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
* @module authRESTAPI
*/

var express = require('express');
var router = express.Router();
var passport = require('passport');
var api = require('../../modules/passport-api/auth.js');

var cors = require('cors');

router.use(cors());
router.options('*', cors())


//serializeUser becaule the default passport.serializeUser function wont be called without session
/**
* takes req.user and makes it useable in the session.  Called automaticly 
* @function serializeUser
* @ignore
*/
function serializeUser(req, res, done) {
    console.log("USer:")
    console.log(req.user[0]);
    //REMOVE SECRET INFO LIKE PASSWORDS
    //delete req.user[0].password;
    //req.user = req.user[0];
    req.user = utils.cleanUser(req.user);
    done();
};

/**
    * Logges the user in using passport.authenticate
    * @function handleAuthLogin
    * @async
    * @param {request} req
    * @param {response} res
    * @api POST /api/auth/login/
    * @apibody {application/json}
    * @example 
    * <caption>Body structure: </caption>
    * email:<user's email>,
    * password:<user's password>
    * @todo Test application/json
    * @apiresponse {json} Returns in a json object with key: "token" and the value has a PassportJS compatible JWT
    */
router.post('/login', passport.authenticate('local-login', {
  session: false
}), function handleAuthLogin(req, res, next) {

    api.newJWT(req.user[0].id, function(err, jwt) {
        if(err) {
            return next(err);
        }
        res.status(200).json({
            token: "JWT " + jwt,
            userId: req.user[0].id
        });
    });
});




/**
    * Logges the user in using passport.authenticate AND uses the Double Submit Cookies Method for web apps.  This sets cookies
    * @function loginDSCM
    * @async
    * @param {request} req
    * @param {response} res
    * @api POST /api/auth/login/dscm
    * @apibody {application/json}
    * @example 
    * <caption>Body structure: </caption>
    * email:<user's email>,
    * password:<user's password>
    * @todo Test application/json
    * @apiresponse {json} Sends Status code of 200.  Sets Cookies for webapp auth
    */

router.post('/login/dscm', passport.authenticate('local-login', {
  session: true
}), function loginDSCM(req, res, next) {
    api.newJWTForCookies(req.user[0].id, function(err, jwtData) {
        if(err) {
            return next(err);
        }
        
        res.cookie('JWT', "JWT " + jwtData.token, {httpOnly: true, signed: true, maxAge: 24 * 60 * 60 * 1000});
        res.cookie('XSRF-TOKEN', jwtData.dscm, {maxAge: 24 * 60 * 60 * 1000});
        res.status(200).json({
            userId: req.user[0].id
        });
    })
});






router.get("/google/callback", passport.authenticate( 'google', { 
        failureRedirect: '/auth/login?failGoogle=true'
}), function(req, res, next) {
    console.log(req.user, "USER RETURNED")
    if(req.session.googleDSCM) {
        api.newJWTForCookies(req.user.id, function(err, jwtData) {
            if(err) {
                return next(err);
            }
            res.cookie('JWT', "JWT " + jwtData.token, {httpOnly: true, signed: true, maxAge: 24 * 60 * 60 * 1000});
            res.cookie('XSRF-TOKEN', jwtData.dscm, {maxAge: 24 * 60 * 60 * 1000});
            res.redirect("/?userId=" + req.user.id);
        });
    } else {
        api.newJWT(req.user.id, function(err, jwt) {
            if(err) {
                return next(err);
            }
            res.status(200).json({
                token: "JWT " + jwt,
                userId: req.user.id
            });
        });
    }
    
});



module.exports = router;