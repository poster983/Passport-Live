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
var shortid = require('shortid');
var config = require("config");
var moment = require("moment");
var uaParser = require('ua-parser-js');

exports.typeCheck = require("./customTypeCheck.js");
exports.rateLimit = require("./rateLimit.js");
//console.log(exports.typeCheck)
/**
* Removes data like passwords and other sensitive info before sending it to the user 
* @function cleanUser
* @link module:js/utils
* @param {user} user - The user to clean.  The same user object found in the database 
* @returns {user}
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
                return next(err)
            }
        })

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
                    return next(err)
                } else {
                    return next();
                }
            })
        } else {
            return next();
        }
        
    }
    
}

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
  }

    /**
        * Generates a secure token/key
        * @function generateSecureKey
        * @link module:js/utils
        * @returns {string} Secure token/key.
        */
  exports.generateSecureKey = function() {
      return shortid.generate() + shortid.generate();
  }

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
                return resolve({valid: true})
            }
            for(var x = 0; x < rules.length; x++) {
                if(!new RegExp(rules[x]).test(password)) {
                    var err = new Error(config.get("passwordPolicy.humanReadableRule") + "Failed at regex test: " + rules[x])
                    err.status = 400;
                    return resolve({
                        valid: false,
                        failedAt: rules[x],
                        humanReadableRule: config.get("passwordPolicy.humanReadableRule")
                    })
                }
                if(x >= rules.length-1) {
                    return resolve({valid: true})
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
            })
        }
    })
    
}

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
                untested: false,
                blocked:  false,
                outdated: false,
                ua: ua
            } 
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
            return reject(new TypeError("userAgent.browser Undefined"));
            
        }
    })  
}


/**
* A user object found in the database
* @typedef {json} user
*/