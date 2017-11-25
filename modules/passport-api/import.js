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
* A set of Apis for importing large amounts of data into passport
* @module js/import
*/
const convertExcel = require('excel-as-json').processFile;
const accountAPI = require("./accounts.js");
var r = require('rethinkdb');
var db = require('../../modules/db/index.js');
var r_ = db.dash()
var utils = require('../passport-utils/index.js');
var typeCheck = require("type-check").typeCheck;
var moment = require("moment");
var emailJS = require("./email.js");

/**
* Creates a bulk import job log 
* @function newBulkLog
* @link module:js/import
* @param {String} name - A Non unique human readable ID for the job.
* @param {String} importType - The type of import it is.  includes "account" and "schedule"
* @returns {Promise}
*/
function newBulkLog(name, importType) {
    //return new Promise((resolve, reject) => {
       return r.table("bulkImports").insert({name: name, date: r.now(), importType: importType}).run(db.conn());
    //})
}
/**
* Updates the bulk log with new info about the import
* @function updateBulkLog
* @link module:js/import
* @param {String} id - Bulk Import ID
* @param {Number} totalTried - Total number of attempted document imports
* @param {Number} totalImported - The total number of documents successfully imported
* @param {Object[]} loggedErrors - Any error logged when processing the documents
* @param {Object} properties - any special properties that each importType might want to include.
* @param {(Number|undefined)} properties.totalInitialized - (For importType "account") Total number of accounts imported with passwords set.
* @returns {Promise}
*/
function updateBulkLog(id, totalTried, totalImported, loggedErrors, properties) { 
    return r.table("bulkImports").get(id).update({totalTried: totalTried, totalImported: totalImported, loggedErrors: loggedErrors, properties: properties}).run(db.conn());
}
/**
* Deletes the bulk log
* @function deleteBulkLog
* @link module:js/import
* @param {String} id - Bulk Import ID
* @returns {Promise}
*/
function deleteBulkLog(id) { 
    return r.table("bulkImports").get(id).delete().run(db.conn());
}

/*
* Searches the bulk log database 
* @link module:js/import
* @param {Object} queries
* @param {(String|undefined)} queries.name - Bulk Log Name
* @param {(String|undefined)} queries.type - importType. Current values: "account", "schedule" 
* @param {(Object|undefined)} queries.date
* @param {(String|Date|undefined)} queries.date.from - ISO Strng or date Low end.  inclusive
* @param {(String|Date|undefined)} queries.date.to - ISO Strng High end. inclusive
* @returns {Promise} - array
*/
exports.searchBulkLogs = (queries) => {
    return new Promise((resolve, reject) => {
        if(!typeCheck("{name: Maybe String, date: Maybe {from: Maybe ISODate | Date, to: Maybe ISODate | Date}, type: Maybe String}", queries, utils.typeCheck)) {
            return reject(new TypeError("queries must be an object with format: \"{name: Maybe String, date: Maybe ISODate, type: Maybe String}\""));
        }
        //            date: r.ISO8601(queries.date),
        if(queries.date && typeCheck("Date", queries.date.from)) {
            queries.date.from = moment(queries.date.from).toISOString()
        }
        if(queries.date && typeCheck("Date", queries.date.to)) {
            queries.date.to = moment(queries.date.to).toISOString()
        }
        return r_.table("bulkImports")
        .filter((date) => {
            if(queries.date && queries.date.from && queries.date.to) {
                return date("date").during(r_.ISO8601(queries.date.from), r_.ISO8601(queries.date.to), {leftBound: "closed", rightBound: "closed"});
            } else if(queries.date && queries.date.from) {
                return date("date").ge(r_.ISO8601(queries.date.from));
            } else if(queries.date && queries.date.to) {
                return date("date").le(r_.ISO8601(queries.date.to));
            } else {
                return true;
            }
        })
        .filter((row) => {
            if(queries.name != undefined) {
                return row("name").eq(queries.name)
            } else {
                return true;
            }
        })
        .filter((row) => {
            if(queries.type != undefined) {
                return row("importType").eq(queries.type)
            } else {
                return true;
            }
        })
        .run().then(resolve).catch(reject)
    })
}

