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



//
/* GET Student page. */
router.get('/', checkAuth.ensureLoggedIn('/auth/login'), ssarv(["student", "dev", "admin"], {locationOfRoles: "user.userGroup", failureRedirect: "/"}), function(req, res, next) {

	enabledPassGroups = config.get('passGroups.enabledPassGroups');
	var passGroups = new Array();

	for (var i = 0, len = enabledPassGroups.length; i < len; i++) {
		/*
		if(config.get('passGroups.' + enabledPassGroups[i] + '.viewType') == "select") {

		}
		*/
		passGroups[i] = JSON.parse('{ "viewName":"' + config.get('passGroups.' + enabledPassGroups[i] + '.viewName') + '", "value": "' + config.get('passGroups.' + enabledPassGroups[i] + '.customGroupID') + '"}');
		
	}
    res.render('student/index', { doc_Title: 'Passport-Student', passGroups: passGroups});
});

module.exports = router;
