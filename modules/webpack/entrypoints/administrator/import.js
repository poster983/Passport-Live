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
var miscAPI = require("../../api/misc.js");
let buttonLoader = require("../../common/buttonLoader");
let typeCheck = require("type-check").typeCheck;
let XLSX = require("xlsx");
let flat = require("flat");
let Logger = require("../../common/Logger.js");
//var moment = require("moment");

var bulkTable = null;
let userGroups = null;
let accountLog = null;
window.onload = function() {
    $(".button-collapse").sideNav();
    $("select").material_select();
    $(".collapsible").collapsible();
    $(".modal").modal();

    //Logger
    accountLog = new Logger("#accountImport-log");
    //Import Job Caret
    new Caret($("#expandSearch"), {content: $("#expandSearchDiv")});
    //Account import json expand caret
    new Caret($("#account-json-expand"), {
        callback: (isOpen) => {
            if(isOpen) {
                $("#account-json-textbox").removeClass("textarea-less");
                $("#account-json-textbox").trigger("autoresize");
            } else {
                $("#account-json-textbox").addClass("textarea-less");
            }
            
        }
    });

    
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

    //get usergroup premissions
    buttonLoader.load("#accountImport-submit");
    buttonLoader.load("#accountImport-verifyJSONData");
    miscAPI.getUserGroups().then((uG) => {
        userGroups = uG;
        buttonLoader.done("#accountImport-submit");
        buttonLoader.done("#accountImport-verifyJSONData");
    }).catch((err) => {
        buttonLoader.fail("#accountImport-submit");
        buttonLoader.fail("#accountImport-verifyJSONData");
        $("#accountImport-submit").attr("disabled", "disabled");
        $("#accountImport-verifyJSONData").attr("disabled", "disabled");
        utils.throwError(err);
    });

};

function searchBulkLogsForm() {
    
}


/**ACCOUNT IMPORT **/
var excelWorkbook = null;
//Process Excel after input change
$("input[name=accountImport-excel]").on("change", (e) => {
    let sheetSelect = $("#accountImport-excel-sheet");
    //reset sheet select
    sheetSelect.find("option").not(":first").remove();
    sheetSelect.off("change");

    let fileList = $("input[name=accountImport-excel]")[0].files;
    if(fileList.length == 1) {
        buttonLoader.load("#accountImport-excel-filebutton");
        Materialize.toast("Loading excel file", 6000);
        //load file 
        let reader = new FileReader();
        reader.onload = function(e) {
            let data = e.target.result;
            let workbook = XLSX.read(data, {type: "binary"});
            console.log(workbook);
            
            excelWorkbook = workbook;
            //set sheet select
            for(let i = 0; i < workbook.SheetNames.length; i++) {
                sheetSelect.append($("<option/>").val(workbook.SheetNames[i]).html(workbook.SheetNames[i]));
            }
            sheetSelect.material_select();
            buttonLoader.success("#accountImport-excel-filebutton");
            Materialize.toast("Excel file loaded", 6000);
        };
        reader.onerror = function(e) {
            buttonLoader.fail("#accountImport-excel-filebutton");
            utils.throwError(e);
        };
        //read
        reader.readAsBinaryString(fileList[0]);
    } else if(fileList.length < 1) {
        // no file selected
        Materialize.toast("Please select a file", 6000);
    } else {
        Materialize.toast("One file at a time", 4000);
    }

    
});



//JSON EXPAND


// JSON PROSESS

