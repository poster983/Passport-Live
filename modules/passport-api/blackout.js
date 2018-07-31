/*
Passport-Live is a modern web app for schools that helps them manage passes.
    Copyright (C) 2017  Joseph Hassell

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

email: hi@josephhassell.com
*/

/**
 * Blackouts prevent passes from being requested to a certain user on a given day and time or period
*  @module js/blackout
*/

var db = require("../../modules/db/index.js");
let r = db.dash();
var config = require("config");
var moment = require("moment");
let {DateTime} = require("luxon");
let typeCheck = require("type-check").typeCheck;
let utils = require("../passport-utils/index.js");
let {RRule, RRuleSet, rrulestr} = require("rrule");
let util = require("util");

//TYPES
/**
 * A Blackout object returned from the DB.
 * @global
 * @typedef {Object} Blackout
 * 
 */

/**
 * A recurrence rule in the iCalendar RFC standard.
 * @see {@link https://www.npmjs.com/package/rrule|rrule} npm package for more insight.
 * @global
 * @typedef {String} RRuleRFC
 * 
 */

//CODE 
/**
 * Schedules a new blackout
 * @link module:js/blackout
 * @param {Object} blackout
 * @param {Object} blackout.dateTime
 * @param {String} blackout.dateTime.timeZone - an IANA timezone string 
 * @param {(Date|ISOString)} [blackout.dateTime.date] - Used for all-day blackouts, and by-period blackouts
 * @param {(Date|ISOString)} [blackout.dateTime.start] - The starting datetime for the blackout. cannot be used with blackout.periods
 * @param {(Date|ISOString)} [blackout.dateTime.end] - THe dateTime of the end of the blackout. cannot be used with blackout.periods
 * @param {String[]} [blackout.periods] - Periods must equal one of the set periods in the configs.  Defaults to using the time range. Cannot be used with dateTime.start and dateTime.end.
 * @param {String} [blackout.accountID] - If given, the blackout will be for this person 
 * @param {(RRuleRFC|RRuleRFC[])} [blackout.rrule] - A recurrence rule for the blackout. Cannot have DTSTART, Timezones are ignored and dateTime.timeZone is used instead
 * @param {String} [blackout.message] - A message to show to any user that encounters this blackout 
 * @returns {Promise.<Blackout, Error>}
 * @throws {(TypeError|ReQL|Error)}
 */
