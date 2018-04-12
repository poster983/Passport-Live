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
* @module blackoutAPI
*/

var r = require('rethinkdb');
var db = require('../../modules/db/index.js');
var config = require("config");
var moment = require("moment");

/**
 * Schedules a new blackout
 * @param {Object} blackout
 * @param {(Object|Date|ISOString)} blackout.dateTime - If a date or ISO String, the function will automaticly fill in .startand .end with .end being exactly one day ahead.
 * @param {(Date|ISOString)} [blackout.dateTime.start] - The starting datetime for the blackout
 * @param {(Date|ISOString)} [blackout.dateTime.end] - THe dateTime of the end of the blackout
 * @param {String[]} [blackout.periods] - Periods must equal one of the set periods in the configs.  Defaults to using the time range.
 * @param {String} [blackout.accountID] - If given, the blackout will be for the person 
 * 
 */
exports.new = (blackout, options) => {

}

exports.newBlackout = function(date, periods, userId, message, done) {
    //add the moment js checker

    //check array
    if(!Array.isArray(periods) || periods.length <= 0) {
        var err = new Error("periods Not A Valid Array")
        err.status = 400; //bad request
        return done(err);  //callback error 
    }
    //check userId
    if(!userId) {
        var err = new Error("userId not present")
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
    })
}

exports.getBlackoutByUserId = function(userId, done) {
    r.table('blackouts').filter({
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
        
    })
}

exports.getBlackoutByUserIdAndDate = function(userId, date, done) {
    //error check if date is not valid 
    if(!moment(date).isValid()) {
        var err = new Error("Date not valid")
        err.status = 400; //bad request
        return done(err);  //callback error 
    }
    var date = moment(date).format("Y-MM-DD"); //get date in format {string}
    console.log(userId)
    r.table('blackouts').filter({
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
        })
    });


    //do your thing...
}

exports.getBlackoutByDate = function(date, done) {
    if (!moment(date).isValid()) {
        var err = new Error("Date is not valid")
        err.status = 400; //bad request
        return done(err); //callback error
    }
    var date = moment(date).format("Y-MM-DD"); //get date in format {string}
    r.table('blackouts').filter({
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
        })
    });
}

