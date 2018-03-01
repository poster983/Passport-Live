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
* @module js/schedules
*/

 /** 
    * Gets the Currint period for the date based off the time 
    * If time is omitted, the passport will assume UTC Midnight 
    * @link module:js/schedules
    * @function getActivePeriodsAtDateTime
    * @returns {callback} Array of Active Periods for the Date and Time 
    * @param {object} dateTime - An ISO Date with time and zone info 
    * @param {function} done - Callback
    */


//TODO MAKE DATABASE STORE UTC TIME
exports.getActivePeriodsAtDateTime = function(dateTime, done) {
    if(moment(dateTime).isValid()) {
        var utcQuaryTime = moment(moment(dateTime).utc().format("HH:mm"), "HH:mm");
        var dateTimeUTC = moment(dateTime).utc();
        /*console.log(moment(dateTime).utc())
        console.log(moment.parseZone(dateTime))
        console.log(moment(moment(dateTime).utc().format("HH:mm"), "HH:mm"), "this");

        console.log(moment())
        console.log(moment(dateTime).utc())
        */
        //console.log(utcQuaryTime.isBetween(moment(startTime, "HH:mm"), moment(endTime, "HH:mm")));
        indexAPI.getScheduleOfADate(db.conn(), dateTimeUTC, true, function(err, schedules) {
            if(err) {
                return done(err);
            }
            //console.log(schedules)
            //return done(null, schedules);
            if(!schedules.id) {
                var err = new Error("No Schedule Found")
                err.status = 404;
                return done(err);
            }
            if(!schedules.scheduleDefinition || !schedules.scheduleDefinition.scheduleData) {
                var err = new Error("Schedule Data Invalid")
                err.status = 500;
                return done(err);
            }
            var scheduleData = schedules.scheduleDefinition.scheduleData;
            var scheduleConsts = Object.keys(scheduleData);
            var currentPeriods = [];
            if(scheduleConsts.length <= 0) {
                var err = new Error("No Schedule Data Found")
                err.status = 500;
                return done(err);
            }
            //console.log(scheduleConsts)
            for(var x = 0; x < scheduleConsts.length; x++) {
                if(utcQuaryTime.isBetween(moment(scheduleData[scheduleConsts[x]].start, "HH:mm"), moment(scheduleData[scheduleConsts[x]].end, "HH:mm"))) {
                    currentPeriods.push({period: scheduleConsts[x], start: scheduleData[scheduleConsts[x]].start, end: scheduleData[scheduleConsts[x]].end})
                    
                }
                if(x >= scheduleConsts.length-1) {
                    return done(null, currentPeriods);
                }
            }
            
        })
    } else {
        var err = new Error("Invalid Date/Time");
        err.status = 400;
        return done(err);
    }
    
    //indexAPI.getScheduleOfADate(db.conn(), )
}