exports.insert = (blackout, options) => {
    return new Promise((resolve, reject) => {
        let insert = {};
        //check blackout object

        //check blackout periods
        if(!typeCheck("Maybe [period]", blackout.periods, utils.typeCheck)) {
            let error = TypeError("periods expected to be an array of periods");
            error.status = 400;
            return reject(error);
        } else if (Array.isArray(blackout.periods) && blackout.periods.length > 0) {
            //check if periods array and if dateTime.start or dateTime.end is set
            if(typeof blackout.dateTime === "object" && (blackout.dateTime.start || blackout.dateTime.end)) {
                let error = Error("periods array cannot be used with \"dateTime.start\" and \"dateTime.end.\" Use \"dateTime.date\"");
                error.status = 400;
                return reject(error);
            } else {
                insert.periods = blackout.periods;
            }
        }
        
        //check blackout.dateTime 
        if(typeof blackout.dateTime === "object") {
            //check for dateTime.date
            if((blackout.dateTime.start || blackout.dateTime.end) && blackout.dateTime.date) {
                let error = Error("Invalid dateTime: \"dateTime.start\" and \"dateTime.end\" are incompatible with \"dateTime.date\"");
                error.status = 400;
                return reject(error);
            }
            //check for timezone 
            if(typeof blackout.dateTime.timeZone !== "string" || blackout.dateTime.timeZone.length > 0) {
                let error = TypeError("\"blackout.dateTime.timeZone\" must be a valid IANA timezone string");
                error.status = 400;
                return reject(error);
            }
            if(blackout.dateTime.date) {
                //if string
                if(typeof blackout.dateTime.date === "string") {
                    blackout.dateTime.date = DateTime.fromISO(blackout.dateTime.date, {zone: blackout.dateTime.timeZone});
                } else if (blackout.dateTime.date instanceof Date) {
                    blackout.dateTime.date = DateTime.fromJSDate(blackout.dateTime.date, {zone: blackout.dateTime.timeZone});
                } else if (blackout.dateTime.date instanceof DateTime) {
                    blackout.dateTime.date = blackout.dateTime.date.setZone(blackout.dateTime.timeZone);
                } else {
                    let error = Error("Invalid dateTime.date: Invalid Format");
                    error.status = 400;
                    return reject(error);
                }
                //check valid
                if(!blackout.dateTime.date.isValid) {
                    //invalid time
                    let error = Error("Invalid dateTime.date: " + blackout.dateTime.date.invalidReason);
                    error.status = 400;
                    return reject(error);
                }
                //set start end values 
                blackout.dateTime.start = blackout.dateTime.date;
                blackout.dateTime.end = blackout.dateTime.date.plus({days: 1});
            } else if(blackout.dateTime.start || blackout.dateTime.end) {
                //check if both are present
                if((blackout.dateTime.start && !blackout.dateTime.end) || (!blackout.dateTime.start && blackout.dateTime.end)) {
                    let error = Error("Invalid dateTime: \"dateTime.start\" and \"dateTime.end\" must both be set.");
                    error.status = 400;
                    return reject(error);
                }
                //parse datetime.start
                if(typeof blackout.dateTime.start === "string") {
                    blackout.dateTime.start = DateTime.fromISO(blackout.dateTime.start, {zone: blackout.dateTime.timeZone});
                } else if (blackout.dateTime.start instanceof Date) {
                    blackout.dateTime.start = DateTime.fromJSDate(blackout.dateTime.start, {zone: blackout.dateTime.timeZone});
                } else if (blackout.dateTime.start instanceof DateTime) {
                    blackout.dateTime.start = blackout.dateTime.start.setZone(blackout.dateTime.timeZone);
                } else {
                    let error = Error("Invalid dateTime.start: Invalid Format");
                    error.status = 400;
                    return reject(error);
                }
                //parse dateTime.end
                if(typeof blackout.dateTime.end === "string") {
                    blackout.dateTime.end = DateTime.fromISO(blackout.dateTime.end, {zone: blackout.dateTime.timeZone});
                } else if (blackout.dateTime.end instanceof Date) {
                    blackout.dateTime.end = DateTime.fromJSDate(blackout.dateTime.end, {zone: blackout.dateTime.timeZone});
                } else if (blackout.dateTime.end instanceof DateTime) {
                    blackout.dateTime.end = blackout.dateTime.end.setZone(blackout.dateTime.timeZone);
                } else {
                    let error = Error("Invalid dateTime.end: Invalid Format");
                    error.status = 400;
                    return reject(error);
                }
                //console.log(blackout.dateTime.start)
            } else {
                let error = TypeError("\"blackout.dateTime\" must be an object with either \"dateTime.start\" and \"dateTime.end\" or \"dateTime.date\"");
                error.status = 400;
                return reject(error);
            }
        } else {
            let error = TypeError("\"blackout.dateTime\" must be an object");
            error.status = 400;
            return reject(error);
        }

        //console.log(blackout.dateTime.start, blackout.dateTime.end)
        //check if start is before end 
        if(blackout.dateTime.start >= blackout.dateTime.end) {
            let error = Error("dateTime.start must be before dateTime.end");
            error.status = 400;
            return reject(error);
        }
        //console.log(blackout.dateTime.start)
        //convert times to rethinkdb times 
        insert.dateTime = {
            start: r.ISO8601(blackout.dateTime.start.toISO()).inTimezone("Z"),
            end: r.ISO8601(blackout.dateTime.end.toISO()).inTimezone("Z"),
            timeZone: blackout.dateTime.timeZone
        };

        //check account id 
        if(!typeCheck("Maybe String", blackout.accountID)) {
            let error = TypeError("accountID expected to be undefined or a String");
            error.status = 400;
            return reject(error);
        }
        if(blackout.accountID) {
            insert.accountID = blackout.accountID;
        }
        if(blackout.rrule) {
            insert.recurrence = utils.rruleToDatabase(blackout.dateTime.start, blackout.rrule);
            if(insert.recurrence.lastOccurrence) {
                insert.recurrence.lastOccurrence = r.ISO8601(insert.recurrence.lastOccurrence).inTimezone("Z");
            }
        }
        if(!typeCheck("Maybe String", blackout.message)) {
            let error = TypeError("message expected to be undefined or a String");
            error.status = 400;
            return reject(error);
        } 
        if(blackout.message) {
            insert.message = blackout.message;
        }
        insert.created = r.now();
        //return resolve(insert);
        return r.table("blackouts").insert(insert).run().then(resolve).catch(reject);
    });
};
/*exports.insert({
    dateTime: {
        //timeZone: "America/Chicago",
        //date: "2018-06-05"
        start: "2018-05-01T08:00:00",
        end: "2018-05-01T09:30:00"
    },
    //rrule: "RRULE:FREQ=DAILY;COUNT=4",
    //periods: ["h", "g", "f"]
}).then((res) => {
    console.log(res)
}).catch((err) => {
    console.error(err)
});*/



