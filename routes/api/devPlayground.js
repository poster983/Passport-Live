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

var express = require("express");
var securityJS = require("../../modules/passport-api/security.js");
var emailApi = require("../../modules/passport-api/email.js");
var utils = require("../../modules/passport-utils/index.js");
var emailTracker = require("pixel-tracker");
let {DateTime} = require("luxon");
var router = express.Router();





emailTracker.use(function (error, result) {
    console.log(result);
});

router.get("/pixel.gif", function(req, res, next) {
    console.log(req);
    return next();
}, emailTracker.middleware);


router.post("/sendMail", function(req, res, next) {
    emailApi.sendMail({
        to: "to@example.com",
        subject: "Message title",
        text: "Plaintext version of the message",
        html: "<p>HTML version of the message</p>"
    }, null).then(function(resp) {
        res.send(resp);
    }).catch(function(err) {
        next(err);
    });
});


router.get("/delay/:delay", (req, res, next) => {
    setTimeout(function() {
        res.send("Hello World");
    }, parseInt(req.params.delay));
});



router.get("/newActivateKey", (req, res, next) => {
    securityJS.newKey.activateAccount(req.query.id).then((key) => {
        res.send(key);
    }).catch((err) => {return next(err);});
});

router.get("/checkPermKeyValidity", (req, res, next) => {
    securityJS.checkPermissionKeyValidity(req.query.type, req.query.key).then((key) => {
        res.send(key);
    }).catch((err) => {return next(err);});
});


/*Brute Forse */
router.get("/brute/test", utils.rateLimit.testBruteForse.prevent, function(req, res, next) {
    res.json({num: Math.random(), brute: req.brute});
});
router.get("/brute", utils.rateLimit.testBruteForse.prevent, function(req, res, next) {
    res.json({num: Math.random(), brute: req.brute});
});



/* RRule rethinkdb filter optimizer */
//timezone fix maybe https://runkit.com/nizmox/576896ef64545613002b49b1
let {RRule, RRuleSet, rrulestr} = require("rrule");

router.post("/rrule/", function(req, res, next) {
    let rrule = req.body.rrule;
    let timeZone = req.body.timeZone;
    let startDate = DateTime.fromISO(req.body.start, { zone: timeZone });
    res.json(utils.rruleToDatabase(startDate, rrule))
    /*let lastOccurrence;
    let rruleWithDate;
    let parsed;
    let rruleValid = utils.validateRRule(rrule);
    
    if(!rruleValid.valid) {
        let error = new Error(rruleValid.errors);
        error.status = 400;
        console.log(error)
        return next(error);
    } else {
        if(typeof rrule === "string") {
            rrule = rrulestr(rrule, {forceset: true});
        }
        if(rrule instanceof RRule) {
            //convert object to string
            parsed = ["RRULE:"+rrule.toString()];
        } else if(rrule instanceof RRuleSet) {
            parsed = rrule.valueOf();
        } else if(Array.isArray(rrule)) {
            parsed = rrule;
        } else {
            let error = TypeError("This error should never happen. Invalid RRule passed");
            error.status = 500;
            return next(error);
        }

        //check if dtstart is there, if it is, error
        for(let x = 0; x < parsed.length; x++) {
            if(parsed[x].includes("DTSTART")) {
                //should error 
                let error = Error("\"DTSTART\" is not allowed in the RRULE.  Use datetime.start");
                error.status = 400;
                return next(error);
            }
        }
        //extract until date, also generate 
        rruleWithDate = rrulestr(parsed.join(" "), {forceset: true, dtstart: startDate.toJSDate()});
        //check if all rrules have an end
        if(rruleWithDate._rrule.length > 0) {
            for(let x = 0; x < rruleWithDate._rrule.length; x++) {
                if(typeof rruleWithDate._rrule[x].options.count !== "number" && !rruleWithDate._rrule[x].options.until) {
                    break;
                }
                console.log(x, rruleWithDate._rrule.length -1)
                //checked all fields 
                if(x <= rruleWithDate._rrule.length -1) {
                    //generate last Occurrence
                    let allOcc = rruleWithDate.all(); 
                    lastOccurrence = DateTime.fromJSDate(allOcc[allOcc.length-1], { zone: timeZone });
                }
            }
        } else if (rruleWithDate._rdate.length > 0) {
            //check last occurence for rdate if rrule is not present
            lastOccurrence = DateTime.fromJSDate(rruleWithDate._rdate[0], { zone: timeZone });
            for(let x = 0; x < rruleWithDate._rdate.length; x++) {
                let testTime = DateTime.fromJSDate(rruleWithDate._rdate[x], { zone: timeZone });
                if(testTime > lastOccurrence) {
                    lastOccurrence = testTime;
                }
            }
        } else {
            //no date rules
            let error = TypeError("Invalid RRULE");
            error.status = 400;
            return next(error);
        }
    }
    
    res.json({
        parsed: parsed,
        rrule: rrule,
        ittRule: rruleWithDate.all(),
        ittRuleTZ: (function() {
            let dt = rruleWithDate.all();
            let returner = [];
            for(let x = 0; x < dt.length; x++) {
                returner.push(DateTime.fromJSDate(dt[x], {zone: timeZone}))
            }
            return returner;
        })(),
        rruleWithDate: rruleWithDate,
        lastOccurrence: lastOccurrence
    });*/
});




module.exports = router;