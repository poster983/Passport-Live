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
var StudentScheduleEditor = require("../../sections/StudentScheduleEditor.js");
var TeacherScheduleEditor = require("../../sections/TeacherScheduleEditor.js");
var utils = require("../../utils/index.js");
var scheduleJS = require("../../api/schedule.js");
var unsavedWork = require("../../common/unsavedWork.js")
var anime = require("animejs");
var Table = require("../../common/Table.js")

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
    new Caret($("#se-advancedOptionsCaret"), {content: $("#se-advancedOptionsDIV")});

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


/* SCHEDULE EDITOR */ 
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
                var err = new Error("Please click on the edit (pencil) button and add a teacher schedule.");
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



