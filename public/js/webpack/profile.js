/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 20);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

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
* Browser Utilities.
* @module webpack/utils
*/

/**
* Takes an Object and returns a URL Query string
* @link module:webpack/utils
* @param {Object} params
* @returns {String}
*/
exports.urlQuery = (params) => {
    return query = Object.keys(params)
    .filter(function(e) { return ((params[e] !== undefined) && params[e] !== null) }) //removes 
    .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
    .join('&');
}

/**
* Parses an error, and triggers a toast 
* @link module:webpack/utils
* @param {Error} err
* @returns {undefined}
*/
exports.throwError = (err) => {
  //Do more Later
  if(err.isFetch) {
    var $toastHTML = $("<span> ERROR: " + err.response.status + " " + err.message + "</span>").append($("<br/> <span> <strong>" + decodeURIComponent(err.response.headers.get("errormessage")) + "</strong> </span>"))
  } else if(err.status) {
    //AJAX ERROR
    var $toastHTML = $("<span> ERROR: " + err.status + " " + err.statusText + "</span>").append($("<br/> <span> <strong>" + decodeURIComponent(err.getResponseHeader("errormessage")) + "</strong> </span>"))
  } else if(err.message) {
    var $toastHTML = $("<span> ERROR: " + err.message + "</span>")
  } else {
    var $toastHTML = $("<span> ERROR! Check The Console For More Details.</span>")
  }
  Materialize.toast($toastHTML, 4000)
  console.error(err);
}

/**
* An wrapper for the fetch api to make code clean   
* @link module:webpack/utils
* @param {String} method - GET, POST, PATCH, PUT, DELETE, ect.
* @param {String} url - Url to send request to.
* @param {(Object|undefined)} data
* @param {(Object|undefined)} data.query - JSON key pair to add to the URL as a query
* @param {(Object|undefined)} data.body - Data to send in the body of the request.  May not work with GET and DELETE
* @param {(Boolean|undefined)} data.head - Data to be sent as the header. Json object
* @param {(Boolean|undefined)} data.auth - If true, it will send the XSRF-TOKEN to the server
* @returns {Promise}
*/
exports.fetch = (method, url, data) => {
  return new Promise((resolve, reject) => {
    if(!data) {data = {}}
    if(data.query) {data.query = "?" + exports.urlQuery(data.query)} else {data.query = ""}
    if(!data.head) {data.head = {}}
    if(data.auth) {data.head["x-xsrf-token"] = exports.getCookie("XSRF-TOKEN")}
    if(data.body && typeof data.body === "object") {
      data.head["Content-Type"] = "application/json";
      data.body = JSON.stringify(data.body);
    }
    fetch(url + data.query, {
          method: method,
          headers: new Headers(data.head),
          body: data.body,
          credentials: 'same-origin'
      }).then(exports.fetchStatus).then(exports.fetchJSON).then((json) => {
        return resolve(json)
      }).catch((err) => {
        return reject(err);
      })
  })
}

/**
* Parses a fetch response and either throws an error, or it returns a promise  
* @link module:webpack/utils
* @param {Response} response
* @returns {Promise}
*/
exports.fetchStatus = (response) => {
  //console.log(response)
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    var error = new Error(response.statusText)
    error.isFetch = true;
    error.response = response;
    //exports.throwError(error)
    throw error
  }
}

/**
* Converts response to json   
* @link module:webpack/utils
* @param {Response} response
* @returns {Promise}
*/
exports.fetchJSON = (response) => {
  return response.text().then(function(text) {
    return text ? JSON.parse(text) : {}
  })
}

/**
* Creates a UUID V4 Id    
* @link module:webpack/utils
* @returns {String}
*/
exports.uuidv4 = () => {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => 
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

/**
* Sets a browser cookie   
* @link module:webpack/utils
* @param {String} cname - Value to name the cookie
* @param {String} cvalue - Value of the cookie
* @param {Number} exdays - Days until expired
* @returns {undefined}
*/
exports.setCookie = (cname, cvalue, exdays) => {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

/**
* Gets a browser cookie   
* @link module:webpack/utils
* @param {String} cname - Name of the cookie
* @returns {String}
*/
exports.getCookie = (name) => {
    /*var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";*/
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();

}

/**
* Returns a list of every distinct key in the object   
* @link module:webpack/utils
* @param {Object[]} arr - Array of the json objects with keys to test
* @returns {String[]}
*/
exports.distinctKeys = (arr) => {
    return Object.keys(arr.reduce(function(result, obj) {
      return Object.assign(result, obj);
    }, {}))
}

/**
* Returns the current user's ID 
* @link module:webpack/utils
* @returns {String}
*/
exports.thisUser = () => {
  return exports.getCookie("ACCOUNT-ID");
}

/**
* Material full screen response for major actions
* @link module:webpack/utils
* @param {string} icon - Can be "check" or "cancel"
* @param {string} colorClass - Either a css class to apply to the background or presets: "success" "error" or "warning"
* @returns {function} done
*/
exports.materialResponse = (icon, colorClass, done) => {
  switch(colorClass){
    case "success": 
      colorClass = "green accent-3";
      break;
     case "error": 
      colorClass = "red accent-4";
      break;
    case "warning": 
      colorClass = "orange accent-4";
      break;
  }

  //Set the elements 
  $("body").prepend("<div id=\"circleThingContainer\" class=\"circleThingContainer\"><div id=\"circleThing\" class=\"circleThing\"></div></div><span id=\"Xleft\"></span><span id=\"Xright\"></span><div id=\"checkmarkContainer\"><span id=\"Cleft\"></span><span id=\"Cright\"></span></div>")
    //setup green grow
    if(icon == "check") {
      $('#checkmarkContainer').addClass('checkmarkContainer checkmarkContainerIn');
        //Check marks 
      $('#Cleft').addClass('Cleft CleftIn');
      $('#Cright').addClass('Cright CrightIn');
    }
    if(icon == "cancel") {
        //X marks 
      $('#Xleft').addClass('Xleft XleftIn');
      $('#Xright').addClass('Xright XrightIn');
    }

    $("#circleThing").removeClass().addClass("circleThing circleGrow");
    //addcolor
    $("#circleThing").addClass(colorClass);

    //on circle complete 
    $('#circleThing').one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(e) {
      
      $("#circleThingContainer").addClass(colorClass)
      $('#circleThing').removeClass().addClass('circleThing');
      //wait for 1 second
      setTimeout(function() {
        if(icon == "check") {
          $('#checkmarkContainer').removeClass('checkmarkContainerIn').addClass('checkmarkContainerOut');
          $('#Cleft').removeClass('CleftIn').addClass("CleftOut");
          $('#Cright').removeClass('CrightIn').addClass("CrightOut");
        }
        if(icon == "cancel") {
            //X marks 
          $('#Xleft').removeClass('XleftIn').addClass("XLeftOut");
          $('#Xright').removeClass('XrightIn').addClass("XrightOut");
        }

        $('#circleThing').removeClass().addClass('circleThing circleGrow grey darken-4');
        //$('#circleThing').css("background-color", "rgba(0, 0, 0, 0)")
        //when final one ends
        $('#circleThing').one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(e) {
          $("#circleThingContainer").removeClass(colorClass).addClass("grey darken-4")
          setTimeout(function() {
            $('#Xleft').remove();
            $('#Xright').remove();
            $('#Cleft').remove();
            $('#Cright').remove();
            $('#checkmarkContainer').remove();
            $("#circleThingContainer").fadeOut("fast", function() {
              $("#circleThingContainer").remove();
            });
            $("#circleThing").remove();
            if(typeof done == "function") {
              return done();
            }
          }, 500);
        });
      }, 1000);
    });
}

/** 
* Opens a mustache Mixen page
* @link module:webpack/utils
* @param {string} pageID - ID of the page element containing the mixen 
*/
exports.openPage = (pageID) => {
  $("#" + pageID).addClass("active");
}
/** 
* close a mustache Mixen page
* @link module:webpack/utils
* @param {string} pageID - ID of the page element containing the mixen 
*/
exports.closePage = (pageID) => {
  $("#" + pageID).removeClass("active");
}

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

// Generated by LiveScript 1.4.0
(function(){
  var VERSION, parseType, parsedTypeCheck, typeCheck;
  VERSION = '0.3.2';
  parseType = __webpack_require__(4);
  parsedTypeCheck = __webpack_require__(5);
  typeCheck = function(type, input, options){
    return parsedTypeCheck(parseType(type), input, options);
  };
  module.exports = {
    VERSION: VERSION,
    typeCheck: typeCheck,
    parsedTypeCheck: parsedTypeCheck,
    parseType: parseType
  };
}).call(this);


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

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
var flat = __webpack_require__(12);
var utils = __webpack_require__(0);
var typeCheck = __webpack_require__(1).typeCheck;
var DeepKey = __webpack_require__(14);

/**
* Takes structured data and makes a table from it. call this.generate() to create a table,
* All data should be strings to avoid strange behaviour.  
* @link module:webpack/framework
* @class 
* @param {Selector} containerElement - The table container.
* @param {Object} data - The data to be added to the table.
* @param {Object} [options]
* @param {String[]} [options.ignoredKeys] - List of keys to leave out of the row object
* @param {String} [options.idKey] - Key name in data to act as ID.  Will generate a unique one for every row if not included. 
* @param {String[]} [options.hiddenKeys] - Removes the keys from the table, but keeps it in row object. 
* @param {Function} [options.inject] - fires for every row.  Allowes for one to inject columns and data for each row. First param is the row object, second is a callback that takes one array of objects. Example Object to return: {column: String, strictColumn: Maybe Boolean, dom: *}
* @param {String} [options.tableClasses] - class strings to be added to the top table element 
* @param {(Function|String[])} [options.sort] - Can be an array of the order of column keys, or an array.sort callback. See MDN Web Docs for array.sort
* @param {Function} [options.afterGenerate] - Function that runs after any function that adds elements to the dom.
* @param {Boolean} [options.preferInject] - If ture, options.inject will take presedence over the data, if false, the data will overwrite the injected row
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
        this.container = $(containerElement);
        this.options = options;
        this.table = {};
    }
    generate(injectOnce) {
        return new Promise((resolve, reject) => {
            this._sortData(this.data, injectOnce).then(({columns, rows}) => {
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
        this.emptyContainer();
    }
    emptyContainer() {
        this.container.empty();
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
    appendRow(data, injectOnce) {
        return new Promise((resolve, reject) => {
            this.addData(data);
            this._sortData(data, injectOnce).then(({rows}) => {
                this._compileRow(this.table.data.head, rows).then((elements) => {
                    $("#" + this.table.body.id).append(elements)
                    //update table object
                    this.table.data.rows.push(rows);
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
    getTableBody() {
        return $("#" + this.table.body.id);
    }
    _sortData(data, injectOnce) {
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
                let promInj = []
                //row.injectedData = {};
                promInj.push(new Promise((resolveIn, rejectIn) => {
                    //Generate Actions 
                    if(typeCheck("Function", this.options.inject)) {
                        //console.log("INJECTING")
                        this.options.inject(row, (injected) => {
                            if(typeCheck("[{column: String, strictColumn: Maybe Boolean, dom: *}]", injected)) {
                                this._compileInject(injected).then((inj) => {
                                    return resolveIn(inj)
                                    //row.injectedData = Object.assign(row.injectedData, inj);
                                })
                            } else {
                                return rejectIn(new TypeError("inject callback expected a single paramater with type structure: [{column: String, strictColumn: Maybe Boolean, dom: *}]"));
                            }
                            
                        })
                    } else {
                        return resolveIn()
                    }
                }))
                //inject once
                promInj.push(new Promise((resolveIn, rejectIn) => {
                    //Generate Actions 
                    if(typeCheck("Function", injectOnce)) {
                        //console.log("INJECTING")
                        injectOnce(row, (injected) => {
                            if(typeCheck("[{column: String, strictColumn: Maybe Boolean, dom: *}]", injected)) {
                                this._compileInject(injected).then((inj) => {
                                    return resolveIn(inj)
                                    //row.injectedData = Object.assign(row.injectedData, inj);
                                })
                            } else {
                                return rejectIn(new TypeError("inject callback expected a single paramater with type structure: [{column: String, strictColumn: Maybe Boolean, dom: *}]"));
                            }
                            
                        })
                    } else {
                        return resolveIn()
                    }
                }))


                Promise.all(promInj).then(([injectGlobal, injectOnce]) => {
                    if(injectGlobal && injectOnce) {
                        row.injectedData = Object.assign(injectGlobal, injectOnce);
                    } else if(injectGlobal) {row.injectedData = injectGlobal} else if(injectOnce){row.injectedData = injectOnce}

                    let flatData = flat(row.shownData, {safe: true});
                    if(row.injectedData) {
                        //console.log(row.injectedData)
                        //remove dupe and combine
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
                    row.getBody = () => {
                        if(!row.injectedData) {
                            return flatData
                        } else {
                            if(this.options.preferInject) {return Object.assign(flatData, row.injectedData)} else {return Object.assign(row.injectedData, flatData)}
                        }
                    }
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
    _compileInject(injected) {
        return new Promise((resolve) => {
            let injectedData = {};
            if(injected.length < 1) {return resolve(injectedData);}
            for(let a = 0; a < injected.length; a++) {
                if(injected[a].strictColumn) {
                    injectedData[injected[a].column] = injected[a].dom;
                } else {
                    injectedData = Object.assign(injectedData, flat({[injected[a].column.split(".")]: injected[a].dom}, {safe: true}))
                }
                if(a >= injected.length-1) {
                    return resolve(injectedData);
                }
            }
        });
    }
}

module.exports = Table;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

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
var typeCheck = __webpack_require__(1).typeCheck

/**
* Pairs a caret "^" button with a hidden element.  Shows element when carot is clicked and flips carot.
* @link module:webpack/framework
* @class 
* @param {Selector} caretButton - The clickable element.
* @param {Selector} content - The element to be shown.
* @param {(Object|undefined)} options - The clickable element.
* @param {(Boolean|undefined)} options.isOpen - True if the element should be shown by default.
* @param {(Number|undefine)} options.timing - How fast the element will be shown. In ms.
* @param {(Function|undefine)} options.callback - Passes one argument, "isOpen" (bool). Fires whenever the Caret is opened.
*/
class Caret {
    constructor(caretButton, content, options) {
        if(!typeCheck("Maybe {isOpen: Maybe Boolean, timing: Maybe Number, callback: Maybe Function}"), options) {
            throw new TypeError("Options expected an object with structure: \"Maybe {isOpen: Maybe Boolean, timing: Maybe Number, callback: Maybe Function}\"");
        }
        if(!options) {options = {}}
        this.options = options;
        this.caretButton = caretButton;
        this.contentElm = content;
        this.state = (this.options.isOpen || false);
        this.caretButton.css("transition", "transform 0.2s");
        this.showContent(this.state, 0)
    }
    initialize() {
        this.caretButton.on("click", e=> this._onClick(e));
    }
    destroy() {
        this.caretButton.off("click");
    }
    _onClick(event) {
        if(this.state) {this.caretButton.css("transform", "rotate(0deg)")} else {this.caretButton.css("transform", "rotate(180deg)")}
        if(typeCheck("Function", this.options.callback)) {this.options.callback(!this.state)}
        this.showContent(!this.state);
    }
    showContent(isShown, time) {
        if(!typeCheck("Number", time)) {time = (this.options.timing || 200)}
        if(time > 0) {
            if(isShown) {this.contentElm.slideDown(time)} else {this.contentElm.slideUp(time)}
        } else {
            if(isShown) {this.contentElm.show()} else {this.contentElm.hide()}
        }
        this.state = isShown;
    }
}

module.exports = Caret;

