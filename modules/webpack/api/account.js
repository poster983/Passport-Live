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
* @module webpack/api/accounts
*/

var utils = require("../utils/index.js");


/** 
* Gets all accounts with classes from the server.
* @link module:webpack/api/accounts
* @returns {Promise}
*/
exports.getWithClasses = () => {
    return utils.fetch("GET", "/api/account/hasClasses", {auth: true})
}

/** 
    * Searches accounts that match the query
    * @link webpack/api/accounts
    * @param {Object} query
    * @param {(string|undefined)} query.id - Primary Key.  Uses getAll.  
    * @param {(string|undefined)} query.email
    * @param {(userGroup|undefined)} query.userGroup
    * @param {(Object|string|undefined)} query.name - If a string it will do a combined search using Match
    * @param {(string|undefined)} query.name.salutation - User's prefix/salutation
    * @param {(string|undefined)} query.name.first - User's given name
    * @param {(string|undefined)} query.name.last - User's family name
    * @param {(string|number|undefined)} query.schoolID
    * @param {(number|undefined)} query.graduationYear
    * @returns {Promise} Includes array.
    */
exports.get = (query) => {

}