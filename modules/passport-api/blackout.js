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
 * @param {(Object|Date|ISOString)} blackout.dateTime - If a date or ISO String, the function will automaticly fill in .start and .end with .end being exactly one day ahead.
 * @param {(Date|ISOString)} blackout.dateTime.start - The starting datetime for the blackout. cannot be used with blackout.periods
 * @param {(Date|ISOString)} blackout.dateTime.end - THe dateTime of the end of the blackout. cannot be used with blackout.periods
 * @param {String[]} [blackout.periods] - Periods must equal one of the set periods in the configs.  Defaults to using the time range. 
 * @param {String} [blackout.accountID] - If given, the blackout will be for this person 
 * @param {(RRuleRFC|RRuleRFC[])} [blackout.rrule] - A recurrence rule for the blackout.
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
                let error = Error("periods array cannot be used with \"dateTime.start\" and \"dateTime.end\"");
                error.status = 400;
                return reject(error);
            } else {
                insert.periods = blackout.periods;
            }
        }

        //check blackout.date 
        let dateType = `
        {
            dateTime: Date|ISODate|{
                start: Date|ISODate,
                end: Date|ISODate
            }, ...
        }
        `;
        if(!typeCheck(dateType, blackout, utils.typeCheck)) {
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
        }

        //convert times to rethinkdb times 
        insert.dateTime = {
            start: r.ISO8601(insert.dateTime.start).inTimezone("Z"),
            end: r.ISO8601(insert.dateTime.end).inTimezone("Z")
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
            let rruleValid = utils.validateRRule(blackout.rrule);
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
        insert.created = r.date();
        //return resolve(insert);
        return r.table("blackouts").insert(insert).run().then(resolve).catch(reject);
    });
};
/*exports.insert({
    dateTime: {
        start: "2018-04-19T11:16:23-05:00",
        end: "2018-04-19T11:17:23-05:00"
    },
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