/**
 * Get a blackout object
 * @link module:js/blackout
 * @param {String} blackoutID 
 * @returns {Promise.<Blackout, Error>}
 * @throws {(TypeError|ReQL|Error)}
 */
exports.get = (blackoutID) => {
    return new Promise((resolve, reject) => {
        //check blackout ID
        if(typeof blackoutID !== "string") {
            let error = TypeError("blackoutID expected to be a String");
            error.status = 400;
            return reject(error);
        }
        return r.table("blackouts").get(blackoutID).run().then(resolve).catch(reject);
    });
};

/**
 * Filter Range of dates
 * @private
 * @param {Object} options
 * @param {DateTime} [options.filterFrom] 
 * @param {DateTime} [options.filterTo] 
 * @param {DateTime} options.start 
 * @param {DateTime} options.end 
 * @param {Boolean} [options.ignoreTime=false] - Will filter ignore the time of day when doing comparisons
 */
function filterDateRange({filterFrom, filterTo, start, end, ignoreTime}) {
    let oFrom = true;
    let oTo = true;
    //if low limit 
    if(filterFrom) {
        let compareTo;
        if(ignoreTime) {
            compareTo = (start.setZone("UTC").startOf("day") >= filterFrom.setZone("UTC").startOf("day"));
        } else {
            compareTo = (start.setZone("UTC") < filterFrom.setZone("UTC"));
        }
        oFrom = (compareTo|| (filterFrom >= start && filterFrom < end));
    }
    if(filterTo) {
        let compareTo;
        if(ignoreTime) {
            compareTo = (end.setZone("UTC").startOf("day") <= filterTo.setZone("UTC").startOf("day"));
        } else {
            compareTo = (end.setZone("UTC") < filterTo.setZone("UTC"));
        }
        oTo = (compareTo || (filterTo >= start && filterTo < end));
    }
    return (oFrom && oTo);
}


/**
 * @param {Object} [filter] 
 * @param {Object} [filter.dateTime] 
 * @param {(Date|ISOString)} [filter.dateTime.from] - Must be before to
 * @param {(Date|ISOString)} [filter.dateTime.to] - Must be after from
 * @param {String[]} [filter.periods] 
 * @param {String} [filter.accountID] 
 * @param {Object} [options]
 * @param {Boolean} [options.singleEvents=false] - Expand recurring blackouts to single events
 * @param {Number} [options.singleEventLimit=100] - The limit to how many recurring events will be returned if singleEvents is true
 * @returns {Promise.<Blackout[], TypeError|ReQL|Error>}
 */
