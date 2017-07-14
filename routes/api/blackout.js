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
* @module blackoutRESTAPI
*/
var express = require('express');
var router = express.Router();
var passport = require('passport');
var cors = require('cors');
var config = require('config');
var api = require('../../modules/passport-api/blackout.js');

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
    * Returns all blackouts by the user ID
    * @function newBlackout
    * @api POST /api/blackout/
    * @apiparam {userGroup} userGroup - A Usergroup constant defined in the config
    * @apibody {none}
    * @example 
    * <caption>Body Structure (application/json): </caption>
    * {
    *    "date": "2017-07-11",
    *    "periods": ["a", "b". "c"],
    *    "userId": "1fgsdfdsg879f6f879d79f98d7g8",
    *    "message": "I am sick."
    * }
    */
router.post('/', function newBlackout(req, res, next) {
    var date = req.body.date;
    var periods = req.body.periods;
    var userId = req.body.userId;
    var message = req.body.message;

    api.newBlackout(date, periods, userId, message, function(err, trans) {
        if (err) {
            return next(err);
        }
        res.status(201).json(trans);
    }) 
})

/**
    * Returns all blackouts by the user ID
    * @function getBlackoutByUserId
    * @api POST /api/blackout/user/:userId
    * @apiparam {string} userId - The ID corresponding to an account 
    * @returns {json} - blackout row
    */
router.get('/user/:userId', function getBlackoutByUserId(req, res, next) {
    api.getBlackoutByUserId(req.params.userId, function(err, doc) {
        if(err) {
            return next(err);
        }
        res.json(doc);
    })
})

/**
    * Returns all blackouts by the date
    * @function getBlackoutByDate
    * @api POST /api/blackout/date/:date
    * @apiparam {string} date - The date of the blackout
    * @returns {json} - blackout row
    */
router.get('/date/:date', function(req, res, next) {
    api.getBlackoutByDate(req.params.date, function(err, doc) {
        if (err) {
            return next(err);
        }
        res.json(doc);
    })
})

/**
    * Returns all blackouts by the user ID and date
    * @function getBlackoutByUserIdAndDate
    * @api POST /api/blackout/user/:userId/date/:date
    * @apiparam {string} userId - The ID corresponding to an account 
    * @apiparam {string} date - the date of the blackout
    * @returns {json} - blackout row
    */
router.get('/user/:userId/date/:date', function(req, res, next) {
    api.getBlackoutByUserIdAndDate(req.params.userId, req.params.date, function(err, doc) {
        if (err) {
            return next(err);
        }
        res.json(doc);
    })
})

module.exports = router;