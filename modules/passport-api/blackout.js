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
        let dateType = `
        {
            dateTime: {
                timeZone: String
                start: Date|ISODate,
                end: Date|ISODate
            }, ...
        }`;
        if(typeof blackout.dateTime === "object") {
            //check for dateTime.date
            if((blackout.dateTime.start || blackout.dateTime.end) && blackout.dateTime.date) {
                let error = Error("Invalid dateTime: \"dateTime.start\" and \"dateTime.end\" are incompatible with \"dateTime.date\"");
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
                console.log(blackout.dateTime.start)
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


        
        /*if(!typeCheck(dateType, blackout, utils.typeCheck)) {
            let error = TypeError("dateTime expected to be these types: " + dateType);
            error.status = 400;
            return reject(error);
        } else if (typeCheck("Date|ISODate", blackout.dateTime, utils.typeCheck)) {
            //set start and end options
            blackout.dateTime = moment(blackout.dateTime);//.hour(0).minute(0).second(0).millisecond(0);
            insert.dateTime = {
                start: blackout.dateTime.toISOString(),
                end: blackout.dateTime.add(1, "day").toISOString()
            };
        } else if(typeCheck("{start: Date, end: Date}", blackout.dateTime, utils.typeCheck)) {
            //convert to iso strings
            insert.dateTime = {
                start: moment(blackout.dateTime.start).toISOString(),
                end: moment(blackout.dateTime.end).toISOString()
            };
        } else {
            insert.dateTime = blackout.dateTime; 
        }
        //check if end is after start
        if(!moment(insert.dateTime.start).isBefore(insert.dateTime.end)) {
            let error = Error("dateTime.start must be before dateTime.end");
            error.status = 400;
            return reject(error);
        }*/

        //convert times to rethinkdb times 
        insert.dateTime = {
            start: r.ISO8601(blackout.dateTime.start.toISO()).inTimezone("Z"),
            end: r.ISO8601(blackout.dateTime.end.toISO()).inTimezone("Z")
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
            /*let rruleValid = utils.validateRRule(blackout.rrule);
            if(!rruleValid.valid) {
                let error = {errors: rruleValid.errors, status: 400};
                return reject(error);
            } else {
                if(blackout.rrule instanceof RRule) {
                    //convert object to string
                    insert.rrule = ["RRULE:"+blackout.rrule.toString()];
                } else if(blackout.rrule instanceof RRuleSet) {
                    insert.rrule = blackout.rrule.valueOf();
                } else if(Array.isArray(blackout.rrule)) {
                    insert.rrule = blackout.rrule;
                } else if(typeof blackout.rrule === "string") {
                    blackout.rrule = rrulestr(blackout.rrule);
                } else {
                    let error = TypeError("This error should never happen. Invalid RRule passed");
                    error.status = 500;
                    return reject(error);
                }
            }*/
            insert.recurrence = utils.rruleToDatabase(blackout.dateTime.start, blackout.rrule);
            insert.recurrence.lastOccurrence = r.ISO8601(insert.recurrence.lastOccurrence).inTimezone("Z");
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
        timeZone: "America/Chicago",
        start: "2018-06-18T17:00:00",
        end: "2018-06-19T17:00:00"
    },
    rrule: "RRULE:FREQ=MONTHLY;COUNT=12 RDATE:20180619T050000 RDATE:20190619T050000",
    //periods: ["a"]
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
 * @param {Object} [filter] 
 * @param {Object} [filter.dateTime] 
 * @param {(Date|ISOString)} [filter.dateTime.from] 
 * @param {(Date|ISOString)} [filter.dateTime.to] 
 * @param {String[]} [filter.periods] 
 * @param {String} [filter.accountID] 
 * @param {Object} [options]
 * @param {Boolean} [options.singleEvents=false] - Expand recurring blackouts to single events
 * @returns {Promise.<Blackout[], TypeError|ReQL|Error>}
 */
exports.list = (filter, options) => {
    return new Promise((resolve, reject) => {
        if(!filter) {filter = {};}
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
        let rQuery = r.table("blackouts");
        
        //filter accountID
        if(filter.accountID) {
            rQuery = rQuery.filter({
                accountID: filter.accountID
            });
            delete filter.accountID;
        }

        //filter date and 
        if(filter.date && (filter.date.from || filter.date.to)) {
            rQuery = rQuery.filter((date) => {
                let from = true;
                let to = true;
                if(filter.date.from) {
                    //filter low end
                    from = r.or(
                        date("date")("start").inTimezone("Z").date()
                            .ge(
                                r.ISO8601(filter.date.from).inTimezone("Z").date()
                            ),
                        r.ISO8601(filter.date.from).inTimezone("Z")
                            .during(
                                date("date")("start").inTimezone("Z"), 
                                date("date")("end").inTimezone("Z"),
                                {leftBound: "closed", rightBound: "open"}
                            )
                    );
                }
                if(filter.date.to) {
                    to = r.or(
                        date("date")("end").inTimezone("Z").date()
                            .lt(
                                r.ISO8601(filter.date.to).inTimezone("Z").date()
                            ),
                        r.ISO8601(filter.date.to).inTimezone("Z")
                            .during(
                                date("date")("start").inTimezone("Z"), 
                                date("date")("end").inTimezone("Z"),
                                {leftBound: "open", rightBound: "closed"}
                            )
                    );
                }

                return r.and(from, to);
            });
            delete filter.date;
        }

        //filter periods
        if(typeCheck("[period]", filter.period, utils.typeCheck)) {
            rQuery = rQuery.filter(function(period) {
                return r.expr(filter.period).contains(period("period")); 
            });
            delete filter.period;
        }

        //run 
        return rQuery.run().then(resolve).catch(reject);
    });
};


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