exports.list = (filter, options) => {
    return new Promise((resolve, reject) => {
        if(!filter) {filter = {};}
        options = Object.assign({
            singleEvents: false,
            singleEventLimit: 100
        }, options);
        let filterType = `
        {
            dateTime: Maybe {
                from: Maybe Date|ISODate,
                to: Maybe Date|ISODate
            },
            periods: Maybe [period],
            accountID: Maybe String
        }
        `;
        if(!typeCheck(filterType, filter, utils.typeCheck)) {
            let err = new TypeError("Invalid filter object, expected structure like: " + filterType);
            err.status = 400;
            return reject(err);
        }
        //convert dates to ISO 
        if(filter.dateTime && typeCheck("Date", filter.dateTime.from)) {
            filter.dateTime.from = moment(filter.dateTime.from).toISOString();
        }
        if(filter.dateTime && typeCheck("Date", filter.dateTime.to)) {
            filter.dateTime.to = moment(filter.dateTime.to).toISOString();
        }

        //check if filter times are in the right order
        if(filter.dateTime && filter.dateTime.from && filter.dateTime.to) {
            if(DateTime.fromISO(filter.dateTime.from) >= DateTime.fromISO(filter.dateTime.to)) {
                let err = new Error("Invalid DateTime range: dateTime.from must be before dateTime.to");
                err.status = 400;
                return reject(err);
            }
        }

        let rQuery = r.table("blackouts");
        
        //filter accountID
        if(filter.accountID) {
            rQuery = rQuery.filter({
                accountID: filter.accountID
            });
            delete filter.accountID;
        }

        

        //filter date and 
        if(filter.dateTime && (filter.dateTime.from || filter.dateTime.to)) {
            rQuery = rQuery.filter((date) => {

                //check dates for non recurring blackouts
                let from = true;
                let to = true;
                if(filter.dateTime.from) {
                    //filter low end
                    from = r.branch(
                        r.and(//if the periods array exists...
                            date.hasFields("periods"),
                            date("periods").typeOf().eq("ARRAY"),
                            date("periods").count().gt(0)
                        ), 
                        r.or( //then ignore the times
                            date("dateTime")("start").inTimezone("Z").date()
                                .ge(
                                    r.ISO8601(filter.dateTime.from).inTimezone("Z").date()
                                ),
                            r.ISO8601(filter.dateTime.from).inTimezone("Z")
                                .during(
                                    date("dateTime")("start").inTimezone("Z"), 
                                    date("dateTime")("end").inTimezone("Z"),
                                    {leftBound: "closed", rightBound: "open"}
                                )
                        ), 
                        date("dateTime")("start").inTimezone("Z") //else filter with times 
                            .ge(
                                r.ISO8601(filter.dateTime.from).inTimezone("Z")
                            )
                    );

                }
                if(filter.dateTime.to) {
                    to = r.branch(
                        r.and(//if the periods array exists...
                            date.hasFields("periods"),
                            date("periods").typeOf().eq("ARRAY"),
                            date("periods").count().gt(0)
                        ), 
                        r.or(//then ignore the times
                            date("dateTime")("end").inTimezone("Z").date()
                                .le(
                                    r.ISO8601(filter.dateTime.to).inTimezone("Z").date()
                                ),
                            r.ISO8601(filter.dateTime.to).inTimezone("Z")
                                .during(
                                    date("dateTime")("start").inTimezone("Z"), 
                                    date("dateTime")("end").inTimezone("Z"),
                                    {leftBound: "open", rightBound: "closed"}
                                )
                        ),
                        date("dateTime")("end").inTimezone("Z") //else filter with times 
                            .lt(
                                r.ISO8601(filter.dateTime.to).inTimezone("Z")
                            )
                    );
                }

                //check dates for finite recurring blackouts
                let frFrom = true;
                let frTo = true;
                if(filter.dateTime.from) {
                    //filter low end
                    frFrom = r.or(
                        date("dateTime")("start").inTimezone("Z").date()
                            .ge(
                                r.ISO8601(filter.dateTime.from).inTimezone("Z").date()
                            ),
                        r.ISO8601(filter.dateTime.from).inTimezone("Z")
                            .during(
                                date("dateTime")("start").inTimezone("Z"), 
                                date("recurrence")("lastOccurrence").inTimezone("Z"),
                                {leftBound: "closed", rightBound: "open"}
                            )
                    );
                }
                if(filter.dateTime.to) {
                    frTo = r.or(
                        date("recurrence")("lastOccurrence").inTimezone("Z").date()
                            .le(
                                r.ISO8601(filter.dateTime.to).inTimezone("Z").date()
                            ),
                        r.ISO8601(filter.dateTime.to).inTimezone("Z")
                            .during(
                                date("dateTime")("start").inTimezone("Z"), 
                                date("recurrence")("lastOccurrence").inTimezone("Z"),
                                {leftBound: "open", rightBound: "closed"}
                            )
                    );
                }

                //check dates for infinite recurring blackouts (no end date)
                let irTo = true;
                if(filter.dateTime.to) {
                    irTo = r.branch(
                        r.and(//if the periods array exists...
                            date.hasFields("periods"),
                            date("periods").typeOf().eq("ARRAY"),
                            date("periods").count().gt(0)
                        ), 
                        date("dateTime")("start").inTimezone("Z").date() //then filter without time
                            .le(
                                r.ISO8601(filter.dateTime.to).inTimezone("Z").date()
                            ),
                        date("dateTime")("start").inTimezone("Z") //else filter tith time
                            .lt(
                                r.ISO8601(filter.dateTime.to).inTimezone("Z")
                            )
                    );
                }
                

                return r.branch(
                    date.hasFields({recurrence: "lastOccurrence"}),// if is a recurring event with a finite ammount of Occurrences
                    r.and(frFrom, frTo),//then filter as a finite recurring event,
                    date.hasFields({recurrence: "lastOccurrence"}).not().and(date.hasFields({recurrence: "rrule"})),  //else if the event is an infinite rule
                    irTo,//r.or(irBetween, r.and(irFrom, irTo)),
                    r.and(from, to)//else filter as a single event
                );
            });
            delete filter.date;
        }

        //filter periods
        if(typeCheck("[period]", filter.periods, utils.typeCheck)) {
            rQuery = rQuery.filter(function(doc) {
                return r.branch(
                    doc.hasFields("periods").and(doc("periods").typeOf().eq("ARRAY")),//if  periods exists and is an array
                    r.expr(filter.periods).default([]).setIntersection(doc("periods")).count().ge(1), // then filter by periods.  filter.periods contains at least one value in doc("periods")
                    true //if no periods array, pass it down
                );
            });
            delete filter.period;
        }

        //run 
        return rQuery.run().then((docs) => {
            //convert from and to to js dates
            let dtFrom;
            if(filter.dateTime && filter.dateTime.from) {
                dtFrom = DateTime.fromISO(filter.dateTime.from);
            }
            let dtTo;
            if(filter.dateTime && filter.dateTime.to) {
                dtTo = DateTime.fromISO(filter.dateTime.to);
            }
            
            let allBlackouts = [];
            //first find every recurrence for recurring rules and check to see if it matches the filter
            for(let x = 0; x < docs.length; x++) {
                //console.log(x)
                let doc = Object.assign({}, docs[x]);
                //console.log(doc);
                if(typeof doc.recurrence === "object") {
                    let dtstart = DateTime.fromJSDate(doc.dateTime.start, {zone: doc.dateTime.timeZone});
                    let dtend = DateTime.fromJSDate(doc.dateTime.end, {zone: doc.dateTime.timeZone});
                    //get duration
                    let duration = dtend.diff(dtstart, "millisecond");

                    let docRRule = rrulestr(doc.recurrence.rrule.join(" "), {dtstart: dtstart.toJSDate()});
                    //validate for safety
                    let validate = utils.validateRRule(docRRule);
                    //error if not valid
                    if(!validate.valid) {
                        let err = new Error(validate.errors);
                        err.status = 500;
                        return reject(err);
                    }
                    
                    
                    
                    
                    let occurrences = docRRule.all((date, i) => { //generate occurrences
                        //console.log(date, i)

                        //check limit
                        if(i >= options.singleEventLimit) {
                            return false;
                        }
                        return true;
                        
                    });

                    if(options.singleEvents) { //return one document with original dates even if there are multiple occurences in the rule
                        occurrences = occurrences.find((date) => {
                            let dtStartCalc = DateTime.fromJSDate(date, {zone: doc.dateTime.timeZone});
                            let dtEndCalc = dtStartCalc.plus({milliseconds: duration.milliseconds});

                            if(filterDateRange({filterFrom: dtFrom, filterTo: dtTo, start: dtStartCalc, end: dtEndCalc, ignoreTime: true})) {//check if date is included in filter range
                                return true;
                            } else { //not included in filter range
                                return false;
                            }
                        });
                        if(occurrences) {
                            allBlackouts.push(doc);
                        }

                    } else { //filter and merge dates
                        occurrences = occurrences.map((date) => { //filter the occurrences and map them
                            //convert date to luxon 
                            let dtStartCalc = DateTime.fromJSDate(date, {zone: doc.dateTime.timeZone});
                            let dtEndCalc = dtStartCalc.plus({milliseconds: duration.milliseconds});
                            
                            

                            //either merge the date and the document, or replace with null
                            if(filterDateRange({filterFrom: dtFrom, filterTo: dtTo, start: dtStartCalc, end: dtEndCalc, ignoreTime: true})) {
                                // merge
                                return Object.assign({}, doc, {
                                    dateTime: {
                                        start: dtStartCalc.toJSDate(),
                                        end: dtEndCalc.toJSDate()
                                    }
                                });
                            } else {
                                //skip
                                return null;
                            }
                        }).filter((date) => { //remove invalid dates from array
                            
                            if(date === null) {
                                return false;
                            }
                            return true;
                        });

                        //merge occurrences into allBlackouts
                        Array.prototype.push.apply(allBlackouts, occurrences);
                    }
                } else {
                    //push non recurring events to allBlackouts
                    allBlackouts.push(doc);
                }
                
                
            }

            
            //if the document has periods, find the correct date and time for the start and end times. if it dos not have periods, find the active periods for the time range.
            /*for(let x = 0; x < allBlackouts.length; x++) {
                let doc = allBlackouts[x];
                if(Array.isArray(doc.periods) && doc.periods.length > 0) { //if the document has periods, find the correct date and time for the start and end times

                }
            }*/



            return resolve({docs: docs, allBlackouts: allBlackouts});

        }).catch(reject);
    });
};

