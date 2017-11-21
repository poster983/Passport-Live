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
var jwt = require('jsonwebtoken');
var ms = require("ms");
var router = express.Router();
var db = require('../modules/db/index.js');



//RaTE LIMIT RATE LIMIT!!
//Reset Password 
router.get("/resetPassword", (req, res, next) => {
    var permissionKey = req.query.key;
    var notif = req.query.notif;
    if(typeof permissionKey === "string") {
        securityJS.checkPermissionKeyValidity(securityJS.permissionKeyType.RESET_PASSWORD, permissionKey).then((payload) => {
            if(payload) {
                var newPayload = {};
                newPayload.dscm = Math.random().toString(36).slice(2);
                newPayload.key = permissionKey;
                //console.log(payload)
                jwt.sign(newPayload, config.get('secrets.api-secret-key'), {
                    expiresIn: "2m",
                }, (err, token) => {
                    if(err) {return next(err);}
                    res.cookie('JWT', "JWT " + token, {httpOnly: true, signed: true, maxAge: ms("2m")});
                    res.cookie('XSRF-TOKEN', newPayload.dscm, {maxAge: ms("2m")});

                    res.render("accounts/passwordReset", {doc_Title: 'Reset Your Password -- Passport', notification: notif});
                });
            } else {
                res.redirect('/auth/login?notif=' + encodeURIComponent("\"key\" invalid")); 
            }
        }).catch((err)=>{return next(err);})
    } else {
        res.redirect('/auth/login?notif=' + encodeURIComponent("Query \"key\" invalid.")); 
    }
})
//RaTE LIMIT RATE LIMIT!!
router.patch("/resetPassword", (req, res, next) => {
    //console.log(req.signedCookies.JWT);
    if(req.header("authorization")) {
        jwt.verify(req.header("authorization").substring(4), config.get('secrets.api-secret-key'), (err, decode) => {
            if(err) {return next(err);}
            securityJS.checkPermissionKeyValidity(securityJS.permissionKeyType.RESET_PASSWORD, decode.key).then((payload) => {
                if(payload && payload.params && payload.params.accountID) {
                    console.log(req.body)
                    var password = req.body.password;
                    if(password == req.body.passwordVer) {
                        accountJS.updatePassword(payload.params.accountID, password).then((trans) => {
                            console.log(trans)
                            if(trans && trans.replaced > 1) {
                                return next(new Error("An impossible error has just occurred. Please perform a reality check."))
                            } else if(trans && trans.replaced < 1) {
                                var err = new Error("Nothing Changed")
                                err.status = 400;
                                return next(err);
                            } else {
                                securityJS.keyUsed(securityJS.permissionKeyType.RESET_PASSWORD, decode.key).then((usedTrans) => {
                                    //res.redirect('/auth/login?notif=' + encodeURIComponent("Account Password Reset.")); 
                                    res.sendStatus(204);
                                    //Should send notification email.
                                }).catch((err) => {return next(err)})
                            }
                        }).catch((err) => {return next(err)})

                        
                    } else {
                        var err = new Error("Passwords Must Match");
                        err.status = 400;
                        return next(err);
                    }
                
                } else {
                    var err = new Error("Invalid Key");
                    err.status = 400;
                    return next(err);
                }
            })
        })
    } else {
        var err = new Error("Invalid JWT");
        err.status = 401;
        return next(err);
    }
    //next(new Error("weeeeee"))
    //res.json({hi:"there"})
});



//RaTE LIMIT RATE LIMIT!!
//Account Activation
//localhost:3000/account/activate
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
                            res.redirect('/auth/login?notif=' + encodeURIComponent("Your account is now active")); 
                        } else {
                            //MAKE PASSWORK RESET KEY AND SEND TO PASSWORD RESET PAGE!
                            securityJS.newKey.resetPassword(payload.params.accountID).then((key) => {
                                res.redirect('/account/resetPassword?key=' + encodeURIComponent(key) + "&notif=" + encodeURIComponent("Your account is now active. Please create a password.")); 
                            }).catch((err)=>{return next(err)});
                        }
                    }).catch((err)=>{return next(err)})
                }).catch((err) => {return next(err)})
                
                //res.send(resp)
            } else if(resp && resp.replaced > 1) {
                var err = new Error("An impossible error has just occurred. Please perform a reality check.");
                err.status = 500;
                return next(err);
            } else if(resp && resp.unchanged > 0) {
                //console.log(resp)
                securityJS.keyUsed(securityJS.permissionKeyType.ACTIVATE_ACCOUNT, permissionKey).catch((err) => {console.error(err, "Account Activation");});
                res.redirect('/auth/login?notif=' + encodeURIComponent("Your account is already verified")); 
            } else {
                var err = new Error("User Not Found");
                err.status = 500;
                return next(err);
            }
        }).catch((err)=>{return next(err)})
    }).catch((err)=>{return next(err)});
  } else {
    res.redirect('/auth/login'); 
  }
})



module.exports = router;
