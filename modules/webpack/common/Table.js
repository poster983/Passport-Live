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

/**
* Takes structured data and makes a table from it. call this.generate() to create a table
* @link module:webpack/framework
* @class 
* @param {Selector} containerElement - The table container.
* @param {Object} data - The data to be added to the table.
* @param {(Object|undefined)} options - The clickable element.
* @param {(String[]|undefined)} options.ignoredKeys - List of keys to leave out of the row object
* @param {(String|undefine)} options.idKey - Key name in data to act as ID.  Will generate a unique one for every row if not included. 
* @param {(String[]|undefine)} options.hiddenKeys - Removes the keys from the table, but keeps it in row object. 
* @param {(Function|undefine)} options.inject - ires for every row.  Allowes for one to inject columns and data for each row. First param is the row object, second is a callback that takes one array of objects. Example Object to return: {column: String, strictColumn: Maybe Boolean, dom: *}
* @param {(String|undefine)} options.tableClasses - class strings to be added to the top table element 
* @param {(Function|String[]|undefine)} options.sort - Can be an array of the order of column keys, or an array.sort callback. See MDN Web Docs for array.sort
* @param {(Function|undefine)} options.afterGenerate - Function that runs after any function that adds elements to the dom.
* @param {(Boolean|undefine)} options.preferInject - If ture, options.inject will take presedence over the data, if false, the data will overwrite the injected row
*/
class Table {
    constructor(containerElement, data, options) {
        /*if(!typeCheck("Maybe {ignoredKeys: Maybe [String], idKey: Maybe String, hiddenKeys: Maybe [String], inject: Maybe Function, tableClasses: Maybe String, sort: Maybe [String] | Function, ...}"), options) {
            throw new TypeError("Options expected an object with structure: \"Maybe {ignoredKeys: Maybe [String], idKey: Maybe String, hiddenKeys: Maybe [String], inject: Maybe Function, tableClasses: Maybe String, sort: Maybe [String] | Function}\"");
        }*/
        if(!options){options = {};}
        if(!typeCheck("[Object]", data)) {
            throw new TypeError("data must be an array of objects");
        }
        this.data = data;
        this.container = containerElement;
        this.options = options;
        this.table = {};
    }
    generate() {
        return new Promise((resolve, reject) => {
            this._sortData(this.data).then(({columns, rows}) => {
                /*console.log(columns, "Col")
                console.log(rows, "rows")*/
                var promises = [];
                /**HEAD**/
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

                /**BODY**/
                this.table.body = {};
                this.table.body.id = "__TABLE_BODY_ID_" + utils.uuidv4() + "__"
                let tableBody = $("<tbody/>").attr("id", this.table.body.id);
                promises.push(new Promise((resolveRow, rejectRow) => {

                    //compile row
                    /*for(let r = 0; r < rows.length; r++) {
                        let tr = $("<tr/>").attr("id", rows[r].rowID);
                        let bodyData = rows[r].getBody();
                        //console.log(bodyData)
                        //allign rows with correct columns 
                        for (let a = 0 ; a < columns.length; a++) {
                            tr.append($("<td/>").html(bodyData[columns[a]]));

                            if(a >= columns.length-1) {
                                //push to body
                                tableBody.append(tr);
                            }
                            if(a >= columns.length-1 && r >= rows.length-1) {
                                //push to body
                                return resolveRow();

                            }
                        }
                    }*/
                    this._compileRow(columns, rows).then((tBody) => {
                        tableBody.append(tBody);
                        return resolveRow();
                    }).catch(err => reject(err))
                }))

                Promise.all(promises).then(() => {
                    this.container.append($("<table/>").addClass(this.options.tableClasses)
                        .append(tableHead)
                        .append(tableBody)
                    )
                    this.table.data = {
                        head: columns,
                        rows: rows
                    }
                    if(typeCheck("Function", this.options.afterGenerate)) {
                        this.options.afterGenerate();
                    }
                    
                    resolve();
                }).catch((err) => {
                    return reject(err);
                })
            });
        });
    }
    _compileRow(columns, rows) {
        return new Promise((resolve, reject) => {
            let tBody = [];
            for(let r = 0; r < rows.length; r++) {
                let tr = $("<tr/>").attr("id", rows[r].rowID);
                let bodyData = rows[r].getBody();
                //console.log(bodyData)
                //allign rows with correct columns 
                for (let a = 0 ; a < columns.length; a++) {
                    tr.append($("<td/>").html(bodyData[columns[a]]));

                    if(a >= columns.length-1) {
                        //push to body
                        tBody.push(tr);
                    }
                    if(a >= columns.length-1 && r >= rows.length-1) {
                        //push to body
                        //console.log(tBody)
                        return resolve(tBody);

                    }
                }
            }
        })
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
    getDirtyRowID(originalID) {
        return "__TABLE_ROW_" + originalID + "__";
    }
    selectRowElm(TABLE_ROW_ID) {
        return $("#"+TABLE_ROW_ID);
    }
    //no support for new columns yet.
    appendRow(data) {
        return new Promise((resolve, reject) => {
            this.addData(data);
            this._sortData(data).then(({rows}) => {
                console.log(rows, "row")
                this._compileRow(this.table.data.head, rows).then((elements) => {
                    $("#" + this.table.body.id).append(elements)
                    console.log(elements)
                    if(typeCheck("Function", this.options.afterGenerate)) {
                        this.options.afterGenerate();
                    }
                    resolve();
                }).catch(err => reject(err))
            }).catch(err => reject(err))
        })
    }
    deleteRow(TABLE_ROW_ID) {
        this.selectRowElm(TABLE_ROW_ID).remove();
    }
    _sortData(data) {
        return new Promise((resolve, reject) => {
            var columnNames = [];
            var rows = [];
            for(let x = 0; x < data.length; x++ ) {
                let row = {};
                row.shownData = data[x];
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
                new Promise((resolveIn, rejectIn) => {
                    //Generate Actions 
                    if(typeCheck("Function", this.options.inject)) {
                        //console.log("INJECTING")
                        row.injectedData = {};
                        this.options.inject(row, (injected) => {
                            if(typeCheck("[{column: String, strictColumn: Maybe Boolean, dom: *}]", injected)) {
                                for(let a = 0; a < injected.length; a++) {
                                    //console.log(injected)
                                    if(injected[a].strictColumn) {
                                        row.injectedData[injected[a].column] = injected[a].dom;
                                    } else {
                                        row.injectedData = Object.assign(row.injectedData, flat({[injected[a].column.split(".")]: injected[a].dom}, {safe: true}))
                                    }
                                    if(a >= injected.length-1) {
                                        return resolveIn();
                                    }
                                }
                            } else {
                                return rejectIn(new TypeError("inject callback expected a single paramater with type structure: [{column: String, strictColumn: Maybe Boolean, dom: *}]"));
                            }
                            
                        })
                    } else {
                        return resolveIn()
                    }
                }).then(() => {
                    let flatData = flat(row.shownData, {safe: true});
                    if(row.injectedData) {
                        //console.log(row.injectedData)
                        if(this.options.preferInject) {
                            row.shownKeys = [...new Set([...Object.keys(flatData), ...Object.keys(row.injectedData)])];
                        } else {
                            row.shownKeys = [...new Set([...Object.keys(row.injectedData), ...Object.keys(flatData)])];
                        }
                        
                    } else {
                        row.shownKeys = Object.keys(flatData);
                    }
                    columnNames = [...new Set([...columnNames, ...row.shownKeys])];




                    // add helper functions
                    row.getBody = () => {if(this.options.preferInject) {return Object.assign(flatData, row.injectedData)} else {return Object.assign(row.injectedData, flatData)}}
                    //Waitfor end of loop
                    rows.push(row);
                    //console.log(rows, "loop Row")
                    if(x >= data.length-1) {
                        //sort 
                        if(typeCheck("[String]", this.options.sort)) {
                            /*let reference_object = {};
                            for (let i = 0; i < this.options.sort.length; i++) {
                                reference_object[this.options.sort[i]] = i;
                            }*/
                            columnNames.sort((a, b) => {
                              return this.options.sort.indexOf(a) - this.options.sort.indexOf(b);
                            });
                        } else if(typeCheck("Function", this.options.sort)) {
                            columnNames.sort(this.options.sort);
                        }
                        return resolve({columns: columnNames, rows: rows});
                    }
                    
                }).catch((err) => {throw err})
            }
        });
    }
}

module.exports = Table;