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
* @module miscAPI
*/

var r = require('rethinkdb');
var db = require('../../modules/db/index.js');
var config = require("config");
var moment = require("moment");

///PERMISSON KEYS
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