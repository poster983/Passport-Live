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
var utils = require("../modules/passport-utils/index.js")
var accountJS = require("../modules/passport-api/accounts.js");
var securityJS = require("../modules/passport-api/security.js");
var url = require("url");
/*var r = require('rethinkdb');
var db = require('../modules/db/index.js');
var typeCheck = require("type-check").typeCheck;*/
var router = express.Router();


let customHead = null;
if(config.has("webInterface.customHeadCode") && typeof config.get("webInterface.customHeadCode") === "string") {
    customHead = config.get("webInterface.customHeadCode");
}
//this page will route each user to the correct page after login 
router.get("/", function(req, res, next) {
    if(req.user) {
        if(req.session.returnTo) {
            var url_parts = url.parse(req.session.returnTo, true);
            var query = Object.assign(url_parts.query, req.query);
            let str = Object.keys(query).length>0?"?" + utils.urlQuery(query):"";
            res.redirect(url_parts.pathname + str);
            delete req.session.returnTo;
        } else {
            var permittedDash = config.get("userGroups." + req.user.userGroup + ".permissions.dashboards");
            if(permittedDash.length > 1 && !req.query.continue) {
                res.render("multiDashRoute",{doc_Title: "Passport", customHead: customHead, dashboards: permittedDash});
            } else {
                let query = Object.keys(req.query).length>0?"?" + utils.urlQuery(req.query):"";
                res.redirect(permittedDash[0] + query);
            }
        }
    } else {
        console.log("not Logged In");
        //forward query params
        let query = Object.keys(req.query).length>0?"?" + utils.urlQuery(req.query):"";
        res.redirect("auth/login" + query);
    }
  
});


/*
router.post('/callback/multiDashRoute/', function(req, res, next) {

});*/



module.exports = router;
