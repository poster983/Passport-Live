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
 * Endpoints for a single user.
* @module api/account/user
*/

var express = require("express");
var router = express.Router();
var cors = require("cors");
var passport = require("passport");
var utils = require("../../modules/passport-utils/index.js");
let passesJS = require("../../modules/passport-api/passes");


router.use(cors());
router.options("*", cors());

//JWT auth
router.use(passport.authenticate("jwt", { session: false}));

//Checks for "me" and replaces it with the user ID
router.param("accountID", (req, res, next) => {
    if(req.params.accountID.toLowerCase() === "me") {
        req.params.accountID = req.user.id;
    }
    //check permissions 
    //THIS WILL FAIL AFTER NEXT MERGE WITH MASTER
    if(!utils.checkPermission(req.user.userGroup, ["administrator"])) {
        //current user is only allowed to see themselves 
        if(req.params.accountID !== req.user.id) {
            //403 Forbidden 
            return res.sendStatus(403);
        }
    }
    return next();
});


/**
 * Gets all passes that are relevant to the user 
 * @function getUserPasses
 * @api GET /api/account/:accountID/passes
 * @apiparam {String} accountID
 * @apiquery {String} filter - PLEASE SEE: {@link module:api/passes.getPasses} for filters 
 * @apiresponse {Object[]} Pass objects in an array
 */
router.get("/:accountID/passes/", function getUserPasses(req, res, next) {
    //check for accountID
    if(typeof req.params.accountID !== "string") {
        let err = TypeError("accountID expected a string");
        err.status = 400;
        return next(err);
    }
    console.log(req.query)
    passesJS.get({
        id: req.query.id,
        fromPerson: req.query.fromPerson,
        toPerson: req.query.toPerson,
        migrator: req.query.migrator,
        requester: req.query.requester,
        period: req.query.period,
        date: {
            from: req.query.date_from,
            to: req.query.date_to
        },
        forUser: req.params.accountID
    })
        .then((passes) => {
            return res.json(passes);
        })
        .catch((err) => {
            return next(err);
        });
});


module.exports = router;