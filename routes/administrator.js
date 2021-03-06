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

router.get("/", checkAuth.ensureLoggedIn("/auth/login"), utils.dashboardPermission(["administrator"], {failRedirect: "/"}), utils.compileDashboardNav, function(req, res, next) {
    var user = {};
    user.name = req.user.name;
    user.email = req.user.email;
    user.id = req.user.id;

    let cards = {};
    /** Cards **/
    cards.userGroups = Object.keys(config.get("userGroups"));
    //sidebar
    req.sidenav.links = [
        "<li><a class=\"waves-effect active\" href=\"/administrator\"><i class=\"material-icons\">home</i>Home</a></li>",
        "<li><a class=\"waves-effect\" href=\"/account?referral=administrator\"><i class=\"material-icons\">account_circle</i>My Account</a></li>",
        "<li><a href=\"/administrator/import\" class=\"waves-effect\"><i class=\"material-icons\">backup</i>Import</a></li>"
    ];

    res.render("administrator/index", { doc_Title: "Passport-Administrator", customHead: customHead, user: user, cards: cards, sidenav: req.sidenav, passportVersion: process.env.npm_package_version, currentYear: new Date().getFullYear()});
});

router.get("/import", checkAuth.ensureLoggedIn("/auth/login"), utils.dashboardPermission(["administrator"], {failRedirect: "/"}), utils.compileDashboardNav, function(req, res, next) {
    var user = {};
    user.name = req.user.name;
    user.email = req.user.email;
    user.id = req.user.id;

    req.sidenav.links = [
        "<li><a class=\"waves-effect\" href=\"/administrator\"><i class=\"material-icons\">home</i>Home</a></li>",
        "<li><a class=\"waves-effect\" href=\"/account?referral=administrator\"><i class=\"material-icons\">account_circle</i>My Account</a></li>",
        "<li><a href=\"/administrator/import\" class=\"waves-effect active\"><i class=\"material-icons\">backup</i>Import</a></li>"
    ];
    res.render("administrator/import", { doc_Title: "Import -- Passport-Administrator", customHead: customHead, user: user, sidenav: req.sidenav, passportVersion: process.env.npm_package_version, currentYear: new Date().getFullYear()});
});


module.exports = router;
