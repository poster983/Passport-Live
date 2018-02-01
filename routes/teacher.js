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

var express = require("express");
var config = require("config");
var router = express.Router();
var checkAuth = require("connect-ensure-login");
var utils = require("../modules/passport-utils/index.js");

let customHead = null;
if(config.has("webInterface.customHeadCode") && typeof config.get("webInterface.customHeadCode") === "string") {
    customHead = config.get("webInterface.customHeadCode");
}

router.get("/", checkAuth.ensureLoggedIn("/auth/login"), utils.middlewarePermission(["teacher"], {failRedirect: "/"}), utils.compileDashboardNav, function(req, res, next) {
    var user = {};
    user.name = req.user.name;
    user.email = req.user.email;
    user.id = req.user.id;
    req.sidenav.links = [
        "<li><a class=\"waves-effect\" href=\"/teacher\"><i class=\"material-icons\">home</i>Home</a></li>",
        "<li><a class=\"waves-effect\" href=\"/account?referral=teacher\"><i class=\"material-icons\">account_circle</i>My Account</a></li>"
    ];

    res.render("teacher/index", { doc_Title: "Passport-Teacher", user, customHead: customHead, sidenav: req.sidenav, passportVersion: process.env.npm_package_version, currentYear: new Date().getFullYear()});
});


module.exports = router;