/**
 * Functions for manupulating imported accunts. Assumes account importType
 * @name accounts
 * @inner
 * @private
 * @memberof js/import
 * @property {Object} accounts
 * @property {function} accounts.rollback - Deletes all accounts linked to a given import job
 */
var accounts = {};
 /**
 * Deletes all accounts linked to a given import job ID
 * @function
 * @memberof js/import
 * @param {String} bulkID - Id of the bulk import.
 * @param {Boolean} ignoreActivated - If true, activated accounts will be skipped.
 * @returns {Promise} - Transaction Statement  
 */
 accounts.rollback = (bulkID, ignoreVerified) => {
    return new Promise((resolve, reject) => {
        return r_.table("accounts").filter((row) => {
            return row("flags")("bulkImportID").eq(bulkID);
        }).filter((row) => {
            if(ignoreVerified) {
                return row("isVerified").eq(false);
            } else {
                return true;
            }
        }).delete().run().then((trans) => {
             if(trans.deleted > 0) {
                r_.table("bulkImports").get(bulkID).update({rollback: {on: r_.now(), deleted: trans.deleted}}).run().then(() => {
                    return resolve(trans);
                }).catch((err)=>{return reject(err);});
            } else {
                return resolve(trans);
            }
        }).catch(reject);
    })
    
    //
 }

//accounts.rollback("8e4a8ff9-5503-4e6f-920c-7b07f1109601", true).then((res)=>{console.log(res)}).catch((err)=>{console.error(err)});

 /**
 * Sends athe activation email to all unverified users.  
 * @function
 * @memberof js/import
 * @param {String} bulkID - Id of the bulk import.
 * @returns {Promise} - arg0: Accounts, arg1: sendActivationEmail Cursor
 */
accounts.sendActivation = (bulkID) => {
    return new Promise((resolve, reject) => {
        return r_.table("accounts")
        .filter((row) => {
            return row("flags")("bulkImportID").eq(bulkID);
        })
        .filter((row) => {
            return row("isVerified").eq(false);
        })
        .withFields("id", "email", {name: "first"})
        .map((doc) => {
            return doc.merge({accountID: doc('id')}).without('id');
        })
        .map((doc) => {
            return doc.merge({to: doc('email')}).without('email');
        })
        .run().then((accounts) => {
            emailJS.sendActivationEmail(accounts).then((cur) => {
                return resolve(accounts, cur)
            }).catch(reject)
            
        }).catch(reject)
    })
}
//accounts.sendActivation("089aa0ae-c8ab-42c2-9807-b6b6c6dc27de").then((res, cur)=>{console.log(res); console.log(cur)}).catch((err)=>{console.error(err)});
exports.accounts = accounts;

