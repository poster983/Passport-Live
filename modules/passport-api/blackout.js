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
 * @param {Object} blackout
 * @param {(Object|Date|ISOString)} blackout.dateTime - If a date or ISO String, the function will automaticly fill in .startand .end with .end being exactly one day ahead.
 * @param {(Date|ISOString)} blackout.dateTime.start - The starting datetime for the blackout
 * @param {(Date|ISOString)} blackout.dateTime.end - THe dateTime of the end of the blackout
 * @param {String[]} [blackout.periods] - Periods must equal one of the set periods in the configs.  Defaults to using the time range.
 * @param {String} [blackout.accountID] - If given, the blackout will be for this person 
 * @param {RRuleRFC} [rrule] - A recurrence rule for the blackout.
 * @param {String} [message] - A message to show to any user that encounters this blackout 
 * @returns {Promise.<Blackout, Error>}
 * @throws {(TypeError|ReQL|Error)}
 */
exports.new = (blackout, options) => {
    return new Promise((resolve, reject) => {
        //check blackout object
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
            blackout.dateTime = {
                start: moment(blackout.dateTime),
                end: moment(blackout.dateTime)
            }
        }
        //check blackout periods
        if(!typeCheck("Maybe [period]", blackout.periods, utils.typeCheck)) {
            let error = TypeError("periods expected to be an array of periods");
            error.status = 400;
            return reject(error);
        } 
        //check account id 
        if(!typeCheck("Maybe String", blackout.accountID)) {
            let error = TypeError("accountID expected to be undefined or a String");
            error.status = 400;
            return reject(error);
        }
        let rruleValid = utils.validateRRule(blackout.rrule);
        if(!rruleValid.valid) {
            let error = {errors: rruleValid.errors, status: 400};
            return reject(error);
        } else {
            if(blackout.rrule instanceof RRule) {
                //convert object to string
                blackout.rrule = "RRULE:"+blackout.rrule.toString();
            } else if(blackout.rrule instanceof RRuleSet) {
                blackout.rrule = blackout.rrule.valueOf().join(" ");
            } else {
                let error = TypeError("This error should never happen. Invalid RRule passed");
                error.status = 500;
                return reject(error);
            }
        }
        if(!typeCheck("Maybe String", blackout.message)) {
            let error = TypeError("message expected to be undefined or a String");
            error.status = 400;
            return reject(error);
        }
        
        r.table("blackouts").insert({

        });
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

