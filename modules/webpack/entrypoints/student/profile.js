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
var ScheduleEditor = require("../../sections/StudentScheduleEditor.js");
var utils = require("../../utils/index.js");
var scheduleJS = require("../../api/schedule.js");
var unsavedWork = require("../../common/unsavedWork.js")


var scheduleEditor = null;
window.onload = function() {
    routeHash();
    console.log(utils.thisUser())
    
    $(".button-collapse").sideNav();
    $(window).stellar({
        responsive: true,
    });
    loadMySchedules();

    $("#settingsCard").find("input").on("change", settingNeedsSaving);
}



//Router
window.addEventListener("hashchange", routeHash);
function routeHash() {
    let hash = window.location.hash;
    console.log(hash)
    switch(hash) {
        case "#editSchedule": 
            utils.openPage("scheduleEditor");
            $("#mixenSESave").removeClass("disabled");
            initScheduleEditor();
            break;
        default: 
            $("#mixenSESave").addClass("disabled");
            utils.closePage("scheduleEditor");
    }
}


function initScheduleEditor() {
    if($("#editScheduleContainer").children().length <=0) {
        unsavedWork.button("#mixenSEBack", {
            onAction: () => {
                console.log("action")
            },
            onDiscard: () => {
                unsavedWork.reset("#mixenSEBack");
                scheduleEditor.clearContainer();
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
        scheduleEditor = new ScheduleEditor($("#editScheduleContainer"), {
            onChange: (e) => {
                console.log("changed")
                unsavedWork.changed("#mixenSEBack");
            }
        });
        genScheduleEditor();
    }
}

function genScheduleEditor() {
    scheduleEditor.generate().then(() => {
        $("#mixenSESave").on("click", (e) => {
            $("#mixenSESave").addClass("disabled");
            scheduleEditor.submit().then((resp) => {
                console.log(resp);
                if(resp.transaction && resp.transaction.unchanged >= 1) {
                    Materialize.toast('Nothing changed', 4000)
                    unsavedWork.saved("#mixenSEBack");
                    window.location.hash = "";
                } else {
                    Materialize.toast('Updated schedule', 4000)
                    unsavedWork.saved("#mixenSEBack");
                    loadMySchedules();
                    window.location.hash = "";
                    utils.materialResponse("check", "success")
                }
                
                
            }).catch((err) => {$("#mixenSESave").removeClass("disabled"); utils.throwError(err)})
        })
    }).catch(err => utils.throwError(err))
}
var idOfUser = utils.thisUser();




function loadMySchedules() {
scheduleJS.getSchedules(utils.thisUser()).then((data) => {
    data = data.studentType;
    if(data && data.schedule) {
        //clear area
        $("#scheduleBody").empty();
        //do stuff with schedule 
        console.log(data)
        var keys = Object.keys(data.schedule);
        for(var i = 0; i < keys.length; i++) {
          //set defaults 
          /*
          if(!data.schedule[keys[i]] || !data.schedule[keys[i]].className) {
            data.schedule = {
              [keys[i]]: {
                className: undefined
              }
            }
          }*/
          if(data.schedule[keys[i]]) {
            var tr = document.createElement("TR");
            //create elements
            var idEl = document.createElement("TD");
            var idElText = document.createTextNode(keys[i].charAt(0).toUpperCase() + keys[i].slice(1));

            var classEl = document.createElement("TD");
            if(data.schedule[keys[i]] && data.schedule[keys[i]].className) {
              var classElText = document.createTextNode(data.schedule[keys[i]].className);
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
            if(data.schedule[keys[i]] && data.schedule[keys[i]].room) {
              var roomElText = document.createTextNode(data.schedule[keys[i]].room);
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
            $('#scheduleBody').append(tr);
          }
        }

      } else {
        err = new Error("Data is Undefined");
        err.status = 500;
        return errorHand(err);
      }
    }).catch((err) => {
        return utils.throwError(err);
    })
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
        Materialize.toast('THIS IS AN EASTER EGG!', 6000)
        setTimeout(function() {
            Materialize.toast('I need ideas!', 6000)
        }, 1000);
        console.log("TODO EASTER EGG")
    }
    
}