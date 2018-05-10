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

/** 
* @module js/utils/rateLimit 
*/
const ExpressBrute = require('express-brute');
const db = require("../db/index.js");
const moment = require("moment");

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
    * Middleware to prevent brute force attacks For any Public API. 
    * Requests/Retries: 100
    * Remembers for 5 min.
    * @link module:js/utils/rateLimit
    * @function loginBruteforce
    */
exports.publicApiBruteforce = new ExpressBrute(db.brute(), {
    freeRetries: 100,
    attachResetToRequest: false,
    refreshTimeoutOnRequest: false,
    minWait: 25*60*60*1000, // 1 day 1 hour (should never reach this wait time) 
    maxWait: 25*60*60*1000, // 1 day 1 hour (should never reach this wait time) 
    lifetime: 5*60, // 5 min (seconds not milliseconds) 
    failCallback: failCallback,
    handleStoreError: handleStoreError
});
/**
    * Middleware to prevent brute force attacks when logging in
    * Retries: 5
    * Remembers for a dynamic time.
    * @link module:js/utils/rateLimit
    * @function loginBruteforce
    */
exports.loginBruteforce = new ExpressBrute(db.brute(), {
    freeRetries: 5,
    minWait: 30*1000, // 30 seconds
    maxWait: 60*60*1000, // 1 hour, 
    refreshTimeoutOnRequest: false,
    attachResetToRequest: true,
    failCallback: function (req, res, next, nextValidRequestDate) {
        var err = new Error("You've made too many failed attempts in a short period of time, please try again "+moment(nextValidRequestDate).fromNow());
        err.status = 429;
        return next(err);
    },
    handleStoreError: handleStoreError
});
/**
    * Middleware to prevent brute force attacks when requesing a password reset email 
    * Retries: 3
    * Remembers for 1 day
    * @link module:js/utils/rateLimit
    * @function emailPasswordResetBruteforce
    */
exports.emailPasswordResetBruteforce = new ExpressBrute(db.brute(), {
    freeRetries: 3,
    attachResetToRequest: false,
    refreshTimeoutOnRequest: false,
    minWait: 25*60*60*1000, // 1 day 1 hour (should never reach this wait time) 
    maxWait: 25*60*60*1000, // 1 day 1 hour (should never reach this wait time) 
    lifetime: 24*60*60, // 1 day (seconds not milliseconds) 
    failCallback: function (req, res, next, nextValidRequestDate) {
        var err = new Error("You've made too many requests, please try again "+moment(nextValidRequestDate).fromNow());
        err.status = 429;
        return next(err);
    },
    handleStoreError: handleStoreError
});
/**
    * Middleware to prevent brute force attacks With returning avatars and backgrounds 
    * Retries: 500
    * Remembers for 1 min
    * @link module:js/utils/rateLimit
    * @function emailPasswordResetBruteforce
    */
exports.mediaBruteforce = new ExpressBrute(db.brute(), {
    freeRetries: 500,
    attachResetToRequest: false,
    refreshTimeoutOnRequest: false,
    maxWait: 30*1000, // 30 seconds
    lifetime: 60, // 1 min (seconds not milliseconds) 
    failCallback: function (req, res, next, nextValidRequestDate) {
        var err = new Error("You've made too many requests, please try again "+moment(nextValidRequestDate).fromNow());
        err.status = 429;
        return next(err);
    },
    handleStoreError: handleStoreError
});
// No more than 5000 requests per day 
/**
    * Middleware to prevent brute force attacks with authentecated APIs  
    * Requests/Retries: 1000
    * Remembers for 1 day
    * @link module:js/utils/rateLimit
    * @function emailPasswordResetBruteforce
    */
exports.globalBruteforce = new ExpressBrute(db.brute(), {
    freeRetries: 1000,
    attachResetToRequest: false,
    refreshTimeoutOnRequest: false,
    minWait: 25*60*60*1000, // 1 day 1 hour (should never reach this wait time) 
    maxWait: 25*60*60*1000, // 1 day 1 hour (should never reach this wait time) 
    lifetime: 24*60*60, // 1 day (seconds not milliseconds) 
    failCallback: failCallback,
    handleStoreError: handleStoreError
});



exports.testBruteForse = new ExpressBrute(db.brute(), {
    freeRetries: 3,
    attachResetToRequest: true,
    refreshTimeoutOnRequest: false,
    minWait: 5*1000, // 1 day 1 hour (should never reach this wait time) 
    maxWait: 1*60*1000, // 1 day 1 hour (should never reach this wait time) 
    failCallback: failCallback,
    handleStoreError: handleStoreError
});