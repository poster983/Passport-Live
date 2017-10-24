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
var utils = require('../passport-utils/index.js');

//util function 
function newBulkLog(name, importType, generatedPassword) {
    //return new Promise((resolve, reject) => {
       return r.table("bulkImports").insert({name: name, date: r.now(), importType: importType, generatedPassword: generatedPassword}).run(db.conn());
    //})
}
function updateBulkLog(id, totalTried, totalImported, loggedErrors) { 
    r.table("bulkImports").get(id).update({totalTried: totalTried, totalImported: totalImported, loggedErrors: loggedErrors}).run(db.conn());
}

function deleteBulkLog(id) { 
    r.table("bulkImports").get(id).delete().run(db.conn());
}

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
* @param {accountDefaultRule} defaultRule - The fallback Json object for missing values in the arrayToMap and mapRule See: {@link accountDefaultRule}
* @param {Object} jobProperties
* @property {String} jobProperties.name - Name to identify this import as.
* @property {boolean} jobProperties.generatePassword - Generates a password when no password is found in the excel sheet, and default rule is undefined for password.
* @property {boolean} jobProperties.requirePasswordReset - Flags the account to reset the password on first login
* @property {(Object|undefined)} jobProperties.emailUsers - If undefined, the accounts will automaticly be verified and no email will be sent.
* @property {boolean} jobProperties.emailUsers.includePassword -  If ture, the email will include the password. 
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
        convertExcel(excelFilePath, undefined, false, function(err, data) {
            if(err) {
                return reject(err);
            }
            exports.mapAccounts(data, mapRule, defaultRule, jobProperties.generatePassword).then(function(results) {
                var errors = [];
                var transPromice = [];
                var imported = 0;
                if(results.length <= 0) {
                    var err = new TypeError("Excel can't be mapped");
                    err.status = 500;
                    return reject(err);
                }
                //logs this import job in the DB for easy rollback
                newBulkLog(jobProperties.name, "account", (jobProperties.generatePassword == true)).then((jResp) => {
                    if(jResp.inserted == 1) {
                        //loop through mapped account data 
                        for(var x = 0; x < results.length; x++) {
                            transPromice.push(new Promise(function(rRes, rRej) {
                                var promRes = results[x];
                                var flags = {}
                                var newAccountOptions = {};
                                flags.bulkImportID = jResp.generated_keys[0];
                                if(jobProperties.requirePasswordReset) {
                                    flags.requirePasswordReset = true;
                                }
                                if(jobProperties.emailUsers) {
                                    if(jobProperties.emailUsers.includePassword == true) {
                                        //send email with password
                                        newAccountOptions.sendConfirmEmailwithPassword = true;
                                    } else {
                                        //send email without password
                                        newAccountOptions.sendConfirmEmailwithPassword = false;
                                    }
                                } else {
                                    newAccountOptions.skipEmail = true;
                                }

                                accountAPI.createAccount({userGroup: results[x].userGroup, name: results[x].name, email: results[x].email, password: results[x].password, schoolID: results[x].schoolID, graduationYear: results[x].graduationYear, flags: flags}, newAccountOptions).then(function(transSummery) {
                                    //promRes.password = undefined;
                                    rRes({onUser: promRes, error: null});
                                    imported++;
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
                                        finalLog.push(updateBulkLog(jResp.generated_keys[0], results.length, imported, errors))
                                    }
                                    Promise.all(finalLog).then(() => {
                                        resolve({summary: sumArray, totalTried: results.length, totalImported: imported});
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

/*
exports.importAccountsExcel("/home/joseph/Desktop/passportImport/facultyhassell.xlsx", {
            name: {
                first: "First Name",
                last: "Last Name",
                salutation: null
            },
            schoolID: "Faculty User Id",
            graduationYear: null,
            email: "Filtered Email",
            userGroup: null,
            isVerified: null,
            password: "Password"
        }, {
            name: {
                salutation: "Ind."
            },
            userGroup: "teacher",
            isVerified: true,
            graduationYear: null
        }).then(function(transSummery) {
            console.log(transSummery);
        }).catch(function(err) {
            console.error(err);
        });*/

function tester() {

    convertExcel("/home/joseph/Desktop/passportImport/facultyhassell.xlsx", undefined, false, function(err, data) {
        if(err) {
            return console.error(err);
        }
        console.log(data)
        exports.mapAccounts(data, {
            name: {
                first: "First Name",
                last: "Last Name",
                salutation: null
            },
            schoolID: "Faculty User Id",
            graduationYear: null,
            email: "Filtered Email",
            userGroup: null,
            isVerified: null,
            password: "Password"
        }, {
            name: {
                salutation: "Ind."
            },
            userGroup: "teacher",
            isVerified: true,
            graduationYear: null
        }).then(function(results) {
            console.log("results")
            console.log(results)
        }).catch(function(err) {
            console.error(err)
        })
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
 * @property {(integer|undefined)} graduationYear - The fallback year the student graduates,
 * @property {(string|undefined)} email - The fallback email,
 * @property {(string|undefined)} userGroup - The fallback userGroup constant from your config files.
 * @property {(boolean|undefined)} isVerified - Because you are importing this, we recomend you set this to true.
 * @property {(string|undefined)} password - The fallback password to be hashed later (WE HIGHLY RECOMMEND SETTING THIS TO undefined AS A COMMON PASSWORD IS DUMB).
 * @example 
 * {
 *       name: {
 *           salutation: "Ind."
 *       },
 *       userGroup: "teacher",
 *       isVerified: true,
 *       graduationYear: null,
 *       isArchived: false
 *   }
 */

//exports.accountsFromJSON = function(account)