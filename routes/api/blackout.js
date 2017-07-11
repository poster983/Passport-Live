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

router.post('/', function(req, res, next) {
    var day = req.body.day;
    var periods = req.body.periods;
    var userId = req.body.userId;
    var message = req.body.message;

    api.newBlackout(day, periods, userId, message, function(err, trans) {
        if (err) {
            return next(err);
        }
        res.status(201).json(trans);
    }) 
})

//select by USER ID 
router.get('/:userId', function(req, res, next) {
    api.getBlackoutByUserId(req.params.userId, function(err, doc) {
        if(err) {
            return next(err);
        }
        res.json(doc);
    })
})

//select by USER ID AND Day
router.get('/:userId/:day', function(req, res, next) {
    //
})

module.exports = router;