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
* @module js/security
*/

var r = require('rethinkdb');
var db = require('../../modules/db/index.js');
var config = require("config");
var moment = require("moment");
var shortid = require("shortid");
var oldApi = require("./index.js")
var typeCheck = require("type-check").typeCheck;
var utils = require("../passport-utils/index.js")
var accountsJS = require("./accounts.js")


///PERMISSON KEYS
    



    /*
    Creates a short permission key 

    
    "permissions": a JSON object with a custom permission payload, Ex: userGroups
    "params": per Use case
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
     * @link module:js/security
     * @param {permissionKeyType} type - ENUM for the type of permission key this is.  Each may impose diffrent requirements.
     * @param {Object} permissions - Json tree of permissions.
     * @param {Object} params
     * @param {(undefined|Object)} timeout - When should the key become invalid.
     * @param {(undefined|number)} timeout.tally - Will become inactive after given number of uses.
     * @param {(undefined|Date|ISO)} timeout.time - Will become inactive after given time.
     * @returns {Promise}
     */
    exports.createPermissionKey = function(type, permissions, params, timeout) {
        return new Promise((resolve, reject) => {
            var ins = {}
            var key = shortid.generate() + shortid.generate();
            
            //console.log(parseInt(timeout.tally))
            console.log(timeout)
            /*if(timeout.time) {
                //format time to a general format
                timeout.time = moment(timeout.time).toISOString();
            } else if(timeout.tally) {
                if(isNaN(parseInt(timeout.tally))) {
                    var err = new Error("timeout.tally expected an int");
                    err.status = 400;
                    return reject(err)
                } else {
                    timeout.tally = parseInt(timeout.tally)
                }
            }*/
            if(!typeCheck("Maybe {tally: Maybe Number, time: Maybe ISODate | Date}", timeout, utils.typeCheck)) {
                var err = new TypeError("timeout expects an Object with the following types: \"Maybe {tally: Maybe Number, time: Maybe ISODate | Date}\"");
                    err.status = 400;
                    return reject(err)
            }

            if(timeout) {
                if(typeCheck("ISODate", timeout.time, utils.typeCheck)) {
                    timeout.time = r.ISO8601(timeout.time)
                }
                ins.timeout = timeout;
            }
            if(params) {
                ins.params = params;
            }
            if(permissions) {
                ins.permissions = permissions;
            }

            if(!typeCheck("permissionKeyType", type, utils.typeCheck)) {
                var err = new TypeError("Type expected the \"permissionKeyType\" ENUM ");
                    err.status = 400;
                    return reject(err)
            }

            //CHeck Type Rules
            if(type === "NEW_ACCOUNT") {
                if(!typeCheck("{userGroups: [userGroup]}", permissions, utils.typeCheck)) {
                    var err = new TypeError("permissions.userGroups must be an array of type \"userGroup\" strings.");
                    err.status = 400;
                    return reject(err);
                }
            }
            if(type === "ACTIVATE_ACCOUNT") {
                if(!typeCheck("{accountID: String}", params, utils.typeCheck)) {
                    var err = new TypeError("permissions.accountID must be an ID string.");
                    err.status = 400;
                    return reject(err);
                }
            }
            if(type === "RESET_PASSWORD") {
                if(!typeCheck("{accountID: String}", params, utils.typeCheck)) {
                    var err = new TypeError("permissions.accountID must be an ID string.");
                    err.status = 400;
                    return reject(err);
                }
            }

            ins.key = key;
            ins.type = type;

            r.table("permissionKeys").insert(ins).run(db.conn(), function(err) {
                if(err) {
                    return reject(err);
                }
                return resolve(key);
            })
        })
    }//* @link module:js/security
    //* @memberof! js/security.newKey#
    //* @exports js/security/newKey
     /**
     * A set of wrappers for creating specific types of perm keys. 
     * @name newKey
     * @inner
     * @private
     * @memberof module:js/security
     * @property {Object} newKey
     * @property {function} newKey.newAccount - Creates a New Permission Key For New Accounts
     */
    var newKey = {};
     /**
     * Creates a New Permission Key For Creating New Accounts from the new account form and API
     * @function
     * @memberof module:js/security
     * @param {String[]} userGroups - Must only contain valid userGroup keys defined in the configs.
     * @param {(undefined|Object)} timeout - When should the key become invalid.
     * @param {(undefined|number)} timeout.tally - Will become inactive after given number of uses.
     * @param {(undefined|Date|string)} timeout.time - Will become inactive after given time.
     * @returns {Promise}
     */
    newKey.newAccount = function(userGroups, timeout) {
        return new Promise((resolve, reject) => {
            return exports.createPermissionKey(exports.permissionKeyType.NEW_ACCOUNT, {userGroups: userGroups}, null, timeout).then(resolve).catch(reject)
        }) 
    }

     /**
     * Creates a New Permission Key For Activating New Accounts From email
     * @function
     * @memberof module:js/security
     * @param {String} id - Account id that this key will work for.
     * @returns {Promise}
     */
    newKey.activateAccount = function(id) {
        return new Promise((resolve, reject) => {
            accountsJS.getUserByID(id, (err, user) => {
                if(err) {return reject(err);}
                if(!user){var err = new Error("User not found"); err.status = 404; return reject(err);}
                var date = moment().add(7, "days")
                return exports.createPermissionKey(exports.permissionKeyType.ACTIVATE_ACCOUNT, null, {accountID: id}, {time: date.toISOString(), tally: 1}).then(resolve).catch(reject)
            })
            
        }) 
    }

    /**
     * Creates a New Permission Key For resetting a forgotten password Accounts From email. Times out after 1 hour
     * @function
     * @memberof module:js/security
     * @param {String} id - Account id that this key will work for.
     * @returns {Promise}
     */
    newKey.resetPassword = function(id) {
        return new Promise((resolve, reject) => {
            var date = moment().add(1, "hours")
            return exports.createPermissionKey(exports.permissionKeyType.RESET_PASSWORD, null, {accountID: id}, {time: date.toISOString(), tally: 1}).then(resolve).catch(reject)
        }) 
    }
    /*
    setTimeout(function() {
        //newKey.newAccount(["student", "teacher"], {tally: }) //["student", "teacher"]
        console.log(typeCheck("Date", new Date()))
        console.log(typeCheck("ISODate", "2017-11-10T02:41:57+00:00", utils.typeCheck))
        var date = new Date();
        date.setDate(date.getDate() + 1)
        console.log(typeCheck("Maybe {tally: Maybe Number, time: Maybe ISODate | Date}", {tally: 5, time: date}, utils.typeCheck))
        //newKey.newAccount(["student"], {time: "2017-11-10T02:41:57+00:00", tally:6})
        //newKey.newAccount(["student"], {time: date, tally:12})
    }, 1000);*/
    exports.newKey = newKey;


    //This checks to see if the Permission key is valid and returns a json object with the permissions.
    //Callback: done(err, perms)
    //SHould only return one
    /**
     * Checks a Permission Key.  It also may change the timeout field if on tally mode
     * @link module:js/security
     * @param {string} key - the key to check.
     * @param {function} done - Callback.
     */
