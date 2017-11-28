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
* @module webpack/api/import
*/

var utils = require("../utils/index.js");

/**
* Searches the bulk log database 
* @link module:webpack/api/import
* @param {Object} queries
* @param {(String|undefined)} queries.name - Bulk Log Name
* @param {(String|undefined)} queries.type - importType. Current values: "account", "schedule" 
* @param {(String|Date|undefined)} queries.from - ISO Strng or date Low end.  inclusive
* @param {(String|Date|undefined)} queries.to - ISO Strng High end. inclusive
* @returns {Promise} - array
*/
exports.searchBulkLogs = (queries) => {
    fetch("/api/import/log?" + utils.urlQuery(queries), {
        method: "GET",
        headers: new Headers({
          //"Content-Type": "application/json",
          "x-xsrf-token": getCookie("XSRF-TOKEN")
        }),
        credentials: 'same-origin'
    }).then(utils.fetchStatus).then(utils.fetchJSON).then((json) => {
      console.log(json)
    }).catch((err) => {
      return errorHand(err);
    })
}