/***/ }),
/* 4 */
/***/ (function(module, exports) {

// Generated by LiveScript 1.4.0
(function(){
  var identifierRegex, tokenRegex;
  identifierRegex = /[\$\w]+/;
  function peek(tokens){
    var token;
    token = tokens[0];
    if (token == null) {
      throw new Error('Unexpected end of input.');
    }
    return token;
  }
  function consumeIdent(tokens){
    var token;
    token = peek(tokens);
    if (!identifierRegex.test(token)) {
      throw new Error("Expected text, got '" + token + "' instead.");
    }
    return tokens.shift();
  }
  function consumeOp(tokens, op){
    var token;
    token = peek(tokens);
    if (token !== op) {
      throw new Error("Expected '" + op + "', got '" + token + "' instead.");
    }
    return tokens.shift();
  }
  function maybeConsumeOp(tokens, op){
    var token;
    token = tokens[0];
    if (token === op) {
      return tokens.shift();
    } else {
      return null;
    }
  }
  function consumeArray(tokens){
    var types;
    consumeOp(tokens, '[');
    if (peek(tokens) === ']') {
      throw new Error("Must specify type of Array - eg. [Type], got [] instead.");
    }
    types = consumeTypes(tokens);
    consumeOp(tokens, ']');
    return {
      structure: 'array',
      of: types
    };
  }
  function consumeTuple(tokens){
    var components;
    components = [];
    consumeOp(tokens, '(');
    if (peek(tokens) === ')') {
      throw new Error("Tuple must be of at least length 1 - eg. (Type), got () instead.");
    }
    for (;;) {
      components.push(consumeTypes(tokens));
      maybeConsumeOp(tokens, ',');
      if (')' === peek(tokens)) {
        break;
      }
    }
    consumeOp(tokens, ')');
    return {
      structure: 'tuple',
      of: components
    };
  }
  function consumeFields(tokens){
    var fields, subset, ref$, key, types;
    fields = {};
    consumeOp(tokens, '{');
    subset = false;
    for (;;) {
      if (maybeConsumeOp(tokens, '...')) {
        subset = true;
        break;
      }
      ref$ = consumeField(tokens), key = ref$[0], types = ref$[1];
      fields[key] = types;
      maybeConsumeOp(tokens, ',');
      if ('}' === peek(tokens)) {
        break;
      }
    }
    consumeOp(tokens, '}');
    return {
      structure: 'fields',
      of: fields,
      subset: subset
    };
  }
  function consumeField(tokens){
    var key, types;
    key = consumeIdent(tokens);
    consumeOp(tokens, ':');
    types = consumeTypes(tokens);
    return [key, types];
  }
  function maybeConsumeStructure(tokens){
    switch (tokens[0]) {
    case '[':
      return consumeArray(tokens);
    case '(':
      return consumeTuple(tokens);
    case '{':
      return consumeFields(tokens);
    }
  }
  function consumeType(tokens){
    var token, wildcard, type, structure;
    token = peek(tokens);
    wildcard = token === '*';
    if (wildcard || identifierRegex.test(token)) {
      type = wildcard
        ? consumeOp(tokens, '*')
        : consumeIdent(tokens);
      structure = maybeConsumeStructure(tokens);
      if (structure) {
        return structure.type = type, structure;
      } else {
        return {
          type: type
        };
      }
    } else {
      structure = maybeConsumeStructure(tokens);
      if (!structure) {
        throw new Error("Unexpected character: " + token);
      }
      return structure;
    }
  }
  function consumeTypes(tokens){
    var lookahead, types, typesSoFar, typeObj, type;
    if ('::' === peek(tokens)) {
      throw new Error("No comment before comment separator '::' found.");
    }
    lookahead = tokens[1];
    if (lookahead != null && lookahead === '::') {
      tokens.shift();
      tokens.shift();
    }
    types = [];
    typesSoFar = {};
    if ('Maybe' === peek(tokens)) {
      tokens.shift();
      types = [
        {
          type: 'Undefined'
        }, {
          type: 'Null'
        }
      ];
      typesSoFar = {
        Undefined: true,
        Null: true
      };
    }
    for (;;) {
      typeObj = consumeType(tokens), type = typeObj.type;
      if (!typesSoFar[type]) {
        types.push(typeObj);
      }
      typesSoFar[type] = true;
      if (!maybeConsumeOp(tokens, '|')) {
        break;
      }
    }
    return types;
  }
  tokenRegex = RegExp('\\.\\.\\.|::|->|' + identifierRegex.source + '|\\S', 'g');
  module.exports = function(input){
    var tokens, e;
    if (!input.length) {
      throw new Error('No type specified.');
    }
    tokens = input.match(tokenRegex) || [];
    if (in$('->', tokens)) {
      throw new Error("Function types are not supported.\ To validate that something is a function, you may use 'Function'.");
    }
    try {
      return consumeTypes(tokens);
    } catch (e$) {
      e = e$;
      throw new Error(e.message + " - Remaining tokens: " + JSON.stringify(tokens) + " - Initial input: '" + input + "'");
    }
  };
  function in$(x, xs){
    var i = -1, l = xs.length >>> 0;
    while (++i < l) if (x === xs[i]) return true;
    return false;
  }
}).call(this);


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

// Generated by LiveScript 1.4.0
(function(){
  var ref$, any, all, isItNaN, types, defaultType, customTypes, toString$ = {}.toString;
  ref$ = __webpack_require__(6), any = ref$.any, all = ref$.all, isItNaN = ref$.isItNaN;
  types = {
    Number: {
      typeOf: 'Number',
      validate: function(it){
        return !isItNaN(it);
      }
    },
    NaN: {
      typeOf: 'Number',
      validate: isItNaN
    },
    Int: {
      typeOf: 'Number',
      validate: function(it){
        return !isItNaN(it) && it % 1 === 0;
      }
    },
    Float: {
      typeOf: 'Number',
      validate: function(it){
        return !isItNaN(it);
      }
    },
    Date: {
      typeOf: 'Date',
      validate: function(it){
        return !isItNaN(it.getTime());
      }
    }
  };
  defaultType = {
    array: 'Array',
    tuple: 'Array'
  };
  function checkArray(input, type){
    return all(function(it){
      return checkMultiple(it, type.of);
    }, input);
  }
  function checkTuple(input, type){
    var i, i$, ref$, len$, types;
    i = 0;
    for (i$ = 0, len$ = (ref$ = type.of).length; i$ < len$; ++i$) {
      types = ref$[i$];
      if (!checkMultiple(input[i], types)) {
        return false;
      }
      i++;
    }
    return input.length <= i;
  }
  function checkFields(input, type){
    var inputKeys, numInputKeys, k, numOfKeys, key, ref$, types;
    inputKeys = {};
    numInputKeys = 0;
    for (k in input) {
      inputKeys[k] = true;
      numInputKeys++;
    }
    numOfKeys = 0;
    for (key in ref$ = type.of) {
      types = ref$[key];
      if (!checkMultiple(input[key], types)) {
        return false;
      }
      if (inputKeys[key]) {
        numOfKeys++;
      }
    }
    return type.subset || numInputKeys === numOfKeys;
  }
  function checkStructure(input, type){
    if (!(input instanceof Object)) {
      return false;
    }
    switch (type.structure) {
    case 'fields':
      return checkFields(input, type);
    case 'array':
      return checkArray(input, type);
    case 'tuple':
      return checkTuple(input, type);
    }
  }
  function check(input, typeObj){
    var type, structure, setting, that;
    type = typeObj.type, structure = typeObj.structure;
    if (type) {
      if (type === '*') {
        return true;
      }
      setting = customTypes[type] || types[type];
      if (setting) {
        return setting.typeOf === toString$.call(input).slice(8, -1) && setting.validate(input);
      } else {
        return type === toString$.call(input).slice(8, -1) && (!structure || checkStructure(input, typeObj));
      }
    } else if (structure) {
      if (that = defaultType[structure]) {
        if (that !== toString$.call(input).slice(8, -1)) {
          return false;
        }
      }
      return checkStructure(input, typeObj);
    } else {
      throw new Error("No type defined. Input: " + input + ".");
    }
  }
  function checkMultiple(input, types){
    if (toString$.call(types).slice(8, -1) !== 'Array') {
      throw new Error("Types must be in an array. Input: " + input + ".");
    }
    return any(function(it){
      return check(input, it);
    }, types);
  }
  module.exports = function(parsedType, input, options){
    options == null && (options = {});
    customTypes = options.customTypes || {};
    return checkMultiple(input, parsedType);
  };
}).call(this);


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

// Generated by LiveScript 1.4.0
var Func, List, Obj, Str, Num, id, isType, replicate, prelude, toString$ = {}.toString;
Func = __webpack_require__(7);
List = __webpack_require__(8);
Obj = __webpack_require__(9);
Str = __webpack_require__(10);
Num = __webpack_require__(11);
id = function(x){
  return x;
};
isType = curry$(function(type, x){
  return toString$.call(x).slice(8, -1) === type;
});
replicate = curry$(function(n, x){
  var i$, results$ = [];
  for (i$ = 0; i$ < n; ++i$) {
    results$.push(x);
  }
  return results$;
});
Str.empty = List.empty;
Str.slice = List.slice;
Str.take = List.take;
Str.drop = List.drop;
Str.splitAt = List.splitAt;
Str.takeWhile = List.takeWhile;
Str.dropWhile = List.dropWhile;
Str.span = List.span;
Str.breakStr = List.breakList;
prelude = {
  Func: Func,
  List: List,
  Obj: Obj,
  Str: Str,
  Num: Num,
  id: id,
  isType: isType,
  replicate: replicate
};
prelude.each = List.each;
prelude.map = List.map;
prelude.filter = List.filter;
prelude.compact = List.compact;
prelude.reject = List.reject;
prelude.partition = List.partition;
prelude.find = List.find;
prelude.head = List.head;
prelude.first = List.first;
prelude.tail = List.tail;
prelude.last = List.last;
prelude.initial = List.initial;
prelude.empty = List.empty;
prelude.reverse = List.reverse;
prelude.difference = List.difference;
prelude.intersection = List.intersection;
prelude.union = List.union;
prelude.countBy = List.countBy;
prelude.groupBy = List.groupBy;
prelude.fold = List.fold;
prelude.foldl = List.foldl;
prelude.fold1 = List.fold1;
prelude.foldl1 = List.foldl1;
prelude.foldr = List.foldr;
prelude.foldr1 = List.foldr1;
prelude.unfoldr = List.unfoldr;
prelude.andList = List.andList;
prelude.orList = List.orList;
prelude.any = List.any;
prelude.all = List.all;
prelude.unique = List.unique;
prelude.uniqueBy = List.uniqueBy;
prelude.sort = List.sort;
prelude.sortWith = List.sortWith;
prelude.sortBy = List.sortBy;
prelude.sum = List.sum;
prelude.product = List.product;
prelude.mean = List.mean;
prelude.average = List.average;
prelude.concat = List.concat;
prelude.concatMap = List.concatMap;
prelude.flatten = List.flatten;
prelude.maximum = List.maximum;
prelude.minimum = List.minimum;
prelude.maximumBy = List.maximumBy;
prelude.minimumBy = List.minimumBy;
prelude.scan = List.scan;
prelude.scanl = List.scanl;
prelude.scan1 = List.scan1;
prelude.scanl1 = List.scanl1;
prelude.scanr = List.scanr;
prelude.scanr1 = List.scanr1;
prelude.slice = List.slice;
prelude.take = List.take;
prelude.drop = List.drop;
prelude.splitAt = List.splitAt;
prelude.takeWhile = List.takeWhile;
prelude.dropWhile = List.dropWhile;
prelude.span = List.span;
prelude.breakList = List.breakList;
prelude.zip = List.zip;
prelude.zipWith = List.zipWith;
prelude.zipAll = List.zipAll;
prelude.zipAllWith = List.zipAllWith;
prelude.at = List.at;
prelude.elemIndex = List.elemIndex;
prelude.elemIndices = List.elemIndices;
prelude.findIndex = List.findIndex;
prelude.findIndices = List.findIndices;
prelude.apply = Func.apply;
prelude.curry = Func.curry;
prelude.flip = Func.flip;
prelude.fix = Func.fix;
prelude.over = Func.over;
prelude.split = Str.split;
prelude.join = Str.join;
prelude.lines = Str.lines;
prelude.unlines = Str.unlines;
prelude.words = Str.words;
prelude.unwords = Str.unwords;
prelude.chars = Str.chars;
prelude.unchars = Str.unchars;
prelude.repeat = Str.repeat;
prelude.capitalize = Str.capitalize;
prelude.camelize = Str.camelize;
prelude.dasherize = Str.dasherize;
prelude.values = Obj.values;
prelude.keys = Obj.keys;
prelude.pairsToObj = Obj.pairsToObj;
prelude.objToPairs = Obj.objToPairs;
prelude.listsToObj = Obj.listsToObj;
prelude.objToLists = Obj.objToLists;
prelude.max = Num.max;
prelude.min = Num.min;
prelude.negate = Num.negate;
prelude.abs = Num.abs;
prelude.signum = Num.signum;
prelude.quot = Num.quot;
prelude.rem = Num.rem;
prelude.div = Num.div;
prelude.mod = Num.mod;
prelude.recip = Num.recip;
prelude.pi = Num.pi;
prelude.tau = Num.tau;
prelude.exp = Num.exp;
prelude.sqrt = Num.sqrt;
prelude.ln = Num.ln;
prelude.pow = Num.pow;
prelude.sin = Num.sin;
prelude.tan = Num.tan;
prelude.cos = Num.cos;
prelude.acos = Num.acos;
prelude.asin = Num.asin;
prelude.atan = Num.atan;
prelude.atan2 = Num.atan2;
prelude.truncate = Num.truncate;
prelude.round = Num.round;
prelude.ceiling = Num.ceiling;
prelude.floor = Num.floor;
prelude.isItNaN = Num.isItNaN;
prelude.even = Num.even;
prelude.odd = Num.odd;
prelude.gcd = Num.gcd;
prelude.lcm = Num.lcm;
prelude.VERSION = '1.1.2';
module.exports = prelude;
function curry$(f, bound){
  var context,
  _curry = function(args) {
    return f.length > 1 ? function(){
      var params = args ? args.concat() : [];
      context = bound ? context || this : this;
      return params.push.apply(params, arguments) <
          f.length && arguments.length ?
        _curry.call(context, params) : f.apply(context, params);
    } : f;
  };
  return _curry();
}

/***/ }),
/* 7 */
/***/ (function(module, exports) {

// Generated by LiveScript 1.4.0
var apply, curry, flip, fix, over, memoize, slice$ = [].slice, toString$ = {}.toString;
apply = curry$(function(f, list){
  return f.apply(null, list);
});
curry = function(f){
  return curry$(f);
};
flip = curry$(function(f, x, y){
  return f(y, x);
});
fix = function(f){
  return function(g){
    return function(){
      return f(g(g)).apply(null, arguments);
    };
  }(function(g){
    return function(){
      return f(g(g)).apply(null, arguments);
    };
  });
};
over = curry$(function(f, g, x, y){
  return f(g(x), g(y));
});
memoize = function(f){
  var memo;
  memo = {};
  return function(){
    var args, key, arg;
    args = slice$.call(arguments);
    key = (function(){
      var i$, ref$, len$, results$ = [];
      for (i$ = 0, len$ = (ref$ = args).length; i$ < len$; ++i$) {
        arg = ref$[i$];
        results$.push(arg + toString$.call(arg).slice(8, -1));
      }
      return results$;
    }()).join('');
    return memo[key] = key in memo
      ? memo[key]
      : f.apply(null, args);
  };
};
module.exports = {
  curry: curry,
  flip: flip,
  fix: fix,
  apply: apply,
  over: over,
  memoize: memoize
};
function curry$(f, bound){
  var context,
  _curry = function(args) {
    return f.length > 1 ? function(){
      var params = args ? args.concat() : [];
      context = bound ? context || this : this;
      return params.push.apply(params, arguments) <
          f.length && arguments.length ?
        _curry.call(context, params) : f.apply(context, params);
    } : f;
  };
  return _curry();
}

/***/ }),
/* 8 */
/***/ (function(module, exports) {

// Generated by LiveScript 1.4.0
var each, map, compact, filter, reject, partition, find, head, first, tail, last, initial, empty, reverse, unique, uniqueBy, fold, foldl, fold1, foldl1, foldr, foldr1, unfoldr, concat, concatMap, flatten, difference, intersection, union, countBy, groupBy, andList, orList, any, all, sort, sortWith, sortBy, sum, product, mean, average, maximum, minimum, maximumBy, minimumBy, scan, scanl, scan1, scanl1, scanr, scanr1, slice, take, drop, splitAt, takeWhile, dropWhile, span, breakList, zip, zipWith, zipAll, zipAllWith, at, elemIndex, elemIndices, findIndex, findIndices, toString$ = {}.toString, slice$ = [].slice;
each = curry$(function(f, xs){
  var i$, len$, x;
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    f(x);
  }
  return xs;
});
map = curry$(function(f, xs){
  var i$, len$, x, results$ = [];
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    results$.push(f(x));
  }
  return results$;
});
compact = function(xs){
  var i$, len$, x, results$ = [];
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    if (x) {
      results$.push(x);
    }
  }
  return results$;
};
filter = curry$(function(f, xs){
  var i$, len$, x, results$ = [];
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    if (f(x)) {
      results$.push(x);
    }
  }
  return results$;
});
reject = curry$(function(f, xs){
  var i$, len$, x, results$ = [];
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    if (!f(x)) {
      results$.push(x);
    }
  }
  return results$;
});
partition = curry$(function(f, xs){
  var passed, failed, i$, len$, x;
  passed = [];
  failed = [];
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    (f(x) ? passed : failed).push(x);
  }
  return [passed, failed];
});
find = curry$(function(f, xs){
  var i$, len$, x;
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    if (f(x)) {
      return x;
    }
  }
});
head = first = function(xs){
  return xs[0];
};
tail = function(xs){
  if (!xs.length) {
    return;
  }
  return xs.slice(1);
};
last = function(xs){
  return xs[xs.length - 1];
};
initial = function(xs){
  if (!xs.length) {
    return;
  }
  return xs.slice(0, -1);
};
empty = function(xs){
  return !xs.length;
};
reverse = function(xs){
  return xs.concat().reverse();
};
unique = function(xs){
  var result, i$, len$, x;
  result = [];
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    if (!in$(x, result)) {
      result.push(x);
    }
  }
  return result;
};
uniqueBy = curry$(function(f, xs){
  var seen, i$, len$, x, val, results$ = [];
  seen = [];
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    val = f(x);
    if (in$(val, seen)) {
      continue;
    }
    seen.push(val);
    results$.push(x);
  }
  return results$;
});
fold = foldl = curry$(function(f, memo, xs){
  var i$, len$, x;
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    memo = f(memo, x);
  }
  return memo;
});
fold1 = foldl1 = curry$(function(f, xs){
  return fold(f, xs[0], xs.slice(1));
});
foldr = curry$(function(f, memo, xs){
  var i$, x;
  for (i$ = xs.length - 1; i$ >= 0; --i$) {
    x = xs[i$];
    memo = f(x, memo);
  }
  return memo;
});
foldr1 = curry$(function(f, xs){
  return foldr(f, xs[xs.length - 1], xs.slice(0, -1));
});
unfoldr = curry$(function(f, b){
  var result, x, that;
  result = [];
  x = b;
  while ((that = f(x)) != null) {
    result.push(that[0]);
    x = that[1];
  }
  return result;
});
concat = function(xss){
  return [].concat.apply([], xss);
};
concatMap = curry$(function(f, xs){
  var x;
  return [].concat.apply([], (function(){
    var i$, ref$, len$, results$ = [];
    for (i$ = 0, len$ = (ref$ = xs).length; i$ < len$; ++i$) {
      x = ref$[i$];
      results$.push(f(x));
    }
    return results$;
  }()));
});
flatten = function(xs){
  var x;
  return [].concat.apply([], (function(){
    var i$, ref$, len$, results$ = [];
    for (i$ = 0, len$ = (ref$ = xs).length; i$ < len$; ++i$) {
      x = ref$[i$];
      if (toString$.call(x).slice(8, -1) === 'Array') {
        results$.push(flatten(x));
      } else {
        results$.push(x);
      }
    }
    return results$;
  }()));
};
difference = function(xs){
  var yss, results, i$, len$, x, j$, len1$, ys;
  yss = slice$.call(arguments, 1);
  results = [];
  outer: for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    for (j$ = 0, len1$ = yss.length; j$ < len1$; ++j$) {
      ys = yss[j$];
      if (in$(x, ys)) {
        continue outer;
      }
    }
    results.push(x);
  }
  return results;
};
intersection = function(xs){
  var yss, results, i$, len$, x, j$, len1$, ys;
  yss = slice$.call(arguments, 1);
  results = [];
  outer: for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    for (j$ = 0, len1$ = yss.length; j$ < len1$; ++j$) {
      ys = yss[j$];
      if (!in$(x, ys)) {
        continue outer;
      }
    }
    results.push(x);
  }
  return results;
};
union = function(){
  var xss, results, i$, len$, xs, j$, len1$, x;
  xss = slice$.call(arguments);
  results = [];
  for (i$ = 0, len$ = xss.length; i$ < len$; ++i$) {
    xs = xss[i$];
    for (j$ = 0, len1$ = xs.length; j$ < len1$; ++j$) {
      x = xs[j$];
      if (!in$(x, results)) {
        results.push(x);
      }
    }
  }
  return results;
};
countBy = curry$(function(f, xs){
  var results, i$, len$, x, key;
  results = {};
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    key = f(x);
    if (key in results) {
      results[key] += 1;
    } else {
      results[key] = 1;
    }
  }
  return results;
});
groupBy = curry$(function(f, xs){
  var results, i$, len$, x, key;
  results = {};
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    key = f(x);
    if (key in results) {
      results[key].push(x);
    } else {
      results[key] = [x];
    }
  }
  return results;
});
andList = function(xs){
  var i$, len$, x;
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    if (!x) {
      return false;
    }
  }
  return true;
};
orList = function(xs){
  var i$, len$, x;
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    if (x) {
      return true;
    }
  }
  return false;
};
any = curry$(function(f, xs){
  var i$, len$, x;
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    if (f(x)) {
      return true;
    }
  }
  return false;
});
all = curry$(function(f, xs){
  var i$, len$, x;
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    if (!f(x)) {
      return false;
    }
  }
  return true;
});
sort = function(xs){
  return xs.concat().sort(function(x, y){
    if (x > y) {
      return 1;
    } else if (x < y) {
      return -1;
    } else {
      return 0;
    }
  });
};
sortWith = curry$(function(f, xs){
  return xs.concat().sort(f);
});
sortBy = curry$(function(f, xs){
  return xs.concat().sort(function(x, y){
    if (f(x) > f(y)) {
      return 1;
    } else if (f(x) < f(y)) {
      return -1;
    } else {
      return 0;
    }
  });
});
sum = function(xs){
  var result, i$, len$, x;
  result = 0;
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    result += x;
  }
  return result;
};
product = function(xs){
  var result, i$, len$, x;
  result = 1;
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    result *= x;
  }
  return result;
};
mean = average = function(xs){
  var sum, i$, len$, x;
  sum = 0;
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    sum += x;
  }
  return sum / xs.length;
};
maximum = function(xs){
  var max, i$, ref$, len$, x;
  max = xs[0];
  for (i$ = 0, len$ = (ref$ = xs.slice(1)).length; i$ < len$; ++i$) {
    x = ref$[i$];
    if (x > max) {
      max = x;
    }
  }
  return max;
};
minimum = function(xs){
  var min, i$, ref$, len$, x;
  min = xs[0];
  for (i$ = 0, len$ = (ref$ = xs.slice(1)).length; i$ < len$; ++i$) {
    x = ref$[i$];
    if (x < min) {
      min = x;
    }
  }
  return min;
};
maximumBy = curry$(function(f, xs){
  var max, i$, ref$, len$, x;
  max = xs[0];
  for (i$ = 0, len$ = (ref$ = xs.slice(1)).length; i$ < len$; ++i$) {
    x = ref$[i$];
    if (f(x) > f(max)) {
      max = x;
    }
  }
  return max;
});
minimumBy = curry$(function(f, xs){
  var min, i$, ref$, len$, x;
  min = xs[0];
  for (i$ = 0, len$ = (ref$ = xs.slice(1)).length; i$ < len$; ++i$) {
    x = ref$[i$];
    if (f(x) < f(min)) {
      min = x;
    }
  }
  return min;
});
scan = scanl = curry$(function(f, memo, xs){
  var last, x;
  last = memo;
  return [memo].concat((function(){
    var i$, ref$, len$, results$ = [];
    for (i$ = 0, len$ = (ref$ = xs).length; i$ < len$; ++i$) {
      x = ref$[i$];
      results$.push(last = f(last, x));
    }
    return results$;
  }()));
});
scan1 = scanl1 = curry$(function(f, xs){
  if (!xs.length) {
    return;
  }
  return scan(f, xs[0], xs.slice(1));
});
scanr = curry$(function(f, memo, xs){
  xs = xs.concat().reverse();
  return scan(f, memo, xs).reverse();
});
scanr1 = curry$(function(f, xs){
  if (!xs.length) {
    return;
  }
  xs = xs.concat().reverse();
  return scan(f, xs[0], xs.slice(1)).reverse();
});
slice = curry$(function(x, y, xs){
  return xs.slice(x, y);
});
take = curry$(function(n, xs){
  if (n <= 0) {
    return xs.slice(0, 0);
  } else {
    return xs.slice(0, n);
  }
});
drop = curry$(function(n, xs){
  if (n <= 0) {
    return xs;
  } else {
    return xs.slice(n);
  }
});
splitAt = curry$(function(n, xs){
  return [take(n, xs), drop(n, xs)];
});
takeWhile = curry$(function(p, xs){
  var len, i;
  len = xs.length;
  if (!len) {
    return xs;
  }
  i = 0;
  while (i < len && p(xs[i])) {
    i += 1;
  }
  return xs.slice(0, i);
});
dropWhile = curry$(function(p, xs){
  var len, i;
  len = xs.length;
  if (!len) {
    return xs;
  }
  i = 0;
  while (i < len && p(xs[i])) {
    i += 1;
  }
  return xs.slice(i);
});
span = curry$(function(p, xs){
  return [takeWhile(p, xs), dropWhile(p, xs)];
});
breakList = curry$(function(p, xs){
  return span(compose$(p, not$), xs);
});
zip = curry$(function(xs, ys){
  var result, len, i$, len$, i, x;
  result = [];
  len = ys.length;
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    i = i$;
    x = xs[i$];
    if (i === len) {
      break;
    }
    result.push([x, ys[i]]);
  }
  return result;
});
zipWith = curry$(function(f, xs, ys){
  var result, len, i$, len$, i, x;
  result = [];
  len = ys.length;
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    i = i$;
    x = xs[i$];
    if (i === len) {
      break;
    }
    result.push(f(x, ys[i]));
  }
  return result;
});
zipAll = function(){
  var xss, minLength, i$, len$, xs, ref$, i, lresult$, j$, results$ = [];
  xss = slice$.call(arguments);
  minLength = undefined;
  for (i$ = 0, len$ = xss.length; i$ < len$; ++i$) {
    xs = xss[i$];
    minLength <= (ref$ = xs.length) || (minLength = ref$);
  }
  for (i$ = 0; i$ < minLength; ++i$) {
    i = i$;
    lresult$ = [];
    for (j$ = 0, len$ = xss.length; j$ < len$; ++j$) {
      xs = xss[j$];
      lresult$.push(xs[i]);
    }
    results$.push(lresult$);
  }
  return results$;
};
zipAllWith = function(f){
  var xss, minLength, i$, len$, xs, ref$, i, results$ = [];
  xss = slice$.call(arguments, 1);
  minLength = undefined;
  for (i$ = 0, len$ = xss.length; i$ < len$; ++i$) {
    xs = xss[i$];
    minLength <= (ref$ = xs.length) || (minLength = ref$);
  }
  for (i$ = 0; i$ < minLength; ++i$) {
    i = i$;
    results$.push(f.apply(null, (fn$())));
  }
  return results$;
  function fn$(){
    var i$, ref$, len$, results$ = [];
    for (i$ = 0, len$ = (ref$ = xss).length; i$ < len$; ++i$) {
      xs = ref$[i$];
      results$.push(xs[i]);
    }
    return results$;
  }
};
at = curry$(function(n, xs){
  if (n < 0) {
    return xs[xs.length + n];
  } else {
    return xs[n];
  }
});
elemIndex = curry$(function(el, xs){
  var i$, len$, i, x;
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    i = i$;
    x = xs[i$];
    if (x === el) {
      return i;
    }
  }
});
elemIndices = curry$(function(el, xs){
  var i$, len$, i, x, results$ = [];
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    i = i$;
    x = xs[i$];
    if (x === el) {
      results$.push(i);
    }
  }
  return results$;
});
findIndex = curry$(function(f, xs){
  var i$, len$, i, x;
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    i = i$;
    x = xs[i$];
    if (f(x)) {
      return i;
    }
  }
});
findIndices = curry$(function(f, xs){
  var i$, len$, i, x, results$ = [];
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    i = i$;
    x = xs[i$];
    if (f(x)) {
      results$.push(i);
    }
  }
  return results$;
});
module.exports = {
  each: each,
  map: map,
  filter: filter,
  compact: compact,
  reject: reject,
  partition: partition,
  find: find,
  head: head,
  first: first,
  tail: tail,
  last: last,
  initial: initial,
  empty: empty,
  reverse: reverse,
  difference: difference,
  intersection: intersection,
  union: union,
  countBy: countBy,
  groupBy: groupBy,
  fold: fold,
  fold1: fold1,
  foldl: foldl,
  foldl1: foldl1,
  foldr: foldr,
  foldr1: foldr1,
  unfoldr: unfoldr,
  andList: andList,
  orList: orList,
  any: any,
  all: all,
  unique: unique,
  uniqueBy: uniqueBy,
  sort: sort,
  sortWith: sortWith,
  sortBy: sortBy,
  sum: sum,
  product: product,
  mean: mean,
  average: average,
  concat: concat,
  concatMap: concatMap,
  flatten: flatten,
  maximum: maximum,
  minimum: minimum,
  maximumBy: maximumBy,
  minimumBy: minimumBy,
  scan: scan,
  scan1: scan1,
  scanl: scanl,
  scanl1: scanl1,
  scanr: scanr,
  scanr1: scanr1,
  slice: slice,
  take: take,
  drop: drop,
  splitAt: splitAt,
  takeWhile: takeWhile,
  dropWhile: dropWhile,
  span: span,
  breakList: breakList,
  zip: zip,
  zipWith: zipWith,
  zipAll: zipAll,
  zipAllWith: zipAllWith,
  at: at,
  elemIndex: elemIndex,
  elemIndices: elemIndices,
  findIndex: findIndex,
  findIndices: findIndices
};
function curry$(f, bound){
  var context,
  _curry = function(args) {
    return f.length > 1 ? function(){
      var params = args ? args.concat() : [];
      context = bound ? context || this : this;
      return params.push.apply(params, arguments) <
          f.length && arguments.length ?
        _curry.call(context, params) : f.apply(context, params);
    } : f;
  };
  return _curry();
}
function in$(x, xs){
  var i = -1, l = xs.length >>> 0;
  while (++i < l) if (x === xs[i]) return true;
  return false;
}
function compose$() {
  var functions = arguments;
  return function() {
    var i, result;
    result = functions[0].apply(this, arguments);
    for (i = 1; i < functions.length; ++i) {
      result = functions[i](result);
    }
    return result;
  };
}
function not$(x){ return !x; }

