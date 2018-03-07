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
* Account manipulation APIs
* @module js/accounts
*/
var r = require("rethinkdb");
var db = require("../../modules/db/index.js");
var r_ = db.dash();
var config = require("config");
var bcrypt = require("bcrypt-nodejs");
var utils = require("../passport-utils/index.js");
var human = require("humanparser");
var moment = require("moment");
var _ = require("underscore");
const util = require("util");
var typeCheck = require("type-check").typeCheck;
var securityJS = require("./security.js");
var emailJS = require("./email.js");
var accountScheduleJS = require("./accountSchedule.js");

/** ACCOUNT TYPE DEFS **/ 

/**
 * User Account Model stored in RethinkDB
 * @typedef {Object} account
 * @property {String} id - Assigned by RethinkDB. A Primary Key / Primary Index
 * @property {String} email - Must be unique. (TODO: Secondary Index)
 * @property {Object} name
 * @property {String} name.salutation - Prefix (Mr., Ms., Mx., ECT...)
 * @property {String} name.first - Given name
 * @property {String} name.last - Family name
 * @property {userGroup} userGroup
 * @property {Object} groupFields - unused
 * @property {boolean} isArchived - If true the user's account is frozen and no manipulation will take place.
 * @property {boolean} isVerified - If true, the user will be able to make passes and email notifications will work.
 * @property {(String|null)} password - Will be removed when returned from a REST endpoint
 * @property {Number} [graduationYear=null] - only required on userGroups that define it in the configs.
 * @property {String} [schoolID=null]
 * @property {Object} properties
 * @property {Date} properties.createdOn
 * @property {(Date|null)} properties.verifiedOn
 * @property {Object} flags 
 * @property {String} [flags.bulkImportID=undefined] - The ID of the account import job that imported this account. 
 * @property {Object} integrations - holds ids and keys of services that integrate with passport 
 * @property {Object} integrations.google - OAuth2 Login
 * @property {Object} integrations.google.id - Google ID used to match the google account to the passport user
 */


/**
 * Account Tags/flags/metadata/options. 
 * @typedef {(Object|undefined|null)} accountFlags
 * @property {(boolean|undefined)} requirePasswordReset - On the next login, the user will be required to reset their password.  
 * @property {(String|undefined)} bulkImportID - The ID of the mass import sequence for debugging and rollbackability.  
 */



/** CODE **/
/** 
    * Creates An Account 
    * @function createAccount
    * @link module:js/accounts
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
        } else {
            user.schoolID = user.schoolID + "";
        }
        if(!user.graduationYear || user.graduationYear == "") {
            if(config.has("userGroups." + user.userGroup + ".graduates") && config.get("userGroups." + user.userGroup + ".graduates") == true) {
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
            user.graduationYear = parseInt(user.graduationYear);
        }
        if(typeof user.groupFields == "undefined" || !!user.groupFields || (user.groupFields.constructor === Object && Object.keys(user.groupFields).length === 0)) {
            user.groupFields = {};
        }
        //console.log(user)
        //console.log(email.substring(email.indexOf("@")))
        var emailPromise = new Promise(function(resolveE, rejectE) {
            if (config.has("userGroups." + user.userGroup)) {
                if(config.has("userGroups." + user.userGroup + ".permissions.allowedEmailDomains")) {
                    var uGD = config.get("userGroups." + user.userGroup + ".permissions.allowedEmailDomains");
                    console.log(uGD);
                    if(uGD != false && uGD.length > 0) {
                        for(var z = 0; z < uGD.length; z++) {
                            //console.log(uGD[z], "email")
                            if(user.email.substring(user.email.indexOf("@")) == uGD[z].toLowerCase()) {
                                resolveE();
                            }
                            if(z >= uGD.length - 1 ) {
                                var err = new Error("Email Domain Not Allowed.");
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
                    r.table("accounts")("email").contains(user.email).run(db.conn(), function(err, con){
                        if(err) {
                            console.error(err);
                            return reject(err);
                        }
                        //Checks to see if there is already an email in the DB            
                        if(con){
                            //THe email has been taken
                            var err = new Error("Email Taken");
                            err.status = 409;
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
                                        });
                                    }
                                } else {
                                    var err = new Error("Failed to store user in the database");
                                    err.status = 500;
                                    return reject(err, results);
                                }
                            
                            }).catch(function(err) {
                                return reject(err);
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
        });
    });
};
/**
    * @callback createAccountCallback
    * @param {object} err - Returns an error object if any.
    */

