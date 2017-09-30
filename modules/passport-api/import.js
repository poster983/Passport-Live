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
* A set of Apis for importing large amounts of data into passport
* @module js/import
*/

/** 
* Takes in a flat array of messy named data and then maps it to a passport standard
* @function mapAccounts
* @link module:js/import
* @param {Object[]} arrayToMap - most likely imported from excel using the import api; the messy data that must be sorted
* @param {accountMapRule} mapRule - Json object that relates each required field to a key in another dataset. See: {@link accountMapRule}
* @param {accountDefaultRule} defaultRule - The fallback Json object for missing values in the arrayToMap and mapRule See: {@link accountDefaultRule}
* @returns {Promise}
*/
exports.mapAccounts = function(arrayToMap, mapRule, defaultRule) {
    return "HELLO"
}

/**
 * Json object that relates each required field to a key in another dataset.  If any key is null, it will fallback to the defaults.
 * @typedef {Object} accountMapRule
 * @property {Object} name
 * @property {(string|null)} name.first - Key/Column name of the user's first name located in the unmapped json import source.
 * @property {(string|null)} name.last - Key/Column name of the user's last name located in the unmapped json import source.
 * @property {(string|null)} name.salutation - Key/Column name of the user's salutation located in the unmapped json import source.
 * @property {(string|null)} schoolID - Key/Column name of the user's School ID located in the unmapped json import source.
 * @property {(string|null)} graduationYear - Key/Column name of The user's Graduation Year located in the unmapped json import source.
 * @property {(string|null)} email - Key/Column name of The user's email located in the unmapped json import source.
 * @property {(string|null)} userGroup - Key/Column name of The user's userGroup constant from the configs located in the unmapped json import source.
 * @property {(boolean|null)} isVerified - Because you are importing this, we recomend you set this to null.
 * @property {(string|null)} password - Name of the Key/Column containing the passwords (WE HIGHLY RECOMMEND SETTING THIS TO undefined AS A COMMON PASSWORD IS DUMB).
 * @example
 * {
 *       name: {
 *           first: "First Name",
 *           last: "Last Name",
 *           salutation: null
 *       },
 *       schoolID: "Faculty User Id",
 *       graduationYear: null,
 *       email: "E-Mail",
 *       userGroup: null,
 *       isVerified: null,
 *       password: "Password"
 *   }
 */

 /**
 * Fallback for {@link accountMapRule}.
 * If the key is undefined, and a user lacks a value from the array, the user will be skipped.
 * @typedef {Object} accountDefaultRule
 * @property {Object} name
 * @property {(string|undefined)} name.first - The fallback first name
 * @property {(string|undefined)} name.last - The fallback last name
 * @property {(string|undefined)} name.salutation - The fallback salutation (We recommend Ind. as a good gender neutral salutation if you don't have the user's salutation on hand)
 * @property {(string|undefined)} schoolID - The fallback schoolID,
 * @property {(integer|undefined)} graduationYear - The fallback year the student graduates,
 * @property {(string|undefined)} email - The fallback email,
 * @property {(string|undefined)} userGroup - The fallback userGroup constant from your config files.
 * @property {(boolean|undefined)} isVerified - Because you are importing this, we recomend you set this to true.
 * @property {(string|undefined)} password - The fallback password to be hashed later (WE HIGHLY RECOMMEND SETTING THIS TO undefined AS A COMMON PASSWORD IS DUMB).
 * @example 
 * {
 *       name: {
 *           salutation: "Ind."
 *       },
 *       userGroup: "teacher",
 *       isVerified: true,
 *       graduationYear: null,
 *       isArchived: false
 *   }
 */

//exports.accountsFromJSON = function(account)