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
var flat = require('flat');
var utils = require("../utils/index.js");
var typeCheck = require("type-check").typeCheck;

class Table {
    constructor(containerElement, data, options) {
        if(!typeCheck("Maybe {ignoreKeys: Maybe [String], idKey: Maybe String, hiddenKeys: Maybe [String]}"), options) {
            throw new TypeError("Options expected an object with structure: \"Maybe {ignoreKeys: Maybe [String], idKey: Maybe String, hiddenKeys: Maybe [String]}\"");
        }
        if(!typeCheck("[Object]", data)) {
            throw new TypeError("data must be an array of objects");
        }
        this.data = data;
        this.container = containerElement;
        this.options = options;
    }
    generate() {
        //var flatData = flat(this.data);
        console.log(this.data)
        //var distinctKeys = utils.distinctKeys(this.data)
        console.log(distinctKeys);
        for(var x = 0; x < this.data.length; x++ ) {
            //DO STUFF
        }


        //data in the table
        this.liveData = this.data;
        this.liveKeys = distinctKeys;
    }
    addData(newData) {
        if(!typeCheck("[Object]", newData)) {
            throw new TypeError("data must be an array of objects");
        }
        this.data = this.data.concat(newData)

    }

}

module.exports = Table;