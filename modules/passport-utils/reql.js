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

let r = require("../db/index.js").dash();

/** 
 * Common rethinkdb query utils
 * @module js/utils/reql 
 */



/**
  * Converts periods to a datetime range
  * @link module:js/utils/reql
  * @param {String[]} periods - Array of period constants
  * @param {Date|datetime} date - Uses the scheduled schedule for this day to find the time range
  * @returns {Object} - Rethinkdb Query Object with start and end datetimes
  * @throws {ReQLError}
  */
exports.periodToTime = (periods, date) => {
    //r.table()
};