/*exports.list({
    dateTime: {
        from: "2018-06-07T20:00:00-05:00",
        to: "2018-06-09T11:00:00-05:00"
    }
    //periods: ["d"]
}, {
    singleEvents: false
}).then((res) => {
    
    /*res.recurring = res.recurring.map((doc) => {
        console.log(doc)
        if(Object.keys(res.recurring).length > 0) {
            return Object.assign(doc, {
                dateTime: {
                    start: DateTime.fromJSDate(doc.dateTime.start, {zone: doc.dateTime.timeZone}).toISO(),
                    end: DateTime.fromJSDate(doc.dateTime.end, {zone: doc.dateTime.timeZone}).toISO()
                }
            });
        } else {return doc;}
            
    });*
    console.log(util.inspect(res, { depth: 5 }));
}).catch((err) => {
    console.error(err);
});*/

/*let tarr = [{a: 1},{a: 2},{a: 3}];
let neww = [];
for(let j = 0; j < tarr.length; j++) {
    let tar = {...tarr[j]};
    Object.assign(tar, {b: j})
    neww.push(tar)
}
console.log(tarr, neww)*/


exports.newBlackout = function(date, periods, userId, message, done) {
    //add the moment js checker

    //check array
    if(!Array.isArray(periods) || periods.length <= 0) {
        var err = new Error("periods Not A Valid Array");
        err.status = 400; //bad request
        return done(err);  //callback error 
    }
    //check userId
    if(!userId) {
        var err = new Error("userId not present");
        err.status = 400; //bad request
        return done(err);  //callback error 
    }
    
    r.table("blackouts").insert({
        date: date,
        periods: periods,
        userId: userId,
        message: message
    }).run(db.conn(), function(err, data) {
        if (err) {
            return done(err);
        }
        return done(null, data);
    });
};

