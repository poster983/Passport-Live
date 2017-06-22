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
    SECURITY
    **/
    /*
    Creates a short permission key 

    Callback: done(err, key)
    "permissions": a JSON object with a custom permission payload, Ex: userGroup
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

    tester: function(hello, done) {
        console.log(hello);
        done(null, hello);
    }
}