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
var router = express.Router();
var r = require("rethinkdb");
var config = require("config");
var utils = require("../modules/passport-utils/index.js");

/*
var httpv = require('http').Server(router);
var io = require('socket.io')(httpv);
*/
//var r = require('../modules/db/index.js')();
var passport = require("passport");
//  , LocalStrategy = require('passport-local').Strategy;

let customHead = null;
if(config.has("webInterface.customHeadCode") && typeof config.get("webInterface.customHeadCode") === "string") {
    customHead = config.get("webInterface.customHeadCode");
}


/** 
  Google Login
**/
//utils.rateLimit.publicApiBruteforce.prevent,
router.get("/google/", function googleOAuth2(req, res, next) {
    //req.session.permissionKey = req.query.pk;
    if(req.query.dscm) {
        req.session.googleDSCM = true;
    } else {
        req.session.googleDSCM = false;
    }

    
    next();
}, function(req, res, next) {
    var prom = null;
    if(req.query.failGoogle) {
        prom = "select_account";
    }
    passport.authenticate("google", { scope: 
    [ "profile", "email" ],
    prompt: prom}
    )(req, res, function(err) {
        if(err) {
            return next(err);
        }
        return next();
    });
});

/*
router.get('/google/dscm', function (req, res, next) {
    //req.session.permissionKey = req.query.pk;
    req.session.googleDSCM = true;
    next();
}, passport.authenticate('google', { scope: 
    [ "profile", "email" ] }
));*/

//'https://www.googleapis.com/auth/plus.profile.emails.read'
//utils.rateLimit.publicApiBruteforce.prevent,
router.get("/login", function(req, res, next) {
    var msg = null;
    if(req.query.msgHead || req.query.msg) {
        msg = {
            head: req.query.msgHead,
            body: req.query.msg
        };
    }

    var notif = req.query.notif;
    var googleQuery = "";
  
    if(req.query.failGoogle) {
        googleQuery += "&failGoogle=true";
    }
  
    //check user agent and browser support 
    utils.getBrowserSupport(req.headers["user-agent"]).then((sB) => {
        console.log(sB);
        if(sB.untested) {
            var templateBs = {};
            templateBs.head = "Your browser is untested!";
            templateBs.message = "You may experience broken features or layout bugs.";
            templateBs.browser = sB.ua.browser;
        } else if(sB.outdated) {
            var templateBs = {};
            templateBs.head = "Your browser is outdated!";
            templateBs.message = "Your browser is older than the minimum supported version. <br> You may experience broken features or layout bugs.  <br>  We highly encourage updating your browser.";
            templateBs.browser = sB.ua.browser;
        }
        res.render("auth/login", { doc_Title: "Login -- Passport", customHead: customHead, browserSupport: templateBs, message: msg, notification: notif, googleQuery: googleQuery});
    }).catch((err) => {
        console.log(err);
        notif = "Unable to detect browser. Proceed with caution";
        res.render("auth/login", { doc_Title: "Login -- Passport", message: msg, customHead: customHead, notification: notif, googleQuery: googleQuery});
    });
});




//et signup
//utils.rateLimit.publicApiBruteforce.prevent,
router.get("/signup/", function(req, res, next) {
    var msg = null;
    let customHead = null;
    if(config.has("webInterface.customHeadCode") && typeof config.get("webInterface.customHeadCode") === "string") {
        customHead = config.get("webInterface.customHeadCode");
    }
    res.render("auth/signup", { doc_Title: "Signup -- Passport", customHead: customHead, message: msg});
});



//utils.rateLimit.publicApiBruteforce.prevent,
router.get("/logout", function(req, res, next){
    //req.logout();

    if(!config.get("misc.storeSessionToDisc")) {
        req.session = null;
        req.logout();
        res.redirect("/auth/login");
    } else {
        req.session.destroy(function (err) {
            if(err) {
                return next(err);
            }
            res.redirect("/auth/login"); 
        });
    }
    //res.redirect('/auth/login');
});






module.exports = router;
