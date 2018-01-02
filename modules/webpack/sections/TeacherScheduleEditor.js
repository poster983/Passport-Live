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
    }
    /*Events*/

    clearContainer() {
        $(this.container).children().off();
        $(this.container).empty();
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
                    
                    /*if(allSchedules && allSchedules.teacherType) {
                        let schedule = allSchedules.teacherType;
                        let periods = Object.keys(schedule.schedule);
                        for(let x = 0; x < periods.length; x++) {
                            if(schedule.schedule[periods[x]]) {
                                this.teacherTable.appendRow([{}], (row, callback) => {
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
                    }*/
                    //create new row button
                    this.container.append($("<a/>").attr("id", this.addRowButtonID).addClass("waves-effect waves-light btn").append($("<i/>").addClass("material-icons left").html("add")).html("Add Period").on("click", () => {
                        $("#" + this.addRowButtonID).attr("disabled", true)
                        this.teacherTable.appendRow([{}])
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
            if(isTeachingValue) {
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
                                this.checkValidity().catch(err => reject(err))
                            }).append($("<i/>").addClass("material-icons").html(classIcon)))
                            .append($("<p/>").html(" &nbsp; No class name").css("transform", "translateY(50%)").css("display", classPlaceHolderDisplay))
                            .append($("<div/>").addClass("input-field col s10").css("display", classCSS).attr("id", classNameID + "_DIV__")
                                .append($("<input/>").attr("type", "text").val(classValue).attr("id", classNameID).addClass(this.classNameClass).on("keyup", (e) => {
                                    if(typeof this.options.onChange === "function") {
                                        this.options.onChange(e);
                                    }
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
                                this.checkValidity().catch(err => reject(err))
                            }).append($("<i/>").addClass("material-icons").html(roomIcon)))
                            .append($("<p/>").html(" &nbsp; No Room").css("transform", "translateY(50%)").css("display", roomPlaceHolderDisplay))
                            .append($("<div/>").addClass("input-field col s10").css("display", roomCSS).attr("id", roomID + "_DIV__")
                                .append($("<input/>").attr("type", "text").val(roomValue).attr("id", roomID).addClass(this.roomClass).on("keyup", (e) => {
                                    if(typeof this.options.onChange === "function") {
                                        this.options.onChange(e);
                                    }
                                    this.checkValidity().catch(err => reject(err));
                                })).append($("<label/>").addClass(roomLabelCSS).attr("for", roomID).html("Class name"))
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
                                this.checkValidity().catch(err => reject(err))
                            }).append($("<i/>").addClass("material-icons").html(limitIcon)))
                            .append($("<p/>").html(" &nbsp; No Limit").css("transform", "translateY(50%)").css("display", limitPlaceHolderDisplay))
                            .append($("<div/>").addClass("input-field col s10").css("display", limitCSS).attr("id", limitID + "_DIV__")
                                .append($("<input/>").attr("type", "text").val(limitValue).attr("id", limitID).addClass(this.limitClass).on("keyup", (e) => {
                                    if(typeof this.options.onChange === "function") {
                                        this.options.onChange(e);
                                    }
                                    this.checkValidity().catch(err => reject(err));
                                })).append($("<label/>").addClass(limitLabelCSS).attr("for", limitID).html("Period Limit"))
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
                                    this.checkValidity().catch(err => reject(err))
                                })
                                .append($("<span/>").addClass("lever"))
                                .append("Teaching")
                            )))
                    }
                    /*{
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
                    }*/
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
            if(this.teacherTable.getTableBody().children().length < 1) {
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
            let tableBody = this.teacherTable.getTableBody().children();
            console.log(this.teacherTable.getTableBody());
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

module.exports = TeacherScheduleEditor;