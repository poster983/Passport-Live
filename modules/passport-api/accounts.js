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
* Account manipulation APIs
* @module js/accounts
*/
var r = require('rethinkdb');
var db = require('../../modules/db/index.js');
var config = require('config');
var bcrypt = require('bcrypt-nodejs');
var utils = require("../passport-utils/index.js")
var human = require('humanparser');
var moment = require("moment");
var _ = require("underscore");
const util = require('util')
var typeCheck = require("type-check").typeCheck;
var securityJS = require("./security.js");
var emailJS = require("./email.js");


/** 
    * Creates An Account 
    * @function createAccount
    * @link module:passportApi
    * @async
    * @example
    * api.createAccount({userGroup: "student", name: {first: "Student", last: "McStudentface", salutation: "Mx." } email: "james.smith@gmail.com", schoolID: "123456", {studentID: 01236, isArchived: false }, function(err){
    *   if(err) {
    *     //do something with error
    *   } else {
    *     //Created
    *   }
    * });
    * @param {Object} user
    * @param {String} user.userGroup - A usergroup defined in the config
    * @param {Object} user.name
    * @param {string} user.name.salutation - A user's title/salutation (Mr., Ms., Mx., ECT...)
    * @param {string} user.name.first - A user's given name
    * @param {string} user.name.last - A user's family name
    * @param {string} user.email - A user's email address
    * @param {(string|undefined|null)} user.schoolID - A user's schoolID (optional)
    * @param {(boolean|undefined)} user.isVerified - If false, the user must first click on a verification link before being able to login. (default: false)
    * @param {(int|null|undefined)} user.graduationYear - Optional
    * @param {(string|undefined|null)} user.password - The user's password.  If undefined or null, options.generatePassword must be true or it will error.
    * @param {(Object|undefined)} user.groupFields - A json object with data unique to that usergroup (Most of the time, the json object is empty.  The program does most of the work)
    * @param {accountFlags} user.flags - See typedef
    * @param {(Object|undefined)} options
    * @param {boolean} options.generatePassword - overrides user.password and generates a secure random password Will return the password in the promise.(Default: false)
    * @param {boolean} options.skipEmail - Will Skip sending any confirmation email all together. (Default: false)
    * @param {boolean} options.allowNullPassword - Will not error if password is of type Null.  The password will be set on account activation. This improves this function's efficiency massively if the password is set to null(default: false)
    * @returns {Promise} - Resolution includes the transaction summary
    */