//exports.searchBulkLogs({date: {to: "2017-11-25T13:10:00-05:00", from: "2017-11-25T13:00:00-05:00"}}).then((res)=> {console.log(res)}).catch((err)=> {console.error(err)});
//exports.searchBulkLogs({name: "testFaculty"}).then((res)=> {console.log(res)}).catch((err)=> {console.error(err)});
/** 
* Takes in a flat array of messy named data and then maps it to a passport standard
* @function mapAccounts
* @link module:js/import
* @param {Object[]} arrayToMap - most likely imported from excel using the import api; the messy data that must be sorted
* @param {accountMapRule} mapRule - Json object that relates each required field to a key in another dataset. See: {@link accountMapRule}
* @param {accountDefaultRule} defaultRule - The fallback Json object for missing values in the arrayToMap and mapRule See: {@link accountDefaultRule}
* @param {boolean} generatePassword - Will generate a password if the default rule for password is undefined.
* @returns {Promise}
*/
exports.mapAccounts = function(arrayToMap, mapRule, defaultRule, generatePassword) {
    return new Promise(function(resolve, reject) {
        try {
            var mappedData = arrayToMap.map(function(n) {
                var returner = {};
                returner.name = {};
                if(!mapRule.name || !mapRule.name.first || !n[mapRule.name.first]) {
                    if(defaultRule.name.first) {
                        returner.name.first = defaultRule.name.first;
                    } else {
                        return null;
                    }
                } else {
                    returner.name.first = n[mapRule.name.first];
                }
                if(!mapRule.name || !mapRule.name.last || !n[mapRule.name.last]) {
                    if(defaultRule.name.last) {
                        returner.name.last = defaultRule.name.last;
                    } else {
                        return null;
                    }
                } else {
                    returner.name.last = n[mapRule.name.last];
                }
                if(!mapRule.name || !mapRule.name.salutation || !n[mapRule.name.salutation]) {
                    if(defaultRule.name.salutation) {
                        returner.name.salutation = defaultRule.name.salutation;
                    } else {
                        return null;
                    }
                } else {
                    returner.name.salutation = n[mapRule.name.salutation];
                }
                if(!mapRule.schoolID  || !n[mapRule.schoolID]) {
                    if(defaultRule.schoolID) {
                        returner.schoolID = defaultRule.schoolID;
                    } else {
                        return null;
                    }
                } else {
                    returner.schoolID = n[mapRule.schoolID];
                }
                if(!mapRule.email  || !n[mapRule.email]) {
                    if(defaultRule.email) {
                        returner.email = defaultRule.email;
                    } else {
                        return null;
                    }
                } else {
                    returner.email = n[mapRule.email];
                }
                if(!mapRule.userGroup  || !n[mapRule.userGroup]) {
                    if(defaultRule.userGroup) {
                        returner.userGroup = defaultRule.userGroup;
                    } else {
                        return null;
                    }
                } else {
                    returner.userGroup = n[mapRule.userGroup];
                }
                if(!mapRule.hasOwnProperty("isVerified")  || !n[mapRule.userGroup]) {
                    if(defaultRule.hasOwnProperty("isVerified")) {
                        returner.isVerified = defaultRule.isVerified;
                    } else {
                        return null;
                    }
                } else {
                    returner.isVerified = n[mapRule.isVerified];
                }

                if(!mapRule.hasOwnProperty("graduationYear")  || !n[mapRule.graduationYear]) {
                    if(defaultRule.hasOwnProperty("graduationYear")) {
                        returner.graduationYear = defaultRule.graduationYear;
                    } else {
                        return null;
                    }
                } else {
                    returner.graduationYear = n[mapRule.graduationYear];
                }

                if(!mapRule.hasOwnProperty("password")  || !n[mapRule.password]) {
                    if(defaultRule.hasOwnProperty("password")) {
                        returner.password = defaultRule.password;
                    } else {
                        //generate password
                        if(generatePassword == true) {
                            returner.password = utils.generateSecureKey();
                        } else {
                           return null;
                        }
                        
                    }
                } else {
                    returner.password = n[mapRule.password];
                }

                return returner;
            })
            results = mappedData.filter(function(v) {
                return (v !== null);
            })
            return resolve(results);
        } catch(err) {
            return reject(err);
        }


    })

    
}

