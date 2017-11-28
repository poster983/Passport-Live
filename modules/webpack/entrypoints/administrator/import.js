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
var Caret = require("../../common/Caret.js");
var Table = require("../../common/Table.js");
var utils = require("../../utils/index.js");
var importAPI = require("../../api/import.js")
//var moment = require("moment");

var bulkTable = null;
window.onload = function() {
  var caret = new Caret($("#expandSearch"), $("#expandSearchDiv"));
  caret.initialize();
  console.log(utils.urlQuery({
    string: "There",
    number: 1,
    bool: true,
    null: null,
    undefined: undefined
  }))
  //get initial table values and create table object.
  bulkTable = new Table($("#bulkLogTable"), [], {
    ignoredKeys: ["id"],
    idKey: "id",
    hiddenKeys: ["loggedErrors"]
  });

  importAPI.searchBulkLogs({
    name: "f"
  }).then((data) => {
    //console.log(data)
    bulkTable.addData(data)
    bulkTable.generate();
  }).catch(err=>utils.throwError(err));
};

function searchBulkLogsForm() {
    
}