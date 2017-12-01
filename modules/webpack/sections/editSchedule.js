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

class ScheduleEditor {
    constructor(formOutputContainer, accountID, isTeacher, options) {
        this.container = formOutputContainer;
        this.accountID = accountID;
        if(isTeacher) {this.type = "teacher"} else {this.type = "student"}
    }
    generate() {
        return new Promise((resolve, reject) => {
            scheduleAPI.getSchedules(accountID).then((allSchedules) => {
                console.log(allSchedules);

            }).catch(reject);
        })
    }
}

module.exports = ScheduleEditor;