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
* @module js/misc
*/

var r = require('rethinkdb');
var db = require('../../modules/db/index.js');
var config = require("config");
var moment = require("moment");
var shortid = require("shortid");
var oldApi = require("./index.js")

///PERMISSON KEYS

    /*
    Creates a short permission key 

    Callback: done(err, key)
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
     * @function createPermissionKey
     * @link module:js/misc
     * @async
     * @param {json} permissions - Json tree of permissions.
     * @param {json} params - unused.
     * @param {json} timeout - Time.
     * @param {function} done - Callback.
     * @returns {callback} - See: {@link #params-doneCallback|<a href="#params-createPermissionKeyCallback">Callback Definition</a>}
     */
    exports.createPermissionKey = function(permissions, params, timeout, done) {
        var key = shortid.generate() + shortid.generate();
        console.log(parseInt(timeout.tally))
        console.log(timeout.tally)
        if(timeout.time) {
            //format time to a general format
            timeout.time = moment(timeout.time).toISOString();
        } else if(timeout.tally) {
            if(isNaN(parseInt(timeout.tally))) {
                var err = new Error("timeout.tally expected an int");
                err.status = 400;
                return done(err)
            } else {
                timeout.tally = parseInt(timeout.tally)
            }
        }
        if(!params) {
            params = {};
        }
        r.table("permissionKeys").insert({ 
            key: key,
            permissions: permissions,
            params: params,
            timeout: timeout
        }).run(db.conn(), function(err) {
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
     * Checks a Permission Key.  It also may change the timeout field if on tally mode
     * @link module:js/misc
     * @async
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
 * @function getPermissionKeyData
 * @async
 * @param {string} key - the key to check.
 * @param {function} done - Callback.
 */
exports.getPermissionKeyData = function(key, done) {
	if(!key || typeof key != "string") {
		var err = new Error("Invalid Key");
		err.status = 400;
		return done(err);
	}
	r.table("permissionKeys").filter({
        key: key,
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


