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
* @module js/periods 
*/

let config = require("config");
let DeepKey = require("deep-key");

/**
  * Lists all possible period IDs 
  * @link module:js/periods
  * @returns {String[]}
  */
exports.listPeriodIDs = () => {
    let ignoredKeys = ["variation", "name"];
    let deepKeyArray = DeepKey.keys(config.get("schedule.periods"));
    for(let x = 0; x < deepKeyArray.length; x++) {
        deepKeyArray[x] = deepKeyArray[x].filter((key, index) => { //filter out non id keys 
            if(index == 0) { //always include the first key
                return true;
            } 
            if(ignoredKeys.includes(key)) { // if the current key is to be ignored then remove it
                return false;
            }
            return true;
        }); 
    }
    //remove duplecate arrays 
    deepKeyArray = Array.from(new Set(deepKeyArray.map(JSON.stringify)), JSON.parse);
    //convert array values to strings
    deepKeyArray = deepKeyArray.map((keyArray) => {
        return keyArray.join(".");
    });

    for(let x = 0; x < deepKeyArray.length; x++) { //remove invalid periods.
        let searchFrom = deepKeyArray[x].lastIndexOf("."); 
        if(searchFrom > 0) {
            let searchString = deepKeyArray[x].substring(0, searchFrom);
            let toRemove = deepKeyArray.find((element) => { //find any strings that equal what is before the current string's searchFrom value 
                return searchString === element;
            });
            deepKeyArray.splice(deepKeyArray.indexOf(toRemove),1);
        }
    }

    return deepKeyArray;
};

/**
 * Gets the period object from the configs 
 * @link module:js/periods
 * @param {String} id - period id (EX. "a", "lunch.1")
 * @returns {Object}
 * @throws {ReferenceError}
 */
exports.getPeriod = (id) => {
    if(exports.listPeriodIDs().includes(id)) { //valid
        return DeepKey.get(config.get("schedule.periods"), id.replace(".", ".variation.").split("."));
    } else {
        throw new ReferenceError(`${id} is not a defined period.`);
    }
};
//console.log(exports.getPeriod("e.1"));