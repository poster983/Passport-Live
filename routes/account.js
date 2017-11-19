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



//RaTE LIMIT RATE LIMIT!!
//Reset Password 
router.get("/resetPassword", (req, res, next) => {
    var permissionKey = req.query.key;
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
                    res.render("accounts/passwordReset", {doc_Title: 'Reset Your Password -- Passport'});
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
router.post("/resetPassword", (req, res, next) => {
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
                            securityJS.keyUsed(securityJS.permissionKeyType.RESET_PASSWORD, decode.key).then((trans) => {
                                //res.redirect('/auth/login?notif=' + encodeURIComponent("Account Password Reset.")); 
                                res.json({redirectTo: "/auth/login?notif=" + encodeURIComponent("Account Password Reset.")});
                                //Should send notification email.
                            }).catch((err) => {return next(err)})
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

module.exports = router;
