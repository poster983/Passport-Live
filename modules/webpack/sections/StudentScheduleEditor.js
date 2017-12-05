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

var Table = require("../common/Table.js");
var scheduleAPI = require("../api/schedule.js");
var accountAPI = require("../api/account.js");
var miscAPI = require("../api/misc.js");
var utils = require("../utils/index.js");

class StudentScheduleEditor {
    constructor(formOutputContainer, options) {
        this.container = formOutputContainer;
        if(!options) {options = {}}
        this.options = options;
        this.periodSelectClass = "__PERIOD_SELECT_" + utils.uuidv4() + "__";
        this.autocompleteClass = "__SCHEDULE_AUTOCOMPLETE_" + utils.uuidv4() + "__";
        this.addRowButtonID = "__ADD_ROW_PERIOD_" + utils.uuidv4() + "__";
        this.autocompleteREGEX  = new RegExp(/( --- )+(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|\"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*\")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/)
    }
    generate() {
        return new Promise((resolve, reject) => {
            let prom = [];
            prom.push(miscAPI.getScheduleConfig());
            prom.push(scheduleAPI.getSchedules(this.options.accountID));
            prom.push(accountAPI.getWithClasses());
            Promise.all(prom).then(([scheduleConfig, allSchedules, allClassAccounts]) => {
                this.allClassAccounts = allClassAccounts;
                let locationAutocompleteData = {};
                let doneMappingAutoData = new Promise((res) => {
                    for(let x = 0; x < this.allClassAccounts.length; x++) {
                        if(this.allClassAccounts[x].name.salutation) {
                            locationAutocompleteData[this.allClassAccounts[x].name.salutation + ' ' + this.allClassAccounts[x].name.first + ' ' + this.allClassAccounts[x].name.last + ' --- ' + this.allClassAccounts[x].email] = null;
                        } else {
                            locationAutocompleteData[this.allClassAccounts[x].name.first + ' ' + this.allClassAccounts[x].name.last + ' --- ' + this.allClassAccounts[x].email] = null;
                        }
                        if(x >= this.allClassAccounts.length-1) {
                            return res();
                        }
                    }
                })
                //console.log(scheduleConfig, allSchedules);
                
                //data mapping 
                
                //console.log(tableArray)

                /*$("<span/>")
                                    .prepend($("<a/>").addClass("left btn-floating waves-effect waves-light delete-row").css("transform", "translateY(50%)").on("click", () => {
                                        $("#" + this.addRowButtonID).attr("disabled", false)
                                        studentTable.deleteRow(row.rowID)
                                    }).append($("<i/>").addClass("material-icons").html("delete")))
                                    .append(sel)*/

                let studentTable = new Table(this.container, [{}], {
                    preferInject: false,
                    idKey: "id",
                    ignoredKeys: ["id"],
                    inject: (row, callback) => {
                        let autoID = "__AUTOCOMPLETE_" + utils.uuidv4()
                        this._periodDom(studentTable, row.rowID, scheduleConfig.periods).then((perDom) => {
                            return callback([
                                {
                                    column: "Period",
                                    strictColumn: true,
                                    dom: perDom

                                }, {
                                    column: "Location",
                                    strictColumn: true,
                                    dom: $("<span/>")
                                        /*.append($("<a/>").addClass("waves-effect waves-light btn").append($("<i/>").addClass("material-icons left").html("add")).html("Add Teacher").on("click", () => {

                                        }))*/
                                        .prepend($("<a/>").addClass("left btn-floating waves-effect waves-light").attr("data-location", false).css("transform", "translateY(0%)").on("click", (e) => {
                                            if($(e.currentTarget).attr("data-location") == "true") {
                                                //close
                                                
                                                //$("#" + this.addRowButtonID).attr("disabled", false)
                                                $("#" + autoID + "_DIV__").slideUp(500);
                                                $(e.currentTarget).siblings("p").slideDown(500)
                                                $(e.currentTarget).attr("data-location", false).css("transform", "translateY(0%)").find("i").html("add_location")
                                                this.checkValidity().catch(err => reject(err))
                                            } else {
                                                //open 
                                                
                                                $("#" + autoID + "_DIV__").slideDown(500);
                                                $(e.currentTarget).siblings("p").slideUp(500)
                                                $(e.currentTarget).attr("data-location", true).css("transform", "translateY(50%)").find("i").html("location_off")
                                                this.checkValidity().catch(err => reject(err))
                                            }
                                            
                                        }).append($("<i/>").addClass("material-icons").html("add_location")))
                                        .append($("<p/>").html(" &nbsp; No set location").css("transform", "translateY(50%)"))
                                        .append($("<div/>").addClass("input-field col s10").css("display", "none").attr("id", autoID + "_DIV__")
                                            .append($("<input/>").attr("type", "text").attr("id", autoID).addClass(this.autocompleteClass + " autocomplete").attr("data-autocomplete-period", null).on("keyup", (e) => {
                                                this.checkValidity().catch(err => reject(err))
                                            }))
                                            .append($("<label/>").attr("for", autoID).html("Search Teachers"))
                                        )
                                }
                            ])
                        })
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
                                  this.checkValidity().catch(err => reject(err))
                                },
                                minLength: 1, // The minimum length of the input for the autocomplete to start. Default: 1.
                            });
                        }).catch(err => reject(err))
                    }
                });

                studentTable.generate().then(() => {
                    //Import existing schedule
                    let schedule = allSchedules.studentType;
                    let initInject = []
                    if(schedule) {
                        let periods = Object.keys(schedule.schedule);
                        for(var x = 0; x < periods.length; x++) {
                            this._periodDom(studentTable, utils.uuidv4(), scheduleConfig.periods, periods[x]).then((sel) => {
                                initInject.push({Periods: $("<span/>").append(sel).html()});
                            })
                            if(x >= periods.length-1) {
                                // console.log(initInject)
                                studentTable.appendRow(initInject)
                            }
                        }
                    }
                    //create new row button
                    this.container.append($("<a/>").attr("id", this.addRowButtonID).addClass("waves-effect waves-light btn").append($("<i/>").addClass("material-icons left").html("add")).html("Add Period").on("click", () => {
                        $("#" + this.addRowButtonID).attr("disabled", true)
                        studentTable.appendRow([{}])
                    }))
                });


            }).catch(reject);
        })
    }
    _periodSelectElm(periods, selected) {
        return new Promise((resolve, reject) => {
            let sel = $("<select/>").addClass(this.periodSelectClass).on("change", () => {
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
    _periodDom(tableObject, rowID, periods, selected) {
        return new Promise((resolve, reject) => {
            this._periodSelectElm(periods).then((sel) => {
                return resolve($("<span/>")
                .prepend($("<a/>").addClass("left btn-floating waves-effect waves-light delete-row").css("transform", "translateY(50%)").on("click", () => {
                    $("#" + this.addRowButtonID).attr("disabled", false)
                    tableObject.deleteRow(rowID)
                }).append($("<i/>").addClass("material-icons").html("delete")))
                .append(sel));
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
    checkValidity() {
        return new Promise((resolve, reject) => {
            let prom = [];
            prom.push(this._checkPeriodSelect());
            prom.push(this._checkLocation());
            
            Promise.all(prom).then(([periodRes, locationRes]) => {
                console.log(locationRes)
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
}

module.exports = StudentScheduleEditor;


//STUDENT TEST CODE 
/*//Table Gen
                    let autocompleteClass = "__SCHEDULE_AUTOCOMPLETE_" + utils.uuidv4() + "__";
                    let studentTable = new Table(this.container, tableArray, {
                        inject: (row, callback) => {
                            let autoID = "__AUTOCOMPLETE_" + utils.uuidv4()
                            let enabledID = "__ACTIONS_ENABLED_" + utils.uuidv4()
                            let enabledTeacherID = "__ACTIONS_ENABLED_TEACHER_" + utils.uuidv4()
                            return callback([
                                {
                                    column: "Teacher", 
                                    strictColumn: true, 
                                    dom: $("<span/>").append(
                                        $("<input/>").attr("type", "text").attr("id", autoID).addClass(autocompleteClass + " autocomplete").attr("data-autocomplete-period", row.shownData.Periods.toLowerCase())
                                    ).append(
                                        $("<label/>").attr("for", autoID).html("Search Teachers")
                                    )
                                },
                                {
                                    column: "Actions", 
                                    strictColumn: true,
                                    dom: $("<span/>").append(
                                        $("<input/>").attr("type", "checkbox").addClass("filled-in").attr("data-action-enabled-period", row.shownData.Periods.toLowerCase()).attr("id", enabledID).attr("checked", "checked").attr("onclick", "")
                                    ).append(
                                        $("<label/>").attr("for", enabledID).html("Period Enabled")
                                    ).append($("<br/>")).append(
                                        $("<input/>").attr("type", "checkbox").addClass("filled-in").attr("data-action-enabled-teacher-period", row.shownData.Periods.toLowerCase()).attr("id", enabledTeacherID).attr("checked", "checked")
                                    ).append(
                                        $("<label/>").attr("for", enabledTeacherID).html("Have Teacher")
                                    )
                                }
                            ])
                        }
                    })
                    studentTable.generate().then(() => {
                        console.log("done");

                        $('input.'+autocompleteClass).autocomplete({
                            data: {
                              "Apple": null,
                              "Microsoft": null,
                              "Google": 'https://placehold.it/250x250'
                            },
                            limit: 5, // The max amount of results that can be shown at once. Default: Infinity.
                            onAutocomplete: function(val) {
                              // Callback function when value is autcompleted.
                            },
                            minLength: 1, // The minimum length of the input for the autocomplete to start. Default: 1.
                        });
        
                    }).catch(reject)*/