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
//Useful functions for passport (NOT API FUNCTIONS)

/** 
 * A helper module for getting the config values.
 * Will be used more later when configs get switched to being stored in the database.
 * This module currently emulates the config package on npm
 * @module js/config 
*/

let config = require("config");

/**
 * Gets a config value from key.  Use with await/async
 * @link module:js/config
 * @param {String} key 
 * @param {String} [domain] - What domain's configs to search (unused) 
 * @returns {Promice<*,Error>}
 */
exports.get = (key, domain) => {
    return new Promise((resolve) => {
        if(typeof domain === "string" && domain.length > 0) {
            //find the config from the database
            throw new Error(`No configs found for ${domain}`); //place holder
        } else {
            //setTimeout(() => {
            return resolve(config.get(key));
            //});
        }
    });
};

/**
 * Checks if a config value exists from key.  Use with await/async
 * @link module:js/config
 * @param {String} key 
 * @param {String} [domain] - What domain's configs to search (unused) 
 * @returns {Promice<*,Error>}
 */
exports.has = (key, domain) => {
    return new Promise((resolve) => {
        if(typeof domain === "string" && domain.length > 0) {
            //find the config from the database
            throw new Error(`No configs found for ${domain}`); //place holder
        } else {
            return resolve(config.has(key));
        }
    });
};

/*let test = async () => {
    let returner;
    try {
        returner = await exports.get("schedule");
    } catch(e) {
        throw e;
    }
    console.log(returner, "test")
    let hi = returner.periods;
    hi.test = true;
    return hi;
};

async function test2() {
    console.log(test());
    console.log(await test())
}

test2();*/
