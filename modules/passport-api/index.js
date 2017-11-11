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

var r = require('rethinkdb');
var shortid = require('shortid');
var utils = require('../passport-utils/index.js');
var moment = require('moment');
var config = require('config');
var securityAPI = require("./security.js");
//All functions that make the api function.
/** 
* @module passportApi 
* @example
* var api = require('./modules/passport-api/index.js')
*/
module.exports = { 
    
    /** 
    ADMINISTRATION
    **/

    /** 
    * Creates a new Schedule Definition
    * @function newScheduleDefinition
    * @link module:passportApi
    * @async
    * @returns {callback} error and Rethinkdb action sum
    * @param {object} dbConn - RethinkDB Connection Object.
    * @param {string} name - Name of the Schedule
    * @param {scheduleData} scheduleData - See: {@link #params-scheduleData|<a href="#params-scheduleData">Tree Example</a>}
    * @param {function} done - Callback
    */
    newScheduleDefinition: function(dbConn, name, scheduleData, done) {
        //check if times are in correct spots 
        var allowedPer = config.get('schedule.periods');
        //loop through keys
        for (var key in scheduleData) {
          if (scheduleData.hasOwnProperty(key)) {
            var currKey = scheduleData[key]
            if(allowedPer.indexOf(key) == -1) {
                var err = new Error("Config constant for periods not found: " + key);
                    err.status = 404;
                    return done(err);
            }
            if(currKey.hasOwnProperty("start") && currKey.hasOwnProperty("end")){
                if(moment(currKey.start, "HH:mm").isBefore(moment(currKey.end, "HH:mm"))) {
                    //return done(null, moment(currKey.start, "HH:mm").utc().format("HH:mm"));
                    scheduleData[key].start = moment(currKey.start, "HH:mm").utc().format("HH:mm");
                    scheduleData[key].end = moment(currKey.end, "HH:mm").utc().format("HH:mm");
                } else {
                    var err = new Error("Start time is after end time for period: \"" + key + "\"");
                    err.status = 400;
                    return done(err)
                }
                
            } else {
                var err = new Error("start or end Key not Found");
                err.status = 400;
                return done(err);
            }
          }
        }
        //send to db
       r.table("scheduleDefinitions").insert({
            name: name,
            scheduleData: scheduleData
        }).run(dbConn, function(err, data) {
            if (err) {
                return done(err);
            }
            return done(null, data)
        }) 
    },
    /** 
    * Gets a Schedule Definition
    * @function getScheduleDefinition
    * @link module:passportApi
    * @async
    * @returns {callback} Data of the row
    * @param {object} dbConn - RethinkDB Connection Object.
    * @param {string} id - Id of the row.  in null, gets all
    * @param {function} done - Callback
    */
    getScheduleDefinition: function(dbConn, id, done) {
        if(id) {
            r.table('scheduleDefinitions').get(id).run(dbConn, function(err, data) {
                if(err) {
                    return done(err);
                }
                return done(null, data)
            });
        } else {
            r.table('scheduleDefinitions').run(dbConn, function(err, data) {
                if(err) {
                    return done(err);
                }
                data.toArray(function(err, data) {
                    if(err) {
                        return done(err);
                    }
                    return done(null, data)
                })
                
            });
        }
        
    },

    /** 
    * Schedules a date for a Schedule Definition
    * @function scheduleSingleScheduleDefinition
    * @link module:passportApi
    * @async
    * @returns {callback} Data of the action
    * @param {object} dbConn - RethinkDB Connection Object.
    * @param {string} SCid - Id of the Schedule Definition
    * @param {string} date - Moment.js compadable date
    * @param {function} done - Callback
    */
    scheduleSingleScheduleDefinition: function(dbConn, SCid, date, done) {
        if(!moment(date).isValid()) {
            var err = new Error("Date not valid");
            err.status = 400;
            return done(err)
        }
        date = moment(date).format("Y-MM-DD");
        
        r.table("scheduleCalendar").insert({
            ScheduleDefinitionID: SCid,
            date: date
        }).run(dbConn, function(err, data) {
            if(err) {
                return done(err);
            }
            return done(null, data);
        })
    },

    /** 
    * Schedules a Repeating date for a Schedule Definition
    * @function scheduleRepeatingScheduleDefinition
    * @link module:passportApi
    * @async
    * @returns {callback} Data of the action
    * @param {object} dbConn - RethinkDB Connection Object.
    * @param {string} SCid - Id of the Schedule Definition
    * @param {repeatingRule} repeatingRule - See: {@link #params-repeatingRule|<a href="#params-repeatingRule">Object Example</a>}
    * @param {function} done - Callback
    */
    scheduleRepeatingScheduleDefinition: function(dbConn, SCid, repeatingRule, done) {
        //Check if repeatingRule is valid
        if(repeatingRule.repeats == "daily") {
            if(!Number.isInteger(repeatingRule.every)) {
                var err = new Error("repeatingRule.every expected a number");
                err.status = 400;
                return done(err); 
            }
            if(!repeatingRule.startsOn || !moment(repeatingRule.startsOn).isValid()) {
                var err = new Error("repeatingRule.startsOn not a date");
                err.status = 400;
                return done(err); 
            }
        } else if(repeatingRule.repeats == "weekly") {
            //if(!Number.isInteger(repeatingRule.every)) {
            if(isNaN(parseInt(repeatingRule.every))) {
                if(typeof repeatingRule.every == "string") {
                    if(isNaN(parseInt(repeatingRule.every))) {
                        var err = new Error("repeatingRule.every expected a number");
                        err.status = 400;
                        return done(err); 
                    }
                }
                var err = new Error("repeatingRule.every expected a number");
                err.status = 400;
                return done(err); 

            }
            if(!Array.isArray(repeatingRule.on)) {
                    var err = new Error("repeatingRule.on expected an Array");
                    err.status = 400;
                    return done(err); 
                }
            if(!repeatingRule.startsOn || !moment(repeatingRule.startsOn).isValid()) {
                var err = new Error("repeatingRule.startsOn not a date");
                err.status = 400;
                return done(err); 
            }
        } else {
            var err = new Error("repeatingRule has invalid syntex");
            err.status = 400;
            return done(err)
        }

        //defaults
        if(isNaN(parseInt(repeatingRule.importance))) {
            if(typeof repeatingRule.importance == "string") {
                if(isNaN(parseInt(repeatingRule.importance))) {
                    var err = new Error("repeatingRule.importance expected a number");
                    err.status = 400;
                    return done(err); 
                }
            }
            var err = new Error("repeatingRule.importance expected a number");
            err.status = 400;
            return done(err); 

        }

        repeatingRule.startsOn = moment(repeatingRule.startsOn).format("Y-MM-DD");
        r.table("scheduleRepeating").insert({
            ScheduleDefinitionID: SCid,
            repeatingRule: repeatingRule
        }).run(dbConn, function(err, data) {
            if(err) {
                return done(err);
            }
            return done(null, data);
        })
    },

    /** 
    * Gets the Schedule for that date 
    * @function getScheduleOfADate
    * @link module:passportApi
    * @async
    * @returns {callback} Array of schedules OR just a single schedule if checkImportance is true
    * @param {object} dbConn - RethinkDB Connection Object.
    * @param {string} date - Moment.js compadable date
    * @param {boolean} checkImportance - If the function should automaticly check the importance of the schedule and only return the highest importance
    * @param {function} done - Callback
    * @todo MAKE BETTER
    */

    getScheduleOfADate: function(dbConn, date, checkImportance, done) {
         if(!moment(date).isValid()) {

            var err = new Error("Date not valid");
            err.status = 400;
            return done(err)
        }
        var momentDate = moment(date);
        
        date = momentDate.format("Y-MM-DD");

        r.table("scheduleCalendar").filter({
            date: date
        }).map( r.row.merge(function(ro) {
            return {scheduleDefinition: r.table('scheduleDefinitions').get(ro('ScheduleDefinitionID'))}
        })).without('ScheduleDefinitionID').run(dbConn, function(err, cursor) {
            if(err) return done(err);
            cursor.toArray(function(err, results) {
                if(err) return done(err);
                //check if array is empty
                if(results.length > 0) {
                    //return results 
                    return done(null, results)
                } else {
                    checkRepeating();
                }
            });
            
        })

        function checkRepeating() {
            var validRows = [];
            r.table("scheduleRepeating").map( r.row.merge(function(ro) {
                return {scheduleDefinition: r.table('scheduleDefinitions').get(ro('ScheduleDefinitionID'))}
            })).without('ScheduleDefinitionID').run(dbConn, function(err, cursor) {
                if(err) return done(err);
                cursor.toArray(function(err, results) {
                    if(err) return done(err);
                    if(results.length <= 0) {
                        var err = new Error("No Recurring Schedules Found");
                        err.status = 404;
                        return done(err)
                    }
                    //start checking rules
                    for(var x = 0; x < results.length; x++) {
                        var startDay = moment(results[x].repeatingRule.startsOn);
                        var queryDay = moment(date);
                        //weekly
                        if(results[x].repeatingRule.repeats == "weekly") {
                            //if diffence bt weeks is below 0 then assume that it is not needed
                            var weekDif = queryDay.format('w') - startDay.format('w');
                            if(weekDif >= 0) {
                                //console.log(startDay.toString())
                                
                                //check if query week is in the set
                                if(weekDif % results[x].repeatingRule.every == 0) {
                                    //check if the day is on the rule
                                    if(results[x].repeatingRule.on.indexOf(queryDay.format("dddd").toLowerCase()) != -1) {
                                        validRows.push(results[x])
                                    }
                                }
                            }
                        }
                        /*
                        console.log(startDay.toString() + " + diff: ");
                        console.log(queryDay.format('w') - startDay.format('w'))
                        console.log("Mod:");
                        console.log(weekDif % results[x].repeatingRule.every)
                        console.log("_________");*/
                        if(x >= results.length-1) {
                            //check returns nly the most important 
                            if(checkImportance) {
                                if(validRows.length <= 0) {

                                    return done(null, null);
                                }
                                if(validRows.length == 1) {

                                    return done(null, validRows[0]);
                                }
                                var mIS = validRows[0];
                                for(var i = 1; i < validRows.length; i++) {

                                    if(mIS.repeatingRule.importance < validRows[i].repeatingRule.importance) {
                                        
                                        mIS = validRows[i];
                                        
                                    } else if(mIS.repeatingRule.importance == validRows[i].repeatingRule.importance) {
                                        //conflicting importance fallback
                                        if(moment(mIS.repeatingRule.startsOn).isBefore(validRows[i].repeatingRule.startsOn)) {
                                            mIS = validRows[i];
                                        } else if(mIS.repeatingRule.startsOn == validRows[i].repeatingRule.startsOn) {
                                            var err = new Error("Unable to resolve conflicting schedules with repeatingRule IDs of: \"" + mIS.id + "\" AND \"" + validRows[i].id + "\"");
                                            err.status = 500;
                                            return done(err)
                                        }
                                    }

                                    //on done
                                    if(i >= validRows.length-1) {
                                        return done(null, mIS)
                                    }
                                }
                            } else {
                                return done(null, validRows);
                            }
                            
                            
                        }
                    }
                    
                    //return done(null, results)
                });
            });
        }
        

    },

        
    /**
    SECURITY
    **/
    //Wrapper for compatibility
    /*createPermissionKey: function(dbConnNull, permissions, params, timeout, done) {
        securityAPI.createPermissionKey(permissions, params, timeout, function(err, resp) {
            return done(err, resp)
        })
    },
    checkPermissionKey: function(dbConnNull, key, done) {
        securityAPI.checkPermissionKey(key, function(err, resp) {
            return done(err, resp)
        })
    },*/


    /**
    Server
    **/

     /** 
    * Gets all passgroups defined in configs 
    * @function getPassGroups
    * @link module:passportApi
    * @async
    * @returns {callback} error and array of passGroup info.
    * @param {function} done - Callback
    */
    getPassGroups: function(done) {
        var uG = config.get('userGroups');
        var pG = {};
        var i = 0;
        for (var key in uG) {
            if (uG.hasOwnProperty(key) && config.has('userGroups.' + key + '.passes')) {
               //console.log(key + " -> " + uG[key]);
               pG[key] = uG[key].passes
            }
            if(i >= Object.keys(uG).length-1) {
                
                return done(null, pG);
            }
            
            i++;
        }
        
        
    },

    

    tester: function(hello, done) {
        console.log(hello);
        done(null, hello);
    }
}

