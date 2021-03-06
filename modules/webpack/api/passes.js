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
* Browser pass Functions.
* @module webpack/api/passes
*/

var utils = require("../utils/index.js");

/**
 * Gets passes and filters them.
 * @param {Object} filter - SEE: {@link module:api/passes.getPasses} filter param
 * @returns {Object[]}
 */
exports.get = (filter) => {
    //console.log(filter)
    return utils.fetch("GET", "/api/passes/", {query: filter, auth: true});
};

/**
 * Gets a pass's state AND the change rules.
 * @param {String} passID
 * @param {Boolean} [substitute] - For people with "teacher" permission.  Allows them to act on behalf of fromPersson
 * @returns {Object}
 */
exports.getState = (passID, substitute) => {
    return utils.fetch("GET", "/api/passes/" + passID + "/state", {auth: true, query: {substitute: substitute}});
};


/**
 * Sets a pass's state by a state type.
 * @param {String} passID
 * @param {String} stateType
 * @param {Boolean} [substitute] - For people with "teacher" permission.  Allows them to act on behalf of fromPersson
 * @returns {Object}
 */
exports.setState = (passID, stateType, substitute) => {
    return utils.fetch("PATCH", "/api/passes/" + passID + "/state", {body: {
        type: stateType
    }, query: {substitute: substitute}, auth: true});
};

/**
 * Sets a pass's state by a state type.
 * @param {String} passID
 * @param {Boolean} [substitute] - For people with "teacher" permission.  Allows them to act on behalf of fromPersson
 * @returns {Object}
 */
exports.undoState = (passID, substitute) => {
    return utils.fetch("PATCH", "/api/passes/" + passID + "/state/undo", {auth: true, query: {substitute: substitute}});
};