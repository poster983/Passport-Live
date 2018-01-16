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
var importAPI = require("../../api/import.js");
let buttonLoader = require("../../common/buttonLoader");
let XLSX = require("xlsx");
//var moment = require("moment");

var bulkTable = null;
window.onload = function() {
    var caret = new Caret($("#expandSearch"), $("#expandSearchDiv"));
    caret.initialize();
    
    //get initial table values and create table object.
    bulkTable = new Table($("#bulkLogTable"), [], {
        ignoredKeys: ["id"],
        idKey: "id",
        sort: ["Actions", "name", "importType", "date", "totalImported", "totalTried"],
        hiddenKeys: ["loggedErrors", "rollback", "properties"],
        tableClasses: "white-text responsive-table",
        inject: function(row, done) {
            return done([{
                column: "Actions", 
                strictColumn: true,
                dom: $("<div/>").attr("onclick", "console.log(\"" + row.getRowID() + "\");").html("CLICK ME")
            //dom: {hello: "there", howAre: "you"}
            }]);
        } 
    });

    importAPI.searchBulkLogs({}).then((data) => {
    //console.log(data)
        bulkTable.addData(data);
        bulkTable.generate().catch(err=>utils.throwError(err));
    }).catch(err=>utils.throwError(err));

};

function searchBulkLogsForm() {
    
}


/**ACCOUNT IMPORT **/

//Process Excel after input change
$("input[name=accountImport-excel]").on("change", (e) => {
    let fileList = $("input[name=accountImport-excel]")[0].files;
    console.log($("input[name=accountImport-excel]"))
    if(fileList.length == 1) {
        //load file 
        let reader = new FileReader();
        reader.onload = function(e) {
            let data = e.target.result;
            let workbook = XLSX.read(data, {type: "binary"});
            console.log(workbook);
            let json = XLSX.utils.sheet_to_json(workbook.Sheets["studentinfohassell"]);
            console.log(json);
        };
        //read
        reader.readAsBinaryString(fileList[0]);
    } else if(fileList.length < 1) {
        // no file selected
        Materialize.toast("Please select a file", 6000)
    } else {
        Materialize.toast("One file at a time", 4000)
    }

    
});


// JSON PROSESS
$("#account-json-textbox").on("focusout", (e) => {
    try {
        
        $("#account-json-textbox").val(utils.formatJSON($("#account-json-textbox").val()));
        $("#accountImport-json-error").html(null)
        $("#account-json-textbox").addClass("valid").removeClass("invalid");
    } catch(err) {
        $("#accountImport-json-error").html(err.message);
        $("#account-json-textbox").removeClass("valid").addClass("invalid");
    }
    $("#account-json-textbox").trigger("autoresize");
});

//Submit Button
$("#accountImport-submit").on("click", (e) => {
    buttonLoader.load("#accountImport-submit");
    setTimeout(() => {
        buttonLoader.fail("#accountImport-submit", 2000);
    }, 1000);
});