exports.getBlackoutByUserId = function(userId, done) {
    r.table("blackouts").filter({
        userId: userId
    }).run(db.conn(), function(err, curDoc) {
        if(err) {
            return done(err);
        }
        curDoc.toArray(function(err, doc) {
            if(err) {
                return done(err);
            }
            return done(null, doc);
        });
        
    });
};

exports.getBlackoutByUserIdAndDate = function(userId, date, done) {
    //error check if date is not valid 
    if(!moment(date).isValid()) {
        var err = new Error("Date not valid");
        err.status = 400; //bad request
        return done(err);  //callback error 
    }
    var date = moment(date).format("Y-MM-DD"); //get date in format {string}
    console.log(userId);
    r.table("blackouts").filter({
        userId: userId,
        date: date
    }).run(db.conn(), function(err, curDoc) {
        if (err) {
            return done(err);
        }
        curDoc.toArray(function(err, doc) {
            if (err) {
                return done(err);
            }
            return done(null, doc);
        });
    });


    //do your thing...
};

exports.getBlackoutByDate = function(date, done) {
    if (!moment(date).isValid()) {
        var err = new Error("Date is not valid");
        err.status = 400; //bad request
        return done(err); //callback error
    }
    var date = moment(date).format("Y-MM-DD"); //get date in format {string}
    r.table("blackouts").filter({
        date: date // CHANGE TO RETHINKDB DATE
    }).run(db.conn(), function(err, curDoc) {
        if (err) {
            return done(err);
        }
        curDoc.toArray(function(err, doc) {
            if (err) {
                return done(err);
            }
            return done(null, doc);
        });
    });
};

