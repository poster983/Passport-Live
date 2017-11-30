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
        /*if(!typeCheck("Maybe {ignoredKeys: Maybe [String], idKey: Maybe String, hiddenKeys: Maybe [String], inject: Maybe Function, tableClasses: Maybe String}"), options) {
            throw new TypeError("Options expected an object with structure: \"Maybe {ignoredKeys: Maybe [String], idKey: Maybe String, hiddenKeys: Maybe [String], inject: Maybe Function, tableClasses: Maybe String}\"");
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
        return new Promise((resolve, reject) => {
            this._sortData().then(({columns, rows}) => {
                console.log(columns, "Col")
                console.log(rows, "rows")
                var promises = [];
                let tableHead = $("<thead/>");
                promises.push(new Promise((resolveCol, rejectCol) => {
                    let tr = $("<tr/>");
                    //compile Head
                    for(let x = 0; x < columns.length; x++) {
                        tr.append($("<th/>").html(columns[x]));
                        if(x >= columns.length-1) {
                            //done 
                            tableHead.append(tr);
                            return resolveCol()
                        }
                    }
                }))

                Promise.all(promises).then(() => {
                    this.container.append($("<table/>").addClass(this.options.tableClasses)
                        .append(tableHead)
                    )
                }).catch((err) => {
                    return reject(err);
                })
            });
        });
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
    parseRowID(TABLE_ROW_ID) {
        return TABLE_ROW_ID.substring(12, TABLE_ROW_ID.length-2);
    }
    _sortData() {
        return new Promise((resolve, reject) => {
            var columnNames = [];
            var rows = [];
            for(let x = 0; x < this.data.length; x++ ) {
                let row = {};
                row.shownData = this.data[x];
                row.rowID = "__TABLE_ROW_" + utils.uuidv4() + "__";
                //note ID
                if(this.options.idKey && row.shownData[this.options.idKey]) {
                    row.rowID = "__TABLE_ROW_" + DeepKey.get(row.shownData, this.options.idKey.split(".")) + "__"; 
                }
                //Store Untouched ID for dev
                row.getRowID = () => {return this.parseRowID(row.rowID);}

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
                    if(typeCheck("Function", this.options.inject)) {
                        console.log("INJECTING")
                        row.injectedData = {};
                        this.options.inject(row, (injected) => {
                            if(typeCheck("[{column: String, strictColumn: Maybe Boolean, dom: *}]", injected)) {
                                for(let a = 0; a < injected.length; a++) {
                                    if(injected[a].strictColumn) {
                                        row.injectedData[injected[a].column] = injected[a].dom;
                                    } else {
                                        row.injectedData = Object.assign(row.injectedData, flat({[injected[a].column.split(".")]: injected[a].dom}, {safe: true}))
                                    }
                                    if(a >= injected.length-1) {
                                        return resolve();
                                    }
                                }
                            } else {
                                return reject(new TypeError("inject callback expected a single paramater with type structure: [{column: String, strictColumn: Maybe Boolean, dom: *}]"));
                            }
                            
                        })
                    } else {
                        return resolve()
                    }
                }).then(() => {
                    let flatData = flat(row.shownData, {safe: true});
                    if(row.injectedData) {
                        row.shownKeys = [...new Set([...Object.keys(flatData), ...Object.keys(row.injectedData)])];
                    } else {
                        row.shownKeys = Object.keys(flatData);
                    }
                    columnNames = [...new Set([...columnNames, ...row.shownKeys])];
                    
                    // add helper functions
                    row.getBody = () => {return flat(Object.assign(row.shownData, row.injectedData))}
                    //Waitfor end of loop
                    rows.push(row);
                    //console.log(rows, "loop Row")
                    if(x >= this.data.length-1) {
                        this.sortedColumns = columnNames;
                        this.sortedData = rows;
                        return resolve({columns: this.sortedColumns, rows: this.sortedData});
                    }
                    
                }).catch((err) => {throw err})
            }
        });
    }
}

module.exports = Table;