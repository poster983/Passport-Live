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

//TODO: INCLUDE IN INDEX.JS
/** 
* @module passportAccountsApi
*/
var r = require('rethinkdb');
var db = require('../../modules/db/index.js');
//DASHBOARDS//

exports.getSchedulesForStudentDash = function(id, done) {
    r.table("accounts").get(id).run(db.conn(), function(err, data) {
        if(err) {
            return done(err);
        }
        var studentPeriodDatadata = data.groupFields.student.periodSchedule
        var periodKeys = Object.keys(studentPeriodDatadata);
        for(var i = 0; i < periodKeys.length; i++) {
            var errs = null;
            var currPer = studentPeriodDatadata[periodKeys[i]];
            if(currPer.hasOwnProperty("teacherID")) {
                //loop and get teacher 
                
                r.table("accounts").get(currPer.teacherID).pluck({'name': true, 'groupFields' : {'teacher': 'periodSchedule'}}).run(db.conn(), function(err, data) {
                    if(err) {
                        errs = err;
                       
                    }
                   console.log(data)
                });
            }

            if(i >= periodKeys.length -1 ) {
                return done(errs, "hi")
            }
        }
        //return done(null, periodKeys)
    })
}