/** 
    * Searches accounts that match the query
    * @link module:js/accounts
    * @param {Object} query
    * @param {(string|undefined)} query.id - Primary Key.  Uses getAll.  
    * @param {(string|undefined)} query.email
    * @param {(userGroup|undefined)} query.userGroup
    * @param {(Object|string|undefined)} query.name - If a string it will do a combined search using Match
    * @param {(string|undefined)} query.name.salutation - User's prefix/salutation
    * @param {(string|undefined)} query.name.first - User's given name
    * @param {(string|undefined)} query.name.last - User's family name
    * @param {(string|number|undefined)} query.schoolID
    * @param {(number|undefined)} query.graduationYear
    * @returns {Promise} Includes an array of account objects.
    */
exports.get = (query) => {
    return new Promise((resolve, reject) => {
        let typeStruct = `{
            id: Maybe String, 
            email: Maybe String, 
            userGroup: Maybe userGroup,
            name: Maybe String | {
                salutation: Maybe String,
                first: Maybe String,
                last: Maybe String
            },
            schoolID: Maybe String | Number
            graduationYear: Maybe Number
        }`;
        if(!typeCheck(typeStruct, query, utils.typeCheck)) {
            return reject(new TypeError("Expected \"query\" to have structure of: \"" + typeStruct + "\""));
        }
        if(typeof query.schoolID === "number") {
            query.schoolID = query.schoolID.toString();
        }
        let dbquery = r_.table("accounts");
        if(query.id) {
            let queryID = query.id;
            delete query.id;
            dbquery = dbquery.getAll(queryID);
            
        }
        //Samrt Name Search
        if(typeof query.name === "string") {
            let nameStr = query.name;
            delete query.name;
            dbquery = dbquery.filter(function(doc){
                return r_.or(doc("name")("first").add(doc("name")("last")).match("(?i)"+nameStr.replace(/\s/g,"")),
                    doc("name")("salutation").add(doc("name")("first"), doc("name")("last")).match("(?i)"+nameStr.replace(/\s/g,"")),
                    doc("name")("salutation").add(doc("name")("last")).match("(?i)"+nameStr.replace(/\s/g,""))
                );
            });

        }
        //leftover query
        dbquery = dbquery.filter(query);
        //run query
        dbquery.run().then(resolve).catch(reject);
    });
};
/*
setTimeout(() => {
exports.get({
    //name: "ass"
    //id: "sdhjfajaklsdf",
    name: {
        first: "Joseph"
    }
}).then((res) => {
    console.log(res)
}).catch((err) => {
    console.error(err);
})
}, 500);*/
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
            return doc("userGroup").match(userGroup).and(
                doc("name")("first").add(doc("name")("last")).match("(?i)"+name.replace(/\s/g,"")).or(
                    doc("name")("salutation").add(doc("name")("first"), doc("name")("last")).match("(?i)"+name.replace(/\s/g,"")).or(
                        doc("name")("salutation").add(doc("name")("last")).match("(?i)"+name.replace(/\s/g,""))
                    )
                )
            );
        }).run(dbConn, function(err, document) {

            if(err) {
            //console.log(err)
                return done(err, null);
            }

            document.toArray(function(err, arr) {
                if(err) {
                    return done(err);
                }
                return done(null, arr);            
            });
        });
};
    
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
    });
};

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
    });
};

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
        return done(err);
    }
    r.table("accounts").get(id).run(db.conn(), function(err, document) {
        if(err) {
            return done(err);
        }
        return done(null, document);
       
    });
};

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
            return done(null, data);
        });
    }

};



/** 
    * A wraper function for {@link module:js/userSchedule.update} 
    * @link module:js/accounts
    * @deprecated
    * @param {string} userID - User id to update.
    * @param {string} dashboard - may be either "student" or "teacher"
    * @param {object} schedule  - The schedule object. 
    * @param {function} done - Callback
    * @returns {callback}
    */
exports.updateUserSchedule = function(userID, dashboard, schedule, done) {
    accountScheduleJS.update(userID, dashboard, schedule_UIN).then((res) => {
        return done(null, res);
    }).catch((err) => {
        return done(err);
    });
};


/** 
    * A wraper function for {@link module:js/userSchedule.replace} 
    * @link module:js/accounts
    * @deprecated
    * @param {string} userID - Userid to replace the schedule.
    * @param {string} dashboard - may be either "student" or "teacher"
    * @param {object} schedule  - The schedule object. 
    * @returns {Promise}
    */
exports.replaceUserSchedule = (userID, dashboard, schedule) => {
    return accountScheduleJS.replace(userID, dashboard, schedule_UIN);
};



/** 
    * A wraper function for {@link module:js/userSchedule.new} 
    * @link module:js/accounts
    * @deprecated
    * @param {string} userID - ID of User.
    * @param {constant} dashboard - may be either "student" or "teacher"
    * @param {object} schedule_UIN  - The schedule.
    * @param {function} done - Callback
    * @returns {callback}
    */
