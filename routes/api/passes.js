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
* @module passRESTApi
*/

var express = require("express");
var router = express.Router();
var r = require("../../modules/db/index.js");
var cors = require('cors');
var utils = require("../../modules/passport-utils/index.js");
var api = require("../../modules/passport-api/passes.js");
var passport = require("passport");
var config = require("config");

router.use(cors());
router.options('*', cors())

function serializeUser(req, res, done) {
    console.log(req.user[0]);
    //REMOVE SECRET INFO LIKE PASSWORDS
    //delete req.user[0].password;
    //req.user = req.user[0];
    req.user = utils.cleanUser(req.user);
    done();
};

/**
    * Creates a new Pass from/for the student dashboard.
    * REQUIRES JWT Authorization in headers.
    * @todo Account must have student db permissions
    * @function newPassStudent
    * @async
    * @param {request} req
    * @param {response} res
    * @param {nextCallback} next
    * @api POST /api/passes/dashboard/student/
    * @apibody {json} See Example
    * @example
    * <caption>Body Structure (application/json): </caption>
    * {
    *    "fromPerson": (id Of Account)
    *    "toPerson": (id Of Account)
    *    "migrator"; (id of account)
    *    "period": (a period constant)
    *    "date": (an date in iso standered)
    * }
    *
    * @apiresponse {json} Returns rethink db action summery
    */
router.post("/dashboard/student/", passport.authenticate('jwt', { session: false}), function newPassStudent(req, res, next) {
    var fromPerson = req.body.fromPerson;
    var toPerson = req.body.toPerson;
    var migrator = req.body.migrator;
    var period = req.body.period;
    var date = req.body.date;

    api.newPass(toPerson, fromPerson, migrator, migrator, period, date, function(err, trans) {
        if(err) {
            return next(err);
        }
        res.status(201).json(trans);
    })
});


module.exports = router;