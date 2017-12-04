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
    }
    generate() {
        return new Promise((resolve, reject) => {
            let prom = [];
            prom.push(miscAPI.getScheduleConfig());
            prom.push(scheduleAPI.getSchedules(this.options.accountID))
            Promise.all(prom).then(([scheduleConfig, allSchedules]) => {
                console.log(scheduleConfig, allSchedules);
                if(this.type == "student") {
                    let schedule = allSchedules.studentType;
                    //data mapping 
                    let tableArray = scheduleConfig.periods.map((per) => {
                        return {Periods: per.toUpperCase()}
                    })
                    console.log(tableArray)
                    //Table Gen
                    let autocompleteClass = "__SCHEDULE_AUTOCOMPLETE_" + utils.uuidv4() + "__";
                    let studentTable = new Table(this.container, tableArray, {
                        inject: (row, callback) => {
                            let autoID = "__AUTOCOMPLETE_" + utils.uuidv4()
                            return callback([
                                {
                                    column: "Teacher", 
                                    strictColumn: true, 
                                    dom: $("<span/>").append(
                                        $("<input/>").attr("type", "text").attr("id", autoID).addClass(autocompleteClass).attr("data-period", row.shownData.Periods.toLowerCase())
                                    ).append(
                                        $("<label/>").attr("for", autoID).html("Search Teachers")
                                    )
                                }
                            ])
                        }
                    })
                    studentTable.generate().then(() => console.log("done")).catch(reject)
                }
            }).catch(reject);
        })
    }
}

module.exports = ScheduleEditor;