/***/ }),
/* 9 */
/***/ (function(module, exports) {

// Generated by LiveScript 1.4.0
var values, keys, pairsToObj, objToPairs, listsToObj, objToLists, empty, each, map, compact, filter, reject, partition, find;
values = function(object){
  var i$, x, results$ = [];
  for (i$ in object) {
    x = object[i$];
    results$.push(x);
  }
  return results$;
};
keys = function(object){
  var x, results$ = [];
  for (x in object) {
    results$.push(x);
  }
  return results$;
};
pairsToObj = function(object){
  var i$, len$, x, resultObj$ = {};
  for (i$ = 0, len$ = object.length; i$ < len$; ++i$) {
    x = object[i$];
    resultObj$[x[0]] = x[1];
  }
  return resultObj$;
};
objToPairs = function(object){
  var key, value, results$ = [];
  for (key in object) {
    value = object[key];
    results$.push([key, value]);
  }
  return results$;
};
listsToObj = curry$(function(keys, values){
  var i$, len$, i, key, resultObj$ = {};
  for (i$ = 0, len$ = keys.length; i$ < len$; ++i$) {
    i = i$;
    key = keys[i$];
    resultObj$[key] = values[i];
  }
  return resultObj$;
});
objToLists = function(object){
  var keys, values, key, value;
  keys = [];
  values = [];
  for (key in object) {
    value = object[key];
    keys.push(key);
    values.push(value);
  }
  return [keys, values];
};
empty = function(object){
  var x;
  for (x in object) {
    return false;
  }
  return true;
};
each = curry$(function(f, object){
  var i$, x;
  for (i$ in object) {
    x = object[i$];
    f(x);
  }
  return object;
});
map = curry$(function(f, object){
  var k, x, resultObj$ = {};
  for (k in object) {
    x = object[k];
    resultObj$[k] = f(x);
  }
  return resultObj$;
});
compact = function(object){
  var k, x, resultObj$ = {};
  for (k in object) {
    x = object[k];
    if (x) {
      resultObj$[k] = x;
    }
  }
  return resultObj$;
};
filter = curry$(function(f, object){
  var k, x, resultObj$ = {};
  for (k in object) {
    x = object[k];
    if (f(x)) {
      resultObj$[k] = x;
    }
  }
  return resultObj$;
});
reject = curry$(function(f, object){
  var k, x, resultObj$ = {};
  for (k in object) {
    x = object[k];
    if (!f(x)) {
      resultObj$[k] = x;
    }
  }
  return resultObj$;
});
partition = curry$(function(f, object){
  var passed, failed, k, x;
  passed = {};
  failed = {};
  for (k in object) {
    x = object[k];
    (f(x) ? passed : failed)[k] = x;
  }
  return [passed, failed];
});
find = curry$(function(f, object){
  var i$, x;
  for (i$ in object) {
    x = object[i$];
    if (f(x)) {
      return x;
    }
  }
});
module.exports = {
  values: values,
  keys: keys,
  pairsToObj: pairsToObj,
  objToPairs: objToPairs,
  listsToObj: listsToObj,
  objToLists: objToLists,
  empty: empty,
  each: each,
  map: map,
  filter: filter,
  compact: compact,
  reject: reject,
  partition: partition,
  find: find
};
function curry$(f, bound){
  var context,
  _curry = function(args) {
    return f.length > 1 ? function(){
      var params = args ? args.concat() : [];
      context = bound ? context || this : this;
      return params.push.apply(params, arguments) <
          f.length && arguments.length ?
        _curry.call(context, params) : f.apply(context, params);
    } : f;
  };
  return _curry();
}

/***/ }),
/* 10 */
/***/ (function(module, exports) {

// Generated by LiveScript 1.4.0
var split, join, lines, unlines, words, unwords, chars, unchars, reverse, repeat, capitalize, camelize, dasherize;
split = curry$(function(sep, str){
  return str.split(sep);
});
join = curry$(function(sep, xs){
  return xs.join(sep);
});
lines = function(str){
  if (!str.length) {
    return [];
  }
  return str.split('\n');
};
unlines = function(it){
  return it.join('\n');
};
words = function(str){
  if (!str.length) {
    return [];
  }
  return str.split(/[ ]+/);
};
unwords = function(it){
  return it.join(' ');
};
chars = function(it){
  return it.split('');
};
unchars = function(it){
  return it.join('');
};
reverse = function(str){
  return str.split('').reverse().join('');
};
repeat = curry$(function(n, str){
  var result, i$;
  result = '';
  for (i$ = 0; i$ < n; ++i$) {
    result += str;
  }
  return result;
});
capitalize = function(str){
  return str.charAt(0).toUpperCase() + str.slice(1);
};
camelize = function(it){
  return it.replace(/[-_]+(.)?/g, function(arg$, c){
    return (c != null ? c : '').toUpperCase();
  });
};
dasherize = function(str){
  return str.replace(/([^-A-Z])([A-Z]+)/g, function(arg$, lower, upper){
    return lower + "-" + (upper.length > 1
      ? upper
      : upper.toLowerCase());
  }).replace(/^([A-Z]+)/, function(arg$, upper){
    if (upper.length > 1) {
      return upper + "-";
    } else {
      return upper.toLowerCase();
    }
  });
};
module.exports = {
  split: split,
  join: join,
  lines: lines,
  unlines: unlines,
  words: words,
  unwords: unwords,
  chars: chars,
  unchars: unchars,
  reverse: reverse,
  repeat: repeat,
  capitalize: capitalize,
  camelize: camelize,
  dasherize: dasherize
};
function curry$(f, bound){
  var context,
  _curry = function(args) {
    return f.length > 1 ? function(){
      var params = args ? args.concat() : [];
      context = bound ? context || this : this;
      return params.push.apply(params, arguments) <
          f.length && arguments.length ?
        _curry.call(context, params) : f.apply(context, params);
    } : f;
  };
  return _curry();
}

/***/ }),
/* 11 */
/***/ (function(module, exports) {

// Generated by LiveScript 1.4.0
var max, min, negate, abs, signum, quot, rem, div, mod, recip, pi, tau, exp, sqrt, ln, pow, sin, tan, cos, asin, acos, atan, atan2, truncate, round, ceiling, floor, isItNaN, even, odd, gcd, lcm;
max = curry$(function(x$, y$){
  return x$ > y$ ? x$ : y$;
});
min = curry$(function(x$, y$){
  return x$ < y$ ? x$ : y$;
});
negate = function(x){
  return -x;
};
abs = Math.abs;
signum = function(x){
  if (x < 0) {
    return -1;
  } else if (x > 0) {
    return 1;
  } else {
    return 0;
  }
};
quot = curry$(function(x, y){
  return ~~(x / y);
});
rem = curry$(function(x$, y$){
  return x$ % y$;
});
div = curry$(function(x, y){
  return Math.floor(x / y);
});
mod = curry$(function(x$, y$){
  var ref$;
  return (((x$) % (ref$ = y$) + ref$) % ref$);
});
recip = (function(it){
  return 1 / it;
});
pi = Math.PI;
tau = pi * 2;
exp = Math.exp;
sqrt = Math.sqrt;
ln = Math.log;
pow = curry$(function(x$, y$){
  return Math.pow(x$, y$);
});
sin = Math.sin;
tan = Math.tan;
cos = Math.cos;
asin = Math.asin;
acos = Math.acos;
atan = Math.atan;
atan2 = curry$(function(x, y){
  return Math.atan2(x, y);
});
truncate = function(x){
  return ~~x;
};
round = Math.round;
ceiling = Math.ceil;
floor = Math.floor;
isItNaN = function(x){
  return x !== x;
};
even = function(x){
  return x % 2 === 0;
};
odd = function(x){
  return x % 2 !== 0;
};
gcd = curry$(function(x, y){
  var z;
  x = Math.abs(x);
  y = Math.abs(y);
  while (y !== 0) {
    z = x % y;
    x = y;
    y = z;
  }
  return x;
});
lcm = curry$(function(x, y){
  return Math.abs(Math.floor(x / gcd(x, y) * y));
});
module.exports = {
  max: max,
  min: min,
  negate: negate,
  abs: abs,
  signum: signum,
  quot: quot,
  rem: rem,
  div: div,
  mod: mod,
  recip: recip,
  pi: pi,
  tau: tau,
  exp: exp,
  sqrt: sqrt,
  ln: ln,
  pow: pow,
  sin: sin,
  tan: tan,
  cos: cos,
  acos: acos,
  asin: asin,
  atan: atan,
  atan2: atan2,
  truncate: truncate,
  round: round,
  ceiling: ceiling,
  floor: floor,
  isItNaN: isItNaN,
  even: even,
  odd: odd,
  gcd: gcd,
  lcm: lcm
};
function curry$(f, bound){
  var context,
  _curry = function(args) {
    return f.length > 1 ? function(){
      var params = args ? args.concat() : [];
      context = bound ? context || this : this;
      return params.push.apply(params, arguments) <
          f.length && arguments.length ?
        _curry.call(context, params) : f.apply(context, params);
    } : f;
  };
  return _curry();
}

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

var isBuffer = __webpack_require__(13)

module.exports = flatten
flatten.flatten = flatten
flatten.unflatten = unflatten

function flatten (target, opts) {
  opts = opts || {}

  var delimiter = opts.delimiter || '.'
  var maxDepth = opts.maxDepth
  var output = {}

  function step (object, prev, currentDepth) {
    currentDepth = currentDepth || 1
    Object.keys(object).forEach(function (key) {
      var value = object[key]
      var isarray = opts.safe && Array.isArray(value)
      var type = Object.prototype.toString.call(value)
      var isbuffer = isBuffer(value)
      var isobject = (
        type === '[object Object]' ||
        type === '[object Array]'
      )

      var newKey = prev
        ? prev + delimiter + key
        : key

      if (!isarray && !isbuffer && isobject && Object.keys(value).length &&
        (!opts.maxDepth || currentDepth < maxDepth)) {
        return step(value, newKey, currentDepth + 1)
      }

      output[newKey] = value
    })
  }

  step(target)

  return output
}

function unflatten (target, opts) {
  opts = opts || {}

  var delimiter = opts.delimiter || '.'
  var overwrite = opts.overwrite || false
  var result = {}

  var isbuffer = isBuffer(target)
  if (isbuffer || Object.prototype.toString.call(target) !== '[object Object]') {
    return target
  }

  // safely ensure that the key is
  // an integer.
  function getkey (key) {
    var parsedKey = Number(key)

    return (
      isNaN(parsedKey) ||
      key.indexOf('.') !== -1 ||
      opts.object
    ) ? key
      : parsedKey
  }

  var sortedKeys = Object.keys(target).sort(function (keyA, keyB) {
    return keyA.length - keyB.length
  })

  sortedKeys.forEach(function (key) {
    var split = key.split(delimiter)
    var key1 = getkey(split.shift())
    var key2 = getkey(split[0])
    var recipient = result

    while (key2 !== undefined) {
      var type = Object.prototype.toString.call(recipient[key1])
      var isobject = (
        type === '[object Object]' ||
        type === '[object Array]'
      )

      // do not write over falsey, non-undefined values if overwrite is false
      if (!overwrite && !isobject && typeof recipient[key1] !== 'undefined') {
        return
      }

      if ((overwrite && !isobject) || (!overwrite && recipient[key1] == null)) {
        recipient[key1] = (
          typeof key2 === 'number' &&
          !opts.object ? [] : {}
        )
      }

      recipient = recipient[key1]
      if (split.length > 0) {
        key1 = getkey(split.shift())
        key2 = getkey(split[0])
      }
    }

    // unflatten again for 'messy objects'
    recipient[key1] = unflatten(target[key], opts)
  })

  return result
}


/***/ }),
/* 13 */
/***/ (function(module, exports) {

/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function* iterateKeys(obj, opt, parent) {
  if (obj === null || obj === undefined)
    return;
  if (opt.depth > 0 && parent && parent.length >= opt.depth)
    return;
  if (typeof(obj) === 'string')
    return;
  parent = parent || [];
  for (var key of opt.all ? Object.getOwnPropertyNames(obj) : Object.keys(obj)) {
    if (opt.noindex && obj instanceof Array && /^[0-9]+$/.test(key))
      continue;
    var child = parent.slice(0);
    child.push(key);
    if (opt.filter && !opt.filter(child, obj[key], !opt.all || obj.propertyIsEnumerable(key)))
      continue;
    var descend = iterateKeys(obj[key], opt, child);
    var dfirst = descend.next();
    if (opt.leaf) {
      if (!dfirst.done) {
        yield dfirst.value;
        yield* descend;
      }
      else
        yield child;
    }
    else {
      yield child;
      if (!dfirst.done) {
        yield dfirst.value;
        yield* descend;
      }
    }
  }
}
function traverse(obj, deepkey, force) {
  var leaf = obj;
  for (var c = 0; c < deepkey.length; c++)
    if (c == deepkey.length - 1) {
      return [leaf, deepkey[c]];
    }
    else {
      if (!(deepkey[c] in leaf) || leaf[deepkey[c]] === undefined) {
        if (force) {
          // if creating intermediate object, its parent must not be sealed
          if (!Object.isExtensible(leaf))
            throw `Inextensible object: ${ deepkey.slice(0, c).join('.') }`;
          leaf[deepkey[c]] = { };
        }
        else
          return undefined;
      }
      leaf = leaf[deepkey[c]];
      // intermediate object must be non-null object or function
      // note that typeof(null) returns 'object'
      if (leaf === 'null' || (typeof(leaf) !== 'object' && typeof(leaf) !== 'function')) {
        if (force)
          throw `Inextensible object: ${ deepkey.slice(0, c + 1).join('.') }`;
        else
          return undefined;
      }
    }
  return undefined;
}
function accessor(obj, deepkey) {
  var t = traverse(obj, deepkey, true);
  if (!t) return undefined;
  return {
    get: () => { return (t[0])[t[1]]; },
    set: v => { return (t[0])[t[1]] = v;  },
  }
}
function keys(obj, option) {
  var opt;
  if (typeof(option) === 'number')
    opt = { depth: option };
  else if (typeof(option) === 'function')
    opt = { filter: option };
  else if (typeof(option) === 'object' && option !== null)
    opt = option;
  else
    opt = {}
  opt.depth = opt.depth || 0;
  var array = [];
  for (var path of iterateKeys(obj, opt))
    array.push(path);
  return array;
}
function rename(obj, src, dest) {
  return set(obj, dest, del(obj, src));
}
function del(obj, deepkey) {
  var t = traverse(obj, deepkey, false);
  if (!t) return undefined;
  var v = (t[0])[t[1]];
  delete (t[0])[t[1]];
  return v;
}
function set(obj, deepkey, value) {
  var t = traverse(obj, deepkey, true);
  // The following codes is unneeded, traverse will check them
  // if (!(t[1] in t[0]) && !Object.isExtensible(t[0]))
  //   throw `Inextensible object: ${ deepkey.slice(0, deepkey.length - 1).join('.') }`;
  return (t[0])[t[1]] = value;
}
function get(obj, deepkey) {
  var t = traverse(obj, deepkey, false);
  return t ? (t[0])[t[1]] : undefined;
}
function touch(obj, deepkey, value) {
  var t = traverse(obj, deepkey, true);
  if (!(t[1] in t[0])) {
    if (!Object.isExtensible(t[0]))
      throw `Inextensible object: ${ deepkey.slice(0, deepkey.length -1).join('.') }`;
    return (t[0])[t[1]] = value;
  }
  else
    return (t[0])[t[1]];
}
function type(obj, deepkey) {
  return typeof(get(obj, deepkey));
}
function exists(obj, deepkey) {
  var t = traverse(obj, deepkey, false);
  return t ? t[0].propertyIsEnumerable(t[1]) : false;
}
module.exports = {
  keys: keys,
  set: set,
  get: get,
  touch: touch,
  type: type,
  rename: rename,
  delete: del,
  exists: exists,
  accessor: accessor,
};


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

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
* Browser Schedule Functions.
* @module webpack/api/schedule
*/

var utils = __webpack_require__(0);

/** 
* Gets all schedule types for the user
* @link module:webpack/api/schedule
* @param {(String|undefined)} accountID
* @returns {Promise}
*/
exports.getSchedules = (accountID) => {
    if(accountID === undefined) {accountID = ""}
    return utils.fetch("GET", "/api/account/schedule/" + accountID, {auth: true})
}

/** 
* Sets a new schedule for the logged in user
* @link module:webpack/api/schedule
* @param {String} dashboard - can be "student" or "teacher"
* @param {Object} schedule - Please see {@link setUserSchedule}
* @returns {Promise}
*/
exports.newSchedule = (dashboard, schedule) => {
    return utils.fetch("POST", "/api/account/schedule/" + dashboard, {body: schedule, auth: true})
}


/** 
* Updates the schedule for the logged in user
* @link module:webpack/api/schedule
* @param {String} dashboard - can be "student" or "teacher"
* @param {Object} schedule - Please see {@link setUserSchedule}
* @returns {Promise}
*/
exports.updateSchedule = (dashboard, schedule) => {
    return utils.fetch("PATCH", "/api/account/schedule/" + dashboard, {body: schedule, auth: true})
}

/** 
* Replaces the schedule for the logged in user
* @link module:webpack/api/schedule
* @param {String} dashboard - can be "student" or "teacher"
* @param {Object} schedule - Please see {@link setUserSchedule}
* @returns {Promise}
*/
exports.replaceSchedule = (dashboard, schedule) => {
    return utils.fetch("PUT", "/api/account/schedule/" + dashboard, {body: schedule, auth: true})
}

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

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
* @module webpack/api/accounts
*/

var utils = __webpack_require__(0);


/** 
* Gets all accounts with classes from the server.
* @link module:webpack/api/accounts
* @returns {Promise}
*/
exports.getWithClasses = () => {
    return utils.fetch("GET", "/api/account/hasClasses", {auth: true})
}

/** 
    * Searches accounts that match the query
    * @link webpack/api/accounts
    * @param {Object} query
    * @param {(string|undefined)} query.id - Unique Primary Key.  Uses getAll.  
    * @param {(string|undefined)} query.email - Unique Key
    * @param {(userGroup|undefined)} query.userGroup
    * @param {(Object|string|undefined)} query.name - If a string it will do a combined search using Match
    * @param {(string|undefined)} query.name.salutation - User's prefix/salutation
    * @param {(string|undefined)} query.name.first - User's given name
    * @param {(string|undefined)} query.name.last - User's family name
    * @param {(string|number|undefined)} query.schoolID
    * @param {(number|undefined)} query.graduationYear
    * @returns {Promise} Includes array.
    */
exports.get = (query) => {
    return new Promise((resolve, reject) => {
        if(!query) {
            return reject(new TypeError("query must be an object"));
        }
        if(query.name && typeof query.name === "object") {
            if(query.name.salutation) {
                query.name_salutation = query.name.salutation;
                delete query.name.salutation;
            }
            if(query.name.first) {
                query.name_first = query.name.first;
                delete query.name.first;
            }
            if(query.name.last) {
                query.name_last = query.name.last;
                delete query.name.last;
            }
        }
        return utils.fetch("GET", "/api/account", {query: query, auth: true}).then(resolve).catch(reject)
    })   
}

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

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
* Browser Misc Functions.
* @module webpack/api/misc
*/

var utils = __webpack_require__(0);

/** 
* Gets all schedule configs from server.
* @link module:webpack/api/misc
* @returns {Promise}
*/
exports.getScheduleConfig = () => {
    return utils.fetch("GET", "/api/server/config/schedule/", {auth: false})
}

/***/ }),
/* 18 */,
/* 19 */,
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

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
var Caret = __webpack_require__(3);
var StudentScheduleEditor = __webpack_require__(21);
var TeacherScheduleEditor = __webpack_require__(22);
var utils = __webpack_require__(0);
var scheduleJS = __webpack_require__(15);
var unsavedWork = __webpack_require__(23)
var anime = __webpack_require__(24);
var Table = __webpack_require__(2)

