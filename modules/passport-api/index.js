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
var bcrypt = require('bcrypt-nodejs');
var r = require('rethinkdb');
var shortid = require('shortid');
var utils = require('../passport-utils/index.js');
var moment = require('moment');
var human = require('humanparser');
var config = require('config');
//All functions that make the api function.
/** 
* @module passportApi 
* @example
* var api = require('./modules/passport-api/index.js')
*/
module.exports = { 
    /**
    ACCOUNTS 
    **/

    //Creates a new account 
    //groupFields takes a json object.
    //done(err);
    /*
        Group field can contain for example {stuID: 123} Or {myCustomField: "Hello"}
    */
    /** 
    * Creates An Account 
    * @function createAccount
    * @link module:passportApi
    * @async
    * @example
    * api.createAccount(connection, "student", "James", "Smith", "james.smith@gmail.com", "123456", {studentID: 01236, isArchived: false }, function(err){
    *   if(err) {
    *     //do something with error
    *   } else {
    *     //Created
    *   }
    * });
    * @param {object} dbConn - RethinkDB Connection Object.
    * @param {constant} userGroup - A usergroup defined in the config
    * @param {string} firstName - A user's given name
    * @param {string} lastName - A user's family name
    * @param {string} email - A user's email address
    * @param {string} password - The user's password
    * @param {json} groupFields - A json object with data unique to that usergroup (Most of the time, the json object is empty.  The program does most of the work)
    * @param {function} done - Callback
    * @returns {callback} - See: {@link #params-createAccountCallback|<a href="#params-createAccountCallback">Callback Definition</a>} 
    */
    createAccount: function(dbConn, userGroup, firstName, lastName, email, password, groupFields, done) {
        bcrypt.hash(password, null, null, function(err, hash) {
            if(err) {
                console.error(err);
                return done(err, null);
            }
            try {
              // Store hash in your password DB.
              r.table("accounts")('email').contains(email).run(dbConn, function(err, con){
                if(err) {
                    console.error(err);
                    return done(err);
                }
                //Checks to see if there is already an email in the DB            
                if(con){
                  //THe email has been taken
                  var err = new Error("Email Taken");
                  err.status = 409
                  return done(err);
                } else {
                    //insert new account
                    promice = r.table("accounts").insert({
                      name: {
                        first: firstName,
                        last: lastName
                      },
                      email: email,
                      password: hash,
                      userGroup: userGroup, // should be same as a usergroup in config/default.json
                      groupFields: groupFields
                    }).run(dbConn);
                    promice.then(function(conn) {
                        return done(null);
                  });
                }
              });
            } catch(e) {
                
                return done(e);
            }
        });   
    },
    /**
    * @callback createAccountCallback
    * @param {object} err - Returns an error object if any.
    */


    /** 
    * Searches by name and usergroup the account database 
    * @function getUserGroupAccountByName
    * @link module:passportApi
    * @async
    * @returns {callback} Contains ALL account info stored in database.  Make sure to only sent nessessary info to user.
    * @param {object} dbConn - RethinkDB Connection Object.
    * @param {string} name - user's name, cnd be in any format
    * @param {constant} userGroup - A usergroup defined in the config
    * @param {function} done - Callback
    */
    getUserGroupAccountByName: function(dbConn, name, userGroup, done) { 
        var nameSplit = human.parseName(name);
        if(!nameSplit.lastName) {
            nameSplit.lastName = null;
        }
         if(!nameSplit.firstName) {
            nameSplit.firstName = null;
            
        }
        console.log(nameSplit)
         r.table("accounts").filter(function(doc){
                return (doc('userGroup').match(userGroup).and(doc('name')("last").match("(?i)"+nameSplit.lastName).or(doc('name')("first").match("(?i)"+nameSplit.firstName))));
            }).
            run(dbConn, function(err, document) {

             if(err) {
                return done(err, null);
            }

            document.toArray(function(err, arr) {
                if(err) {
                    return done(err)
                }
                //Add Salutation for compadability
                for (var i = 0; i < arr.length; i++) {
                    arr[i].name.salutation = nameSplit.salutation;
                }
                return done(null, arr)
            });
        });
    },
    /** 
    * Searches by usergroup the account database 
    * @function getUserGroupAccountByUserGroup
    * @link module:passportApi
    * @async
    * @returns {callback} Contains ALL account info stored in database.  Make sure to only sent nessessary info to user.
    * @param {object} dbConn - RethinkDB Connection Object.
    * @param {constant} userGroup - A usergroup defined in the config
    * @param {function} done - Callback
    */
    getUserGroupAccountByUserGroup: function(dbConn, userGroup, done) { 
         r.table("accounts").filter({
            userGroup: userGroup
         }).run(dbConn, function(err, document) {
            if(err) {
                return done(err);
            }
            document.toArray(function(err, arr) {
                if(err) {
                    return done(err);
                }
                return done(null, arr);
            });
         })
    },

    /** 
    * Searches by id in the account database 
    * @function getUserByID
    * @link module:passportApi
    * @async
    * @returns {callback} Contains ALL account info stored in database.  Make sure to only sent nessessary info to user.
    * @param {object} dbConn - RethinkDB Connection Object.
    * @param {constant} id - The ID of the user
    * @param {function} done - Callback
    */
    getUserByID: function(dbConn, id, done) { 
         r.table("accounts").get(id).run(dbConn, function(err, document) {
            if(err) {
                return done(err);
            }
            return done(null, document);
           
         })
    },

    /** 
    * Updates/sets any account field by its id 
    * @function updateAccountGroupFieldsByID
    * @link module:passportApi
    * @async
    * @returns {callback} Returns rethink db summery
    * @param {object} dbConn - RethinkDB Connection Object.
    * @param {string} id - id of the account 
    * @param {json} doc - Json object for the update.  Top key should be the name of the dashboard it is for.
    * @param {function} done - Callback
    */
    updateAccountGroupFieldsByID: function(dbConn, id, doc, done) {
        if(!id) {
            var err = new Error("ID Required");
            err.status = 400;
            return done(err);
        } else if(!doc) {
            var err = new Error("doc Required");
            err.status = 400;
            return done(err);
        } else {
            r.table("accounts").get(id).update({groupFields: doc}).run(dbConn, function(err, data) {
                if(err) {
                    return done(err);
                }
                return done(null, data)
            })
        }

    },


    

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
    * @param {string} id - Id of the row
    * @param {function} done - Callback
    */
    getScheduleDefinition: function(dbConn, id, done) {
        r.table('scheduleDefinitions').get(id).run(dbConn, function(err, data) {
            if(err) {
                return done(err);
            }
            return done(null, data)
        });
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
    * Schedules a date for a Schedule Definition
    * @function scheduleSingleScheduleDefinition
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
            if(!Number.isInteger(repeatingRule.every)) {
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
        if(!repeatingRule.importance) {
            repeatingRule.importance = 0;
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
    * @returns {callback} Data of the action
    * @param {object} dbConn - RethinkDB Connection Object.
    * @param {string} date - Moment.js compadable date
    * @param {function} done - Callback
    * @todo MAKE BETTER
    */

    getScheduleOfADate: function(dbConn, date, done) {
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
                            return done(null, validRows);
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
    /*
    Creates a short permission key 

    Callback: done(err, key)
    "permissions": a JSON object with a custom permission payload, Ex: userGroups
    "parms": per Use case
    "timeout": Must be a Json object either:
    {
        tally: 5
    }
    OR 
    {
        time: Date object
    }
    */
    /**
     * Creates a New Permission Key.
     * @function createPermissionKey
     * @link module:passportApi
     * @async
     * @param {object} dbConn - RethinkDB Connection Object.
     * @param {json} permissions - Json tree of permissions.
     * @param {json} parms - unused.
     * @param {json} timeout - Time.
     * @param {function} done - Callback.
     * @returns {callback} - See: {@link #params-doneCallback|<a href="#params-createPermissionKeyCallback">Callback Definition</a>}
     */
    createPermissionKey: function(dbConn, permissions, parms, timeout, done) {
        var key = shortid.generate()
        if(timeout.time) {
            //format time to a general format
            timeout.time = moment(timeout.time).toISOString();
        }
        r.table("permissionKeys").insert({ 
            key: key,
            permissions: permissions,
            parms: parms,
            timeout: timeout
        }).run(dbConn, function(err) {
            if(err) {
                return done(err, null);
            }
            return done(null, key);
        })
    },
    /**
    * @callback createPermissionKeyCallback
    * @param {object} err - Returns an error if any. 
    * @param {string} key - Returnes the new permission key.
    */

    //This checks to see if the Permission key is valid and returns a json object with the permissions.
    //Callback: done(err, perms)
    //SHould only return one
    /**
     * Checks a Permission Key.
     * @link module:passportApi
     * @async
     * @param {object} dbConn - RethinkDB Connection Object.
     * @param {string} key - the key to check.
     * @param {function} done - Callback.
     */
    checkPermissionKey: function(dbConn, key, done) {

        r.table("permissionKeys").filter({
            key: key,
        }).run(dbConn, function(err, document) {
            if(err) {
                return done(err, null);
            }

            document.toArray(function(err, arr) {
                console.log(arr)
                //Found key
                if(0<arr.length) {
                    if(arr[0].timeout.time) {
                        if(moment(arr[0].timeout.time).isSameOrAfter()) {
                            return done(null, {permissions: arr[0].permissions, parms: arr[0].parms});

                        } else {
                            var err = new Error("Key Not Valid");
                            err.status = 422;
                            return done(err, null);
                        }
                    } else if(arr[0].timeout.tally) {
                        if(arr[0].timeout.tally >= 1) {
                            //Subtract 1 from tally
                            r.table("permissionKeys").update({
                                timeout: { 
                                    tally: r.row("timeout")("tally").sub(1)
                                }
                            }).run(dbConn, function(err) {
                                if(err) {
                                    return done(err);
                                } else {
                                    return done(null, {permissions: arr[0].permissions, parms: arr[0].parms});
                                    
                                }
                            });
                        } else {
                            // Tally is less than 1
                            var err = new Error("Key Not Valid");
                            err.status = 422;
                            return done(err, null);
                        }
                    } else {
                        var err = new Error("Timeout field malformed.");
                        err.status = 500;
                        return done(err, null);
                    }
                    //return done(null, arr[0]);
                } else {
                    err = new Error("Key Not Found");
                    err.status = 404;
                    return done(err, null);
                }
            });
        });
    },


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