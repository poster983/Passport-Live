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
            console.log("js/userSchedule.getStudentSchedule#studentUser", studentUser);
            //check for student schedule
            if(!studentUser.schedules || !studentUser.schedules.student) {
                var err = new Error("Account has no student schedule linked");
                err.status = 404;
                return reject(err)
            }
            //MERGE 
            return r.table("userSchedules").get(studentUser.schedules.student)
            
            .do(function(schedule) {
                //loop over each key
                return schedule.merge(r.object("schedule", 
                    schedule("schedule").keys().map(function(key) {
                        //construct new schedule objects
                        return [key, schedule("schedule")(key).do(function(period) {
                            return r.branch(
                                period("teacherID").typeOf().eq("STRING"),
                                r.table("accounts").get(period("teacherID"))
                                .pluck({
                                    "schedules": {
                                        "teacher": true
                                    }, 
                                    "name": true, 
                                    "email": true,
                                    "id": true
                                })
                                .merge(schedule("schedule")(key))
                                ,
                                {teacherID: null}
                            )
                            
                        })]
                    }).coerceTo('object')
                
                ))
                
            })

            .run().then(resolve).catch(reject) //.then((joined) => {console.log(joined); return resolve(joined);})

        }).catch((err) => {return reject(err);})
    })
}

setTimeout(function() {
    exports.getStudentSchedule("3c4fb0e7-9330-45d0-8d7c-9c29142fac45").then((res) => {
        console.log(res)
    }).catch((err) => { console.error(err)})
}, 500);


//END [CODE]