var studentScheduleEditor = null;
var teacherScheduleEditor = null;
var studentTable = null;
var teacherTable = null;
window.onload = function() {
    routeHash();
    console.log(utils.thisUser())
    $('.tooltipped').tooltip({delay: 50});
    $(".button-collapse").sideNav();
    $(window).stellar({
        responsive: true,
    });
    loadMyStudentSchedule();
    loadMyTeacherSchedule();
    //check for changes on settings card
    $("#settingsCard").find("input").on("change", settingNeedsSaving);

    
    //Advanced Options for schedule editor 
    var ADVschedule = new Caret($("#se-advancedOptionsCaret"), $("#se-advancedOptionsDIV"));
    ADVschedule.initialize();

}



//Router
window.addEventListener("hashchange", routeHash);
function routeHash() {
    let hash = window.location.hash;
    console.log(hash)
    switch(hash) {
        case "#editSchedule": 
            utils.openPage("scheduleEditor");
            $(".mixenSESave").removeClass("disabled");
            initScheduleEditor();
            break;
        default: 
            $(".mixenSESave").addClass("disabled");
            utils.closePage("scheduleEditor");
    }
}


/** SCHEDULE EDITOR **/ 
function initScheduleEditor() {
    //init the back button
    unsavedWork.button("#mixenSEBack", {
        onAction: () => {
            console.log("action")
        },
        onDiscard: () => {
            unsavedWork.reset("#mixenSEBack");
            studentScheduleEditor.clearContainer();
            teacherScheduleEditor.clearContainer();
            console.log("discard")
        },
        onWarn: (event) => {
            event.element.find("i").html("backspace");
            Materialize.toast($("<span>You have unsaved work</span>").append($("<br/>")).append("<span>Click back again to discard</span>"), 10000)
            console.log("Warning")
        },
        onSave: (element) => {
            console.log("Saved")
        },
        onReset: (element) => {
            element.find("i").html("arrow_back");
            console.log("Reset")
        }
    })
    //init the various schedules
    
    if($("#editStudentScheduleContainer").length > 0) {
        initStudentScheduleEditor();
    }
    if($("#editTeacherScheduleContainer").length > 0) {
        initTeacherScheduleEditor();
    }
    

}




/* Student Editor */
function initStudentScheduleEditor() {
    if($("#editStudentScheduleContainer").children().length <=0) {
        console.log("RUNN")
        studentScheduleEditor = new StudentScheduleEditor($("#editStudentScheduleContainer"), {
            onChange: (e) => {
                console.log("changed")
                unsavedWork.changed("#mixenSEBack");
            }
        });
        genStudentScheduleEditor();
        /* Schedule Editor Options */
        $("#se-advancedOptions-studentRecovery").off("click");
        $("#se-advancedOptions-studentRecovery").on("change", (e) => {
            if($(e.currentTarget).prop('checked')) {
                genStudentScheduleEditor(true);
            } else {
                genStudentScheduleEditor();
            }
            
        })
    }
}



function genStudentScheduleEditor(startClean) {
    studentScheduleEditor.generate(startClean).then(() => {
        console.log("Generated Student")
        scheduleEditorOnSave();
    }).catch(err => utils.throwError(err))
}

function initTeacherScheduleEditor() {
    if($("#editTeacherScheduleContainer").children().length <=0) {
        /* Schedule Editor Options */
        teacherScheduleEditor = new TeacherScheduleEditor($("#editTeacherScheduleContainer"), {
            onChange: (e) => {
                console.log("changed")
                unsavedWork.changed("#mixenSEBack");
            }
        });
        genTeacherScheduleEditor();
        $("#se-advancedOptions-teacherRecovery").off("click");
        $("#se-advancedOptions-teacherRecovery").on("change", (e) => {
            if($(e.currentTarget).prop('checked')) {
                genTeacherScheduleEditor(true);
            } else {
                genTeacherScheduleEditor();
            }
            
        })
    }
}

function genTeacherScheduleEditor(startClean) {
    teacherScheduleEditor.generate(startClean).then(() => {
        console.log("Generated Teacher")
        scheduleEditorOnSave();
    }).catch(err => utils.throwError(err))

}




function scheduleEditorOnSave() {
    $("a.mixenSESave").off("click");
    $("a.mixenSESave").on("click", (e) => {
        $("a.mixenSESave").addClass("disabled");
        let prom = [];
        if(studentScheduleEditor && studentScheduleEditor.getHasChanged()) {
            prom.push(studentScheduleEditor.submit())
        } else {
            prom.push(new Promise((resolve) => {return resolve();}))
        }
        if(teacherScheduleEditor && teacherScheduleEditor.getHasChanged()) {
            prom.push(teacherScheduleEditor.submit());
        } else {prom.push(new Promise((resolve) => {return resolve();}))}

        Promise.all(prom).then(([student, teacher]) => {
            console.log("Student Response", student);
            console.log("Teacher Response", teacher);
            scheduleEditorSubmitRes(student, teacher);
        }).catch((err) => {$("a.mixenSESave").removeClass("disabled"); utils.throwError(err)})
    })
}


