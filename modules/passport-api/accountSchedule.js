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
* Node APIs for manupulating and getting user schedules
* @module js/userSchedule
*/
// START [IMPORTS]

let utils = require("../passport-utils/index.js")
let accountJS = require("./accounts.js");
let db = require('../../modules/db/index.js');
let r = db.dash();
let config = require('config');
let typeCheck = require("type-check").typeCheck;


// END [IMPORTS]  

// START [TYPE DEFS] 

/**
* Student Schedule/Student Dashboard Schedule object
* @typedef {Object} studentSchedule
* @prop {Object.<...string, Object>} somePeriodName - the key for this should be a period constant defined in the configs
* @prop {?string} somePeriodName.teacherID - Holds an account ID linked to this period. Basically, the student is under this teacher's jurisdiction normally during this period. If null, the student is assumed to not have teacher supervision.
* @example
* {
*    "a": {
*        "teacherID": "2e75aa94-fa63-461a-be06-5345322bebdf"
*    },
*    "b": {
*        "teacherID": "0115c0b0-ee04-4e88-a21f-d2029601b276"
*    },
*    "flex": {
*        "teacherID": null
*    },
*    "lunch": {
*        "teacherID": null
*    }
* }
*/

/**
* Teacher or Supervisor Schedule / Teacher Dashboard Schedule object
* @typedef {Object} teacherSchedule
* @prop {Object.<...string, Object>} somePeriodName - the key for this should be a period constant defined in the configs
* @prop {string} [somePeriodName.className] - Friendly name for the class being taught or activity being supervised 
* @prop {boolean} somePeriodName.isTeaching - If true, students will be discouraged from requesting a pass that period. 
* @prop {string} [somePeriodName.room] - room#/name that the user will primarily be in.
* @prop {int} [somePeriodName.passLimit] - The maximum number of passes to accept per period.  Any passes requested over that period will be in a state of "Queue".  Setting to 0 will Queue all passes.
* @example
* {
*    "a": {
*        "className": "Algebra 1",
*        "isTeaching": true,
*        "room": "W-2048",
*        "passLimit": 0
*    },
*    "b": {
*        "className": "AP Computer Science",
*        "isTeaching": true,
*        "room": "E-404",
*        "passLimit": 0
*    },
*    "c": {
*        "className": "Sub Period",
*        "isTeaching": false,
*        "room": "W-2048"
*    },
*    "flex": {
*        "isTeaching": false,
*        "room": "W-2048",
*        "passLimit": 10
*    },
*    "lunch": {
*        "isTeaching": false,
*        "room": "Teacher Lounge",
*        "passLimit": 0
*    }
* }
*/

//END [TYPE DEFS]
//START [CODE]

/**
* Gets a user Schedule with params
* @link module:js/userSchedule
* @param {Object} [params] 
* @param {string} [params.id] - Primary Key/Index for the row/doc
* @param {string} [params.dashboard] - Currently only "student" or "teacher" types exist
* @param {(studentSchedule|teacherSchedule)} [params.schedule] - can search by a schedule object
* @returns {Promise}
*/
exports.get = (params) => {
    return new Promise((resolve, reject) => {
        let typeStruct = `Maybe {
            id: Maybe String,
            dashboard: Maybe String,
            schedule: Maybe Object
        }`;
        if(!typeCheck(typeStruct, params)) {
            let err = new TypeError("params expected an object with structure: \"" + typeStruct + "\"");
            err.status = 400;
            return reject(err);
        }
        //GET From DB
        let query = r.table("userSchedules");
        if(params) {
            if(typeof params.id === "string") {
                query = query.getAll(params.id);
                delete params.id;
            }
            query = query.filter(params);
        }
        return query.run().then(resolve).catch(reject);
    });
}

