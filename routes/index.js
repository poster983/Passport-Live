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
var utils = require("../modules/passport-utils/index.js")
var accountJS = require('../modules/passport-api/accounts.js');
var securityJS = require('../modules/passport-api/security.js');
var r = require('rethinkdb');
var db = require('../modules/db/index.js');
var typeCheck = require("type-check").typeCheck;
var router = express.Router();

//this page will route each user to the correct page after login 
router.get('/', function(req, res, next) {
    
    if(req.user) {

        var permittedDash = config.get('userGroups.' + req.user.userGroup + '.permissions.dashboards');
        if(permittedDash.length > 1) {
            //callbackURL: "/callback/multiDashRoute/",
            res.render('multiDashRoute',{doc_Title: "Passport",  dashboards: permittedDash});
        } else {
            res.redirect(permittedDash[0]);
        }
        
    } else {
        console.log("not Logged In");
        res.redirect('auth/login');
    }
  
});

//RaTE LIMIT RATE LIMIT!!
//Account Activation
//localhost:3000/activate
router.get("/activate", function(req, res, next) {
  var permissionKey = req.query.key; //Activation Key (permission key)
  if(typeof permissionKey === "string") {
    securityJS.checkPermissionKeyValidity(securityJS.permissionKeyType.ACTIVATE_ACCOUNT, permissionKey).then((payload) => {
        //console.log(payload)
        if(!payload) {
            var err = new Error("Invalid Key");
            err.status = 400;
            return next(err);
        }
        
        if(!typeCheck("{params: {accountID: String}, ...}", payload)) {
            var err = new TypeError("Key Payload Malformed.  Expected \"params.accountID\" to be a String.");
            err.status = 500;
            return next(err);
        }
        
        accountJS.setVerification(payload.params.accountID, true).then((resp) => {
            if(resp && resp.replaced == 1) {
                //Success
                //Main Task done. Edit Timeout field
                securityJS.keyUsed(securityJS.permissionKeyType.ACTIVATE_ACCOUNT, permissionKey).then((trans) => {
                    //Check For Password Field.
                    db.dash().table("accounts").get(payload.params.accountID).hasFields("password").run().then((hasPass) => {
                        if(hasPass) {
                            //send to login page
                            res.redirect('/auth/login?notif=' + encodeURIComponent("Your Account Is Now Active!")); 
                        } else {
                            //MAKE PASSWORK RESET KEY AND SEND TO PASSWORD RESET PAGE!
                            res.redirect('/auth/login?notif=' + encodeURIComponent("RESET PASSWORD PAGE PLACEHOLDER")); 
                        }
                    }).catch((err)=>{return next(err)})
                }).catch((err) => {return next(err)})
                
                //res.send(resp)
            } else if(resp && resp.replaced > 1) {
                var err = new TypeError("An impossible error has just occurred. Please perform a reality check.");
                err.status = 500;
                return next(err);
            } else if(resp && resp.unchanged > 0) {
                //console.log(resp)
                securityJS.keyUsed(securityJS.permissionKeyType.ACTIVATE_ACCOUNT, permissionKey).catch((err) => {console.error(err, "Account Activation");});
                var err = new TypeError("User already Verified");
                err.status = 500;
                return next(err);
            } else {
                var err = new TypeError("User Not Found");
                err.status = 500;
                return next(err);
            }
        }).catch((err)=>{return next(err)})
    }).catch((err)=>{return next(err)});
  } else {
    res.redirect('/auth/login'); 
  }
})

/*
router.post('/callback/multiDashRoute/', function(req, res, next) {

});*/

router.get("/test", utils.testBruteForse.prevent, function(req, res, next) {
    res.json({num: Math.random(), brute: req.brute});
})
router.get("/brute", utils.testBruteForse.prevent, function(req, res, next) {
    res.json({num: Math.random(), brute: req.brute});
})

module.exports = router;
