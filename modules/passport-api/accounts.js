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
const util = require('util')
//DASHBOARDS//

exports.getSchedulesForStudentDash = function(id, done) {
    var promises = [];
    r.table("accounts").get(id).run(db.conn(), function(err, data) {
        if(err) {
            return done(err);
        }
        var studentPeriodDatadata = data.groupFields.student.periodSchedule
        var periodKeys = Object.keys(studentPeriodDatadata);
        for(var i = 0; i < periodKeys.length; i++) {
            var errs = null;
            var currPer = studentPeriodDatadata[periodKeys[i]];
            
            if(currPer.hasOwnProperty("teacherID") && currPer.teacherID) {
                //loop and get teacher 
                console.log(currPer.teacherID)
                //make promice
                promises.push(r.table("accounts").get(currPer.teacherID).pluck({'name': true, 'groupFields': true}).run(db.conn()))
            }

        }
    //Resolve Promices//
        Promise.all(promises).then(function(tDoc){
            console.log("PeriodKeys")
            console.log(periodKeys)
            //for length of student
            for(var i = 0; i < periodKeys.length; i++) {
                //check if teacher has same periods as student 
                if(teacherPeriodData.hasOwnProperty(periodKeys[i])) {

                }
            }
            var teacherPeriodData = tDoc.groupFields.teacher.periodSchedule;
            
            console.log(teacherPeriodData);
            //check if both have assigned the same periods 
            if(teacherPeriodData.hasOwnProperty(periodKeys[i])) {
                //console.log(periodKeys[i])
                console.log(tDoc)
                console.log(studentPeriodDatadata)
                //add teacher data to student doc
                //studentPeriodDatadata[periodKeys[i]] = teacherPeriodData[periodKeys[i]];
            } else {
                err = new Error("Teacher does not have \"" + periodKeys[i] + "\" period definned");
                err.status = 412;
                errs= err;
            }

        },function(err) {
            if(err) {
                return done(err);
            }
        })
    })
}

/*
exports.getSchedulesForStudentDash = function(id, done) {
    r.table("accounts").get(id).eqJoin(r.row('groupFields')('student')('periodSchedule')('a')('teacherID'), r.table("accounts")).zip().run(db.conn(), function(err, data) {
        if(err) {
            return done(err);
        }
        return done(null, data)
        })*/
}