/**
* Gets a student schedule by userID
* @link module:js/userSchedule
* @param {string} userID 
* @returns {studentSchedule} - Promise
*/
exports.getStudentSchedule = function(userID) {
    return new Promise((resolve, reject) => {
        if(!userID) {
            var err = new TypeError("User ID Expected a string");
            err.status = 400;
            return reject(err)
        }
        //Get user from DB 

        accountJS.get({id: userID}).then((studentUser) => {
            if(studentUser.length < 1) {
                var err = new Error("User not found");
                err.status = 404;
                return reject(err)
            }
            studentUser = studentUser[0];
            //check for student schedule
            if(!studentUser.schedules || !studentUser.schedules.student) {
                var err = new Error("Account has no student schedule linked");
                err.status = 404;
                return reject(err)
            }
            //MERGE 
            return r.table("userSchedules").get(studentUser.schedules.student)
            
            .do(function(schedule) {
                //overwrite the schedule object with merged data
                return schedule.merge(r.object("schedule", 
                    //loops for each key
                    schedule("schedule").keys().map(function(key) {
                        //by putting everything in an aray, we can then call .coerceTo('object') to get everything back to an object.
                        return [key, schedule("schedule")(key).do(function(period) {
                            //GET USER ACCOUNT BY teacherID key
                            //If teacherID is not a string, we will return teacherID: null.
                            //if it is a string we get the account and do some manipulation to get the teacher schedule id aswell as wrap it in a "teacher" key
                            return r.branch(
                                //IF
                                period("teacherID").typeOf().eq("STRING"),
                                //THEN
                                r.table("accounts").get(period("teacherID"))
                                .pluck({
                                    "schedules": {
                                        "teacher": true
                                    }, 
                                    "name": true, 
                                    "email": true,
                                    "id": true
                                })
                                .do(function(teacher) {
                                    //put teacher stuff in teacher object
                                    return r.object("teacher", teacher)
                                })
                                //merge teacher schedule 
                                .do(function(teacher) {
                                    
                                    return teacher.merge(
                                        r.branch(
                                            //IF
                                            teacher.hasFields({teacher: {schedules: {teacher: true}}})
                                            ,
                                            //then
                                            {teacher: r.table("userSchedules").get(teacher("teacher")("schedules")("teacher"))
                                                .do(function(tSchedule) {
                                                    return r.branch(
                                                        //IF teacher has set period
                                                        tSchedule.hasFields({schedule: [key]})
                                                        ,//THEN
                                                        {period: tSchedule("schedule")(key)}
                                                        ,//ELSE
                                                        {}
                                                    )
                                                })
                                            }
                                            ,
                                            //else
                                            {}
                                        )
                                    )
                                })
                                //.merge(schedule("schedule")(key))
                                ,
                                //else
                                {teacherID: null}
                            )
                            
                        })]
                    }).coerceTo('object')
                
                ))
                
            })

            .run().then(resolve).catch(reject)

        }).catch((err) => {return reject(err);})
    })
}


/** 
    * Gets the teacher schedule for an account 
    * @link module:js/userSchedule
    * @param {string} userID - ID of User.
    * @param {Object} [query]
    * @param {string[]} [query.periods] - only return these periods.  Defaults to all periods
    * @returns {teacherSchedule} - Promise
    */
exports.getTeacherSchedule = function(userID, query) {
    return new Promise((resolve, reject) => {
        if(!userID) {
            var err = new Error("User ID Not Present");
            err.status = 400;
            return reject(err)
        }

        function userScheduleQuery(account) {
            let tQu = r.table('userSchedules').get(account("schedules")("teacher"))
            if (query && typeCheck("[String]", query.periods)) {
                tQu = tQu.pluck({
                    schedule: query.periods
                })
            }

            return tQu;
        }

        r.table('accounts').get(userID)
        .do((account) => {
            return r.branch(
                account.hasFields({schedules: {teacher: true}})
                ,
                userScheduleQuery(account)
                ,
                null
            )
        }).run().then((res) => {
            return resolve(res)
        }).catch((err) => {return reject(err);})
    })
}



function verifyStudentSchedule(schedule, done) {
    var givenPeriods = Object.keys(schedule);
    for(var x = 0; x < givenPeriods.length; x++) {
        //make "" null 
        console.log(schedule[givenPeriods[x]].teacherID)
        let verType = "{teacherID: String|Null}";
        if(!typeCheck(verType, schedule[givenPeriods[x]])) {
            var err = new TypeError("Schedule expected an array of objects with structure: " + "{*: " + verType + "}")
            return done(err)
        }
        console.log(schedule[givenPeriods[x]], "vsc")
        if(schedule[givenPeriods[x]].teacherID == '') {
            console.log("isDumb")
            schedule[givenPeriods[x]].teacherID = null
        }
        if(schedule[givenPeriods[x]] == "true") {
            schedule[givenPeriods[x]] = true;
        } else if(schedule[givenPeriods[x]] == "false"){
            schedule[givenPeriods[x]] = false;
        }

        if(x >= givenPeriods.length-1 ) {
            return done(null, schedule)
        }
    }
}