$("#account-json-textbox").on("focusout", (e) => {
    try {
        
        $("#account-json-textbox").val(utils.formatJSON($("#account-json-textbox").val()));
        $("#accountImport-json-error").html(null);
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
    //If on excel tab
    if($("#accountImport-excel-tab").hasClass("active")) {
        Materialize.toast("Parsing excel file", 4000);
        parseWorkbook(excelWorkbook, $("#accountImport-excel-sheet").val()).then((json) => {
            //un flatten the data
            $("#account-json-textbox").val(JSON.stringify(json, undefined, 4));
            $("#accountImport-excel-tabs").tabs("select_tab", "accountImport-json");
            buttonLoader.success("#accountImport-submit", 2000);
            $("#account-json-textbox").trigger("autoresize");
            Materialize.toast("Please review the parsed data", 6000);
        }).catch((err) => {
            utils.throwError(err);
            buttonLoader.warning("#accountImport-submit", 2000);
        });
    } else {
        //If JSON 
        let accounts = "";
        try {
            accounts = JSON.parse($("#account-json-textbox").val());
        } catch(e) {
            buttonLoader.fail("#accountImport-submit");
            return Materialize.toast("JSON.parse, Invalid JSON", 6000);
        }
        let importName = $("#accountImport-name");
        if(importName.val().length < 1) {
            buttonLoader.warning("#accountImport-submit");
            importName.addClass("invalid").removeClass("valid");
            return Materialize.toast("Import name required", 6000);
        }
        if(accounts.length < 1) {
            buttonLoader.warning("#accountImport-submit");
            $("#account-json-textbox").addClass("invalid").removeClass("valid");
            return Materialize.toast("Invalid JSON structure", 6000);
        }

        //upload
        accountLog.working("Importing Accounts");
        importAPI.accounts(importName.val(), accounts).then((res) => {
            buttonLoader.success("#accountImport-submit", 3000);
            accountLog.done(JSON.stringify(res, undefined, 4).replace(/\n/g, "<br/>").replace(/ /g, "\u00a0"));
            $("#accountImport-log-model").modal("open");
            Materialize.toast("Successfully imported.", 6000);
            $("#accountImport-json-res").empty().prepend("Total Tried: " + res.totalTried + "<br/>").append("Total Imported: " + res.totalImported + "<br/>").append("Total Initialized: " + res.totalInitialized);
        }).catch((err) => {
            utils.throwError(err);
            buttonLoader.fail("#accountImport-submit", 3000);
            return accountLog.fetchError(err);
        });
    }
});


//May become a utill function someday 
function parseWorkbook(excelWorkbook, sheet) {
    return new Promise((resolve, reject) => {
        if(!excelWorkbook) {
            return reject(new TypeError("Excel workbook not specified"));
        }
        if(!typeCheck("String", sheet)) {
            return reject(new TypeError("Sheet not specified"));
        }
        let json = XLSX.utils.sheet_to_json(excelWorkbook.Sheets[sheet]);
        json = json.map((row) => {
            return flat.unflatten(row);
        });
        resolve(json);
    });
}

//PArse Account Structure button
$("#accountImport-verifyJSONData").on("click", () => {
    buttonLoader.load("#accountImport-verifyJSONData");
    $("#accountImport-excel-tabs").tabs("select_tab", "accountImport-json");
    if($("#account-json-textbox").val().length < 1) {
        buttonLoader.warning("#accountImport-verifyJSONData");
        return Materialize.toast("Nothing to verify", 6000);
    }
    let arr = "";
    try {
        arr = JSON.parse($("#account-json-textbox").val());
    } catch(e) {
        buttonLoader.fail("#accountImport-verifyJSONData");
        return Materialize.toast("JSON.parse, Invalid JSON", 6000);
    }
    if(arr.length < 1) {
        buttonLoader.warning("#accountImport-verifyJSONData");
        return Materialize.toast("Nothing to verify", 6000);
    }
    verifyAccountJSON(arr).then((errors) => {
        console.log(errors)
        if(errors.length < 1) {
            buttonLoader.success("#accountImport-verifyJSONData");
            Materialize.toast("Account JSON structure is valid", 6000);
        } else {
            logJSONErrors(errors);
            $("#accountImport-log-model").modal("open");
            buttonLoader.warning("#accountImport-verifyJSONData");
            Materialize.toast("Account JSON structure is not valid. Please see errors", 6000);
        }
    }).catch((err) => {
        buttonLoader.fail("#accountImport-verifyJSONData");
        utils.throwError(err);
    });
});

function verifyAccountJSON(accountArray) {
    return new Promise((resolve, reject) => {
        if(!userGroups) {
            return reject(new TypeError("Failed to get usergroups"));
        }
        let checkPromise = [];
        for(let x = 0; x < accountArray.length; x++) {
            checkPromise.push(new Promise((res, rej) => {
                //console.log(accountArray[x])
                let account = accountArray[x];
                let errors = [];
                //type 
                if(!typeCheck("Object", account)) {
                    errors.push("Not an object");
                    //FAIL NOW
                    return res({doc: account, errors});
                }
                //required fields
                if(!account.name || typeof account.name.first !== "string") {
                    errors.push("\"name.first\" must be a string");
                }
                if(!account.name || typeof account.name.last !== "string") {
                    errors.push("\"name.last\" must be a string");
                }
                if(!account.name || typeof account.name.salutation !== "string") {
                    errors.push("\"name.salutation\" must be a string");
                }
                if(typeof account.email !== "string") {
                    errors.push("\"email\" must be a string");
                }
                if(typeof account.userGroup !== "string") {
                    errors.push("\"userGroup\" must be a string");
                } else if(!userGroups[account.userGroup]) {
                    errors.push("\"userGroup\" must be a valid userGroup set in the configs. Valid userGroups: " + Object.keys(userGroups));
                }

                //optional
                if(account.schoolID && typeof account.schoolID !== "string") {
                    errors.push("\"schoolID\" is optional(undefined, null), but must be a string if set");
                }
                if(account.isVerified && typeof account.isVerified !== "boolean") {
                    errors.push("\"isVerified\" is optional(undefined, null), but must be a boolean if set");
                }
                if(account.graduationYear && typeof account.graduationYear !== "number") {
                    errors.push("\"graduationYear\" is optional(undefined, null), but must be a number if set");
                } else {
                    //check if usergroup requires it
                    if(userGroups[account.userGroup] && (userGroups[account.userGroup].graduates && typeof account.graduationYear !== "number")) {
                        errors.push("\"graduationYear\" is required to be a number by the userGroup");
                    }
                }
                if(account.password && typeof account.password !== "string") {
                    errors.push("\"password\" is optional(undefined, null), but must be a string if set");
                }
                

                //end 
                if(errors.length < 1) {
                    return res();
                } else {
                    return res({doc: account, errors});
                }
            }));
        }

        Promise.all(checkPromise).then((tran) => {
            tran = tran.filter((val) => {
                return !!val;
            })
            return resolve(tran);
        }).catch((err) => {
            return reject(err);
        });
    });
}




function logJSONErrors(array) {
    for(let x = 0; x < array.length; x++) {
        let string = "\"" + JSON.stringify(array[x].doc, undefined, 4) + "\": ";
        for(let y = 0; y < array[x].errors.length; y++) {
            string = string + "\n <strong>" + array[x].errors[y] + "</strong>";
        }
        string = string.replace(/\n/g, "<br/>").replace(/ /g, "\u00a0");

        accountLog.error(string);
    }
}