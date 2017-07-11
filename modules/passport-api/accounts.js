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

//TODO: INCLUDE IN INDEX.JS
/** 
* @module passportAccountsApi
*/
var r = require('rethinkdb');
var db = require('../../modules/db/index.js');
var config = require('config');
var bcrypt = require('bcrypt-nodejs');
var human = require('humanparser');
const util = require('util')

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
exports.createAccount = function(dbConn, userGroup, firstName, lastName, email, password, groupFields, done) {
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
}
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
exports.getUserGroupAccountByName = function(dbConn, name, userGroup, done) { 
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
}
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
exports.getUserGroupAccountByUserGroup = function(dbConn, userGroup, done) { 
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
}

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
exports.getUserByID = function(dbConn, id, done) { 
     r.table("accounts").get(id).run(dbConn, function(err, document) {
        if(err) {
            return done(err);
        }
        return done(null, document);
       
     })
}

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
exports.updateAccountGroupFieldsByID = function(dbConn, id, doc, done) {
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

}


//DASHBOARDS//
/*
exports.getSchedulesForStudentDash = function(id, done) {
    var promises = [];
    r.table("accounts").get(id).run(db.conn(), function(err, data) {
        if(err) {
            return done(err);
        }
        var studentPeriodDatadata = data.groupFields.student.periodSchedule
        var periodKeys = Object.keys(studentPeriodDatadata);
        for(var i = 0; i < periodKeys.length; i++) {
            var errs = null;
            var currPer = studentPeriodDatadata[periodKeys[i]];
            
            if(currPer.hasOwnProperty("teacherID") && currPer.teacherID) {
                //loop and get teacher 
                console.log(currPer.teacherID)
                //make promice
                promises.push(r.table("accounts").get(currPer.teacherID).pluck({'name': true, 'groupFields': true}).run(db.conn()))
            }

        }
    //Resolve Promices//
        Promise.all(promises).then(function(tDoc){
            console.log("PeriodKeys")
            console.log(periodKeys)
            //for length of student
            for(var i = 0; i < periodKeys.length; i++) {
                //check if teacher has same periods as student 
                if(teacherPeriodData.hasOwnProperty(periodKeys[i])) {

                }
            }
            var teacherPeriodData = tDoc.groupFields.teacher.periodSchedule;
            
            console.log(teacherPeriodData);
            //check if both have assigned the same periods 
            if(teacherPeriodData.hasOwnProperty(periodKeys[i])) {
                //console.log(periodKeys[i])
                console.log(tDoc)
                console.log(studentPeriodDatadata)
                //add teacher data to student doc
                //studentPeriodDatadata[periodKeys[i]] = teacherPeriodData[periodKeys[i]];
            } else {
                err = new Error("Teacher does not have \"" + periodKeys[i] + "\" period definned");
                err.status = 412;
                errs= err;
            }

        },function(err) {
            if(err) {
                return done(err);
            }
        })
    })
}*/

/*
exports.getSchedulesForStudentDash = function(id, done) {
    r.table("accounts").get(id).eqJoin(r.row('groupFields')('student')('periodSchedule')('a')('teacherID'), r.table("accounts")).zip().run(db.conn(), function(err, data) {
        if(err) {
            return done(err);
        }
        return done(null, data)
        })
}*/


//USER schedules//
//private
function verifyUserSchedule(id, dashboard, schedule_UIN, done) {
    var schedule = schedule_UIN;
    switch(dashboard) {
        case "student": 

            break;
        case "teacher":

            break;
        default: 
            var err = new Error("Unknown dashboard: \"" + dashboard + "\"");
            err.status = 400;
            return done(err);
    }

    //check if there are extra periods
    var requiredPeriods = config.get('schedule.periods');
    var givenPeriods = Object.keys(schedule_UIN);
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
}

/** 
    * Updates a user schedule 
    * @function updateUserSchedule
    * @link module:passportAccountsApi
    * @async
    * @example
    * api.createAccount(connection, "student", "James", "Smith", "james.smith@gmail.com", "123456", {studentID: 01236, isArchived: false }, function(err){
    *   if(err) {
    *     //do something with error
    *   } else {
    *     //Created
    *   }
    * });
    * @param {string} id - ID of Schedule.
    * @param {constant} dashboard - may be either "student" or "teacher"
    * @param {json} schedule_UIN  - The schedule.
    * @param {function} done - Callback
    * @returns {callback}
    */
exports.updateUserSchedule = function(id, dashboard, schedule_UIN, done) {
    //param checks
     verifyUserSchedule(id, dashboard, schedule_UIN, function(err, dbSafe) {
        if(err) {
            return done(err)
        }

        r.table("userSchedules").get(id).update(dbSafe).run(db.conn(), function(err, data) {
            if(err) {
                return done(err)
            }
            return done(null, data)
        });
    })
}