function verifyTeacherSchedule(schedule) {
    return new Promise((resolve, reject) => {
        var givenPeriods = Object.keys(schedule);
        for(var x = 0; x < givenPeriods.length; x++) {
            let verType = "{className: Maybe String, isTeaching: Boolean, room: Maybe String, passLimit: Maybe Number}";
            if(!typeCheck(verType, schedule[givenPeriods[x]])) {
                var err = new TypeError("Schedule expected an array of objects with structure: " + "{*: " + verType + "}")
                return reject(err)
            }
            return resolve(schedule);
        }
    })
}
function verifyUserSchedule(dashboard, schedule_UIN, done) {
    var schedule = schedule_UIN;
    var promise = new Promise(function(resolve, reject) {
        switch(dashboard) {
            case "student": 
                verifyStudentSchedule(schedule, function(err, nSch) {
                    if(err) {
                        return reject(err);
                    }
                    schedule = nSch
                    resolve();
                })
                break;
            case "teacher":
                return verifyTeacherSchedule(schedule).then(resolve).catch(reject);
                break;
            default: 
                var err = new Error("Unknown dashboard: \"" + dashboard + "\"");
                err.status = 400;
                return reject(err);
        }
    });
    promise.then(function(result) {
        console.log(schedule)
        //check if there are extra periods
        var requiredPeriods = config.get('schedule.periods');
        var givenPeriods = Object.keys(schedule);
        for(var x = 0; x < givenPeriods.length; x++) {
            if(!requiredPeriods.includes(givenPeriods[x])) {
                var err = new Error("Unknown Period: \"" + givenPeriods[x] + "\"")
                err.status = 400;
                return done(err);
            }
        }
        

        var toDB = {
            "dashboard": dashboard,
            "schedule": schedule
        }
        return done(null, toDB)
    }, function(err) {
        return done(err)
    });
}

/** 
    * Updates a user schedule 
    * @link module:js/userSchedule
    * @param {string} userID - User id to update.
    * @param {string} dashboard - may be either "student" or "teacher"
    * @param {object} schedule  - The schedule object. 
    * @returns {Promise}
    */
exports.update = function(userID, dashboard, schedule) {
    return new Promise((resolve, reject) => {
    
         verifyUserSchedule(dashboard, schedule, function(err, dbSafe) {
            if(err) {
                return reject(err)
            }
            r.table("accounts").get(userID).run().then((user) => {
                if(!user) {
                    var err = new Error("User not found");
                    err.status = 404;
                    return reject(err);
                } 
                if(user.schedules && user.schedules[dashboard]) {
                    r.table("userSchedules").get(user.schedules[dashboard]).update(dbSafe).run(function(err, data) {
                        if(err) {
                            return reject(err)
                        }
                        return resolve(data)
                    });
                } else {
                    var err = new Error("User schedule not found");
                    err.status = 404;
                    return reject(err);
                }
            }).catch((err) => {return reject(err);})
            
        })
     });
}


/** 
    * Replaces a user schedule 
    * @link module:js/userSchedule
    * @param {string} userID - Userid to replace the schedule.
    * @param {string} dashboard - may be either "student" or "teacher"
    * @param {object} schedule  - The schedule object. 
    * @returns {Promise}
    */
exports.replace = (userID, dashboard, schedule) => {
    return new Promise((resolve, reject) => {
        if(typeCheck("Null", schedule)) {
            var err = new TypeError("To delete a user schedule, please use .deleteUserSchedule");
            err.status = 400;
            return reject(err);
        }
        if(!typeCheck("Object", schedule)) {
            var err = new TypeError("schedule expected to be an object, got " + typeof schedule);
            err.status = 400;
            return reject(err);
        }
        console.log(schedule)
        verifyUserSchedule(dashboard, schedule, function(err, dbSafe) {
            if(err) {
                return reject(err)
            }
            r.table("accounts").get(userID).run().then((user) => {
                if(!user) {
                    var err = new Error("User not found");
                    err.status = 404;
                    return reject(err);
                } 
                if(user.schedules && user.schedules[dashboard]) {
                    dbSafe.id = user.schedules[dashboard];
                    r.table("userSchedules").get(user.schedules[dashboard]).replace(dbSafe).run(function(err, data) {
                        if(err) {
                            return reject(err)
                        }
                        return resolve(data)
                    });
                } else {
                    var err = new Error("User schedule not found");
                    err.status = 404;
                    return reject(err);
                }
            }).catch((err) => {return reject(err);})
            
        })
    })
}

/** 
    * Creates a new user schedule 
    * @link module:js/userSchedule
    * @param {string} userID - ID of User.
    * @param {constant} dashboard - may be either "student" or "teacher"
    * @param {object} schedule_UIN  - The schedule.
    * @returns {Promise}
    */
exports.new = function(userID, dashboard, schedule_UIN) {
    return new Promise((resolve, reject) => {
        verifyUserSchedule(dashboard, schedule_UIN, function(err, dbSafe) {
            if(err) {
                return reject(err);
            }
            //dbSafe.userId = userID;
            //chesk for existing 
            r.table('accounts').get(userID).hasFields({schedules: {[dashboard]: true}}).run(function(err, doc) {
                if(err) {
                    return reject(err);
                }
                else if(doc == true) {
                    var err = new Error("Schedule is Present")
                    err.status = 409;
                    return reject(err);
                } else {
                    r.table('userSchedules').insert(dbSafe).run(function(err, trans) {
                        if(err) {
                            return reject(err);
                        }
                        
                        r.table('accounts').get(userID).update({schedules: {[dashboard]: trans.generated_keys[0]}}).run(function(err, data) {
                            if(err) {
                                return reject(err);
                            }
                            return resolve(trans)
                        })
                    })
                }
            })
        })
    });
}


//END [CODE]