//userGroup, name, email, password, schoolID, graduationYear, groupFields, flags,
exports.createAccount = function(user, options) {
    return new Promise((resolve, reject) => {
        //console.log(user)
        if(options && options.generatePassword) {
            user.password = utils.generateSecureKey();
        }
        //console.log(typeof user.isVerified)
        if(typeof user.isVerified != "boolean" && typeof user.isVerified != "undefined") {
            var err = new Error("user.isVerified must be a boolean.  Got " + typeof user.isVerified);
            err.status = 400;
            return reject(err);
        }
        user.isVerified = (user.isVerified==true);
        
        if(!user.userGroup) {
            var err = new Error("Usergroup Undefined");
            err.status = 400;
            return reject(err);
        }
        if(!user.name || !user.name.salutation) {
            var err = new Error("salutation Undefined");
            err.status = 400;
            return reject(err);
        }
        if(!user.name || !user.name.first) {
            var err = new Error("firstName Undefined");
            err.status = 400;
            return reject(err);
        }
        if(!user.name || !user.name.last) {
            var err = new Error("lastName Undefined");
            err.status = 400;
            return reject(err);
        }
        if(!user.email) {
            var err = new Error("email Undefined");
            err.status = 400;
            return reject(err);
        } else {
            user.email = user.email.toLowerCase();
        }
        /*if(!options || !options.allowNullPassword) {
            if(!user.password) {
                var err = new Error("password Undefined");
                err.status = 400;
                return reject(err);
            }
        }*/
        if(options && options.allowNullPassword === true) {
            if(!typeCheck("{password: Null | String, ...}", user)) {
                var err = new TypeError("expected password to be either Null or String.  Got: " + typeof user.password);
                err.status = 400;
                return reject(err);
            }
        } else {
            if(!typeCheck("{password: String, ...}", user)) {
                var err = new TypeError("expected password to be a String.  Got: " + typeof user.password);
                err.status = 400;
                return reject(err);
            }
        }

        if(!user.schoolID || user.schoolID == "") {
            user.schoolID = null;
        }
        if(!user.graduationYear || user.graduationYear == "") {
            if(config.has('userGroups.' + user.userGroup + '.graduates') && config.get('userGroups.' + user.userGroup + '.graduates') == true) {
                var err = new Error("usergroup \"" + user.userGroup + "\" graduates. user.graduationYear must be a year.");
                err.status = 400;
                return reject(err);  
            }
            user.graduationYear = null;
        } else if(!moment(user.graduationYear, "YYYY", true).isValid()) { //isNaN(parseInt(user.graduationYear))
            var err = new Error("graduationYear Is Not A year");
            err.status = 400;
            return reject(err);   
        } else {
            user.graduationYear = parseInt(user.graduationYear)
        }
        if(typeof user.groupFields == "undefined" || !!user.groupFields || (user.groupFields.constructor === Object && Object.keys(user.groupFields).length === 0)) {
            user.groupFields = {};
        }
        //console.log(user)
        //console.log(email.substring(email.indexOf("@")))
        var emailPromise = new Promise(function(resolveE, rejectE) {
            if (config.has('userGroups.' + user.userGroup)) {
                if(config.has("userGroups." + user.userGroup + ".permissions.allowedEmailDomains")) {
                    var uGD = config.get("userGroups." + user.userGroup + ".permissions.allowedEmailDomains")
                    console.log(uGD)
                    if(uGD != false && uGD.length > 0) {
                        for(var z = 0; z < uGD.length; z++) {
                            //console.log(uGD[z], "email")
                            if(user.email.substring(user.email.indexOf("@")) == uGD[z].toLowerCase()) {
                                resolveE();
                            }
                            if(z >= uGD.length - 1 ) {
                                var err = new Error("Email Domain Not Allowed.")
                                err.status = 403;
                                rejectE(err);
                            }
                        }
                    } else {
                        resolveE();
                    }
                } else {
                    resolveE();
                }
            } else {
                var err = new Error("Usergroup Not Found");
                err.status = 404;
                rejectE(err);
            }
        });
        emailPromise.then(function() {

            
            //All code to be run after hashing is complete
            function afterHash(passwordImport) {
                try {
                  // Store hash in your password DB.
                  r.table("accounts")('email').contains(user.email).run(db.conn(), function(err, con){
                    if(err) {
                        console.error(err);
                        return reject(err);
                    }
                    //Checks to see if there is already an email in the DB            
                    if(con){
                      //THe email has been taken
                      var err = new Error("Email Taken");
                      err.status = 409
                      return reject(err);
                    } else {
                        //insert new account
                        function ver() {
                            if(user.isVerified) {
                                return r.now();
                            } else {
                                return null;
                            }
                        }
                        promice = r.table("accounts").insert({
                          name: {
                            first: user.name.first,
                            last: user.name.last,
                            salutation: user.name.salutation
                          },
                          email: user.email,
                          password: passwordImport,
                          userGroup: user.userGroup, // should be same as a usergroup in config/default.json
                          groupFields: user.groupFields,
                          schoolID: user.schoolID,
                          graduationYear: user.graduationYear,
                          isArchived: false,
                          isVerified: user.isVerified,
                          properties: {
                            createdOn: r.now(),
                            verifiedOn: ver()
                          },
                          integrations: false,
                          flags: (user.flags || {})
                        }).run(db.conn());
                        promice.then(function(results) {
                            if(results.inserted == 1) {
                                var resp = {transaction: results};
                                if(options && options.generatePassword) {
                                    resp.password = user.password; 
                                }
                                //check email stuff
                                if(options && options.skipEmail) {
                                    return resolve(resp);
                                } else {
                                    emailJS.sendActivationEmail({
                                        to: user.email,
                                        name: user.name,
                                        accountID: results.generated_keys[0]
                                    }).then((result)=> {
                                        return resolve(resp);
                                    }).catch((err)=> {
                                        return reject(err);
                                    })
                                }
                            } else {
                                var err = new Error("Failed to store user in the database");
                                err.status = 500;
                                return reject(err, results)
                            }
                            
                      }).catch(function(err) {
                        return reject(err)
                      });
                    }
                  });
                } catch(e) {
                    
                    return reject(e);
                }
            }
            //if password is allwed to be null and is null, then just import it.  If not hash it.  Error checking should have already caught the null if it was not allowed.
            if((options && options.allowNullPassword === true) && user.password === null) {
                afterHash(null);
            } else {
                bcrypt.hash(user.password, null, null, function(err, hash) {
                    if(err) {
                        console.error(err);
                        return reject(err, null);
                    }
                    afterHash(hash);
                });
            }

        }, function(err) {
            return reject(err);
        })
    })
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
    * @param {string} name - user's name, can be in any format
    * @param {constant} userGroup - A usergroup defined in the config
    * @param {function} done - Callback
    */
exports.getUserGroupAccountByName = function(dbConn, name, userGroup, done) { 
     r.table("accounts")
     .filter(function(doc){
            return doc('userGroup').match(userGroup).and(
                    doc('name')('first').add(doc('name')('last')).match("(?i)"+name.replace(/\s/g,'')).or(
                        doc('name')('salutation').add(doc('name')('first'), doc('name')('last')).match("(?i)"+name.replace(/\s/g,'')).or(
                            doc('name')('salutation').add(doc('name')('last')).match("(?i)"+name.replace(/\s/g,''))
                        )
                    )
                )
        }).run(dbConn, function(err, document) {

         if(err) {
            //console.log(err)
            return done(err, null);
        }

        document.toArray(function(err, arr) {
            if(err) {
                return done(err)
            }
            return done(null, arr);            
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
    * Searches by email the account database 
    * @function getAccountByEmail
    * @link module:passportApi
    * @async
    * @returns {callback} Contains ALL account info stored in database.  Make sure to only sent nessessary info to user.
    * @param {string} email - The user's Email
    * @param {function} done - Callback
    */
exports.getAccountByEmail = function(email, done) { 
     r.table("accounts").filter({
        email: email
     }).run(db.conn(), function(err, document) {
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
    * @param {constant} id - The ID of the user
    * @param {function} done - Callback
    */
exports.getUserByID = function(id, done) { 
    if(!typeCheck("String", id)) {
        var err = new TypeError("Expected ID to be type \"String\" Got: " + typeof id);
        err.status = 400;
        return done(err)
    }
     r.table("accounts").get(id).run(db.conn(), function(err, document) {
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
function verifyStudentSchedule(schedule, done) {
    var givenPeriods = Object.keys(schedule);
    for(var x = 0; x < givenPeriods.length; x++) {
        //make "" null 
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
function verifyUserSchedule(id, dashboard, schedule_UIN, done) {
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
                resolve();
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
    * @function updateUserSchedule
    * @link module:passportAccountsApi
    * @async
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
    * @param {string} userID - ID of User.
    * @param {constant} dashboard - may be either "student" or "teacher"
    * @param {json} schedule_UIN  - The schedule.
    * @param {function} done - Callback
    * @returns {callback}
    */
exports.newUserSchedule = function(userID, dashboard, schedule_UIN, done) {
    //makesure no extra periods were left out 
    var requiredPeriods = config.get('schedule.periods');
    var givenPeriods = Object.keys(schedule_UIN);
    for(var x = 0; x < requiredPeriods.length; x++) {
        if(!givenPeriods.includes(requiredPeriods[x])) {
            var err = new Error("Missing Required Period: " + requiredPeriods[x])
            err.status = 400;
            return done(err);
        }
    }
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
    * @function getStudentSchedule
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
                    //console.log(joined);
                    return done(null, joined)
                });
                
            })
        } else {
            var err = new Error("Account has no schedule linked");
                    err.status = 404;
                    return done(err)
        }
        
    })
}
function recursiveStudentScheduleJoin(keys, student, done) {
    if(keys.length <= 0) {
        return done(null, student);
    }
    //console.log(student.schedule);
    //console.log(keys[0])
    
    if(student.schedule[keys[0]] && student.schedule[keys[0]].teacherID) {
        try{ 
            r.table('accounts').get(student.schedule[keys[0]].teacherID).pluck({
                "schedules": {
                    "teacher": true
                }, 
                "name": true, 
                "email": true,
                "id": true
            }).run(db.conn(), function(err, teacherAccount) {
                if(err) {
                    console.log(err)
                    return done(err);
                }
                //console.log(teacherAccount.schedules.teacher)
                if(!teacherAccount.schedules || !teacherAccount.schedules.teacher) {
                    student.schedule[keys[0]] = {};
                    student.schedule[keys[0]].teacher = {};
                    student.schedule[keys[0]].teacher.id = teacherAccount.id;
                    student.schedule[keys[0]].teacher.name = teacherAccount.name;
                    student.schedule[keys[0]].teacher.email = teacherAccount.email;
                    student.schedule[keys[0]].teacher.scheduleID = null;
                    //console.log(keys[0], "teacherid is Null")

                    return recursiveStudentScheduleJoin(keys.slice(1), student, done)
                } else {
                    try{ 
                        r.table('userSchedules').get(teacherAccount.schedules.teacher).run(db.conn(), function(err, teacher) {
                            if(err) {
                                return done(err);
                            }
                            //console.log(teacher)
                            if(!teacher || !teacher.schedule || !teacher.userId) {
                                var err = new Error("teacher is not set in the db");
                                err.status = 500;
                                return done(err)
                            }
                            //check if teacher has the period key 

                            if(teacher.schedule.hasOwnProperty(keys[0]) && teacher.schedule[keys[0]]) {
                                //start joining
                                //console.log(teacher.schedule[keys[0]], keys[0])
                                student.schedule[keys[0]] = teacher.schedule[keys[0]];
                                student.schedule[keys[0]].teacher = {};
                                student.schedule[keys[0]].teacher.id = teacher.userId;
                                student.schedule[keys[0]].teacher.name = teacherAccount.name;
                                student.schedule[keys[0]].teacher.scheduleID = teacher.id;
                                return recursiveStudentScheduleJoin(keys.slice(1), student, done)
                            } else {
                                var err = new Error("Teacher has not defined a period that the student has. Period: " + keys[0]);
                                err.status = 500;
                                return done(err)
                            }
                                

                                

                        })
                    } catch(e) {
                        return done(e)
                    }
                }
            });
        } catch(e) {
            return done(e)
        }
    } else {
        //console.log(keys[0], "skipped")
        return recursiveStudentScheduleJoin(keys.slice(1), student, done);
    }

}

/** 
    * Gets a schedule for a teacher dash 
    * @function getTeacherSchedule
    * @link module:passportAccountsApi
    * @async
    * @param {string} userID - ID of User.
    * @param {function} done - Callback
    * @returns {callback}
    */
exports.getTeacherSchedule = function(userID, done) {
    if(!userID) {
        var err = new Error("User ID Not Present");
        err.status = 400;
        return done(err)
    }

    r.table('accounts').get(userID).pluck({
        "name": true,
        "id": true,
        "schedules": {
            "teacher": true
        }
    }).run(db.conn(), function(err, accDoc) {
         if(err) {

            return done(err);
        }
        //if returned stuff
        if(accDoc && accDoc.schedules && accDoc.schedules.teacher) {
             r.table('userSchedules').get(accDoc.schedules.teacher).run(db.conn(), function(err, teacher) {
                if(err) {
                    return done(err);
                }
                if(!teacher || !teacher.schedule) {
                    var err = new Error("teacher.schedule not defined");
                    err.status = 500;
                    return done(err)
                }
                
                return done(null, teacher)
            });
        } else {
            var err = new Error("Account has no schedule linked");
                    err.status = 404;
                    return done(err)
        }
    });
}

/** 
    * Gets Specific Periods based of user.  
    * @function getSpecificPeriods
    * @link module:passportAccountsApi
    * @async
    * @param {string} userID - ID of User.
    * @param {function} done - Callback
    * @returns {callback} Both teacher and student dashboard period info
    */
exports.getSpecificPeriods = function(userID, periodArray, done) {
    var promises = [];
    if(periodArray.length <= 0) {
        var err = new Error("No Periods Specified");
            err.status = 400;
            return done(err)
    }
    exports.getUserByID(userID, function(err, userData) {
        if(err) {
            return done(err)
        } 
        if(!userData) {
            var err = new Error("Account Not Found");
            err.status = 404;
            return done(err)
        }
        if(!userData.schedules || (!userData.schedules.student && !userData.schedules.teacher)) {
            var err = new Error("Account Has No Schedules Linked");
            err.status = 404;
            return done(err)
        }
    
        if(userData.schedules.student) {
            promises.push(new Promise(function(resolve, reject) {
                exports.getStudentSchedule(userID, function(err, studentSchedule) {
                    if(err) {
                        return reject(err);
                    }
                    if(!studentSchedule.schedule) {
                        var err = new Error("Schedule Not Found");
                        err.status = 404;
                        return reject(err)
                    }
                    var studentReturn = {student: []};
                    for(var x = 0; x < periodArray.length; x++) {
                        studentReturn.student.push({period: periodArray[x], periodData: studentSchedule.schedule[periodArray[x]]})
                        if(x >= periodArray.length-1 ) {
                            return resolve(studentReturn);                            
                        }
                        
                    }
                    
                })
                
            }));
        }
        if(userData.schedules.teacher) {
            promises.push(new Promise(function(resolve, reject) {
                exports.getTeacherSchedule(userID, function(err, teacherSchedule) {
                    if(err) {
                        return reject(err);
                    }
                    if(!teacherSchedule.schedule) {
                        var err = new Error("Schedule Not Found");
                        err.status = 404;
                        return reject(err)
                    }
                    var teacherReturn = {teacher: []};
                    for(var x = 0; x < periodArray.length; x++) {
                        teacherReturn.teacher.push({period: periodArray[x], periodData: teacherSchedule.schedule[periodArray[x]]})
                        if(x >= periodArray.length-1 ) {
                            return resolve(teacherReturn);                            
                        }
                        
                    }
                })
            }));
        }

        Promise.all(promises).then(function(periods){
            if(periods.length == 2) {
                return done(null, Object.assign({},periods[0], periods[1]))
            } else {
                return done(null, periods[0])
            }
            
        }).catch(function(err) {
            return done(err)
        });
    });
}

/*
* Creates a link that allows the holder to reset the linked account password
* @function generateResetPasswordLink
* @link module:js/accounts
* @param {Object} identifier
* @property {(undefined|string)} identifier.id - account ID (prefers this)
* @property {(undefined|string)} identifier.email - account email (If there are conflicts, an error will be thrown)
* @returns {Promise}
*/
/*
exports.generateResetPasswordLink = function(identifier) {
    return new Promise((mainResolve, mainReject) => {
        return new Promise((resolve, reject) => {
            if(typeCheck('{id: Maybe String, email: Maybe String}', identifier)) {
                if(identifier.id) {
                    exports.getUserByID(identifier.id, (err, user) => {
                        if(err) {return reject(err);}
                        if(!user){var err = new Error("User not found"); err.status = 404; return reject(err);}
                        return resolve(user)
                    });
                } else if(identifier.email) {
                    exports.getAccountByEmail(identifier.email, (err, user) => {
                        if(err) {return reject(err);}
                        if(user.length <= 0) {var err = new Error("User not found"); err.status = 404; return reject(err);}
                        if(user.length > 1) {var err = new Error("Conflicting Emails"); err.status = 409; return reject(err);}
                        return resolve(user)
                    })
                } else {
                    var err = new TypeError("identifier.id must be of type string OR identifier.email must be of type string");
                    return reject(err);
                }
            } else {
                var err = new TypeError("identifier.id must be of type string OR identifier.email must be of type string");
                return reject(err);
            }
        }).then((user) => {
            return securityJS.newKey.resetPassword(user.id).then(mainResolve).catch(mainReject)
        }).catch(mainReject);
    })
}*/


/**
* Updates the given account's password with a new one
* @function updatePassword
* @link module:js/accounts
* @param {String} id - Account ID
* @param {String} newPassword
* @returns {Promise}
*/
exports.updatePassword = function(id, newPassword) {
    return new Promise(function(resolve, reject) {
        utils.checkPasswordPolicy(newPassword).then((result) => {
            if(result.valid) {
                bcrypt.hash(newPassword, null, null, function(err, hash) {
                  if(err) {
                    //console.log(err)
                    return reject(err);
                  }
                  if(hash) {
                      r.table('accounts').get(id).update({password: hash}).run(db.conn()).then(function(trans) {
                        return resolve(trans);
                      }).catch(function(err) {
                        return reject(err);
                      })
                  } else {
                    var err = new Error("Unknown Hashing Error");
                        err.status = 500;
                        return reject(err);
                  }
                });
            } else {
                var err = new Error(result.humanReadableRule + "  Failed at Regex: " + result.failedAt);
                    err.status = 400;
                    return reject(err);
            }
        }).catch((err) => {return reject(err)})
        
        //
    })
}

/**
* Verifies if the given password is the correct password for the given account.
* @function verifyPassword
* @link module:js/accounts
* @param {String} id - Account ID
* @param {String} password - The password to check against the database
* @returns {Promise}
*/
exports.verifyPassword = function(id, password) { 
    return new Promise(function(resolve, reject) {
        r.table('accounts').get(id).run(db.conn()).then(function(account) {
            if(!account) {
                var err = new Error("Account Not Found");
                err.status = 404;
                return reject(err);
            }
            if(!account.password) {
                var err = new Error("account.password undefined");
                err.status = 500;
                return reject(err);
            }
            bcrypt.compare(password, account.password, function(err, res) {
                if(err) {
                    return reject(err);
                }
                return resolve(res);
            });
        }).catch(function(err) {
            return reject(err);
        })
    })
}



/**
* Combines {@link verifyPassword} and {@link updatePassword} into one convenient package.  Also checks Password policy.
* @function changePassword
* @link module:js/accounts
* @param {String} id - Account ID
* @param {String} currentPassword - The account's current password
* @param {String} newPassword - The new account password
* @returns {Promise}
*/
exports.changePassword = function(id, currentPassword, newPassword) {
    return new Promise(function(resolve, reject) {
        exports.verifyPassword(id, currentPassword).then(function(result) {
            if(result) {
                exports.updatePassword(id, newPassword).then(function(transaction) {
                    return resolve(transaction);
                }).catch(function(err) {
                    //console.log(err)
                    return reject(err);
                })
            } else {
                var err = new Error("Unauthorized");
                err.status = 401;
                return reject(err);
            }
        }).catch(function(err) {
            return reject(err);
        })
    })
}

/**
* Wrapper Function to update tag data.  
* @function updateTags
* @link module:js/accounts
* @param {String} id - Account ID
* @param {accountTags} tagData - The account's current password
* @returns {Promise}
*/
exports.updateTags = function(id, tagData) {
    return new Promise((resolve, reject) => {
        if(Array.isArray(tagData)) {
            var err = new TypeError("tagData is an array, expected Json object");
            return reject(err);
        } else if(typeof tagData != "object") {
            var err = new TypeError("tagData is " + typeof tagData + ", expected Json object");
            return reject(err);
        }
        r.table("accounts").get(id).update({tags: tagData}).run(db.conn()).then((res) => {
            return resolve(res);
        }).catch((err) => {
            return reject(err);
        })
    })
    
}


/**
* Sets the isVerified value.
* @function setVerification
* @link module:js/accounts
* @param {String} id - Account ID
* @param {Boolean} isVerified
* @returns {Promise}
*/
exports.setVerification = function(id, isVerified) {
    return new Promise((resolve, reject) => {
        if(!typeCheck("String", id)) {
            var err = new TypeError("Expected ID to be type \"String\" Got: " + typeof id);
            err.status = 400;
            return reject(err)
        }
        if(!typeCheck("Boolean", isVerified)) {
            var err = new TypeError("Expected isVerified to be type \"Boolean\" Got: " + typeof isVerified);
            err.status = 400;
            return reject(err)
        }

        function verTime() {
            if(isVerified) {
                return r.now();
            } else {
                return null;
            }
        }
        return r.table("accounts").get(id).update({isVerified: isVerified, properties: {verifiedOn: verTime()}}).run(db.conn()).then(resolve).catch(reject);
    });
}

/*setTimeout(function() {
    exports.setVerification("44399ee5-9d08-4f4b-92b5-fd502c0841d9", true).then((res) => {console.log(res);}).catch((err) => console.log(err))
}, 1000);*/

/**
 * Account Tags/flags/metadata/options. 
 * @typedef {(Object|undefined|null)} accountFlags
 * @property {(boolean|undefined)} requirePasswordReset - On the next login, the user will be required to reset their password.  
 * @property {(String|undefined)} bulkImportID - The ID of the mass import sequence for debugging and rollbackability.  
 */