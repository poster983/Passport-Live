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
var config = require("config");
module.exports = {
    /**
    * Removes data like passwords and other sensitive info before sending it to the user 
    * @function cleanUser
    * @link module:utils
    * @param {user} user - The user to clean.  The same user object found in the database 
    * @returns {user}
    */
    cleanUser: function(user){
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
    dscm: function(req, res, next) {            
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
    
}
/**
* A user object found in the database
* @typedef {json} user
*/