function scheduleEditorSubmitRes(student, teacher) {
    if(student) {
        if(student.transaction && student.transaction.unchanged >= 1) {
            Materialize.toast('Student schedule unchanged', 4000)
        } else {
            Materialize.toast('Updated student schedule', 4000)
            loadMyStudentSchedule();
            
        }
    }

    if(teacher) {
        if(teacher.transaction && teacher.transaction.unchanged >= 1) {
            Materialize.toast('Teacher schedule unchanged', 4000)
        } else {
            Materialize.toast('Updated teacher schedule', 4000)
            loadMyTeacherSchedule();
            
        }
    }

    if(student || teacher) {
        unsavedWork.saved("#mixenSEBack");
        window.location.hash = "";
        if((student && student.transaction && student.transaction.unchanged < 1) && (teacher && teacher.transaction && teacher.transaction.unchanged < 1)) {
            utils.materialResponse("check", "success")
        } else if((student && student.transaction && student.transaction.unchanged < 1) && !teacher) {
            utils.materialResponse("check", "success")
        } else if((teacher && teacher.transaction && teacher.transaction.unchanged < 1) && !student) {
            utils.materialResponse("check", "success")
        }
    }
}

var idOfUser = utils.thisUser();




function loadMyStudentSchedule() {
    if($("#studentSchedule").length > 0) {
        scheduleJS.getSchedules(utils.thisUser()).then((data) => {
            console.log(data)
            data = data.studentType;
            if(data && data.schedule) {
                //clear area
                $("#studentScheduleBody").empty();
                //do stuff with schedule 
                //console.log(data)
                var keys = Object.keys(data.schedule);
                let schedule = data.schedule;
                let tableData = Object.keys(schedule);
                tableData = tableData.map(function(period) {
                    //console.log(schedule[period])
                    return {
                        Period: period.charAt(0).toUpperCase() + period.slice(1),
                        Class: schedule[period].teacher && schedule[period].teacher.period && schedule[period].teacher.period.className ? schedule[period].teacher.period.className : "",
                        Teacher: schedule[period].teacher ? schedule[period].teacher.name.first + " " + schedule[period].teacher.name.last : "",
                        Teaching: schedule[period].teacher && schedule[period].teacher.period && schedule[period].teacher.period.isTeaching ? "<i class=\"material-icons\">check_circle</i>" : "<i class=\"material-icons\">cancel</i>",
                        Room: schedule[period].teacher && schedule[period].teacher.period && schedule[period].teacher.period.room ? schedule[period].teacher.period.room : "",
                        Limit: schedule[period].teacher && schedule[period].teacher.period && typeof schedule[period].teacher.period.passLimit === "number" ? schedule[period].teacher.period.passLimit : "∞",
                    }
                })
                
                if(studentTable) {
                    studentTable.replaceData(tableData);
                    studentTable.emptyContainer();
                    studentTable.generate().catch((err) => {utils.throwError(err)})
                } else {
                    studentTable = new Table("#studentSchedule", tableData, {
                        tableClasses: "highlight responsive-table"
                    })
                    studentTable.generate().catch((err) => {utils.throwError(err)})
                }
                /*for(var i = 0; i < keys.length; i++) {
                  //set defaults 
                  if(data.schedule[keys[i]]) {
                    var tr = document.createElement("TR");
                    //create elements
                    var idEl = document.createElement("TD");
                    var idElText = document.createTextNode(keys[i].charAt(0).toUpperCase() + keys[i].slice(1));

                    var classEl = document.createElement("TD");
                    if(data.schedule[keys[i]] && data.schedule[keys[i]].teacher && data.schedule[keys[i]].teacher.period && data.schedule[keys[i]].teacher.period.className) {
                      var classElText = document.createTextNode(data.schedule[keys[i]].teacher.period.className);
                    } else {
                      var classElText = document.createTextNode(" ");
                    }

                    var teacherEl = document.createElement("TD");
                    
                    if(data.schedule[keys[i]] && data.schedule[keys[i]].teacher) {
                      var teacherElText = document.createTextNode(data.schedule[keys[i]].teacher.name.first + " " +  data.schedule[keys[i]].teacher.name.last);
                    } else {
                      var teacherElText = document.createTextNode(" ");
                      
                    }
                    var roomEl = document.createElement("TD");
                    if(data.schedule[keys[i]] && data.schedule[keys[i]].teacher && data.schedule[keys[i]].teacher.period && data.schedule[keys[i]].teacher.period.room) {
                      var roomElText = document.createTextNode(data.schedule[keys[i]].teacher.period.room);
                    } else {
                      var roomElText = document.createTextNode(" ");
                    }

                    //append
                    idEl.appendChild(idElText);
                    tr.appendChild(idEl);

                    classEl.appendChild(classElText);
                    tr.appendChild(classEl);

                    teacherEl.appendChild(teacherElText);
                    tr.appendChild(teacherEl);

                    roomEl.appendChild(roomElText);
                    tr.appendChild(roomEl);

                    //set
                    $('#studentScheduleBody').append(tr);
                  }
                }*/

            } else {
                var err = new Error("Please click on the edit (pencil) button and add a student schedule.");
                markScheduleEditButton(1);
                return utils.throwError(err);
            }
        }).catch((err) => {
            return utils.throwError(err);
        })
    }
}

function loadMyTeacherSchedule() {
    if($("#teacherSchedule").length > 0) {
        scheduleJS.getSchedules().then((data) => {
            data = data.teacherType;
            if(data && data.schedule) {
                let schedule = data.schedule;
                let tableData = Object.keys(schedule);
                tableData = tableData.map(function(period) {
                    //console.log(schedule[period])
                    return {
                        Period: period.charAt(0).toUpperCase() + period.slice(1),
                        Class: (schedule[period].className || ""),
                        Teaching: schedule[period].isTeaching ? "<i class=\"material-icons\">check_circle</i>" : "<i class=\"material-icons\">cancel</i>",
                        Room: (schedule[period].room || ""),
                        Limit: typeof schedule[period].passLimit === "number" ? schedule[period].passLimit : "∞",
                    }
                })
                //console.log(tableData)
                if(teacherTable) {
                    teacherTable.replaceData(tableData);
                    teacherTable.emptyContainer();
                    teacherTable.generate().catch((err) => {utils.throwError(err)})
                } else {
                    teacherTable = new Table("#teacherSchedule", tableData, {
                        tableClasses: "highlight responsive-table"
                    })
                    teacherTable.generate().catch((err) => {utils.throwError(err)})
                }
            } else {
                var err = new Error("Please click on the edit (pencil) button and add a student schedule.");
                markScheduleEditButton(1);
                return utils.throwError(err);
            }
        }).catch((err) => {
            return utils.throwError(err);
        })
    }
}

function markScheduleEditButton(loop) {
    
    $("#openScheduleEditor").removeClass("black-text").css("transition", "all 0s")
    anime({
        targets: '#openScheduleEditor',
        rotateZ: {
            value: "+=720",
            duration: 1200,
        },
        color: [
            {value: "rgb(0,255,0)", duration: 300},
            {value: "rgb(255,0,0)", duration: 400},
            {value: "rgb(0,0,255)", duration: 500},
            {value: "rgb(0,0,0)", duration: 100}
        ],
        scale: [                
            {value: 3, duration: 500},
            {value: 3, duration: 200},
            {value: 1, duration: 500}
        ],
        easing: [.91,-0.54,.29,1.56],
        elasticity: 400,
        loop: loop
    });
}

function settingNeedsSaving(e) {
    $("#saveSettings").removeClass("disabled").addClass("pulse").attr("onclick");
    $("#saveSettings").on("click", saveSettings);
}
function saveSettings(e) {
    console.log("Not Implemented")
}


// (I'm a nerd :P)
//call key press function 
document.onkeydown = checkKey;
var konami = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
var konamiUser = 0;
function checkKey(e) {
    e = e || window.event;
    if(konami[konamiUser] != e.keyCode) {
        konamiUser = 0;
    } else {
        konamiUser++;
    }
    if (konami.length == konamiUser) {
        konamiUser = 0;
        spinneyMcSpinFace();
        /*Materialize.toast('THIS IS AN EASTER EGG!', 6000)
        setTimeout(function() {
            Materialize.toast('I need ideas!', 6000)
        }, 1000);
        console.log("TODO EASTER EGG")*/
    }
    
}

function spinneyMcSpinFace() {
    markScheduleEditButton(5);
    anime({
        targets: 'img#avatar',
        rotateZ: {
            value: "+=720",
            duration: 5000,
        },
        backgroundColor: [
            {value: "rgb(0,255,0)", duration: 1000},
            {value: "rgb(255,0,0)", duration: 1500},
            {value: "rgb(0,0,255)", duration: 1500},
            {value: "#e0e0e0", duration: 1000}
        ],
        translateY: [
            {value: "100%", duration: 1500},
            {value: "100%", duration: 4000},
            {value: "0%", duration: 1500}
        ],
        scale: [                
            {value: 10, duration: 3000},
            {value: 10, duration: 1000},
            {value: 1, duration: 500}
        ],
        easing: [.91,-0.54,.29,1.56],
        elasticity: 400,
        loop: 1
    });
    anime({
        targets: 'img#user-bg',
        translateY: [
            {value: "+=100", duration: 4500},
            {value: "-=100", duration: 500}
        ],
        easing: [.91,-0.54,.29,1.56],
        elasticity: 400,
        loop: 1
    })
}





/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

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