/**
* The json tree for laying out the period times
* The key must equal a period constant defined in the config array (schedule.period)
* Times are in 24hr time
* @example
* {
* "a": { 
*   "start": 14:25,
*   "end": 15:35
* },
* "b": { 
*   "start": 9:25,
*   "end": 10:35
* },
* "c": { 
*   "start": 13:25,
*   "end": 14:10
* },
* "lunch2": {
*   "start": 12:00,
*   "end": 13:05
* }
* }
* @typedef {json} scheduleData
*/

/**
* rule to let the program know when to Repeats.
* @example
* <caption>Repeating daily</caption>
* {
*    "startsOn": "2017-06-26",
*    "repeats": "daily",
*    "every": 1, //days
*    "importance": 0 // (Defaults to: 0) if a conflict happens between two diffrent Repeating schedules, the program can deside what schedule to use.  NOTE: Not implemented in API  
* }
* @example
* <caption>Repeating Weekly</caption>
* {
    "startsOn": "2017-06-26",
    "repeats": "weekly",
    "every": 1, //weeks
    "on": ["monday", "tuesday", "thursday", "friday"],
*    "importance": 1 // (Defaults to: 0) if a conflict happens between two diffrent Repeating schedules, the program can deside what schedule to use.  NOTE: Not implemented in API
* }
* @typedef {json} repeatingRule
*/