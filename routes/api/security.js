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
var ssarv = require("ssarv");

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
    * Creates a new permission key for creating a new Account.
    * Please see {@link module-js_security.html|<a href="module-js_security.html">Module js_security</a>} for type requirements.
    * @function handleCreatePermissionKey
    * @async
    * @param {request} req
    * @param {Object} req.body
    * @param {String[]} req.body.userGroups - Must only contain valid userGroup keys defined in the configs.
    * @param {(undefined|Object)} req.body.timeout - When should the key become invalid.
    * @param {(undefined|number)} req.body.timeout.tally - Will become inactive after given number of uses.
    * @param {(undefined|Date|ISO)} req.body.timeout.time - Will become inactive after given time.
    * @param {response} res
    * @param {nextCallback} next
    * @api POST /api/security/key/NEW_ACCOUNT/
    * @apibody {application/json} 
    * @apiresponse {json} Returns in a json object from the database, the name object, the email, the userGroup, and ID
    * @returns {callback} - See: {@link #params-params-nextCallback|<a href="#params-nextCallback">Callback Definition</a>} 
    */
router.post('/key/NEW_ACCOUNT', passport.authenticate('jwt', { session: false}), ssarv(["admin", "dev"], {locationOfRoles: "user.userGroup"}), function handleCreatePermissionKey(req, res, next) {
    var userGroups=req.body.userGroups;
    var timeout=req.body.timeout;
    
    api.newKey.newAccount(userGroups, timeout).then((key)=> {
        res.status(201).send({
            key: key
        })
    }).catch((err) => {
        return next(err)
    });
});


/**
    * Creates a new API key.
    * @function handleNewApiKey
    * @async
    * @param {request} req
    * @param {response} res
    * @param {nextCallback} next
    * @api POST /api/security/key/API/
    * @apibody {application/json} 
    * @apiresponse {json} Returns the new api key
    * @returns {callback} - See: {@link #params-params-nextCallback|<a href="#params-nextCallback">Callback Definition</a>} 
    * @todo NOT ENABLED YET
    */

router.post('/key/API', function handleNewApiKey(req, res, next) {
    res.sendStatus(501);
});




/**
    * Gets permission key data
    * @function getPermissionKeyData
    * @async
    * @param {request} req
    * @param {response} res
    * @param {nextCallback} next
    * @api GET /api/security/key/:type
    * @apiparam {permissionKeyType} type - Must provide an allowed key type defined in ENUM "permissionKeyType".  (Currently only "NEW_ACCOUNT" and "UNKNOWN" are allowed)
    * @apiquery {string} key - permission key
    * @apiresponse {json} Returns the permission key data
    * @returns {callback} - See: {@link #params-params-nextCallback|<a href="#params-nextCallback">Callback Definition</a>} 
    * @todo Rate Limit DONT USE JWT
    */

router.get('/key/:type', function getPermissionKeyData(req, res, next) {
    var key = req.query.key;
    if(!typeCheck("String", key)) {
        var err = TypeError("Query \"key\" must be a string.  Got " + typeof key);
        err.status = 400;
        return next(err)
    }
    if(type !== api.permissionKeyType.NEW_ACCOUNT || type !== api.permissionKeyType.UNKNOWN) {
        var err = TypeError("Forbidden");
        err.status = 403;
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