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

var indexAPI = require("./index.js");
var r = require('rethinkdb');
var db = require('../../modules/db/index.js');
var config = require("config");
var moment = require("moment");

/** 
* @module passportSchedulesApi
*/

 /** 
    * Gets the Currint period for the date based off the time 
    *  If time is omitted, the passport will assume UTC Midnight 
    * @function getActivePeriodsAtDateTime
    * @async
    * @returns {callback} Array of Active Periods for the Date and Time 
    * @param {object} dateTime - An ISO Date with time and zone info 
    * @param {function} done - Callback
    */

exports.getActivePeriodsAtDateTime = function(dateTime, done) {
    if(moment(dateTime).isValid()) {
        console.log(moment(dateTime).utc())
        console.log(moment.parseZone(dateTime))
        console.log(moment(moment(dateTime).utc().format("HH:mm"), "HH:mm"), "this");

        console.log(moment())
        console.log(moment(dateTime).utc())
        var utcQuaryTime = moment(moment(dateTime).utc().format("HH:mm"), "HH:mm");
        var startTime = "11:30"
        var endTime = "13:30"
        console.log(utcQuaryTime.isBetween(moment(startTime, "HH:mm"), moment(endTime, "HH:mm")));
        //indexAPI.getScheduleOfADate(db.conn(), )
    } else {
        var err = new Error("Invalid Date/Time");
        err.status = 400;
        return done(err);
    }
    
    //indexAPI.getScheduleOfADate(db.conn(), )
}