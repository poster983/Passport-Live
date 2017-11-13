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

//THIS FILE WILL STOP WORKING WHEN IN PRODUCTION

var express = require('express');
var securityJS = require('../../modules/passport-api/security.js');
var emailApi = require("../../modules/passport-api/email.js")
var emailTracker = require('pixel-tracker');
var router = express.Router();





emailTracker.use(function (error, result) {
  console.log(result)
});

router.get("/pixel.gif", function(req, res, next) {
    console.log(req)
    return next();
}, emailTracker.middleware);


router.post("/sendMail", function(req, res, next) {
    emailApi.sendMail({
        to: 'to@example.com',
        subject: 'Message title',
        text: 'Plaintext version of the message',
        html: '<p>HTML version of the message</p>'
    }, null).then(function(resp) {
        res.send(resp);
    }).catch(function(err) {
        next(err)
    })
})
router.get("/emailTemplate", (req, res, next) => {
    var MesOpt = [];
    for(var x = 0; x < 100; x++) {
        MesOpt.push({to: "to@example.com", name: {first: "Test", last: "Person"}, accountEmail: "to@example.com", password: Math.random()})
    }
    console.log(MesOpt)
    emailApi.sendNewAccountWithPassEmail(MesOpt).then((trans) => {
        console.log(trans, "job?")
        return res.sendStatus(202)
        
    }).catch((err) => {
        return next(err);
    })
})

router.get("/delay/:delay", (req, res, next) => {
    setTimeout(function() {
        res.send("Hello World")
    }, parseInt(req.params.delay))
})



router.get("/newActivateKey", (req, res, next) => {
    securityJS.newKey.activateAccount(req.query.id).then((key) => {
        res.send(key);
    }).catch((err) => {return next(err);})
})

router.get("/checkPermKeyValidity", (req, res, next) => {
    securityJS.checkPermissionKeyValidity(req.query.type, req.query.key).then((key) => {
        res.send(key);
    }).catch((err) => {return next(err);})
})

module.exports = router;