/** 
    * Creates a new user schedule 
    * @function newUserSchedule
    * @link module:passportAccountsApi
    * @async
    * @example
    * api.createAccount(connection, "student", "James", "Smith", "james.smith@gmail.com", "123456", {studentID: 01236, isArchived: false }, function(err){
    *   if(err) {
    *     //do something with error
    *   } else {
    *     //Created
    *   }
    * });
    * @param {string} userID - ID of User.
    * @param {constant} dashboard - may be either "student" or "teacher"
    * @param {json} schedule_UIN  - The schedule.
    * @param {function} done - Callback
    * @returns {callback}
    */
exports.newUserSchedule = function(userID, dashboard, schedule_UIN, done) {
    //makesure no extra periods were left out 
    /*var requiredPeriods = config.get('schedule.periods');
    var givenPeriods = Object.keys(schedule_UIN);
    for(var x = 0; x < requiredPeriods.length; x++) {
        if(!givenPeriods.includes(requiredPeriods[x])) {
            var err = new Error("Missing Required Period: " + requiredPeriods[x])
            err.status = 400;
            return done(err);
        }
    }*/
    verifyUserSchedule(userID, dashboard, schedule_UIN, function(err, dbSafe) {
        if(err) {
            return done(err);
        }
        dbSafe.userId = userID
        //chesk for existing 
        r.table('accounts').get(userID).hasFields({schedules: {[dashboard]: true}}).run(db.conn(), function(err, doc) {
            if(err) {
                return done(err);
            }
            else if(doc == true) {
                var err = new Error("Schedule is Present")
                err.status = 409;
                return done(err);
            } else {
                r.table('userSchedules').insert(dbSafe).run(db.conn(), function(err, trans) {
                    if(err) {
                        return done(err);
                    }
                    
                    r.table('accounts').get(userID).update({schedules: {[dashboard]: trans.generated_keys[0]}}).run(db.conn(), function(err, data) {
                        if(err) {
                            return done(err);
                        }
                        return done(null, trans)
                    })
                })
            }
        })
    })
}
/** 
    * Gets a schedule for a student dash 
    * @function newUserSchedule
    * @link module:passportAccountsApi
    * @async
    * @param {string} userID - ID of User.
    * @param {function} done - Callback
    * @returns {callback}
    */
exports.getStudentSchedule = function(userID, done) {
    if(!userID) {
        var err = new Error("User ID Not Present");
        err.status = 400;
        return done(err)
    }

    //get id of schedule from account
    r.table('accounts').get(userID).pluck({
        "schedules": {
            "student": true
        }
    }).run(db.conn(), function(err, accDoc) {
        if(err) {
            return done(err);
        }
        //if returned stuff
        if(accDoc && accDoc.schedules && accDoc.schedules.student) {
            //get keys
            r.table('userSchedules').get(accDoc.schedules.student).run(db.conn(), function(err, student) {
                if(err) {
                    return done(err);
                }
                if(!student || !student.schedule) {
                    var err = new Error("student.schedule not defined");
                    err.status = 500;
                    return done(err)
                }

                var periods = Object.keys(student.schedule);
                recursiveStudentScheduleJoin(periods, student, function(err, joined) {
                    if(err) {
                        return done(err);
                    }
                    console.log(joined);
                    return done(null, joined)
                });
                
            })
        }
        
    })
}
function recursiveStudentScheduleJoin(keys, student, done) {
    if(keys.length <= 0) {
        return done(null, student);
    }
    console.log(student.schedule);
    console.log(keys[0])
    if(student.schedule[keys[0]].teacherID) {
        r.table('accounts').get(student.schedule[keys[0]].teacherID).pluck({
            "schedules": {
                "teacher": true
            }, 
            "name": true
        }).run(db.conn(), function(err, teacherAccount) {
            console.log(teacherAccount.schedules.teacher)
            r.table('userSchedules').get(teacherAccount.schedules.teacher).run(db.conn(), function(err, teacher) {
                if(err) {
                    return done(err);
                }
                console.log(teacher)
                if(!teacher || !teacher.schedule || !teacher.userId) {
                    var err = new Error("teacher is not set in the db");
                    err.status = 500;
                    return done(err)
                }
                //check if teacher has the period key 
                if(teacher.schedule.hasOwnProperty(keys[0])) {
                    //start joining
                    student.schedule[keys[0]] = teacher.schedule[keys[0]];
                    student.schedule[keys[0]].scheduleID = teacher.id;
                    student.schedule[keys[0]].teacher = {};
                    student.schedule[keys[0]].teacher.id = teacher.userId;
                    student.schedule[keys[0]].teacher.name = teacherAccount.name;
                    return recursiveStudentScheduleJoin(keys.slice(1), student, done)
                } else {
                    var err = new Error("Teacher has not defined a period that the student has. Period: " + keys[0]);
                    err.status = 500;
                    return done(err)
                }
                    

                    

            })
        });
    } else {
        return recursiveStudentScheduleJoin(keys.slice(1), student, done);
    }
}