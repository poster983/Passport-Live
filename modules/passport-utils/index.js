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
//Useful functions for passport (NOT API FUNCTIONS)

/** 
* @module js/utils 
*/
var jwt = require("jsonwebtoken");
var shortid = require("shortid");
var config = require("config");
var moment = require("moment");
var uaParser = require("ua-parser-js");
let {RRule, RRuleSet, rrulestr} = require("rrule");

exports.typeCheck = require("./customTypeCheck.js");
exports.rateLimit = require("./rateLimit.js");

/**
* Takes an Object and returns a URL Query string
* @link module:js/utils
* @param {Object} params
* @returns {String}
*/
exports.urlQuery = (params) => {
    return query = Object.keys(params)
        .filter(function(e) { return ((params[e] !== undefined) && params[e] !== null); }) //removes 
        .map(k => encodeURIComponent(k) + "=" + encodeURIComponent(params[k]))
        .join("&");
};

/**
* Middleware wrapper for {@link module:js/utils.checkPermission}
* @link module:js/utils
* @param {string[]} dashboards - Holds the allowed dashboards (Like "student", "teacher", "administrator")
* @param {Object} [options]
* @param {string} [options.failRedirect] - if set, the user will be redirected here on a failure
*/
exports.dashboardPermission = (dashboards, options) => {
    let getErr = () => {
        //make english error
        let dashList = "";
        if(dashboards.length == 2) {
            dashList = dashboards[0] + " or " + dashboards[1];
        } else {
            if(dashboards > 2) {
                dashboards[dashboards.length-1] = "or " + dashboards[dashboards.length-1];
            }
            dashList = dashboards.join(", ");
        }

        let err = new Error("Account must have access to " + dashList + " dashboards to access this resource");
        err.status = 403;
        return err;
    };
    return function(req, res, next) {
        if(req.user) {
            if(exports.checkDashboards(req.user.userGroup, dashboards)) {
                return next();
            } else {
                if(options && options.failRedirect) {
                    return res.redirect(307, options.failRedirect);
                } else {
                    return next(getErr());
                }
            }
        }
    };
};

