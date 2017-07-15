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
    * Creates a new Pass from/for currently logged in account.
    * This one used the JWT to find the requester and migrator.  this only allows the signed in person to request a pass for themselves 
    * REQUIRES JWT Authorization in headers.
    * @todo Account must have student db permissions
    * @function newPassForMe
    * @async
    * @param {request} req
    * @param {response} res
    * @param {nextCallback} next
    * @api POST /api/passes/me/
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
router.post("/me", passport.authenticate('jwt', { session: false}), function newPassForMe(req, res, next) {
    var fromPerson = req.body.fromPerson;
    var toPerson = req.body.toPerson;
    var migrator = req.user.id;
    var period = req.body.period;
    var date = req.body.date;

    api.newPass(toPerson, fromPerson, migrator, migrator, period, date, function(err, trans) {
        if(err) {
            return next(err);
        }
        res.status(201).json(trans);
    })
});
/**
    * Gets all Passes from a day from/for currently logged in account.
    * REQUIRES JWT Authorization in headers.
    * @todo Account must have student db permissions
    * @function getPassForMeFromDay
    * @async
    * @param {request} req
    * @param {response} res
    * @param {nextCallback} next
    * @apiparam {string} idCol - Where to search for the id.  Possible values: "fromPerson", "toPerson", "migrator", "requester"
    * @apiparam {date} fromDay - Begining of the search range
    * @api GET /api/passes/me/from/:fromDay/
    * @apiresponse {json} Returns rethink db action summery
    */
router.get("/me/by/:idCol/from/:fromDay", passport.authenticate('jwt', { session: false}), function getPassForMeFromDay(req, res, next) {
    //res.sendStatus(501);
    var fromDay = req.params.fromDay;
    var idCol = req.params.idCol;

    api.flexableGetPasses(req.user.id, idCol, fromDay, function(err, data) {
        if(err) {
            return next(err);
        }
        res.send(data);
    })
});

/**
    * Gets all Passes from a day to a day from/for currently logged in account.
    * REQUIRES JWT Authorization in headers.
    * @todo Account must have student db permissions
    * @function getPassForMeFromToDay
    * @async
    * @param {request} req
    * @param {response} res
    * @param {nextCallback} next
    * @apiparam {string} idCol - Where to search for the id.  Possible values: "fromPerson", "toPerson", "migrator", "requester"
    * @apiparam {date} fromDay - Begining of the search range
    * @apiparam {date} toDay - End of the search range
    * @api GET /api/passes/me/from/:fromDay/to/:toDay
    * @apiresponse {json} Returns rethink db action summery
    */
router.get("/me/by/:idCol/from/:fromDay/to/:toDay", passport.authenticate('jwt', { session: false}), function getPassForMeFromToDay(req, res, next) {
    res.sendStatus(501);
});


module.exports = router;