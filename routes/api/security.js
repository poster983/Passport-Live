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
* @module securityRESTAPI
*/

var express = require("express");
var router = express.Router();
var cors = require('cors');
var passport = require("passport");
var config = require("config");
var api = require("../../modules/passport-api/security.js");
var typeCheck = require("type-check").typeCheck;

router.use(cors());
router.options('*', cors())

function serializeUser(req, res, done) {
    console.log(req.user[0]);
    //REMOVE SECRET INFO LIKE PASSWORDS
    //delete req.user[0].password;
    //req.user = req.user[0];
    req.user = utils.cleanUser(req.user);
    done();
};


/**
    * Gets permission key data
    * @function getPermissionKeyData
    * @async
    * @param {request} req
    * @param {response} res
    * @param {nextCallback} next
    * @api GET /api/security/key/
    * @apiquery {string} key - permission key
    * @apiresponse {json} Returns the permission key data
    * @returns {callback} - See: {@link #params-params-nextCallback|<a href="#params-nextCallback">Callback Definition</a>} 
    * @todo Rate Limit DONT USE JWT
    */

router.get('/key/', function getPermissionKeyData(req, res, next) {
    var key = req.query.key;
    if(!typeCheck("String", key)) {
        var err = TypeError("Query \"key\" must be a string.  Got " + typeof key);
        err.status = 400;
        return next(err)
    }
    api.getPermissionKeyData(key, function(err, data) {
        if(err) {
            return next(err);
        }
        return res.json(data);
    })
});


module.exports = router;