/** 
* Checks if the allowed dashboards for the given usergroup are present
* @link module:js/utils
* @param {userGroup} userGroup
* @param {string[]} dashboards - Holds the allowed dashboards (Like "student", "teacher", "administrator")
* @returns {boolean} 
*/
exports.checkDashboards = (userGroup, dashboards) => {
    let groupDashboards = exports.getAllowedDashboards(userGroup);
    if(groupDashboards.length > 0) {
        
        if(dashboards.some(elem => groupDashboards.includes(elem))) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}; 

/** 
* Gets the allowed dashboard array from the usergroup configs
* @link module:js/utils
* @param {userGroup} userGroup
* @returns {string[]}
*/
exports.getAllowedDashboards = (userGroup) => {
    if(config.has("userGroups." + userGroup + ".permissions.dashboards")) {
        return config.get("userGroups." + userGroup + ".permissions.dashboards");
    } else {
        return [];
    }
};


/** 
* Middleware that compiles the nav dashboard picker settings and stores it in req.sidenav
* @link module:js/utils
* @param {Object} req
* @param {Object} res
* @param {function} next
* @returns {function}
*/
exports.compileDashboardNav = (req,res,next) => {
    let sidenav = {};
    //make the dashboard picker
    sidenav.dashboards = {};
    sidenav.dashboards.names = exports.getAllowedDashboards(req.user.userGroup);
    if(sidenav.dashboards.names.length < 2) {
        sidenav.dashboards.showPicker = false;
    } else {sidenav.dashboards.showPicker=true;}
    sidenav.dashboards.format = function () {
        return this.substring(0,1).toUpperCase()  + this.substring(1).toLowerCase();
    };
    sidenav.dashboards.icon = function () {
        if(this == "student") {return "book";}
        else if(this == "teacher") {return "assignment";}
        else if(this == "administrator") {return "gavel";}
        else {return "computer";}
    };
    req.sidenav = sidenav;
    return next();
};

/**
* Removes data like passwords and other sensitive info before sending it to the user 
* @function cleanUser
* @link module:js/utils
* @param {account} user - The user to clean.  The same user object found in the database 
* @returns {account}
*/
exports.cleanUser = function(user){
    if(user) {
        if(Array.isArray(user)){
            delete user[0].password;
            return user[0];
        } else {
            delete user.password;
            return user;
        }
    }
},

/**
    * Checks if req is using DSCM and then allows passport to view the data 
    * @function dscm
    * @link module:js/utils
    * @param {json} req - Request 
    * @param {json} res - Response 
    * @param {function} next - Callback 
    * @returns {next}
    * @todo Make a passportjs stratagy for this 
    */
exports.dscm = function(req, res, next) {            
    if(req.header("x-xsrf-token") && req.signedCookies && req.signedCookies.JWT) {
        //using DSCM
        jwt.verify(req.signedCookies.JWT.substring(4), config.get("secrets.api-secret-key"), function(err, decode) {
            if(err) {
                return next(err);
            }
            //console.log(decode)
            if(decode && decode.dscm == req.header("x-xsrf-token")) {
                //put in headder for passport auth
                console.log("DSCM In Use");
                req.headers.authorization = req.signedCookies.JWT;
                return next();

            } else {
                

                var err = new Error("Unauthorized");
                err.status = 401;
                return next(err);
            }
        });

    } else {
        if(req.header("authorization") && req.signedCookies.JWT) {
            jwt.verify(req.signedCookies.JWT.substring(4), config.get("secrets.api-secret-key"), function(err, decode) {
                if(err) {
                    return next(err);
                } else if(decode && decode.dscm) {
                    //possible spoof 
                    //console.log("WEEEEEEEEEEEE")
                    var err = new Error("Unauthorized");
                    err.status = 401;
                    return next(err);
                } else {
                    return next();
                }
            });
        } else {
            return next();
        }
        
    }
    
};

/**
        * Checks if period is a period constant  
        * @function checkPeriod
        * @link module:js/utils
        * @param {string} period - a single period to check against the configs. 
        * @param {function} done - callback. 
        * @returns {done} Includes error, and a boolean.  True for valid period, false for not
        */
exports.checkPeriod = function(period, done) {
    var periodConst = config.get("schedule.periods");
    if(periodConst.includes(period)) {
        return done(null, true);
    } else {
        return done(null, false);
    }
};

/**
        * Generates a secure token/key
        * @function generateSecureKey
        * @link module:js/utils
        * @returns {string} Secure token/key.
        */
exports.generateSecureKey = function() {
    return shortid.generate() + shortid.generate();
};

/**
        * Checks if password is complient with password rules in the config file.  
        * @function checkPasswordPolicy
        * @link module:js/utils
        * @param {string} password - Password to check
        * @returns {Promise} 
        * @example <caption>Promise Payload</caption>
        * {
        *   valid: (boolean)
        *   failedAt: (regex string | undefined)
        *   humanReadableRule: (string | undefined)
        * }
        */
exports.checkPasswordPolicy = function(password) {
    return new Promise((resolve) => {
        var rules = config.get("passwordPolicy.regexRules");
        if(password.length >= config.get("passwordPolicy.minimumLength") && password.length <= config.get("passwordPolicy.maximumLength")) {
            if(rules.length <=0) {
                return resolve({valid: true});
            }
            for(var x = 0; x < rules.length; x++) {
                if(!new RegExp(rules[x]).test(password)) {
                    var err = new Error(config.get("passwordPolicy.humanReadableRule") + "Failed at regex test: " + rules[x]);
                    err.status = 400;
                    return resolve({
                        valid: false,
                        failedAt: rules[x],
                        humanReadableRule: config.get("passwordPolicy.humanReadableRule")
                    });
                }
                if(x >= rules.length-1) {
                    return resolve({valid: true});
                }
            }
        } else {
            /*var err = new Error("Password must be " + config.get("passwordPolicy.minimumLength") + " to " + config.get("passwordPolicy.maximumLength") + " characters long.")
            err.status = 400;
            return done(err, false);*/
            return resolve({
                valid: false,
                failedAt: "{" + config.get("passwordPolicy.minimumLength") + "," + config.get("passwordPolicy.maximumLength") + "}",
                humanReadableRule: config.get("passwordPolicy.humanReadableRule")
            });
        }
    });
    
};

/**
    * Given a user agent, the function determines if it is compatible with passport's web app
    * @function getBrowserSupport
    * @link module:js/utils
    * @param {string} userAgent - Password to check
    * @returns {Promise} See Example
    * @example <caption>Promise Payload</caption>
    * {
    *   supported: (boolean)
    *   untested: (boolean)
    *   blocked: (boolean)
    *   outdated: (boolean)
    * }
    */
exports.getBrowserSupport = function(userAgent) {
    return new Promise((resolve, reject) => {
        var ua = uaParser(userAgent);
        
        var bS = config.get("webInterface.browserSupport");
        
        if(ua && ua.browser && ua.browser.name && ua.browser.major) {
            var returnObj = {
                supported: false,
                untested:  false,
                blocked:   false,
                outdated:  false,
                ua: ua
            }; 
            if(bS.supported && bS.supported[ua.browser.name]) {
                //FOUND BROWSER IN SUPPORTED LIST
                if(ua.browser.major >= bS.supported[ua.browser.name] || bS.supported[ua.browser.name] === true) { 
                    //SUPPORTED
                    returnObj.supported = true;
                } else {
                    //OUTDATED 
                    returnObj.outdated = true;
                }
            } else if(bS.blocked && bS.blocked[ua.browser.name]) {
                if(ua.browser.major <= bS.blocked[ua.browser.name] || bS.blocked[ua.browser.name] === true) {
                    //BLOCKED
                    returnObj.blocked = true;
                } else {
                    //untested
                    returnObj.untested = true;
                }
            } else {
                //UNTESTED
                returnObj.untested = true;
            }
            return resolve(returnObj);
        } else {
            return resolve({untested: true, supported: false, blocked: false, outdated: false, ua: ua});
            
        }
    });  
};

/**
 * Validate RRule String or object
 * @link module:js/utils
 * @param {(RRuleRFC|RRule)} rrule 
 * @returns {Object} - {valid, errors[]}
 */
exports.validateRRule = (rrule) => {
    let rruleOptions = [];
    let rdateOptions = [];
    let res = {valid: true, errors: []};
    if(typeof rrule === "string") {
        //convert to rrule object
        rrule = rrulestr(rrule);
    } else if (typeof rrule !== "object") {
        throw new TypeError("rrule expected to be an object or string.  Got \"" + rrule + "\"");
    }
    //ready options array 
    if(rrule instanceof RRule) {
        rruleOptions.push({"type": "RRULE", "rule": rrule});
    } else if(rrule instanceof RRuleSet) {
        rrule._exdate.forEach((e) => {
            rdateOptions = rdateOptions.concat({"type": "EXDATE", "date": e});
        });
        rrule._rdate.forEach((e) => {
            rdateOptions = rdateOptions.concat({"type": "RDATE", "date": e});
        });
        rrule._rrule.forEach((e) => {
            rruleOptions = rruleOptions.concat({"type": "RRULE", "rule": e});
        });
        rrule._exrule.forEach((e) => {
            rruleOptions = rruleOptions.concat({"type": "EXRULE", "rule": e});
        });
    }
    //console.log(rruleOptions,rdateOptions)
    //do checks on dates 
    for(let x = 0; x < rdateOptions.length; x++) {
        let date = rdateOptions[x].date;
        let type = rdateOptions[x].type;
        //should be a date
        if(isNaN(Date.parse(date))) {
            res.valid = false;
            res.errors.push(new TypeError("\""+type+"\" must be a valid date"));
        }
    }
    //do type checks on RRules
    for(let x = 0; x < rruleOptions.length; x++) {
        let rule = rruleOptions[x].rule.origOptions;
        let type = rruleOptions[x].type;
        //frequency (required)
        const frequencyConst = [RRule.YEARLY, RRule.MONTHLY, RRule.WEEKLY, RRule.DAILY, RRule.HOURLY, RRule.MINUTELY, RRule.SECONDLY];
        if(!rule.freq || !frequencyConst.includes(rule.freq)) {
            res.valid = false;
            res.errors.push(new TypeError(type+": \"freq\" must be one of the following constants: RRule.YEARLY, RRule.MONTHLY, RRule.WEEKLY, RRule.DAILY, RRule.HOURLY, RRule.MINUTELY, RRule.SECONDLY or if using an RRUle string, omit the \"RRule.\""));
        }
        //dtstart should be date
        if(rule.dtstart && isNaN(Date.parse(rule.dtstart))) {
            res.valid = false;
            res.errors.push(new TypeError(type+": \"dtstart\" must be a valid date"));
        }

        //interval should be number
        if(rule.interval && typeof rule.interval !== "number") {
            res.valid = false;
            res.errors.push(new TypeError(type+": \"interval\" must be a number"));
        }

        //wkst should be a RRule.MO, RRule.TU, RRule.WE constants, or an integer
        if(rule.wkst && (!(rule.wkst >= 0 && rule.wkst <= 6)) && !(rule.wkst instanceof RRule.MO.constructor)) {
            res.valid = false;
            res.errors.push(new TypeError(type+": \"wkst\" must be a WeekDay object or an integer from 0-6 "));
        }
        //count should be a number
        if(rule.count && typeof rule.count !== "number") {
            res.valid = false;
            res.errors.push(new TypeError(type+": \"count\" must be a number"));
        }
        //until should be a date
        if(rule.until && isNaN(Date.parse(rule.until))) {
            res.valid = false;
            res.errors.push(new TypeError(type+": \"until\" must be a valid date"));
        }
        //bysetpos must be an integer, or a sequence of integers
        if(rule.bysetpos && ((Array.isArray(rule.bysetpos) && rule.bysetpos.some(isNaN)) && (!Array.isArray(rule.bysecond) && typeof rule.bysecond !== "number"))) {
            res.valid = false;
            res.errors.push(new TypeError(type+": \"bysetpos\" must be a number or an array of numbers"));
        }
        //bymonth must be an integer, or a sequence of integers
        if(rule.bymonth && ((Array.isArray(rule.bymonth) && rule.bymonth.some(isNaN)) && (!Array.isArray(rule.bysecond) && typeof rule.bysecond !== "number"))) {
            res.valid = false;
            res.errors.push(new TypeError(type+": \"bymonth\" must be a number or an array of numbers"));
        }
        //bymonthday must be an integer, or a sequence of integers
        if(rule.bymonthday && ((Array.isArray(rule.bymonthday) && rule.bymonthday.some(isNaN)) && (!Array.isArray(rule.bysecond) && typeof rule.bysecond !== "number"))) {
            res.valid = false;
            res.errors.push(new TypeError(type+": \"bymonthday\" must be a number or an array of numbers"));
        }
        //byyearday must be an integer, or a sequence of integers
        if(rule.byyearday && ((Array.isArray(rule.byyearday) && rule.byyearday.some(isNaN)) && (!Array.isArray(rule.bysecond) && typeof rule.bysecond !== "number"))) {
            res.valid = false;
            res.errors.push(new TypeError(type+": \"byyearday\" must be a number or an array of numbers"));
        }
        //byweekno must be an integer, or a sequence of integers
        if(rule.byweekno && ((Array.isArray(rule.byweekno) && rule.byweekno.some(isNaN)) && (!Array.isArray(rule.bysecond) && typeof rule.bysecond !== "number"))) {
            res.valid = false;
            res.errors.push(new TypeError(type+": \"byweekno\" must be a number or an array of numbers"));
        }
        //byweekday must be an integer, a sequence of integers, one of the weekday constants (RRule.MO, RRule.TU, etc), or a sequence of these constants
        if(rule.byweekday && ((Array.isArray(rule.byweekday) && (rule.byweekday.some(isNaN) && rule.byweekday.some(n=> !(n instanceof RRule.MO.constructor)))) && (typeof rule.byweekday !== "number" && !(rule.byweekday instanceof RRule.MO.constructor)))) {
            res.valid = false;
            res.errors.push(new TypeError(type+": \"wkst\" must be a WeekDay object or an integer or a sequence of "));
        }
        //byhour must be an integer, or a sequence of integers
        if(rule.byhour && ((Array.isArray(rule.byhour) && rule.byhour.some(isNaN)) && (!Array.isArray(rule.bysecond) && typeof rule.bysecond !== "number"))) {
            res.valid = false;
            res.errors.push(new TypeError(type+": \"byhour\" must be a number or an array of numbers"));
        }
        //byminute must be an integer, or a sequence of integers
        if(rule.byminute && ((Array.isArray(rule.byminute) && rule.byminute.some(isNaN)) && (!Array.isArray(rule.bysecond) && typeof rule.bysecond !== "number"))) {
            res.valid = false;
            res.errors.push(new TypeError(type+": \"byminute\" must be a number or an array of numbers"));
        }
        //bysecond must be an integer, or a sequence of integers
        if(rule.bysecond && ((Array.isArray(rule.bysecond) && rule.bysecond.some(isNaN)) && (!Array.isArray(rule.bysecond) && typeof rule.bysecond !== "number"))) {
            res.valid = false;
            res.errors.push(new TypeError(type+": \"bysecond\" must be a number or an array of numbers"));
        }
        //block byeaster as it is not implemented
        if(rule.byeaster) {
            res.valid = false;
            res.errors.push(new TypeError(type+": \"byeaster\" is not implemented"));
        }
    }
    return res;
};

let rru = "FREQ=WEEKLY;DTSTART=20120201T093000Z;INTERVAL=5;BYDAY=MO,FR;BYHOUR=2,4";
//
console.log(exports.validateRRule(rru));
if(exports.validateRRule(rru).valid) {
    console.log(RRule.fromString(rru).all());
}