exports.newUserSchedule = function(userID, dashboard, schedule_UIN, done) {
    accountScheduleJS.new(userID, dashboard, schedule_UIN).then((res) => {
        return done(null, res);
    }).catch((err) => {
        return done(err);
    });
};





/** 
    * A wraper function for {@link module:js/userSchedule.getStudentSchedule} 
    * @function getStudentSchedule
    * @link module:js/accounts
    * @deprecated
    * @param {string} userID - ID of User.
    * @param {function} done - Callback
    * @returns {callback}
    */
exports.getStudentSchedule = function(userID, done) {
    accountScheduleJS.getStudentSchedule(userID).then((res) => {
        return done(null, res);
    }).catch((err) => {
        return done(err);
    });
};


/** 
    * A wraper function for {@link module:js/userSchedule.getTeacherSchedule}
    * @function getTeacherSchedule
    * @link module:js/accounts
    * @deprecated
    * @param {string} userID - ID of User.
    * @param {function} done - Callback
    * @returns {callback}
    */
exports.getTeacherSchedule = function(userID, done) {
    accountScheduleJS.getTeacherSchedule(userID).then((res) => {
        return done(null, res);
    }).catch((err) => {
        return done(err);
    });
};

/** 
    * Gets Specific Periods based of user.  
    * @function getSpecificPeriods
    * @link module:js/accounts
    * @param {string} userID - ID of User.
    * @param {function} done - Callback
    * @returns {callback} Both teacher and student dashboard period info
    */
exports.getSpecificPeriods = function(userID, periodArray, done) {
    var promises = [];
    if(periodArray.length <= 0) {
        var err = new Error("No Periods Specified");
        err.status = 400;
        return done(err);
    }
    exports.getUserByID(userID, function(err, userData) {
        if(err) {
            return done(err);
        } 
        if(!userData) {
            var err = new Error("Account Not Found");
            err.status = 404;
            return done(err);
        }
        if(!userData.schedules || (!userData.schedules.student && !userData.schedules.teacher)) {
            var err = new Error("Account Has No Schedules Linked");
            err.status = 404;
            return done(err);
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
                        return reject(err);
                    }
                    var studentReturn = {student: []};
                    for(var x = 0; x < periodArray.length; x++) {
                        studentReturn.student.push({period: periodArray[x], periodData: studentSchedule.schedule[periodArray[x]]});
                        if(x >= periodArray.length-1 ) {
                            return resolve(studentReturn);                            
                        }
                        
                    }
                    
                });
                
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
                        return reject(err);
                    }
                    var teacherReturn = {teacher: []};
                    for(var x = 0; x < periodArray.length; x++) {
                        teacherReturn.teacher.push({period: periodArray[x], periodData: teacherSchedule.schedule[periodArray[x]]});
                        if(x >= periodArray.length-1 ) {
                            return resolve(teacherReturn);                            
                        }
                        
                    }
                });
            }));
        }

        Promise.all(promises).then(function(periods){
            if(periods.length == 2) {
                return done(null, Object.assign({},periods[0], periods[1]));
            } else {
                return done(null, periods[0]);
            }
            
        }).catch(function(err) {
            return done(err);
        });
    });
};




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
                        r.table("accounts").get(id).update({password: hash}).run(db.conn()).then(function(trans) {
                            return resolve(trans);
                        }).catch(function(err) {
                            return reject(err);
                        });
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
        }).catch((err) => {return reject(err);});
        
        //
    });
};

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
        r.table("accounts").get(id).run(db.conn()).then(function(account) {
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
        });
    });
};



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
                });
            } else {
                var err = new Error("Unauthorized");
                err.status = 401;
                return reject(err);
            }
        }).catch(function(err) {
            return reject(err);
        });
    });
};

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
        });
    });
    
};


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
            return reject(err);
        }
        if(!typeCheck("Boolean", isVerified)) {
            var err = new TypeError("Expected isVerified to be type \"Boolean\" Got: " + typeof isVerified);
            err.status = 400;
            return reject(err);
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
};

/**
* Sends an activation email to a single user.
* @link module:js/accounts
* @param {String} userID - Account ID
* @returns {Promise} - returns the cursor of the email job log.
*/
exports.sendActivation = (userID) => {
    return new Promise((resolve, reject) => {
        if(!userID || typeof userID !== "string") {
            let err = new TypeError("userID expected a string, got: " + typeof userID);
            err.status = 400;
            return reject(err);
        }
        //get account
        return r_.table("accounts").get(userID).pluck("id", "email", {name: ["first"]}, "isVerified").run()
            .then((accounts) => {
                //check if account exists
                if(!accounts) {
                    let err = new Error("Account Not Found");
                    err.status = 404;
                    return reject(err);
                }
                //check if the user is already verified
                if(accounts.isVerified) {
                    let err = new Error("User already verified");
                    err.status = 406;
                    return reject(err);
                }

                //
            })
    })
}

