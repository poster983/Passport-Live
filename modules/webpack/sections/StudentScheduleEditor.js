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
/**
* Class that Generates a Schedule editor for students.
* @class 
* @param {Object} formOutputContainer - Where to put the scheduele editor.
* @param {Object} [options] 
* @param {string} [options.accountID] - Specify what user to pull the existing schedule from. If undefined, the logged in user will be used.
* @param {function} [options.onChange] - Called whenever change occurs in the form. event passed to function.
*/
class StudentScheduleEditor {
    constructor(formOutputContainer, options) {
        this.container = $(formOutputContainer);
        if(!options) {options = {}}
        this.options = options;
        this.hasSchedule = false;
        this.periodSelectClass = "__PERIOD_SELECT_" + utils.uuidv4() + "__";
        this.autocompleteClass = "__SCHEDULE_AUTOCOMPLETE_" + utils.uuidv4() + "__";
        this.addRowButtonID = "__ADD_ROW_PERIOD_" + utils.uuidv4() + "__";
        this.autocompleteREGEX  = new RegExp(/( --- )+(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|\"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*\")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/)
    }
    /*Events*/

    clearContainer() {
        $(this.container).empty();
    }
    generate() {
        return new Promise((resolve, reject) => {
            this.clearContainer();
            let prom = [];
            prom.push(miscAPI.getScheduleConfig());
            prom.push(scheduleAPI.getSchedules(this.options.accountID));
            prom.push(accountAPI.getWithClasses());
            Promise.all(prom).then(([scheduleConfig, allSchedules, allClassAccounts]) => {
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
                                  this.checkValidity().catch(err => reject(err))
                                },
                                minLength: 1, // The minimum length of the input for the autocomplete to start. Default: 1.
                            });
                        }).catch(err => reject(err))
                    }
                });

                this.studentTable.generate().then(() => {
                    //Import existing schedule
                    let schedule = allSchedules.studentType;
                    if(schedule) {
                        this.hasSchedule = true;
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
            let locationIcon = "location_off";
            if(!locationValue) {
                locationValue = "";
                locationCSS = "none"; 
                buttonCSS = "block";
                locationIcon = "add_location"
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
                                    this.checkValidity().catch(err => reject(err))
                                } else {
                                    $("#" + autoID + "_DIV__").slideDown(500);
                                    $(e.currentTarget).siblings("p").slideUp(500)
                                    $(e.currentTarget).attr("data-location", true).css("transform", "translateY(50%)").find("i").html("location_off")
                                    if(typeof this.options.onChange === "function") {
                                        this.options.onChange(e);
                                    }
                                    this.checkValidity().catch(err => reject(err))
                                }
                                
                            }).append($("<i/>").addClass("material-icons").html(locationIcon)))
                            .append($("<p/>").html(" &nbsp; No set location").css("transform", "translateY(50%)").css("display", buttonCSS))
                            .append($("<div/>").addClass("input-field col s10").css("display", locationCSS).attr("id", autoID + "_DIV__")
                                .append($("<input/>").attr("type", "text").val(locationValue).attr("id", autoID).addClass(this.autocompleteClass + " autocomplete").on("keyup", (e) => {
                                    if(typeof this.options.onChange === "function") {
                                        this.options.onChange(e);
                                    }
                                    this.checkValidity().catch(err => reject(err))
                                }))
                                .append($("<label/>").attr("for", autoID).html("Search Teachers"))
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
    checkValidity() {
        return new Promise((resolve, reject) => {
            let prom = [];
            prom.push(this._checkPeriodSelect());
            prom.push(this._checkLocation());
            
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
    submit() {
        return new Promise((resolve, reject) => {
            this.checkValidity().then((validResp) => {
                if(validResp.valid) {
                    this._compileFormData().then((form) => {
                        if(this.hasSchedule) {
                            scheduleAPI.updateSchedule("student", form).then((res) => {return resolve({transaction: res, formData: form})}).catch((err) => {return reject(err)});
                        } else {
                            scheduleAPI.newSchedule("student", form).then((res) => {
                                this.hasSchedule = true;
                                return resolve({transaction: res, formData: form})
                            }).catch((err) => {return reject(err)});
                        }
                    }).catch((err) => {return reject(err)});
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