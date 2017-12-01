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
* Browser Import Functions.
* @module webpack/api/schedule
*/

var utils = require("../utils/index.js");

/** 
* Gets all schedule types for the user
* @link module:webpack/api/schedule
* @param {String} accountID
* @returns {Promise}
*/
exports.getSchedules = (accountID) => {
    return utils.fetch("GET", "/api/account/schedule/id/" + accountID, {auth: true})
}