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
var securityJS = require("../passport-api/security.js");
var config = require("config");
var typeCheck = require("type-check");
var moment = require("moment")

module.exports = {
    customTypes: {
        permissionKeyType: {
            typeOf: "String",//String | Null
            validate: function(x) {
                //console.log(typeof x, x)
                //return true
                return securityJS.permissionKeyType[x] !== undefined;
            }
        },
        userGroup: {
            typeOf: "String",
            validate: function(x) {
                return config.get("userGroups")[x] !== undefined;
            }
        },
        ISODate: {
            typeOf: "String",
            validate: function(x) {
                return moment(x, moment.ISO_8601, true).isValid();
            }
        },
    }
}
