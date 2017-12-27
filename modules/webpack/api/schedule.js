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
* Browser Schedule Functions.
* @module webpack/api/schedule
*/

var utils = require("../utils/index.js");

/** 
* Gets all schedule types for the user
* @link module:webpack/api/schedule
* @param {(String|undefined)} accountID
* @returns {Promise}
*/
exports.getSchedules = (accountID) => {
    if(accountID === undefined) {accountID = ""}
    return utils.fetch("GET", "/api/account/schedule/" + accountID, {auth: true})
}

/** 
* Sets a new schedule for the logged in user
* @link module:webpack/api/schedule
* @param {String} dashboard - can be "student" or "teacher"
* @param {Object} schedule - Please see {@link setUserSchedule}
* @returns {Promise}
*/
exports.newSchedule = (dashboard, schedule) => {
    return utils.fetch("POST", "/api/account/schedule/" + dashboard, {body: schedule, auth: true})
}


/** 
* Replaces the schedule for the logged in user
* @link module:webpack/api/schedule
* @param {String} dashboard - can be "student" or "teacher"
* @param {Object} schedule - Please see {@link setUserSchedule}
* @returns {Promise}
*/
exports.updateSchedule = (dashboard, schedule) => {
    return utils.fetch("PATCH", "/api/account/schedule/" + dashboard, {body: schedule, auth: true})
}