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
let accountScheduleJS = require("../../modules/passport-api/accountSchedule.js");



router.use(cors());
router.options('*', cors())



/** GETs All account schedule types for an account
    * If you dont give an ID, the user in the JWT will be assumed.
    * @link module:api/userSchedule
    * @function getAllSchedules
    * @param {request} req
    * @param {response} res
    * @param {nextCallback} next
    * @api GET /api/account/schedule/[:id]
    * @apiparam {string} [id] - A user's ID.
    * @apiresponse {Object} student schedule is in "studentType" and teacher is in "teacherType"
    * @returns {callback} - See: {@link #params-params-nextCallback|<a href="#params-nextCallback">Callback Definition</a>} 
*/
router.get(['/', '/:id/'], passport.authenticate('jwt', { session: false}), function getAllSchedules(req, res, next) {
    if(!req.params.id) {
        req.params.id = req.user.id;
    }
    var prom = [];

    prom.push(new Promise(function(resolve, reject) {
        return accountScheduleJS.getStudentSchedule(req.params.id).then(resolve).catch((err) => {
            if(err && err.status != 404) {
                return reject(err);
            } 
            return resolve()
        })
    }))

    prom.push(new Promise(function(resolve, reject) {
        return accountScheduleJS.getTeacherSchedule(req.params.id).then(resolve).catch((err) => {
            if(err && err.status != 404) {
                return reject(err);
            } 
            return resolve()
        })
    }))

    Promise.all(prom).then(function(arr) {
        res.json({studentType: arr[0], teacherType: arr[1]});
    }).catch(function(err) {
        return next(err)
    });
});


/** Sets a user schedule for a dashboard
    * @function setUserSchedule
    * @link module:api/userSchedule
    * @param {request} req
    * @param {response} res
    * @param {nextCallback} next
    * @api POST /api/account/schedule/:dashboard
    * @apiparam {string} dashboard - The dashboard this is referring to (student, teacher)
    * @apiresponse {json} Returns rethinkDB action summery
    * @example 
    * <caption>Body Structure For Student Dashboard (application/json): </caption>
    * {
    *    "<periodConst>": {  //
    *       "teacherID": 1367081a-63d7-48cf-a9ac-a6b47a851b13 || null //an ID present means that it will link to that user,  null means that there is no teacher for that period.
    *   },
    *    "<periodConst>": null //this means that the period is dissabled and won't be returned
    * }
    * @returns {callback} - See: {@link #params-params-nextCallback|<a href="#params-nextCallback">Callback Definition</a>} 
*/

router.post("/:dashboard", passport.authenticate('jwt', { session: false}), function setUserSchedule(req, res, next) {
    var dashboard = req.params.dashboard;
    var schedule = req.body;
    //console.log(dashboard)
    accountScheduleJS.new(req.user.id, dashboard, schedule).then((data) => {
        res.send(data)
    }).catch((err) => {return next(err)})
});
/** Updates the user's schedule for a dashboard
    * @function updateUserSchedule
    * @link module:api/userSchedule
    * @param {request} req
    * @param {response} res
    * @param {nextCallback} next
    * @api PATCH /api/account/schedule/:dashboard
    * @apiparam {string} dashboard - The dashboard this is referring to (student, teacher)
    * @apiresponse {json} Returns rethinkDB action summery
    * @example 
    * <caption>Body Structure For Student Dashboard (application/json): </caption>
    * {
    *    "<periodConst>": {  //
    *       "teacherID": 1367081a-63d7-48cf-a9ac-a6b47a851b13 || null //an ID present means that it will link to that user,  null means that there is no teacher for that period.
    *   },
    *    "<periodConst>": null //this means that the period is dissabled and won't be returned
    * }
    * @returns {callback} - See: {@link #params-params-nextCallback|<a href="#params-nextCallback">Callback Definition</a>} 
*/
router.patch("/:dashboard", passport.authenticate('jwt', { session: false}), function updateUserSchedule(req, res, next) {
    var dashboard = req.params.dashboard;
    var schedule = req.body;
    //console.log(dashboard)
    accountScheduleJS.update(req.user.id, dashboard, schedule).then((data) => {
        res.send(data)
    }).catch((err) => {return next(err)})
});

/** Creates or Replaces the user's schedule for a dashboard
    * @function updateUserSchedule
    * @link module:api/userSchedule
    * @param {request} req
    * @param {response} res
    * @param {nextCallback} next
    * @api PUT /api/account/schedule/:dashboard
    * @apiparam {string} dashboard - The dashboard this is referring to (student, teacher)
    * @apiresponse {json} Returns rethinkDB action summery
    * @apibody {module:js/userSchedule#studentSchedule}
    * @returns {callback} - See: {@link #params-params-nextCallback|<a href="#params-nextCallback">Callback Definition</a>} 
*/
router.put("/:dashboard", passport.authenticate('jwt', { session: false}), function updateUserSchedule(req, res, next) {
    var dashboard = req.params.dashboard;
    var schedule = req.body;
    //console.log(req.user)
    if(req.user.schedules && req.user.schedules[dashboard]) {
        accountScheduleJS.replace(req.user.id, dashboard, schedule).then((trans) => {
            //console.log(trans)
            res.json(trans)
        }).catch((err) => {return next(err);})
    } else {
        accountScheduleJS.newUserSchedule(req.user.id, dashboard, schedule).then((data) => {
            res.send(data)
        }).catch((err) => {return next(err)})
    }

});



/** GETs account schedules for student dash
    * @function getSchedulesForStudentDash
    * @link module:api/userSchedule
    * @param {request} req
    * @param {response} res
    * @param {nextCallback} next
    * @api GET /api/account/schedule/student/:id
    * @apiparam {string} id - A user's ID.
    * @apiresponse {json} Returns Joined data of the schedule
    * @returns {callback} - See: {@link #params-params-nextCallback|<a href="#params-nextCallback">Callback Definition</a>} 
    * @todo Auth
*/
router.get('/student/id/:id/', passport.authenticate('jwt', { session: false}), function getSchedulesForStudentDash(req, res, next) {
    if(!req.params.id) {
        var err = new Error("ID Required");
        err.status = 400;
        return next(err)
    }
    accountScheduleJS.getStudentSchedule(req.params.id).then((data) => {
        res.send(data)
    }).catch((err) => {return next(err)})
});

/** GETs account schedules for teacher dash
    * @function getSchedulesForTeacherDash
    * @link module:api/userSchedule
    * @param {request} req
    * @param {response} res
    * @param {nextCallback} next
    * @api GET /api/account/schedule/teacher/:id
    * @apiparam {string} id - A user's ID.
    * @apiresponse {json} Returns the schedule
    * @returns {callback} - See: {@link #params-params-nextCallback|<a href="#params-nextCallback">Callback Definition</a>} 
*/
router.get('/teacher/id/:id/', passport.authenticate('jwt', { session: false}), function getSchedulesForTeacherDash(req, res, next) {
    if(!req.params.id) {
        var err = new Error("ID Required");
        err.status = 400;
        return next(err)
    }
    accountScheduleJS.getTeacherSchedule(req.params.id).then((data) => {
        res.send(data)
    }).catch((err) => {return next(err)})
});

module.exports = router;