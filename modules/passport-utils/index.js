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
* @module utils 
*/
var jwt = require("jsonwebtoken");
var shortid = require('shortid');
var config = require("config");
var moment = require("moment");
const ExpressBrute = require('express-brute');
const BruteRethinkdb = require('brute-rethinkdb')
const db = require("../db/index.js");

/**
* Removes data like passwords and other sensitive info before sending it to the user 
* @function cleanUser
* @link module:utils
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
    * @link module:utils
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
            if(decode.dscm == req.header("x-xsrf-token")) {
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
        return next();
    }
    
}

 /**
    * Checks if period is a period constant  
    * @function checkPeriod
    * @link module:utils
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
        * Checks if period is a period constant  
        * @function checkPeriod
        * @link module:utils
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
        * @link module:utils
        * @returns {string} Secure token/key.
        */
  exports.generateSecureKey = function() {
      return shortid.generate() + shortid.generate();
  }

    /**
        * Checks if password is complient with password rules in the config file.  
        * @function checkPasswordPolicy
        * @link module:utils
        * @param {string} password - Password to check
        * @param {function} done - callback. 
        * @returns {callback} Includes error, and a boolean.
        */
exports.checkPasswordPolicy = function(password, done) {
    var rules = config.get("passwordPolicy.regexRules");
    if(password.length >= config.get("passwordPolicy.minimumLength") && password.length <= config.get("passwordPolicy.maximumLength")) {
        if(rules.length <=0) {
            return done(null, true);
        }
        for(var x = 0; x < rules.length; x++) {
            if(!new RegExp(rules[x]).test(password)) {
                var err = new Error(config.get("passwordPolicy.humanReadableRule") + "Failed at regex test: " + rules[x])
                err.status = 400;
                return done(err, false);
            }
            if(x >= rules.length-1) {
                return done(null, true);
            }
        }
    } else {
        var err = new Error("Password must be " + config.get("passwordPolicy.minimumLength") + " to " + config.get("passwordPolicy.maximumLength") + " characters long.")
        err.status = 400;
        return done(err, false);
    }
}

//exports.getBrowserSupport

    
//brute prevention
let store = new BruteRethinkdb(db.dash(), {table: 'brute'});

var failCallback = function (req, res, next, nextValidRequestDate) {
    var err = new Error("You've made too many requests in a short period of time, please try again "+moment(nextValidRequestDate).fromNow());
    err.status = 429;
    return next(err);
    //res.redirect('/login'); // brute force protection triggered, send them back to the login page 
};

var handleStoreError = function (error) {
    //console.error(error); // log this error so we can figure out what went wrong 
    // cause node to exit, hopefully restarting the process fixes the problem 
    throw JSON.stringify({
        message: error.message,
        parent: error.parent
    }, null, 4);
}

//console.log(module.exports.generateSecureKey())

/**
    * Middleware to prevent brute force attacks   
    * @function userBruteforce
    */
exports.loginBruteforce = new ExpressBrute(store, {
    freeRetries: 5,
    minWait: 1*60*1000, // 1 minute
    maxWait: 60*60*1000, // 1 hour, 
    failCallback: function (req, res, next, nextValidRequestDate) {
        var err = new Error("You've made too many failed attempts in a short period of time, please try again "+moment(nextValidRequestDate).fromNow());
        err.status = 429;
        return next(err);
    },
    handleStoreError: handleStoreError
});
// No more than 1000 login attempts per day per IP 
exports.globalBruteforce = new ExpressBrute(store, {
    freeRetries: 1000,
    attachResetToRequest: false,
    refreshTimeoutOnRequest: false,
    minWait: 25*60*60*1000, // 1 day 1 hour (should never reach this wait time) 
    maxWait: 25*60*60*1000, // 1 day 1 hour (should never reach this wait time) 
    lifetime: 24*60*60, // 1 day (seconds not milliseconds) 
    failCallback: failCallback,
    handleStoreError: handleStoreError
});

exports.publicApiBruteforce = new ExpressBrute(store, {
    freeRetries: 30,
    attachResetToRequest: false,
    refreshTimeoutOnRequest: false,
    minWait: 5*60*1000, // 1 hour (should never reach this wait time) 
    maxWait: 60*60*1000, // 1 day 1 hour (should never reach this wait time) 
    //lifetime: 24*60*60, // 1 day (seconds not milliseconds) 
    failCallback: failCallback,
    handleStoreError: handleStoreError
});

exports.testBruteForse = new ExpressBrute(store, {
    freeRetries: 3,
    attachResetToRequest: true,
    refreshTimeoutOnRequest: false,
    minWait: 5*1000, // 1 day 1 hour (should never reach this wait time) 
    maxWait: 1*60*1000, // 1 day 1 hour (should never reach this wait time) 
    failCallback: failCallback,
    handleStoreError: handleStoreError
});
/**
* A user object found in the database
* @typedef {json} user
*/