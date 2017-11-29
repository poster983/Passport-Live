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
var DeepKey = require("deep-key");

class Table {
    constructor(containerElement, data, options) {
        /*if(!typeCheck("Maybe {ignoredKeys: Maybe [String], idKey: Maybe String, hiddenKeys: Maybe [String], inject: Maybe Function}"), options) {
            throw new TypeError("Options expected an object with structure: \"Maybe {ignoredKeys: Maybe [String], idKey: Maybe String, hiddenKeys: Maybe [String], inject: Maybe Function}\"");
        }*/
        if(!options){options = {};}
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
        var columnNames = [];
        var rows = [];
        for(var x = 0; x < this.data.length; x++ ) {
            var row = {};
            row.shownData = this.data[x];
            row.rowID = "__TABLE_ROW_" + utils.uuidv4() + "__";
            //note ID
            if(this.options.idKey && row.shownData[this.options.idKey]) {
                row.rowID = "__TABLE_ROW_" + DeepKey.get(row.shownData, this.options.idKey.split(".")) + "__"; 
            }

            
            //Filter out hidden keys for later 
            if(this.options.hiddenKeys) {
                row.hiddenData = DeepKey.keys(row.shownData, {
                    filter: (deepkey) => {
                        return this.options.hiddenKeys.includes(deepkey.join("."));
                    }
                }).reduce((obj, key) => {
                    DeepKey.set(obj, key, DeepKey.get(row.shownData, key));
                    return obj;
                }, {})
                if(this.options.ignoredKeys) {
                    this.options.ignoredKeys = this.options.ignoredKeys.concat(this.options.hiddenKeys);
                } else {
                    this.options.ignoredKeys = this.options.hiddenKeys;
                }
            }

            //filter out unwanted Keys
            //should error in constructor if not array
            if(this.options.ignoredKeys) {
                row.shownData = DeepKey.keys(row.shownData, {
                    filter: (deepkey) => {
                        return !this.options.ignoredKeys.includes(deepkey.join("."));
                    }
                }).reduce((obj, key) => {
                    DeepKey.set(obj, key, DeepKey.get(row.shownData, key));
                    return obj;
                }, {})
                
            }
            new Promise((resolve, reject) => {
                //Generate Actions 
                if(typeCheck("Function", this.options.actions)) {
                    this.options.inject(row, (injected) => {
                        if(typeCheck("[{column: String, dom: *}]", injected)) {
                            for(var a = 0; a < injected.length; a++) {
                                DeepKey.set(row.shownData, injected[a].column.join("."), injected[a].dom)
                                if(a >= injected.length-1) {
                                    return resolve();
                                }
                            }
                            
                            //row.shownData = {column: column, dom: domToInject};
                        } else {
                            return reject(new TypeError("inject callback expected a single paramater with type structure: [{column: String, dom: *}]"));
                        }
                        
                    })
                } else {
                    return resolve()
                }
            }).then(() => {
                var flatData = flat(row.shownData);
                row.shownKeys = Object.keys(flatData);
                columnNames = columnNames.concat(row.shownKeys);

                rows.push(row);
            }).catch((err) => {throw err})
            
        }

        console.log(rows)
        //data in the table
        this.liveRows = rows;
        this.liveColumn = columnNames;
    }
    addData(newData) {
        if(!typeCheck("[Object]", newData)) {
            throw new TypeError("data must be an array of objects");
        }
        this.data = this.data.concat(newData)
    }
    replaceData(newData) {
        if(!typeCheck("[Object]", newData)) {
            throw new TypeError("data must be an array of objects");
        }
        this.data = newData;
    }
    destroyTable() {
        this.data = [];
        containerElement.empty();
    }
}

module.exports = Table;