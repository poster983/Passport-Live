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

var db = require("../../modules/db/index.js");
let r = db.dash();
var config = require("config");
var moment = require("moment");
let {DateTime} = require("luxon");
let typeCheck = require("type-check").typeCheck;
let utils = require("../passport-utils/index.js");

/** 
* @module js/schedules
*/

//TYPES 
/**
 * A School wide Schedule object
 * @global
 * @typedef {Object} SchoolSchedule
 * @property {String} id - RethinkDB doc id (DB Set)
 * @property {String} name - A friendly name for the schedule
 * @property {Date} created - The date this Schedule was created (DB Set)
 * @property {Date} [updated] - the date this Schedule was changed (DB Set)
 * @property {String} timeZone - an IANA timezone string.
 * @property {Object[]} periods
 * @property {String} periods[].id - A valid period id (EX: "e1" or "a")
 * @property {Object} periods[].time
 * @property {Date} periods[].time.start - The start time in GMT+0 24Hour time
 * @property {Date} periods[].time.end - The end time in GMT+0 24Hour time
 * @property {(RRuleRFC|RRuleRFC[])} rrule - array of valid rrules Supports RRUleSet
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
                var err = new Error("No Schedule Found");
                err.status = 404;
                return done(err);
            }
            if(!schedules.scheduleDefinition || !schedules.scheduleDefinition.scheduleData) {
                var err = new Error("Schedule Data Invalid");
                err.status = 500;
                return done(err);
            }
            var scheduleData = schedules.scheduleDefinition.scheduleData;
            var scheduleConsts = Object.keys(scheduleData);
            var currentPeriods = [];
            if(scheduleConsts.length <= 0) {
                var err = new Error("No Schedule Data Found");
                err.status = 500;
                return done(err);
            }
            //console.log(scheduleConsts)
            for(var x = 0; x < scheduleConsts.length; x++) {
                if(utcQuaryTime.isBetween(moment(scheduleData[scheduleConsts[x]].start, "HH:mm"), moment(scheduleData[scheduleConsts[x]].end, "HH:mm"))) {
                    currentPeriods.push({period: scheduleConsts[x], start: scheduleData[scheduleConsts[x]].start, end: scheduleData[scheduleConsts[x]].end});
                    
                }
                if(x >= scheduleConsts.length-1) {
                    return done(null, currentPeriods);
                }
            }
            
        });
    } else {
        var err = new Error("Invalid Date/Time");
        err.status = 400;
        return done(err);
    }
    
    //indexAPI.getScheduleOfADate(db.conn(), )
};

/**
 * Creates a new Schedule Definition
 * @link module:js/schedules
 * @param {Object} schedule
 * @param {String} schedule.name - A friendly name for the schedule
 * @param {String} schedule.timeZone - an IANA timezone string.
 * @property {Object[]} schedule.periods
 * @property {String} schedule.periods[].id - A valid period id (EX: "e.1" or "a")
 * @property {Object} schedule.periods[].time
 * @property {String} schedule.periods[].time.start - The start time in GMT+0 24Hour time
 * @property {String} schedule.periods[].time.end - The end time in GMT+0 24Hour time
 * @returns {Promise.<Object, Error>} - Rethinkdb Transaction 
 * @throws {(TypeError|ReQL|Error)}
 */
exports.new = (schedule) => {
    return new Promise((resolve, reject) => {
        if(typeof schedule !== "object") {
            let err = new TypeError("First argument expected to be an Object");
            err.status = 400;
            return reject(err);
        }
        if(typeof schedule.name !== "string") {
            let err = new TypeError("\"schedule.name\" expected to be an String");
            err.status = 400;
            return reject(err);
        }

        //check periods array 

        if(!typeCheck("[{id: period, ...}]"), schedule.periods, utils.typeCheck) {
            let err = new TypeError("\"schedule.periods[].id\" expected to be an String and a valid period ID");
            err.status = 400;
            return reject(err);
        }
    });
};

exports.new({
    name: "Hi",
    periods: [
        {id: "a"}
    ]
}).then((res) => {
    console.log(res)
}).catch((err) => {
    console.error(err);
})
//console.log(typeCheck("period", "as", utils.typeCheck))

/**
     * Functions for manupulating the occurences of SchoolSchedules 
     * @name occurrence
     * @inner
     * @private
     * @memberof module:js/schedules
     * @property {Object} occurrence
     */
var occurrence = {};

/**
 * Creates a new occurence for a SchoolSchedule
 * @function
 * @param {String} scheduleId - SchoolSchedule ID
 * @param {Object} data
 * @param {(RRuleRFC|RRuleRFC[])} data.rrule - array of valid rrules Supports RRUleSet
 * @param {(Date|ISOString)} data.startDate - the first occurence.  Ignores time. Uses timezone from SchoolSchedule
 * @param {Number} [data.importance=0] - If there is more than one schedule occuring on the same day, the one with the higher importance ranking will take priority. (falls back to the date the occurence rule was created)
 * @memberof module:js/schedules
 * @returns {Promise.<Object, Error>} - Rethinkdb Transaction 
 * @throws {(TypeError|ReQL|Error)}
 */
occurrence.new = (scheduleId, data) => {
    
};

exports.occurrence = occurrence;

/**
 * Get the schedule for a given datetime 
 * @link module:js/schedules
 * @param {(Date|ISOString)} dateTime - 
 * @param {Object} [options] 
 * @param {Boolean} [options.returnSelection=false] - will return an un run RethinkDBDash query object. 
 * @returns {(Promise.<SchoolSchedule>|Selection[])} - Returns a selection when options.returnSelection is true. Promise will return a Schedule object and a rrule ICAL RFC string
 * @throws {(TypeError|ReQL|Error)}
 */
exports.on = (dateTime, options) => {
    if(!options) {options = {};}
    
    if(!options.returnSelection) {
       // dateTime
    }

    //r.table 
};


/*let periodID = "e.1";

//periodID.replace(".", ".variation.").split(".");

//let pluckValue = 

let tree = {
  a: {
    teacherID: "hkdjfsh"
  }, 
  e: {
    variation: {
      "1": {
        teacherID: "sssss"
      },
      "2": {
        teacherID: "dsfa"
      }
    }
  }
};

let expandedIDArray = r(periodID).split('.').reduce(
  function(l, r){
    return r.add('.variation.').add(l)
  }
).split('.');





let pluckObject = expandedIDArray.fold(true, function(acc, element) {
  return r.object(element, acc)
});



r.expr(tree).pluck(pluckObject)
*/