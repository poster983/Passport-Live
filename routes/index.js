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
  var permissionKey = req.query.ak; //Activation Key (permission key)
  if(typeof permissionKey === "string") {
    securityJS.getPermissionKeyData(securityJS.permissionKeyType.ACTIVATE_ACCOUNT, permissionKey, (err, payload) => {
        if(err) {
            return next(err);
        }
        //THIS IS AN EXACT CHECK.  FIX!!!
        if(!typeCheck("{params: {accountID: String}}", payload)) {
            var err = new TypeError("Key Payload Malformed.  Expected \"params.accountID\" to be a String.");
            err.status = 500;
            return next(err);
        }
        accountJS.setVerification(payload.params.accountID, true).then((resp) => {
            res.send(resp)
        }).catch((err)=>{return next(err)})
    });
  } else {
    res.redirect('/auth/login?msg=' + encodeURIComponent("Query \"ak\" expected a string.  Got: " + typeof permissionKey)); 
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