/** 
* Takes in an excel file and with some mapping rules, imports them to the accounts table
* NOTE: Email domains are still must follow userGroup settings.
* If the account cant be impoirted using the accountApi, the row is skipped
* @function importAccountsExcel
* @link module:js/import
* @param {string} excelFilePath - The path to the excel file.
* @param {accountMapRule} mapRule - Json object that relates each required field to a key in another dataset. See: {@link accountMapRule}
* @param {accountDefaultRule} defaultRule - The fallback Json object for missing values in the arrayToMap and mapRule See: {@link accountDefaultRule}.  (NOTE: setting password to null will not initialize the account.  When the activation email is sent, the user will have to create a password)
* @param {Object} jobProperties
* @param {String} jobProperties.name - Name to identify this import as.
* @param {boolean} jobProperties.generatePassword - Generates a password when no password is found in the excel sheet, and default rule is undefined for password.
* @returns {Promise}
*/
exports.importAccountsExcel = function(excelFilePath, mapRule, defaultRule, jobProperties) {
    return new Promise(function(resolve, reject) {
        if(Array.isArray(jobProperties) || typeof jobProperties != "object") {
            var err = new TypeError("jobProperties must me an object");
            return reject(err);
        }
        if(typeof jobProperties.name != "string") {
            var err = new TypeError("jobProperties.name must me a string");
            err.status = 400;
            return reject(err);
        }
        //converting to json
        convertExcel(excelFilePath, undefined, false, function(err, data) {
            if(err) {
                return reject(err);
            }
            exports.mapAccounts(data, mapRule, defaultRule, jobProperties.generatePassword).then(function(results) {
                var errors = [];
                var transPromice = [];
                var imported = 0;
                var initialized = 0;
                if(results.length <= 0) {
                    var err = new TypeError("Excel can't be mapped");
                    err.status = 500;
                    return reject(err);
                }
                //logs this import job in the DB for easy rollback
                newBulkLog(jobProperties.name, "account").then((jResp) => {
                    if(jResp.inserted == 1) {
                        //loop through mapped account data 
                        for(var x = 0; x < results.length; x++) {
                            transPromice.push(new Promise(function(rRes, rRej) {
                                var promRes = results[x];
                                var flags = {}
                                var newAccountOptions = {};
                                newAccountOptions.skipEmail = true;
                                newAccountOptions.allowNullPassword = true;
                                newAccountOptions.generatePassword = false;
                                flags.bulkImportID = jResp.generated_keys[0];


                                accountAPI.createAccount({userGroup: results[x].userGroup, name: results[x].name, email: results[x].email, password: results[x].password, schoolID: results[x].schoolID, graduationYear: results[x].graduationYear, flags: flags}, newAccountOptions).then(function(transSummery) {
                                    //promRes.password = undefined;
                                    imported++;
                                    if(promRes.password) {initialized++}
                                    rRes({onUser: promRes, error: null});
                            }).catch((err) => {
                                if(err.status == 500) {
                                    return reject(err); 
                                } else {
                                    //promRes.password = undefined;
                                    errors.push(err)
                                    rRes({onUser: promRes, error: err});
                                }
                            })}));

                            //end 
                            if(x >= results.length-1) {
                                console.log(results.length, errors.length)
                                Promise.all(transPromice).then(function(sumArray) {
                                    var finalLog = [];
                                    if(imported == 0) {
                                        //deletes log if theere was nothing that could be imported
                                        finalLog.push(deleteBulkLog(jResp.generated_keys[0]));
                                    } else {
                                        //updates the log with more job info
                                        finalLog.push(updateBulkLog(jResp.generated_keys[0], results.length, imported, errors, {totalInitialized: initialized}))
                                    }
                                    Promise.all(finalLog).then(() => {
                                        resolve({summary: sumArray, totalTried: results.length, totalImported: imported, totalInitialized: initialized});
                                    }).catch((err) => {
                                        return reject(err);
                                    })
                                    
                                })
                                //return resolve({errors: errors, totalTried: results.length, totalImported: results.length-errors.length})
                                
                            }
                        }
                    } else {
                        var err = new TypeError("Failed to log import job");
                        err.status = 500;
                        return reject(err);
                    }
                }).catch((err) => {
                    return reject(err);
                })
                
                
            }).catch(function(err) {
                return reject(err);
            })
        });
    });
}







