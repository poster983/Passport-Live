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
var miscAPI = require("../api/misc.js");
var utils = require("../utils/index.js");

class ScheduleEditor {
    constructor(formOutputContainer, isTeacher, options) {
        this.container = formOutputContainer;
        if(!options) {options = {}}
        this.options = options;
        if(isTeacher) {this.type = "teacher"} else {this.type = "student"}
        this.periodSelectClass = "__PERIOD_SELECT_" + utils.uuidv4() + "__";
        this.autocompleteClass = "__SCHEDULE_AUTOCOMPLETE_" + utils.uuidv4() + "__";
        this.addRowButtonID = "__ADD_ROW_PERIOD_" + utils.uuidv4() + "__";
    }
    generate() {
        return new Promise((resolve, reject) => {
            let prom = [];
            prom.push(miscAPI.getScheduleConfig());
            prom.push(scheduleAPI.getSchedules(this.options.accountID));
            Promise.all(prom).then(([scheduleConfig, allSchedules]) => {
                //console.log(scheduleConfig, allSchedules);
                if(this.type == "student") {
                    let schedule = allSchedules.studentType;
                    //data mapping 
                    /*let tableArray = scheduleConfig.periods.map((per) => {
                        return {Periods: per.toUpperCase(), Location: ""}
                    })*/
                    //console.log(tableArray)

                    
                    let studentTable = new Table(this.container, [{Period: " ", Location: "dkslfjafkjsdklafjlkasdjfasjdflk"}], {
                        inject: (row, callback) => {
                            let autoID = "__AUTOCOMPLETE_" + utils.uuidv4()
                            this._periodSelectElm(scheduleConfig.periods).then((sel) => {
                                return callback([
                                    {
                                        column: "Period",
                                        strictColumn: true,
                                        dom: $("<span/>")
                                        .prepend($("<a/>").addClass("left btn-floating waves-effect waves-light delete-row").css("transform", "translateY(50%)").on("click", () => {
                                            $("#" + this.addRowButtonID).attr("disabled", false)
                                            studentTable.deleteRow(row.rowID)
                                        }).append($("<i/>").addClass("material-icons").html("delete")))
                                        .append(sel)
                                    }, {
                                        column: "Location",
                                        strictColumn: true,
                                        dom: $("<span/>")
                                            /*.append($("<a/>").addClass("waves-effect waves-light btn").append($("<i/>").addClass("material-icons left").html("add")).html("Add Teacher").on("click", () => {

                                            }))*/
                                            .prepend($("<a/>").addClass("left btn-floating waves-effect waves-light").attr("data-location", false).css("transform", "translateY(0%)").on("click", (e) => {
                                                if($(e.currentTarget).attr("data-location") == "true") {
                                                    //close
                                                    $("#" + this.addRowButtonID).attr("disabled", false)
                                                    $("#" + autoID + "_DIV__").slideUp(500);
                                                    $(e.currentTarget).siblings("p").slideDown(500)
                                                    $(e.currentTarget).attr("data-location", false).css("transform", "translateY(0%)").find("i").html("add_location")
                                                } else {
                                                    //open 
                                                    $("#" + this.addRowButtonID).attr("disabled", true)
                                                    $("#" + autoID + "_DIV__").slideDown(500);
                                                    $(e.currentTarget).siblings("p").slideUp(500)
                                                    $(e.currentTarget).attr("data-location", true).css("transform", "translateY(50%)").find("i").html("location_off")
                                                }
                                                
                                            }).append($("<i/>").addClass("material-icons").html("add_location")))
                                            .append($("<p/>").html("  No set location").css("transform", "translateY(50%)"))
                                            .append($("<div/>").addClass("input-field col s10").css("display", "none").attr("id", autoID + "_DIV__")
                                                .append($("<input/>").attr("type", "text").attr("id", autoID).addClass(this.autocompleteClass + " autocomplete").attr("data-autocomplete-period", null))
                                                .append($("<label/>").attr("for", autoID).html("Search Teachers"))
                                            )
                                    }
                                ])
                            })
                        },
                        afterGenerate: () => {
                            //INIT SELECT
                            $('select').material_select();
                        }
                    });
                    studentTable.generate().then(() => {
                        //create new row button
                        this.container.append($("<a/>").attr("id", this.addRowButtonID).addClass("waves-effect waves-light btn").append($("<i/>").addClass("material-icons left").html("add")).html("Add Period").on("click", () => {
                            $("#" + this.addRowButtonID).attr("disabled", true)
                            studentTable.appendRow([{}])
                        }))

                        this._periodSelectElm(scheduleConfig.periods).then((sel) => {
                            //
                        })
                    });
                }
            }).catch(reject);
        })
    }
    _periodSelectElm(periods, selected) {
        return new Promise((resolve, reject) => {
            let sel = $("<select/>").addClass(this.periodSelectClass).on("change", () => {
                this._allSelectPeriodUnlockAdd();
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

    //checks every 
    _allSelectPeriodUnlockAdd() {
        let sel = $("select." + this.periodSelectClass);
        let prevVal = []
        for(let x = 0; x < sel.length; x++) {
            /*console.log(sel[x])
            console.log($(sel[x]).parentsUntil("td").find("a.delete-row").find("i"))*/
            if(prevVal.includes(sel[x].value)){
                $("#" + this.addRowButtonID).attr("disabled", true);
                $(sel[x]).parentsUntil("td").find("a.delete-row").addClass("pulse red").fadeIn(1000);
                $(sel[x]).parentsUntil("td").find("a.delete-row").find("i").html("error_outline");
                return false;
            } else {
                $(sel[x]).parentsUntil("td").find("a.delete-row").removeClass("pulse red")
                $(sel[x]).parentsUntil("td").find("a.delete-row").find("i").html("delete");
            }
            prevVal.push(sel[x].value)
            if(sel[x].value.length < 1) {
                $("#" + this.addRowButtonID).attr("disabled", true);
                $(sel[x]).parentsUntil("td").find("a.delete-row").addClass("pulse red").fadeIn(1000);
                $(sel[x]).parentsUntil("td").find("a.delete-row").find("i").html("error_outline")
                return false;
            } else {
                $(sel[x]).parentsUntil("td").find("a.delete-row").removeClass("pulse red")
                $(sel[x]).parentsUntil("td").find("a.delete-row").find("i").html("delete")
            }
            if (x >= sel.length-1) {
                $("#" + this.addRowButtonID).attr("disabled", false);
                return true;
            }
        }
    }
    _checkStudentLocation() {
        let sel = $("input." + this.autocompleteClass);
        for(let x = 0; x < sel.length; x++) {
            
        }
    }
}

module.exports = ScheduleEditor;


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