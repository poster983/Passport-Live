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
* @module passportAuthApi
*/

var jwt = require('jsonwebtoken');
var config = require('config');

function rawJWTSign(payload, done) {
    jwt.sign(payload, config.get('secrets.api-secret-key'), {
        expiresIn: 60*60*24
    }, function(err, token) {
        if(err) {
            return done(err);
        }
        return done(null, token);
    });
}

/**
    * Generates a new JWT with no Double Submit Cookies Method support.  Ment for phone apps.
    * @function newJWT
    * @async
    * @param {string} userID -Id of user
    * @param {callback} done
    * @returns {done}
  */
exports.newJWT = function(userID, done){
     rawJWTSign({id: userID}, function(err, token) {
        if(err) {
            return done(err);
        }
        return done(null, token);
    })
}

/**
    * Generates a new JWT WITH Double Submit Cookies Method support.  Ment for web apps.
    * @function newJWTForCookies
    * @async
    * @param {string} userID -Id of user
    * @param {callback} done - returnsjwt token and a random string for 
    * @returns {done}
  */
exports.newJWTForCookies = function(userID, done) { 
    var dscm = Math.random().toString(36).slice(2);
    rawJWTSign({id: userID, dscm: dscm}, function(err, token) {
        if(err) {
            return done(err);
        }
        return done(null, {token: token, dscm: dscm});
    })
}