exports.checkPermissionKey = function(key, done) {

    r.table("permissionKeys").filter({
        key: key,
    }).run(db.conn(), function(err, document) {
        if(err) {
            return done(err, null);
        }

        document.toArray(function(err, arr) {
            if(err) {
                return done(err)
            }
            console.log(arr)
            //Found key
            if(0<arr.length) {
                if(arr[0].timeout.time) {
                    if(moment(arr[0].timeout.time).isSameOrAfter()) {
                        return done(null, {permissions: arr[0].permissions, params: arr[0].params});

                    } else {
                        var err = new Error("Key Not Valid");
                        err.status = 422;
                        return done(err, null);
                    }
                } else if(Number.isInteger(arr[0].timeout.tally)) {
                    if(arr[0].timeout.tally >= 1) {
                        //Subtract 1 from tally
                        r.table("permissionKeys").update({
                            timeout: { 
                                tally: r.row("timeout")("tally").sub(1)
                            }
                        }).run(db.conn(), function(err) {
                            if(err) {
                                return done(err);
                            } else {
                                return done(null, {permissions: arr[0].permissions, params: arr[0].params});
                                
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
}

/**
 * Gets Permission Key data.
 * @link module:js/security
 * @param {permissionKeyType} type - enum
 * @param {string} key - the key to check.
 * @param {function} done - Callback.
 */
exports.getPermissionKeyData = function(type, key, done) {
	if(!key || typeof key != "string") {
		var err = new Error("Invalid Key");
		err.status = 400;
		return done(err);
	}
    if(!typeCheck("permissionKeyType", type, utils.typeCheck)) {
        var err = new TypeError("Type expected the \"permissionKeyType\" ENUM ");
            err.status = 400;
            return reject(err)
    }
	r.table("permissionKeys").filter({
        key: key,
        type: type
    }).run(db.conn(), function(err, document) {
        if(err) {
            return done(err);
        }

        document.toArray(function(err, arr) {
            if(err) {
                return done(err)
            }
            if(arr.length == 1) {
            	return done(null, arr[0]);
            } else if(arr.length < 1) {
            	var err = new Error("Invalid Key");
    	   		err.status = 400;
    	   		return done(err);
            } else {
            	var err = new Error("Conflicting Keys");
    	   		err.status = 500;
    	   		return done(err);
            }
        });
    });
}



/**
ENUM TYPES
**/



/**
 * Used for ensuring the correct fields are added for each type of permission key.
 * @readonly
 * @enum {String}
 */
 exports.permissionKeyType = {
        /** Used For Account Creation API.  The key gives the user permission to create a protected account (I.E. userGroup with "verifyAccountCreation" set to true) */
        NEW_ACCOUNT: "NEW_ACCOUNT", 
        /** Used for activating an account from an email.  Used for both self signup and mass import activation with and without a password*/
        ACTIVATE_ACCOUNT: "ACTIVATE_ACCOUNT", 
        /** Used for resetting your password via an email. */
        RESET_PASSWORD: "RESET_PASSWORD",
        UNKNOWN: "UNKNOWN"
    };
exports.permissionKeyType = Object.freeze(exports.permissionKeyType);