var Table = __webpack_require__(2);
var scheduleAPI = __webpack_require__(15);
var accountAPI = __webpack_require__(16);
var miscAPI = __webpack_require__(17);
var utils = __webpack_require__(0);
/**
* Class that Generates a Schedule editor for students.
* @class 
* @param {Object} formOutputContainer - Where to put the scheduele editor.
* @param {Object} [options] 
* @param {string} [options.accountID] - Specify what user to pull the existing schedule from. If undefined, the logged in user will be used.
* @param {function} [options.onChange] - Called whenever change occurs in the form. event passed to function.
*/
class StudentScheduleEditor {
    /** @constructor */
    constructor(formOutputContainer, options) {
        this.container = $(formOutputContainer);
        if(!options) {options = {}}
        this.options = options;
        this.periodSelectClass = "__PERIOD_SELECT_" + utils.uuidv4() + "__";
        this.autocompleteClass = "__SCHEDULE_AUTOCOMPLETE_" + utils.uuidv4() + "__";
        this.addRowButtonID = "__ADD_ROW_PERIOD_" + utils.uuidv4() + "__";
        this.autocompleteREGEX  = new RegExp(/( --- )+(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|\"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*\")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/)
        this.hasChanged = false;
    }

    clearContainer() {
        $(this.container).children().off();
        $(this.container).empty();
    }
    /** Tells if the form has been changed from its initial value 
    * @returns {boolean}
    */
    getHasChanged() {
        return this.hasChanged;
    }

    /** Creates the table 
    * @param {bool} [startClean] - If true, it will not load the user schedule. Use if there is a problem finding a user schedule, or the user wants to just not load the schedule.
    * @returns {Promise}
    */
    generate(startClean) {
        return new Promise((resolve, reject) => {
            this.clearContainer();
            let prom = [];
            prom.push(miscAPI.getScheduleConfig());
            prom.push(accountAPI.getWithClasses());
            if(startClean) {
                prom.push(new Promise((resolve) => {return resolve()}));
            } else {
                prom.push(scheduleAPI.getSchedules(this.options.accountID));
            }
            
            Promise.all(prom).then(([scheduleConfig, allClassAccounts, allSchedules]) => {
                this.allClassAccounts = allClassAccounts;
                let locationAutocompleteData = {};
                let doneMappingAutoData = new Promise((res) => {
                    for(let x = 0; x < this.allClassAccounts.length; x++) {
                        locationAutocompleteData[this._autocompleteNameFormat(this.allClassAccounts[x].name, this.allClassAccounts[x].email)] = null;
                        if(x >= this.allClassAccounts.length-1) {
                            return res();
                        }
                    }
                })

                this.studentTable = new Table(this.container, [{}], {
                    preferInject: false,
                    idKey: "id",
                    ignoredKeys: ["id"],
                    inject: (row, callback) => {
                        this._injectDOM(scheduleConfig.periods, row).then((arr) => {
                            return callback(arr);
                        }).catch(err => reject(err))
                    },
                    afterGenerate: () => {
                        //INIT SELECT
                        $('select').material_select();
                        doneMappingAutoData.then(() => {
                            $('input.'+this.autocompleteClass).autocomplete({
                                data: locationAutocompleteData,
                                limit: 5, // The max amount of results that can be shown at once. Default: Infinity.
                                onAutocomplete: (val) => {
                                  // Callback function when value is autcompleted.
                                  console.log(val)
                                    if(typeof this.options.onChange === "function") {
                                        this.options.onChange(null);
                                    }
                                    this.hasChanged = true;
                                  this.checkValidity().catch(err => reject(err))
                                },
                                minLength: 1, // The minimum length of the input for the autocomplete to start. Default: 1.
                            });
                        }).catch(err => reject(err))
                    }
                });

                this.studentTable.generate().then(() => {
                    //Import existing schedule
                    
                    if(allSchedules && allSchedules.studentType) {
                        let schedule = allSchedules.studentType;
                        let periods = Object.keys(schedule.schedule);
                        for(let x = 0; x < periods.length; x++) {
                            if(schedule.schedule[periods[x]]) {
                                this.studentTable.appendRow([{}], (row, callback) => {
                                    let nameInj = null;
                                    if(schedule.schedule[periods[x]].teacher && schedule.schedule[periods[x]].teacher.name) {
                                        nameInj = this._autocompleteNameFormat(schedule.schedule[periods[x]].teacher.name, schedule.schedule[periods[x]].teacher.email);
                                    }
                                    this._injectDOM(scheduleConfig.periods, row, periods[x], nameInj).then((arr) => {
                                        return callback(arr);
                                    }).catch(err => reject(err))
                                })
                            }
                        }
                    }
                    
                    //create new row button
                    this.container.append($("<a/>").attr("id", this.addRowButtonID).addClass("waves-effect waves-light btn").append($("<i/>").addClass("material-icons left").html("add")).html("Add Period").on("click", () => {
                        $("#" + this.addRowButtonID).attr("disabled", true)
                        this.studentTable.appendRow([{}])
                        this.checkValidity().catch(err => reject(err));
                    }))

                    //generation done
                    return resolve();
                });


            }).catch(reject);
        })
    }
    _autocompleteNameFormat(nameObject, email) {
        if(nameObject.salutation) {
            return nameObject.salutation + " " + nameObject.first + " " + nameObject.last + " --- " + email;
        } else {
            return nameObject.first + " " + nameObject.last + " --- " + email;
        }
    }
    _periodSelectElm(periods, selected) {
        return new Promise((resolve, reject) => {
            let sel = $("<select/>").addClass(this.periodSelectClass).on("change", (e) => {
                if(typeof this.options.onChange === "function") {
                    this.options.onChange(e);
                }
                this.hasChanged = true;
                this.checkValidity().catch(err => reject(err))
            });
            if(selected) {
                sel.append($("<option/>").attr("value", "").attr("disabled", true).html("Choose a period"));
            } else {
                sel.append($("<option/>").attr("value", "").attr("disabled", true).attr("selected", true).html("Choose a period"));
            }
            
            for(let x = 0; x < periods.length; x++) {
                if(periods[x] == selected) {
                    sel.append($("<option/>").attr("value", periods[x]).attr("selected", true).html(periods[x].toUpperCase()))
                } else {
                    sel.append($("<option/>").attr("value", periods[x]).html(periods[x].toUpperCase()))
                }
                
                if(x >= periods.length-1) {
                    let div = $("<div/>").addClass("input-field col s10").append(sel);
                    resolve(div);
                }
            }
        });
    }
    _periodDom(rowID, periods, selected) {
        return new Promise((resolve, reject) => {
            this._periodSelectElm(periods, selected).then((sel) => {
                return resolve($("<span/>")
                .prepend($("<a/>").addClass("left btn-floating waves-effect waves-light delete-row").css("transform", "translateY(50%)").on("click", (e) => {
                    this.studentTable.deleteRow(rowID)
                    if(typeof this.options.onChange === "function") {
                        this.options.onChange(e);
                    }
                    this.hasChanged = true;
                    $("#" + this.addRowButtonID).attr("disabled", false);
                    this.checkValidity().catch(err => reject(err))
                }).append($("<i/>").addClass("material-icons").html("delete")))
                .append(sel));
            }).catch(err => reject(err))
        })
    }
    _injectDOM(periodArray, row, period, locationValue) {
        return new Promise((resolve, reject) => {
            let locationCSS = "block"; 
            let buttonCSS = "none";
            let labelCSS = "active";
            let locationIcon = "location_off";
            if(!locationValue) {
                locationValue = "";
                locationCSS = "none"; 
                buttonCSS = "block";
                locationIcon = "add_location"
                labelCSS = "";
            }
                
            let autoID = "__AUTOCOMPLETE_" + utils.uuidv4()
            this._periodDom(row.rowID, periodArray, period).then((perDom) => {
                return resolve([
                    {
                        column: "Period",
                        strictColumn: true,
                        dom: perDom

                    }, {
                        column: "Location",
                        strictColumn: true,
                        dom: $("<span/>")
                            .prepend($("<a/>").addClass("left btn-floating waves-effect waves-light").attr("data-location", (!!locationValue)).css("transform", "translateY(0%)").on("click", (e) => {
                                if($(e.currentTarget).attr("data-location") == "true") {
                                    $("#" + autoID + "_DIV__").slideUp(500);
                                    $(e.currentTarget).siblings("p").slideDown(500)
                                    $(e.currentTarget).attr("data-location", false).css("transform", "translateY(0%)").find("i").html("add_location")
                                    if(typeof this.options.onChange === "function") {
                                        this.options.onChange(e);
                                    }
                                    this.hasChanged = true;
                                    this.checkValidity().catch(err => reject(err))
                                } else {
                                    $("#" + autoID + "_DIV__").slideDown(500);
                                    $(e.currentTarget).siblings("p").slideUp(500)
                                    $(e.currentTarget).attr("data-location", true).css("transform", "translateY(50%)").find("i").html("location_off")
                                    if(typeof this.options.onChange === "function") {
                                        this.options.onChange(e);
                                    }
                                    this.hasChanged = true;
                                    this.checkValidity().catch(err => reject(err))
                                }
                                
                            }).append($("<i/>").addClass("material-icons").html(locationIcon)))
                            .append($("<p/>").html(" &nbsp; No set location").css("transform", "translateY(50%)").css("display", buttonCSS))
                            .append($("<div/>").addClass("input-field col s10").css("display", locationCSS).attr("id", autoID + "_DIV__")
                                .append($("<input/>").attr("type", "text").val(locationValue).attr("id", autoID).addClass(this.autocompleteClass + " autocomplete").on("keyup", (e) => {
                                    if(typeof this.options.onChange === "function") {
                                        this.options.onChange(e);
                                    }
                                    this.hasChanged = true;
                                    this.checkValidity().catch(err => reject(err))
                                }))
                                .append($("<label/>").addClass(labelCSS).attr("for", autoID).html("Search Teachers"))
                            )
                    }
                ])
            }).catch(err => reject(err))
        })
    }
    //checks every 
    _checkPeriodSelect() {
        return new Promise((resolve, reject) => {
            let sel = $("select." + this.periodSelectClass);
            let prevVal = []
            for(let x = 0; x < sel.length; x++) {
                if(prevVal.includes(sel[x].value)){
                    return resolve({valid: false, problemRowElement: $(sel[x]).parentsUntil("td")})
                }
                prevVal.push(sel[x].value)
                if(sel[x].value.length < 1) {
                    return resolve({valid: false, problemRowElement: $(sel[x]).parentsUntil("td")});
                }
                if (x >= sel.length-1) {
                    return resolve({valid: true});
                }
            }
        });
    }
    _checkLocation() {
        return new Promise((resolve, reject) => {
            let sel = $("input." + this.autocompleteClass);
            for(let x = 0; x < sel.length; x++) {
                //console.log("CURRENT ELEMENT", sel);
                let button = $(sel[x]).parentsUntil("td").find("a[data-location]");
                if(button.attr("data-location") == "true") {
                    //location enabled
                    if(sel[x].value.length < 1 || sel[x].value.search(this.autocompleteREGEX) < 0) {
                        return resolve({valid: false, problemRowElement: $(sel[x]).parentsUntil("td")})
                    }
                }
                //is finished
                if(x >= sel.length-1) {
                    return resolve({valid: true});
                }
            }
        });
    }
    /** This checks to see if each field is valid.  If not it will change the dom to reflect that.
    * @returns {Promise} - Will not reject even if it is not valid.  Invalid form response: {valid: false, problemRowElement: (Object)}
    */
    checkValidity() {
        return new Promise((resolve, reject) => {
            let prom = [];
            prom.push(this._checkPeriodSelect());
            prom.push(this._checkLocation());
            if(this.studentTable.getTableBody().children().length < 1) {
                return resolve({valid: false});
            }
            Promise.all(prom).then(([periodRes, locationRes]) => {
                $("a[data-location]").removeClass("pulse red").fadeIn(1000);
                $("a.delete-row").removeClass("pulse red").fadeIn(1000);
                if(!locationRes.valid) {
                    locationRes.problemRowElement.find("a[data-location]").addClass("pulse red").fadeIn(1000);
                    $("#" + this.addRowButtonID).attr("disabled", true);
                    return resolve(locationRes);
                } 
                if(!periodRes.valid) {
                    periodRes.problemRowElement.find("a.delete-row").addClass("pulse red").fadeIn(1000);
                    $("#" + this.addRowButtonID).attr("disabled", true);
                    return resolve(periodRes);
                }
                
                
                $("#" + this.addRowButtonID).attr("disabled", false);
                return resolve({valid: true});
            }).catch(err => reject(err));
        
        })
    }

    /** Submits the form
    * @returns {Promise} - {transaction: res, formData: form}
    */
    submit() {
        return new Promise((resolve, reject) => {
            this.checkValidity().then((validResp) => {
                if(validResp.valid) {
                    this._compileFormData().then((form) => {
                        console.log(form)
                        scheduleAPI.replaceSchedule("student", form).then((res) => {return resolve({transaction: res, formData: form})}).catch((err) => {return reject(err)});
                        //scheduleAPI.updateSchedule("student", form).then((res) => {return resolve({transaction: res, formData: form})}).catch((err) => {return reject(err)});
                        /*if(this.hasSchedule) {
                            scheduleAPI.updateSchedule("student", form).then((res) => {return resolve({transaction: res, formData: form})}).catch((err) => {return reject(err)});
                        } else {
                            scheduleAPI.newSchedule("student", form).then((res) => {
                                this.hasSchedule = true;
                                return resolve({transaction: res, formData: form})
                            }).catch((err) => {return reject(err)});
                        }*/
                    }).catch((err) => {return reject(err)});
                } else {
                    return reject(new Error("Invalid form. Please see the marked rows"))
                }
            })
            
        })
    }
    _compileFormData() {
        return new Promise((resolve, reject) => {
            let formData = {};
            let loopPromise = [];
            let tableBody = this.studentTable.getTableBody().children();
            console.log(this.studentTable.getTableBody());
            for(let x = 0; x < tableBody.length; x++) {
                loopPromise.push(new Promise((resolve, reject) => {
                    console.log("Table Rows:", tableBody[x])
                    console.log("Period Select:", $(tableBody[x]).find("select." + this.periodSelectClass))
                    let period = $(tableBody[x]).find("select." + this.periodSelectClass).val();
                    if(period) {
                        //set var.
                        formData[period] = {};
                        console.log("Period Select Value:", $(tableBody[x]).find("select." + this.periodSelectClass).val())
                        console.log(x, "has period")
                        //ROW HAS PERIOD, CONTINUE
                        console.log("Location Toggle:", $(tableBody[x]).find("a[data-location]"))
                        if($(tableBody[x]).find("a[data-location]").attr("data-location") === "true") {
                            console.log(x, "has Location")
                            let autoVal = $(tableBody[x]).find("input."+ this.autocompleteClass).val();
                            console.log("Autocomplete Value:", autoVal);
                            //Validate Autocomplete Val 
                            if(autoVal.length < 1 || autoVal.search(this.autocompleteREGEX) < 0) {
                                //Fail
                                return reject(new Error("Form not valid. Location Invalid."));
                            }
                            console.log(autoVal.search(this.autocompleteREGEX))
                            //Exchange email for ID
                            accountAPI.get({ 
                                email: autoVal.substring(autoVal.search(this.autocompleteREGEX)+5)
                            }).then((user) => {
                                if(user.length > 1) {
                                    //More than one user for that email 
                                    console.error("Conflicting Accounts:", user)
                                    throw new Error("There are multiple users with that email in the DB. Emails should be unique. Please see IT. The users are logged in this console.");
                                }
                                formData[period].teacherID = user[0].id;
                                return resolve();
                            }).catch((err) => {return reject(err)})
                        } else {
                            formData[period].teacherID = null;
                            //Done
                            return resolve();
                        }
                    } else {
                        return reject(new Error("Form not valid. Missing Period."));
                    }
                }));
            }
            Promise.all(loopPromise).then(() => {
                return resolve(formData);
            }).catch((err) => {return reject(err);})
        })
    }
}

module.exports = StudentScheduleEditor;

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

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

var Table = __webpack_require__(2);
var scheduleAPI = __webpack_require__(15);
var accountAPI = __webpack_require__(16);
var miscAPI = __webpack_require__(17);
var utils = __webpack_require__(0);
/**
* Class that Generates a Schedule editor for teachers.
* @class 
* @param {Object} formOutputContainer - Where to put the scheduele editor.
* @param {Object} [options] 
* @param {string} [options.accountID] - Specify what user to pull the existing schedule from. If undefined, the logged in user will be used.
* @param {function} [options.onChange] - Called whenever change occurs in the form. event passed to function.
*/
class TeacherScheduleEditor {
    /** @constructor */
    constructor(formOutputContainer, options) {
        this.container = $(formOutputContainer);
        if(!options) {options = {}}
        this.options = options;
        this.periodSelectClass = "__PERIOD_SELECT_" + utils.uuidv4() + "__";
        this.isTeachingClass = "__IS_TEACHING_SWITCH_" + utils.uuidv4() + "__";
        this.classNameClass = "__CLASS_NAME_INPUT_" + utils.uuidv4() + "__";
        this.roomClass = "__ROOM_INPUT_" + utils.uuidv4() + "__";
        this.limitClass = "__LIMIT_INPUT_" + utils.uuidv4() + "__";
        this.addRowButtonID = "__ADD_ROW_PERIOD_" + utils.uuidv4() + "__";
        this.hasChanged = false;
    }

    clearContainer() {
        $(this.container).children().off();
        $(this.container).empty();
    }
    /** Tells if the form has been changed from its initial value 
    * @returns {boolean}
    */
    getHasChanged() {
        return this.hasChanged;
    }
    /** Creates the table 
    * @param {bool} [startClean] - If true, it will not load the user schedule. Use if there is a problem finding a user schedule, or the user wants to just not load the schedule.
    * @returns {Promise}
    */
    generate(startClean) {
        return new Promise((resolve, reject) => {
            this.clearContainer();
            let prom = [];
            prom.push(miscAPI.getScheduleConfig());
            if(startClean) {
                prom.push(new Promise((resolve) => {return resolve()}));
            } else {
                prom.push(scheduleAPI.getSchedules(this.options.accountID));
            }
            
            Promise.all(prom).then(([scheduleConfig, allSchedules]) => {

                this.teacherTable = new Table(this.container, [{}], {
                    tableClasses: "noresponsive-table",
                    preferInject: false,
                    idKey: "id",
                    ignoredKeys: ["id"],
                    inject: (row, callback) => {
                        this._injectDOM(scheduleConfig.periods, row).then((arr) => {
                            return callback(arr);
                        }).catch(err => reject(err))
                    },
                    afterGenerate: () => {
                        //INIT SELECT
                        $('select').material_select();
                    }
                });

                this.teacherTable.generate().then(() => {
                    //Import existing schedule
                    
                    if(allSchedules && allSchedules.teacherType) {
                        let schedule = allSchedules.teacherType;
                        let periods = Object.keys(schedule.schedule);
                        for(let x = 0; x < periods.length; x++) {
                            if(schedule.schedule[periods[x]]) {
                                let thisPeriod = schedule.schedule[periods[x]];
                                this.teacherTable.appendRow([{}], (row, callback) => {
                                    //console.log("Teacher Schedule", schedule.schedule)
                                    this._injectDOM(scheduleConfig.periods, row, periods[x], thisPeriod.isTeaching, thisPeriod.room, thisPeriod.className, thisPeriod.passLimit).then((arr) => {
                                        return callback(arr);
                                    }).catch(err => reject(err))
                                })
                            }
                        }
                    }
                    //create new row button
                    this.container.append($("<a/>").attr("id", this.addRowButtonID).addClass("waves-effect waves-light btn").append($("<i/>").addClass("material-icons left").html("add")).html("Add Period").on("click", () => {
                        $("#" + this.addRowButtonID).attr("disabled", true)
                        this.teacherTable.appendRow([{}])
                        this.checkValidity().catch(err => reject(err));
                    }))

                    //generation done
                    return resolve();
                });


            }).catch(reject);
        })
    }
    _periodSelectElm(periods, selected) {
        return new Promise((resolve, reject) => {
            let sel = $("<select/>").addClass(this.periodSelectClass).on("change", (e) => {
                if(typeof this.options.onChange === "function") {
                    this.options.onChange(e);
                }
                this.hasChanged = true;
                this.checkValidity().catch(err => reject(err))
            });
            if(selected) {
                sel.append($("<option/>").attr("value", "").attr("disabled", true).html("Choose a period"));
            } else {
                sel.append($("<option/>").attr("value", "").attr("disabled", true).attr("selected", true).html("Choose a period"));
            }
            
            for(let x = 0; x < periods.length; x++) {
                if(periods[x] == selected) {
                    sel.append($("<option/>").attr("value", periods[x]).attr("selected", true).html(periods[x].toUpperCase()))
                } else {
                    sel.append($("<option/>").attr("value", periods[x]).html(periods[x].toUpperCase()))
                }
                
                if(x >= periods.length-1) {
                    let div = $("<div/>").addClass("input-field col s10").append(sel);
                    resolve(div);
                }
            }
        });
    }
    _periodDom(rowID, periods, selected) {
        return new Promise((resolve, reject) => {
            this._periodSelectElm(periods, selected).then((sel) => {
                return resolve($("<span/>")
                .prepend($("<a/>").addClass("left btn-floating waves-effect waves-light delete-row").css("transform", "translateY(50%)").on("click", (e) => {
                    this.teacherTable.deleteRow(rowID)
                    if(typeof this.options.onChange === "function") {
                        this.options.onChange(e);
                    }
                    this.hasChanged = true;
                    $("#" + this.addRowButtonID).attr("disabled", false);
                    this.checkValidity().catch(err => reject(err))
                }).append($("<i/>").addClass("material-icons").html("delete")))
                .append(sel));
            }).catch(err => reject(err))
        })
    }
    _injectDOM(periodArray, row, period, isTeachingValue, roomValue, classValue, limitValue) {
        return new Promise((resolve, reject) => {
            let roomCSS = "block"; 
            let roomPlaceHolderDisplay = "none";
            let roomIcon = "location_off";
            let roomLabelCSS = "active"
            let limitCSS = "block"; 
            let limitPlaceHolderDisplay = "none";
            let limitIcon = "remove_circle_outline";
            let limitLabelCSS = "active"
            let classCSS = "block"; 
            let classPlaceHolderDisplay = "none";
            let classIcon = "remove_circle_outline"; 
            let classLabelCSS = "active"
            if(!roomValue) {
                roomValue = "";
                roomCSS = "none"; 
                roomPlaceHolderDisplay = "block";
                roomIcon = "add_location";
                roomLabelCSS = "";
            }
            if(!classValue) {
                classValue = "";
                classCSS = "none"; 
                classPlaceHolderDisplay = "block";
                classIcon = "class";
                classLabelCSS = "";
            }
            if(!limitValue) {
                limitValue = "";
                limitCSS = "none"; 
                limitPlaceHolderDisplay = "block";
                limitIcon = "group"
                limitLabelCSS = "";
            }
            if(typeof isTeachingValue === "undefined" || isTeachingValue) {
                isTeachingValue = "checked";
            } else {
                isTeachingValue = null;
            }
            //Input IDS
            let classNameID = "__CLASS_NAME_" + utils.uuidv4() + "__"
            let roomID = "__ROOM_" + utils.uuidv4() + "__"
            let limitID = "__LIMIT_" + utils.uuidv4() + "__"
            this._periodDom(row.rowID, periodArray, period).then((perDom) => {
                return resolve([
                    {
                        column: "Period",
                        strictColumn: true,
                        dom: perDom

                    }, {
                        column: "Class name",
                        strictColumn: true,
                        dom: $("<span/>")
                            .prepend($("<a/>").addClass("left btn-floating waves-effect waves-light").attr("data-classname", (!!classValue)).css("transform", "translateY(0%)").on("click", (e) => {
                                if($(e.currentTarget).attr("data-classname") == "true") {
                                    $("#" + classNameID + "_DIV__").slideUp(500);
                                    $(e.currentTarget).siblings("p").slideDown(500)
                                    $(e.currentTarget).attr("data-classname", false).css("transform", "translateY(0%)").find("i").html("class")
                                } else {
                                    $("#" + classNameID + "_DIV__").slideDown(500);
                                    $(e.currentTarget).siblings("p").slideUp(500)
                                    $(e.currentTarget).attr("data-classname", true).css("transform", "translateY(50%)").find("i").html("remove_circle_outline")
                                }
                                if(typeof this.options.onChange === "function") {
                                    this.options.onChange(e);
                                }
                                this.hasChanged = true;
                                this.checkValidity().catch(err => reject(err))
                            }).append($("<i/>").addClass("material-icons").html(classIcon)))
                            .append($("<p/>").html(" &nbsp; No class name").css("transform", "translateY(50%)").css("display", classPlaceHolderDisplay))
                            .append($("<div/>").addClass("input-field col s10").css("display", classCSS).attr("id", classNameID + "_DIV__")
                                .append($("<input/>").attr("type", "text").val(classValue).attr("id", classNameID).addClass(this.classNameClass).on("keyup", (e) => {
                                    if(typeof this.options.onChange === "function") {
                                        this.options.onChange(e);
                                    }
                                    this.hasChanged = true;
                                    this.checkValidity().catch(err => reject(err));
                                })).append($("<label/>").addClass(classLabelCSS).attr("for", classNameID).html("Class name"))
                            )
                    }, {
                        column: "Room",
                        strictColumn: true,
                        dom: $("<span/>")
                            .prepend($("<a/>").addClass("left btn-floating waves-effect waves-light").attr("data-room", (!!roomValue)).css("transform", "translateY(0%)").on("click", (e) => {
                                if($(e.currentTarget).attr("data-room") == "true") {
                                    $("#" + roomID + "_DIV__").slideUp(500);
                                    $(e.currentTarget).siblings("p").slideDown(500)
                                    $(e.currentTarget).attr("data-room", false).css("transform", "translateY(0%)").find("i").html("add_location")
                                } else {
                                    $("#" + roomID + "_DIV__").slideDown(500);
                                    $(e.currentTarget).siblings("p").slideUp(500)
                                    $(e.currentTarget).attr("data-room", true).css("transform", "translateY(50%)").find("i").html("location_off")
                                }
                                if(typeof this.options.onChange === "function") {
                                    this.options.onChange(e);
                                }
                                this.hasChanged = true;
                                this.checkValidity().catch(err => reject(err))
                            }).append($("<i/>").addClass("material-icons").html(roomIcon)))
                            .append($("<p/>").html(" &nbsp; No Room").css("transform", "translateY(50%)").css("display", roomPlaceHolderDisplay))
                            .append($("<div/>").addClass("input-field col s10").css("display", roomCSS).attr("id", roomID + "_DIV__")
                                .append($("<input/>").attr("type", "text").val(roomValue).attr("id", roomID).addClass(this.roomClass).on("keyup", (e) => {
                                    if(typeof this.options.onChange === "function") {
                                        this.options.onChange(e);
                                    }
                                    this.hasChanged = true;
                                    this.checkValidity().catch(err => reject(err));
                                })).append($("<label/>").addClass(roomLabelCSS).attr("for", roomID).html("Room"))
                            )
                    }, {
                        column: "Limit",
                        strictColumn: true,
                        dom: $("<span/>")
                            .prepend($("<a/>").addClass("left btn-floating waves-effect waves-light").attr("data-limit", (!!limitValue)).css("transform", "translateY(0%)").on("click", (e) => {
                                if($(e.currentTarget).attr("data-limit") == "true") {
                                    $("#" + limitID + "_DIV__").slideUp(500);
                                    $(e.currentTarget).siblings("p").slideDown(500)
                                    $(e.currentTarget).attr("data-limit", false).css("transform", "translateY(0%)").find("i").html("group")
                                } else {
                                    $("#" + limitID + "_DIV__").slideDown(500);
                                    $(e.currentTarget).siblings("p").slideUp(500)
                                    $(e.currentTarget).attr("data-limit", true).css("transform", "translateY(50%)").find("i").html("remove_circle_outline")
                                }
                                if(typeof this.options.onChange === "function") {
                                    this.options.onChange(e);
                                }
                                this.hasChanged = true;
                                this.checkValidity().catch(err => reject(err))
                            }).append($("<i/>").addClass("material-icons").html(limitIcon)))
                            .append($("<p/>").html(" &nbsp; No Limit").css("transform", "translateY(50%)").css("display", limitPlaceHolderDisplay))
                            .append($("<div/>").addClass("input-field col s10").css("display", limitCSS).attr("id", limitID + "_DIV__")
                                .append($("<input/>").attr("type", "number").val(limitValue).attr("id", limitID).addClass(this.limitClass).on("keyup", (e) => {
                                    if(typeof this.options.onChange === "function") {
                                        this.options.onChange(e);
                                    }
                                    this.hasChanged = true;
                                    this.checkValidity().catch(err => reject(err));
                                })).append($("<label/>").addClass(limitLabelCSS).attr("for", limitID).html("Pass Limit"))
                            )
                    }, {
                        column: "Teaching",
                        strictColumn: true,
                        dom: $("<span/>")
                            .append($("<div/>").addClass("col s12").append($("<div/>").addClass("switch").append($("<label/>")
                                .prepend("Not")
                                .append($("<input/>").attr("checked", isTeachingValue).attr("type", "checkbox").addClass(this.isTeachingClass)).on("change", (e) => {
                                    if(typeof this.options.onChange === "function") {
                                        this.options.onChange(e);
                                    }
                                    this.hasChanged = true;
                                    this.checkValidity().catch(err => reject(err))
                                })
                                .append($("<span/>").addClass("lever"))
                                .append("Teaching")
                            )))
                    }
                ])
            }).catch(err => reject(err))
        })
    }
    //checks every 
    _checkPeriodSelect() {
        return new Promise((resolve, reject) => {
            let sel = $("select." + this.periodSelectClass);
            let prevVal = []
            for(let x = 0; x < sel.length; x++) {
                if(prevVal.includes(sel[x].value)){
                    return resolve({valid: false, problemRowElement: $(sel[x]).parentsUntil("td")})
                }
                prevVal.push(sel[x].value)
                if(sel[x].value.length < 1) {
                    return resolve({valid: false, problemRowElement: $(sel[x]).parentsUntil("td")});
                }
                if (x >= sel.length-1) {
                    return resolve({valid: true});
                }
            }
        });
    }
    _checkInput(typeClass, buttonEnabledAttr, isNumber) {
        return new Promise((resolve, reject) => {
            let sel = $("input." + typeClass);
            for(let x = 0; x < sel.length; x++) {
                //console.log("CURRENT ELEMENT", sel);
                let button = $(sel[x]).parentsUntil("td").find("a[" + buttonEnabledAttr + "]");
                if(button.attr(buttonEnabledAttr) == "true") {
                    //location enabled
                    if(sel[x].value.length < 1) {
                        return resolve({valid: false, problemRowElement: $(sel[x]).parentsUntil("td")})
                    }
                    if(isNumber && isNaN(parseInt(sel[x].value))) {
                        return resolve({valid: false, problemRowElement: $(sel[x]).parentsUntil("td")})
                    }
                }
                //is finished
                if(x >= sel.length-1) {
                    return resolve({valid: true});
                }
            }
        });
    }
    /*_checkLocation() {
        return new Promise((resolve, reject) => {
            let sel = $("input." + this.autocompleteClass);
            for(let x = 0; x < sel.length; x++) {
                //console.log("CURRENT ELEMENT", sel);
                let button = $(sel[x]).parentsUntil("td").find("a[data-location]");
                if(button.attr("data-location") == "true") {
                    //location enabled
                    if(sel[x].value.length < 1 || sel[x].value.search(this.autocompleteREGEX) < 0) {
                        return resolve({valid: false, problemRowElement: $(sel[x]).parentsUntil("td")})
                    }
                }
                //is finished
                if(x >= sel.length-1) {
                    return resolve({valid: true});
                }
            }
        });
    }*/
    /** This checks to see if each field is valid.  If not it will change the dom to reflect that.
    * @returns {Promise} - Will not reject even if it is not valid.  Invalid form response: {valid: false, problemRowElement: (Object)}
    */
    checkValidity() {
        return new Promise((resolve, reject) => {
            let prom = [];
            prom.push(this._checkPeriodSelect());
            prom.push(this._checkInput(this.classNameClass, "data-classname"));
            prom.push(this._checkInput(this.roomClass, "data-room"));
            prom.push(this._checkInput(this.limitClass, "data-limit", "number"));
            if(this.teacherTable.getTableBody().children().length < 1) {
                return resolve({valid: false});
            }
            Promise.all(prom).then(([periodRes, classnameRes, roomRes, limitRes]) => {
                $("a[data-classname]").removeClass("pulse red").fadeIn(1000);
                $("a[data-room]").removeClass("pulse red").fadeIn(1000);
                $("a[data-limit]").removeClass("pulse red").fadeIn(1000);

                $("a.delete-row").removeClass("pulse red").fadeIn(1000);
                if(!classnameRes.valid) {
                    classnameRes.problemRowElement.find("a[data-classname]").addClass("pulse red").fadeIn(1000);
                    $("#" + this.addRowButtonID).attr("disabled", true);
                    return resolve(classnameRes);
                } 
                if(!roomRes.valid) {
                    roomRes.problemRowElement.find("a[data-room]").addClass("pulse red").fadeIn(1000);
                    $("#" + this.addRowButtonID).attr("disabled", true);
                    return resolve(roomRes);
                } 
                if(!limitRes.valid) {
                    limitRes.problemRowElement.find("a[data-limit]").addClass("pulse red").fadeIn(1000);
                    $("#" + this.addRowButtonID).attr("disabled", true);
                    return resolve(limitRes);
                } 
                if(!periodRes.valid) {
                    periodRes.problemRowElement.find("a.delete-row").addClass("pulse red").fadeIn(1000);
                    $("#" + this.addRowButtonID).attr("disabled", true);
                    return resolve(periodRes);
                }
                
                
                $("#" + this.addRowButtonID).attr("disabled", false);
                return resolve({valid: true});
            }).catch(err => reject(err));
        
        })
    }

    /** Submits the form
    * @returns {Promise} - {transaction: res, formData: form}
    */
    submit() {
        return new Promise((resolve, reject) => {
            this.checkValidity().then((validResp) => {
                if(validResp.valid) {
                    this._compileFormData().then((form) => {
                        console.log(form)
                        scheduleAPI.replaceSchedule("teacher", form).then((res) => {return resolve({transaction: res, formData: form})}).catch((err) => {return reject(err)});
                    }).catch((err) => {return reject(err)});
                } else {
                    return reject(new Error("Invalid form. Please see the marked rows"))
                }
            })
            
        })
    }
    _compileFormData() {
        return new Promise((resolve, reject) => {
            let formData = {};
            let loopPromise = [];
            let tableBody = this.teacherTable.getTableBody().children();
            console.log(this.teacherTable.getTableBody());
            for(let x = 0; x < tableBody.length; x++) {
                loopPromise.push(new Promise((resolve, reject) => {

                    console.log("Table Rows:", tableBody[x])
                    console.log("Period Select:", $(tableBody[x]).find("select." + this.periodSelectClass))
                    //compile period select
                    let period = $(tableBody[x]).find("select." + this.periodSelectClass).val();
                    //period must be valid on all rows
                    if(period) {
                        //set Key with the period
                        formData[period] = {};
                        console.log("Period Select Value:", $(tableBody[x]).find("select." + this.periodSelectClass).val())
                        console.log(x, "has period")
                        //ROW HAS PERIOD, CONTINUE
                        //[START CLASS NAME]
                        //console.log("Class Name Toggle", $(tableBody[x]).find("a[data-classname]"))
                        //check to see if toggle is set to accept user input
                        if($(tableBody[x]).find("a[data-classname]").attr("data-classname") === "true") {
                            //get data from text input
                            let classNameVal = $(tableBody[x]).find("input." + this.classNameClass).val();
                            //valitate input (again)
                            if(classNameVal.length < 1) {
                                //Value not present. ERROR 
                                return reject(new Error("Form not valid. Class name invalid"));
                            }
                            //set value in formData Object
                            formData[period].className = classNameVal;
                        }
                        //[END CLASS NAME]

                        //[START ROOM]
                        if($(tableBody[x]).find("a[data-room]").attr("data-room") === "true") {
                            //get data from text input
                            let roomVal = $(tableBody[x]).find("input." + this.roomClass).val();
                            //valitate input (again)
                            if(roomVal.length < 1) {
                                //Value not present. ERROR 
                                return reject(new Error("Form not valid. Room invalid"));
                            }
                            //set value in formData Object
                            formData[period].room = roomVal;
                        }
                        //[END ROOM]

                        //[START LIMIT]
                        if($(tableBody[x]).find("a[data-limit]").attr("data-limit") === "true") {
                            //get data from text input
                            let limitVal = $(tableBody[x]).find("input." + this.limitClass).val();
                            //valitate input (again)
                            if(limitVal.length < 1 || isNaN(parseInt(limitVal))) {
                                //Value not present. ERROR 
                                return reject(new Error("Form not valid. Limit invalid"));
                            }
                            //set value in formData Object
                            formData[period].passLimit = parseInt(limitVal);
                        }
                        //[END LIMIT]

                        //[START LIMIT]
                        if($(tableBody[x]).find("input." + this.isTeachingClass).is(":checked")) {
                            formData[period].isTeaching = true;
                        } else {
                            formData[period].isTeaching = false;
                        }
                        //[END LIMIT]
                        //console.log("Location Toggle:", $(tableBody[x]).find("a[data-location]"))
                        /*if($(tableBody[x]).find("a[data-location]").attr("data-location") === "true") {
                            console.log(x, "has Location")
                            let autoVal = $(tableBody[x]).find("input."+ this.autocompleteClass).val();
                            console.log("Autocomplete Value:", autoVal);
                            //Validate Autocomplete Val 
                            if(autoVal.length < 1 || autoVal.search(this.autocompleteREGEX) < 0) {
                                //Fail
                                return reject(new Error("Form not valid. Location Invalid."));
                            }
                            console.log(autoVal.search(this.autocompleteREGEX))
                            //Exchange email for ID
                            accountAPI.get({ 
                                email: autoVal.substring(autoVal.search(this.autocompleteREGEX)+5)
                            }).then((user) => {
                                if(user.length > 1) {
                                    //More than one user for that email 
                                    console.error("Conflicting Accounts:", user)
                                    throw new Error("There are multiple users with that email in the DB. Emails should be unique. Please see IT. The users are logged in this console.");
                                }
                                formData[period].teacherID = user[0].id;
                                return resolve();
                            }).catch((err) => {return reject(err)})
                        } else {
                            formData[period].teacherID = null;
                            //Done
                            return resolve();
                        }*/

                        //ALL DONE
                        return resolve();
                    } else {
                        return reject(new Error("Form not valid. Missing Period."));
                    }
                }));
            }
            Promise.all(loopPromise).then(() => {
                return resolve(formData);
            }).catch((err) => {return reject(err);})
        })
    }
}

module.exports = TeacherScheduleEditor;

/***/ }),
/* 23 */
/***/ (function(module, exports) {

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
* Browser module for storing if work is unsaved and then notifying the user.
* This is ment to be used with the back buttons on the mustache mixen pages.
* If the button is clicked and there is unsaved work, the button will need to be pressed again for the button action to go through.
* @module webpack/unsavedWork
*/

/**
* Initiates a button for tracking if work is unsaved.
* @link module:webpack/unsavedWork
* @param {(Object|string)} element - The element to initiate for trackeing
* @param {Object} [callbacks] 
* @param {function} [callbacks.onAction] - called when the button action goes through. IE The page is discarded. The click event and the element are passed
* @param {function} [callbacks.onDiscard] - called when the button is pressed after being warned. Like callbacks.onAction, but not called if everything is saved.
* @param {function} [callbacks.onWarn] - called when the button action is canceled and a warning should be showed. The click event and the element are passed 
* @param {function} [callbacks.onSave] - called when the element is saved and it is save to discard. The Element is passed
* @param {function} [callbacks.onReset] - called when the element is reset to default values. The Element is passed
*/
exports.button = (element, callbacks) => {
    if(!callbacks || typeof callbacks !== "object") {callbacks = {};}
    element = $(element);
    //bind callback to element
    if(typeof callbacks.onSave === "function") {
        element.data("onSave", callbacks.onSave);
    }
    if(typeof callbacks.onReset === "function") {
        element.data("onReset", callbacks.onReset);
    }
    element.attr("data-unsaved", false);
    element.attr("data-willdiscard", false);
    element.off("click");
    element.on("click", (event) => {
        if(element.attr("data-willdiscard") === "true") {
            if(typeof callbacks.onAction === "function") {
                callbacks.onAction({event: event, element: element});
            }
            if(typeof callbacks.onDiscard === "function") {
                callbacks.onDiscard({event: event, element: element});
            }
        } else {
            if(element.attr("data-unsaved") === "true") {
                element.attr("data-willdiscard", true);
                //stop any href or onclick.
                event.preventDefault();
                if(typeof callbacks.onWarn === "function") {
                    return callbacks.onWarn({event: event, element: element});
                }
            } else {
                if(typeof callbacks.onAction === "function") {
                    return callbacks.onAction({event: event, element: element});
                }
            }
        }
    })
}


/**
* Call this when data is changed and thus unsaved.
* [Button]{@link module:webpack/unsavedWork.button} must be called first.
* @link module:webpack/unsavedWork
* @param {(Object|string)} element - The element to notify about the change.
*/
exports.changed = (element) => {
    element = $(element);
    if(typeof element.attr("data-unsaved") === "undefined" || typeof element.attr("data-willdiscard") === "undefined") {
        throw new Error("Please call .button(element, ondiscard) on this element before calling .changed(element)");
    }
    element.attr("data-unsaved", true);
    element.attr("data-willdiscard", false);
}


/**
* Resets the values to a saved state.
* [Button]{@link module:webpack/unsavedWork.button} must be called first.
* @link module:webpack/unsavedWork
* @param {(Object|string)} element - The element to notify about the change.
*/
exports.reset = (element) => {
    element = $(element);
    if(typeof element.attr("data-unsaved") === "undefined" || typeof element.attr("data-willdiscard") === "undefined") {
        throw new Error("Please call .button(element, ondiscard) on this element before calling .saved(element)");
    }
    element.attr("data-unsaved", false);
    element.attr("data-willdiscard", false);
    if(typeof element.data("onReset") === "function") {
        element.data("onReset")(element);
    }
}

/**
* Call this when data is saved and it is ok to click the button. IE. a [reset]{@link module:webpack/unsavedWork.reset}
* Also calles the "onSave" and "onReset" callbacks.
* [Button]{@link module:webpack/unsavedWork.button} must be called first.
* @link module:webpack/unsavedWork
* @param {(Object|string)} element - The element to notify about the change.
*/

exports.saved = (element) => {
    element = $(element);
    exports.reset(element);
    if(typeof element.data("onSave") === "function") {
        element.data("onSave")(element);
    }
}


/**
* Removes all bindings from the element and removes the data and attrs.  The element itself will not be deleted
* [Button]{@link module:webpack/unsavedWork.button} must be called first.
* @link module:webpack/unsavedWork
* @param {(Object|string)} element - The element to destroy.
*/
exports.destroy = (element) => {
    element = $(element);
    if(typeof element.attr("data-unsaved") === "undefined" || typeof element.attr("data-willdiscard") === "undefined") {
        throw new Error("Please call .button(element, ondiscard) on this element before calling .destroy(element)");
    }
    element.attr("data-unsaved", null);
    element.attr("data-willdiscard", null);
    element.data("onSave", null);
    element.data("onReset", null);
    element.off("click");
}

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
 2017 Julian Garnier
 Released under the MIT license
*/
var $jscomp={scope:{}};$jscomp.defineProperty="function"==typeof Object.defineProperties?Object.defineProperty:function(e,r,p){if(p.get||p.set)throw new TypeError("ES3 does not support getters and setters.");e!=Array.prototype&&e!=Object.prototype&&(e[r]=p.value)};$jscomp.getGlobal=function(e){return"undefined"!=typeof window&&window===e?e:"undefined"!=typeof global&&null!=global?global:e};$jscomp.global=$jscomp.getGlobal(this);$jscomp.SYMBOL_PREFIX="jscomp_symbol_";
$jscomp.initSymbol=function(){$jscomp.initSymbol=function(){};$jscomp.global.Symbol||($jscomp.global.Symbol=$jscomp.Symbol)};$jscomp.symbolCounter_=0;$jscomp.Symbol=function(e){return $jscomp.SYMBOL_PREFIX+(e||"")+$jscomp.symbolCounter_++};
$jscomp.initSymbolIterator=function(){$jscomp.initSymbol();var e=$jscomp.global.Symbol.iterator;e||(e=$jscomp.global.Symbol.iterator=$jscomp.global.Symbol("iterator"));"function"!=typeof Array.prototype[e]&&$jscomp.defineProperty(Array.prototype,e,{configurable:!0,writable:!0,value:function(){return $jscomp.arrayIterator(this)}});$jscomp.initSymbolIterator=function(){}};$jscomp.arrayIterator=function(e){var r=0;return $jscomp.iteratorPrototype(function(){return r<e.length?{done:!1,value:e[r++]}:{done:!0}})};
$jscomp.iteratorPrototype=function(e){$jscomp.initSymbolIterator();e={next:e};e[$jscomp.global.Symbol.iterator]=function(){return this};return e};$jscomp.array=$jscomp.array||{};$jscomp.iteratorFromArray=function(e,r){$jscomp.initSymbolIterator();e instanceof String&&(e+="");var p=0,m={next:function(){if(p<e.length){var u=p++;return{value:r(u,e[u]),done:!1}}m.next=function(){return{done:!0,value:void 0}};return m.next()}};m[Symbol.iterator]=function(){return m};return m};
$jscomp.polyfill=function(e,r,p,m){if(r){p=$jscomp.global;e=e.split(".");for(m=0;m<e.length-1;m++){var u=e[m];u in p||(p[u]={});p=p[u]}e=e[e.length-1];m=p[e];r=r(m);r!=m&&null!=r&&$jscomp.defineProperty(p,e,{configurable:!0,writable:!0,value:r})}};$jscomp.polyfill("Array.prototype.keys",function(e){return e?e:function(){return $jscomp.iteratorFromArray(this,function(e){return e})}},"es6-impl","es3");var $jscomp$this=this;
(function(e,r){ true?!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (r),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)):"object"===typeof module&&module.exports?module.exports=r():e.anime=r()})(this,function(){function e(a){if(!h.col(a))try{return document.querySelectorAll(a)}catch(c){}}function r(a,c){for(var d=a.length,b=2<=arguments.length?arguments[1]:void 0,f=[],n=0;n<d;n++)if(n in a){var k=a[n];c.call(b,k,n,a)&&f.push(k)}return f}function p(a){return a.reduce(function(a,d){return a.concat(h.arr(d)?p(d):d)},[])}function m(a){if(h.arr(a))return a;
h.str(a)&&(a=e(a)||a);return a instanceof NodeList||a instanceof HTMLCollection?[].slice.call(a):[a]}function u(a,c){return a.some(function(a){return a===c})}function C(a){var c={},d;for(d in a)c[d]=a[d];return c}function D(a,c){var d=C(a),b;for(b in a)d[b]=c.hasOwnProperty(b)?c[b]:a[b];return d}function z(a,c){var d=C(a),b;for(b in c)d[b]=h.und(a[b])?c[b]:a[b];return d}function T(a){a=a.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i,function(a,c,d,k){return c+c+d+d+k+k});var c=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(a);
a=parseInt(c[1],16);var d=parseInt(c[2],16),c=parseInt(c[3],16);return"rgba("+a+","+d+","+c+",1)"}function U(a){function c(a,c,b){0>b&&(b+=1);1<b&&--b;return b<1/6?a+6*(c-a)*b:.5>b?c:b<2/3?a+(c-a)*(2/3-b)*6:a}var d=/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(a)||/hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*([\d.]+)\)/g.exec(a);a=parseInt(d[1])/360;var b=parseInt(d[2])/100,f=parseInt(d[3])/100,d=d[4]||1;if(0==b)f=b=a=f;else{var n=.5>f?f*(1+b):f+b-f*b,k=2*f-n,f=c(k,n,a+1/3),b=c(k,n,a);a=c(k,n,a-1/3)}return"rgba("+
255*f+","+255*b+","+255*a+","+d+")"}function y(a){if(a=/([\+\-]?[0-9#\.]+)(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(a))return a[2]}function V(a){if(-1<a.indexOf("translate")||"perspective"===a)return"px";if(-1<a.indexOf("rotate")||-1<a.indexOf("skew"))return"deg"}function I(a,c){return h.fnc(a)?a(c.target,c.id,c.total):a}function E(a,c){if(c in a.style)return getComputedStyle(a).getPropertyValue(c.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase())||"0"}function J(a,c){if(h.dom(a)&&
u(W,c))return"transform";if(h.dom(a)&&(a.getAttribute(c)||h.svg(a)&&a[c]))return"attribute";if(h.dom(a)&&"transform"!==c&&E(a,c))return"css";if(null!=a[c])return"object"}function X(a,c){var d=V(c),d=-1<c.indexOf("scale")?1:0+d;a=a.style.transform;if(!a)return d;for(var b=[],f=[],n=[],k=/(\w+)\((.+?)\)/g;b=k.exec(a);)f.push(b[1]),n.push(b[2]);a=r(n,function(a,b){return f[b]===c});return a.length?a[0]:d}function K(a,c){switch(J(a,c)){case "transform":return X(a,c);case "css":return E(a,c);case "attribute":return a.getAttribute(c)}return a[c]||
0}function L(a,c){var d=/^(\*=|\+=|-=)/.exec(a);if(!d)return a;var b=y(a)||0;c=parseFloat(c);a=parseFloat(a.replace(d[0],""));switch(d[0][0]){case "+":return c+a+b;case "-":return c-a+b;case "*":return c*a+b}}function F(a,c){return Math.sqrt(Math.pow(c.x-a.x,2)+Math.pow(c.y-a.y,2))}function M(a){a=a.points;for(var c=0,d,b=0;b<a.numberOfItems;b++){var f=a.getItem(b);0<b&&(c+=F(d,f));d=f}return c}function N(a){if(a.getTotalLength)return a.getTotalLength();switch(a.tagName.toLowerCase()){case "circle":return 2*
Math.PI*a.getAttribute("r");case "rect":return 2*a.getAttribute("width")+2*a.getAttribute("height");case "line":return F({x:a.getAttribute("x1"),y:a.getAttribute("y1")},{x:a.getAttribute("x2"),y:a.getAttribute("y2")});case "polyline":return M(a);case "polygon":var c=a.points;return M(a)+F(c.getItem(c.numberOfItems-1),c.getItem(0))}}function Y(a,c){function d(b){b=void 0===b?0:b;return a.el.getPointAtLength(1<=c+b?c+b:0)}var b=d(),f=d(-1),n=d(1);switch(a.property){case "x":return b.x;case "y":return b.y;
case "angle":return 180*Math.atan2(n.y-f.y,n.x-f.x)/Math.PI}}function O(a,c){var d=/-?\d*\.?\d+/g,b;b=h.pth(a)?a.totalLength:a;if(h.col(b))if(h.rgb(b)){var f=/rgb\((\d+,\s*[\d]+,\s*[\d]+)\)/g.exec(b);b=f?"rgba("+f[1]+",1)":b}else b=h.hex(b)?T(b):h.hsl(b)?U(b):void 0;else f=(f=y(b))?b.substr(0,b.length-f.length):b,b=c&&!/\s/g.test(b)?f+c:f;b+="";return{original:b,numbers:b.match(d)?b.match(d).map(Number):[0],strings:h.str(a)||c?b.split(d):[]}}function P(a){a=a?p(h.arr(a)?a.map(m):m(a)):[];return r(a,
function(a,d,b){return b.indexOf(a)===d})}function Z(a){var c=P(a);return c.map(function(a,b){return{target:a,id:b,total:c.length}})}function aa(a,c){var d=C(c);if(h.arr(a)){var b=a.length;2!==b||h.obj(a[0])?h.fnc(c.duration)||(d.duration=c.duration/b):a={value:a}}return m(a).map(function(a,b){b=b?0:c.delay;a=h.obj(a)&&!h.pth(a)?a:{value:a};h.und(a.delay)&&(a.delay=b);return a}).map(function(a){return z(a,d)})}function ba(a,c){var d={},b;for(b in a){var f=I(a[b],c);h.arr(f)&&(f=f.map(function(a){return I(a,
c)}),1===f.length&&(f=f[0]));d[b]=f}d.duration=parseFloat(d.duration);d.delay=parseFloat(d.delay);return d}function ca(a){return h.arr(a)?A.apply(this,a):Q[a]}function da(a,c){var d;return a.tweens.map(function(b){b=ba(b,c);var f=b.value,e=K(c.target,a.name),k=d?d.to.original:e,k=h.arr(f)?f[0]:k,w=L(h.arr(f)?f[1]:f,k),e=y(w)||y(k)||y(e);b.from=O(k,e);b.to=O(w,e);b.start=d?d.end:a.offset;b.end=b.start+b.delay+b.duration;b.easing=ca(b.easing);b.elasticity=(1E3-Math.min(Math.max(b.elasticity,1),999))/
1E3;b.isPath=h.pth(f);b.isColor=h.col(b.from.original);b.isColor&&(b.round=1);return d=b})}function ea(a,c){return r(p(a.map(function(a){return c.map(function(b){var c=J(a.target,b.name);if(c){var d=da(b,a);b={type:c,property:b.name,animatable:a,tweens:d,duration:d[d.length-1].end,delay:d[0].delay}}else b=void 0;return b})})),function(a){return!h.und(a)})}function R(a,c,d,b){var f="delay"===a;return c.length?(f?Math.min:Math.max).apply(Math,c.map(function(b){return b[a]})):f?b.delay:d.offset+b.delay+
b.duration}function fa(a){var c=D(ga,a),d=D(S,a),b=Z(a.targets),f=[],e=z(c,d),k;for(k in a)e.hasOwnProperty(k)||"targets"===k||f.push({name:k,offset:e.offset,tweens:aa(a[k],d)});a=ea(b,f);return z(c,{children:[],animatables:b,animations:a,duration:R("duration",a,c,d),delay:R("delay",a,c,d)})}function q(a){function c(){return window.Promise&&new Promise(function(a){return p=a})}function d(a){return g.reversed?g.duration-a:a}function b(a){for(var b=0,c={},d=g.animations,f=d.length;b<f;){var e=d[b],
k=e.animatable,h=e.tweens,n=h.length-1,l=h[n];n&&(l=r(h,function(b){return a<b.end})[0]||l);for(var h=Math.min(Math.max(a-l.start-l.delay,0),l.duration)/l.duration,w=isNaN(h)?1:l.easing(h,l.elasticity),h=l.to.strings,p=l.round,n=[],m=void 0,m=l.to.numbers.length,t=0;t<m;t++){var x=void 0,x=l.to.numbers[t],q=l.from.numbers[t],x=l.isPath?Y(l.value,w*x):q+w*(x-q);p&&(l.isColor&&2<t||(x=Math.round(x*p)/p));n.push(x)}if(l=h.length)for(m=h[0],w=0;w<l;w++)p=h[w+1],t=n[w],isNaN(t)||(m=p?m+(t+p):m+(t+" "));
else m=n[0];ha[e.type](k.target,e.property,m,c,k.id);e.currentValue=m;b++}if(b=Object.keys(c).length)for(d=0;d<b;d++)H||(H=E(document.body,"transform")?"transform":"-webkit-transform"),g.animatables[d].target.style[H]=c[d].join(" ");g.currentTime=a;g.progress=a/g.duration*100}function f(a){if(g[a])g[a](g)}function e(){g.remaining&&!0!==g.remaining&&g.remaining--}function k(a){var k=g.duration,n=g.offset,w=n+g.delay,r=g.currentTime,x=g.reversed,q=d(a);if(g.children.length){var u=g.children,v=u.length;
if(q>=g.currentTime)for(var G=0;G<v;G++)u[G].seek(q);else for(;v--;)u[v].seek(q)}if(q>=w||!k)g.began||(g.began=!0,f("begin")),f("run");if(q>n&&q<k)b(q);else if(q<=n&&0!==r&&(b(0),x&&e()),q>=k&&r!==k||!k)b(k),x||e();f("update");a>=k&&(g.remaining?(t=h,"alternate"===g.direction&&(g.reversed=!g.reversed)):(g.pause(),g.completed||(g.completed=!0,f("complete"),"Promise"in window&&(p(),m=c()))),l=0)}a=void 0===a?{}:a;var h,t,l=0,p=null,m=c(),g=fa(a);g.reset=function(){var a=g.direction,c=g.loop;g.currentTime=
0;g.progress=0;g.paused=!0;g.began=!1;g.completed=!1;g.reversed="reverse"===a;g.remaining="alternate"===a&&1===c?2:c;b(0);for(a=g.children.length;a--;)g.children[a].reset()};g.tick=function(a){h=a;t||(t=h);k((l+h-t)*q.speed)};g.seek=function(a){k(d(a))};g.pause=function(){var a=v.indexOf(g);-1<a&&v.splice(a,1);g.paused=!0};g.play=function(){g.paused&&(g.paused=!1,t=0,l=d(g.currentTime),v.push(g),B||ia())};g.reverse=function(){g.reversed=!g.reversed;t=0;l=d(g.currentTime)};g.restart=function(){g.pause();
g.reset();g.play()};g.finished=m;g.reset();g.autoplay&&g.play();return g}var ga={update:void 0,begin:void 0,run:void 0,complete:void 0,loop:1,direction:"normal",autoplay:!0,offset:0},S={duration:1E3,delay:0,easing:"easeOutElastic",elasticity:500,round:0},W="translateX translateY translateZ rotate rotateX rotateY rotateZ scale scaleX scaleY scaleZ skewX skewY perspective".split(" "),H,h={arr:function(a){return Array.isArray(a)},obj:function(a){return-1<Object.prototype.toString.call(a).indexOf("Object")},
pth:function(a){return h.obj(a)&&a.hasOwnProperty("totalLength")},svg:function(a){return a instanceof SVGElement},dom:function(a){return a.nodeType||h.svg(a)},str:function(a){return"string"===typeof a},fnc:function(a){return"function"===typeof a},und:function(a){return"undefined"===typeof a},hex:function(a){return/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(a)},rgb:function(a){return/^rgb/.test(a)},hsl:function(a){return/^hsl/.test(a)},col:function(a){return h.hex(a)||h.rgb(a)||h.hsl(a)}},A=function(){function a(a,
d,b){return(((1-3*b+3*d)*a+(3*b-6*d))*a+3*d)*a}return function(c,d,b,f){if(0<=c&&1>=c&&0<=b&&1>=b){var e=new Float32Array(11);if(c!==d||b!==f)for(var k=0;11>k;++k)e[k]=a(.1*k,c,b);return function(k){if(c===d&&b===f)return k;if(0===k)return 0;if(1===k)return 1;for(var h=0,l=1;10!==l&&e[l]<=k;++l)h+=.1;--l;var l=h+(k-e[l])/(e[l+1]-e[l])*.1,n=3*(1-3*b+3*c)*l*l+2*(3*b-6*c)*l+3*c;if(.001<=n){for(h=0;4>h;++h){n=3*(1-3*b+3*c)*l*l+2*(3*b-6*c)*l+3*c;if(0===n)break;var m=a(l,c,b)-k,l=l-m/n}k=l}else if(0===
n)k=l;else{var l=h,h=h+.1,g=0;do m=l+(h-l)/2,n=a(m,c,b)-k,0<n?h=m:l=m;while(1e-7<Math.abs(n)&&10>++g);k=m}return a(k,d,f)}}}}(),Q=function(){function a(a,b){return 0===a||1===a?a:-Math.pow(2,10*(a-1))*Math.sin(2*(a-1-b/(2*Math.PI)*Math.asin(1))*Math.PI/b)}var c="Quad Cubic Quart Quint Sine Expo Circ Back Elastic".split(" "),d={In:[[.55,.085,.68,.53],[.55,.055,.675,.19],[.895,.03,.685,.22],[.755,.05,.855,.06],[.47,0,.745,.715],[.95,.05,.795,.035],[.6,.04,.98,.335],[.6,-.28,.735,.045],a],Out:[[.25,
.46,.45,.94],[.215,.61,.355,1],[.165,.84,.44,1],[.23,1,.32,1],[.39,.575,.565,1],[.19,1,.22,1],[.075,.82,.165,1],[.175,.885,.32,1.275],function(b,c){return 1-a(1-b,c)}],InOut:[[.455,.03,.515,.955],[.645,.045,.355,1],[.77,0,.175,1],[.86,0,.07,1],[.445,.05,.55,.95],[1,0,0,1],[.785,.135,.15,.86],[.68,-.55,.265,1.55],function(b,c){return.5>b?a(2*b,c)/2:1-a(-2*b+2,c)/2}]},b={linear:A(.25,.25,.75,.75)},f={},e;for(e in d)f.type=e,d[f.type].forEach(function(a){return function(d,f){b["ease"+a.type+c[f]]=h.fnc(d)?
d:A.apply($jscomp$this,d)}}(f)),f={type:f.type};return b}(),ha={css:function(a,c,d){return a.style[c]=d},attribute:function(a,c,d){return a.setAttribute(c,d)},object:function(a,c,d){return a[c]=d},transform:function(a,c,d,b,f){b[f]||(b[f]=[]);b[f].push(c+"("+d+")")}},v=[],B=0,ia=function(){function a(){B=requestAnimationFrame(c)}function c(c){var b=v.length;if(b){for(var d=0;d<b;)v[d]&&v[d].tick(c),d++;a()}else cancelAnimationFrame(B),B=0}return a}();q.version="2.2.0";q.speed=1;q.running=v;q.remove=
function(a){a=P(a);for(var c=v.length;c--;)for(var d=v[c],b=d.animations,f=b.length;f--;)u(a,b[f].animatable.target)&&(b.splice(f,1),b.length||d.pause())};q.getValue=K;q.path=function(a,c){var d=h.str(a)?e(a)[0]:a,b=c||100;return function(a){return{el:d,property:a,totalLength:N(d)*(b/100)}}};q.setDashoffset=function(a){var c=N(a);a.setAttribute("stroke-dasharray",c);return c};q.bezier=A;q.easings=Q;q.timeline=function(a){var c=q(a);c.pause();c.duration=0;c.add=function(d){c.children.forEach(function(a){a.began=
!0;a.completed=!0});m(d).forEach(function(b){var d=z(b,D(S,a||{}));d.targets=d.targets||a.targets;b=c.duration;var e=d.offset;d.autoplay=!1;d.direction=c.direction;d.offset=h.und(e)?b:L(e,b);c.began=!0;c.completed=!0;c.seek(d.offset);d=q(d);d.began=!0;d.completed=!0;d.duration>b&&(c.duration=d.duration);c.children.push(d)});c.seek(0);c.reset();c.autoplay&&c.restart();return c};return c};q.random=function(a,c){return Math.floor(Math.random()*(c-a+1))+a};return q});
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(25)))

/***/ }),
/* 25 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ })
/******/ ]);