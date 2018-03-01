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
* Browser Security Functions.
* @module webpack/api/security
*/

let utils = require("../utils/index.js")

/**
* Creates a new permission key for creating accounts
* @param {Object} body 
* @param {String[]} body.userGroups - What accounts can be created with this perm key
* @param {Object} [body.timeout] - whatever timeout comes first will be applyed.
* @param {Number} [body.timeout.tally] - The number of uses allowed
* @param {String} [body.timeout.time] - ISO date/time
*/
exports.newAccount = (body) => {
    return utils.fetch("POST", "/api/security/key/NEW_ACCOUNT", {body: body, auth: true})
}  