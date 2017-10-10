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
* Apis for sending mail to users
* @module js/email
*/

var r = require('rethinkdb');
var db = require('../../modules/db/index.js');
var config = require('config');
const nodemailer = require('nodemailer');

let SMTPTransporter = nodemailer.createTransport(config.get("nodemailerConfig"));


/** 
* Takes in a flat array of messy named data and then maps it to a passport standard
* @function mapAccounts
* @link module:js/import
* @param {Object[]} arrayToMap - most likely imported from excel using the import api; the messy data that must be sorted
* @param {accountMapRule} mapRule - Json object that relates each required field to a key in another dataset. See: {@link accountMapRule}
* @param {accountDefaultRule} defaultRule - The fallback Json object for missing values in the arrayToMap and mapRule See: {@link accountDefaultRule}
* @returns {Promise}
*/
exports.sendMail = function(header, body, options) {

}