/**
 * Json object that relates each required field to a key in another dataset.  If any key is null, it will fallback to the defaults.
 * @typedef {Object} accountMapRule
 * @property {Object} name
 * @property {(string|null)} name.first - Key/Column name of the user's first name located in the unmapped json import source.
 * @property {(string|null)} name.last - Key/Column name of the user's last name located in the unmapped json import source.
 * @property {(string|null)} name.salutation - Key/Column name of the user's salutation located in the unmapped json import source.
 * @property {(string|null)} schoolID - Key/Column name of the user's School ID located in the unmapped json import source.
 * @property {(string|null)} graduationYear - Key/Column name of The user's Graduation Year located in the unmapped json import source.
 * @property {(string|null)} email - Key/Column name of The user's email located in the unmapped json import source.
 * @property {(string|null)} userGroup - Key/Column name of The user's userGroup constant from the configs located in the unmapped json import source.
 * @property {(boolean|null)} isVerified - Because you are importing this, we recomend you set this to null.
 * @property {(string|null)} password - Name of the Key/Column containing the passwords.
 * @example
 * {
 *       name: {
 *           first: "First Name",
 *           last: "Last Name",
 *           salutation: null
 *       },
 *       schoolID: "Faculty User Id",
 *       graduationYear: null,
 *       email: "E-Mail",
 *       userGroup: null,
 *       isVerified: null,
 *       password: "Password"
 *   }
 */

 /**
 * Fallback for {@link accountMapRule}.
 * If the key is undefined, and a user lacks a value from the array, the user will be skipped.
 * @typedef {Object} accountDefaultRule
 * @property {Object} name
 * @property {(string|undefined)} name.first - The fallback first name
 * @property {(string|undefined)} name.last - The fallback last name
 * @property {(string|undefined)} name.salutation - The fallback salutation (We recommend Ind. as a good gender neutral salutation if you don't have the user's salutation on hand)
 * @property {(string|undefined)} schoolID - The fallback schoolID,
 * @property {(Number|undefined|null)} graduationYear - The fallback year the student graduates,
 * @property {(string|undefined)} email - The fallback email,
 * @property {(string|undefined|null)} userGroup - The fallback userGroup constant from your config files.
 * @property {(boolean|undefined)} isVerified - Because you are importing this, we recomend you set this to true.
 * @property {(string|undefined|null)} password - The fallback password to be hashed later.  Set this to null if you want the user to set their own passsword on account activation. (null is recommended)
 * @example 
 * {
 *       name: {
 *           salutation: "Ind."
 *       },
 *       userGroup: "teacher",
 *       isVerified: true,
 *       graduationYear: null,
 *       isArchived: false,
 *       password: null
 *   }
 */




/** IMPORT TEACHER SCHEDULES **/

//function mapStudentSchedule(mapRule, defaultRule)



/**
 * Json object that relates each required field to a key in another dataset.  If any key is null, it will fallback to the defaults.
 * @typedef {Object} studentScheduleMapRule
 * @property {(string|null)} period - Key/Column name of The .
 * @property {(string|null)} className - Key/Column name of The period's class title
 * @property {(boolean|null)} isVerified - Because you are importing this, we recomend you set this to null.
 * @property {(string|null)} password - Name of the Key/Column containing the passwords.
 * @example
 * {
 *       name: {
 *           first: "First Name",
 *           last: "Last Name",
 *           salutation: null
 *       },
 *       schoolID: "Faculty User Id",
 *       graduationYear: null,
 *       email: "E-Mail",
 *       userGroup: null,
 *       isVerified: null,
 *       password: "Password"
 *   }
 */

 /**
 * Fallback for {@link studentScheduleMapRule}.
 * If the key is undefined, and a user lacks a value from the array, the user will be skipped.
 * @typedef {Object} studentScheduleDefaultRule
 * @property {Object} name
 * @property {(string|undefined)} name.first - The fallback first name
 * @property {(string|undefined)} name.last - The fallback last name
 * @property {(string|undefined)} name.salutation - The fallback salutation (We recommend Ind. as a good gender neutral salutation if you don't have the user's salutation on hand)
 * @property {(string|undefined)} schoolID - The fallback schoolID,
 * @property {(Number|undefined|null)} graduationYear - The fallback year the student graduates,
 * @property {(string|undefined)} email - The fallback email,
 * @property {(string|undefined|null)} userGroup - The fallback userGroup constant from your config files.
 * @property {(boolean|undefined)} isVerified - Because you are importing this, we recomend you set this to true.
 * @property {(string|undefined|null)} password - The fallback password to be hashed later.  Set this to null if you want the user to set their own passsword on account activation. (null is recommended)
 * @example 
 * {
 *       name: {
 *           salutation: "Ind."
 *       },
 *       userGroup: "teacher",
 *       isVerified: true,
 *       graduationYear: null,
 *       isArchived: false,
 *       password: null
 *   }
 */