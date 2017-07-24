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
var config = require('config');
var router = express.Router();
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
var checkAuth = require('connect-ensure-login');
var ssarv = require('ssarv');

router.get('/', checkAuth.ensureLoggedIn('/auth/login'), ssarv(["teacher", "counselor", "lc", "dev", "admin"], {locationOfRoles: "user.userGroup", failureRedirect: "/"}), function(req, res, next) {
    var user = {}
    user.name = req.user.name;
    user.email = req.user.email;
    user.id = req.user.id;
    res.render('teacher/index', { doc_Title: 'Passport-Teacher', user, passportVersion: process.env.npm_package_version, currentYear: new Date().getFullYear()});
});

module.exports = router;
