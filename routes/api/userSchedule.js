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

/**
* @module api/userSchedule
*/

var express = require("express");
var router = express.Router();
var cors = require('cors');
var passport = require("passport")
let userScheduleJS = require("../../modules/passport-api/userSchedules.js");



router.use(cors());
router.options('*', cors())



/** GETs All account schedule types for an account
    * If you dont give an ID, the user in the JWT will be assumed.
    * @link module:api/userSchedule
    * @function 
    * @param {request} req
    * @param {response} res
    * @param {nextCallback} next
    * @api GET /api/account/schedule/{:id}
    * @apiparam {string} id - A user's ID.
    * @apiresponse {json} Returns the schedule
    * @returns {callback} - See: {@link #params-params-nextCallback|<a href="#params-nextCallback">Callback Definition</a>} 
*/
router.get(['/schedule', '/schedule/:id/'], passport.authenticate('jwt', { session: false}), function getAllSchedules(req, res, next) {
    if(!req.params.id) {
        req.params.id = req.user.id;
    }
    var prom = [];

    prom.push(new Promise(function(resolve, reject) {
        userScheduleJS.getStudentSchedule(req.params.id, function(err, data) {
            if(err && err.status != 404) {
                return reject(err);
            }
            
            return resolve(data)
        })
    }))

    prom.push(new Promise(function(resolve, reject) {
        userScheduleJS.getTeacherSchedule(req.params.id, function(err, data) {
            if(err && err.status != 404) {
                return reject(err);
            }
            
            return resolve(data)
        })
    }))

    Promise.all(prom).then(function(arr) {
        res.json({studentType: arr[0], teacherType: arr[1]});
    }).catch(function(err) {
        return next(err)
    });
});

module.exports = router;