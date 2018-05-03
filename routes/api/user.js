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
 * All endpoints here require a JWT in the Authorization Header or a x-xsrf-token header with a JWT cookie
* @module api/account/user
*/

var express = require("express");
var router = express.Router();
var cors = require("cors");
var passport = require("passport");
var utils = require("../../modules/passport-utils/index.js");
let moment = require("moment");

let passesJS = require("../../modules/passport-api/passes");
let accountJS = require("../../modules/passport-api/accounts");


router.use(cors());
router.options("*", cors());

//JWT auth
router.use(passport.authenticate("jwt", { session: false}));



//Checks for "me" and replaces it with the user ID
router.param("accountID", (req, res, next) => {
    if(req.params.accountID.toLowerCase() === "me") {
        req.params.accountID = req.user.id;
    }
    return next();
});

//only allow the current user or a matching usergroup
let allowMeAndUserGroup = (userGroups) => {
    return (req, res, next) => {
        //check permissions 
        //console.log(req.user.userGroup, userGroups, utils.checkDashboards(req.user.userGroup, userGroups))
        if(!utils.checkDashboards(req.user.userGroup, userGroups)) {
            //current user is only allowed to see themselves 
            if(req.params.accountID !== req.user.id) {
                //403 Forbidden 
                return res.sendStatus(403);
            }
        }
        return next();
    };
};


/**
 * Gets all passes that are relevant to the user. 
 * @link module:api/account/user
 * @function getUserPasses
 * @api GET /api/account/:accountID/passes
 * @apiparam {String} accountID
 * @apiquery {String} filter - PLEASE SEE: {@link module:api/passes~getPasses} for filters 
 * @apiquery {(Boolean|String)} substitute - allows an account with teacher permissions to view another account's passes as a substitute teacher.  (overrides fromPerson, date_from, and date_to query params).  Value must be a valid UTC Offset string, or a boolean. Timezone defaults to UTC +0 
 * @apiresponse {Object[]} Pass objects in an array
 */
//
router.get("/:accountID/passes/", allowMeAndUserGroup(["teacher", "administrator"]), function getUserPasses(req, res, next) {
    //check for accountID
    if(typeof req.params.accountID !== "string") {
        let err = TypeError("accountID expected a string");
        err.status = 400;
        return next(err);
    }
    //Check Sub mode
    if(req.query.substitute) {
        if(utils.checkDashboards(req.user.userGroup, ["teacher"])) {
            req.query.fromPerson = req.params.accountID;
            delete req.params.accountID;
            let offset = "Z";
            if(typeof req.query.substitute === "string" && (req.query.substitute !== "true" && req.query.substitute !== "false")) {
                offset = req.query.substitute;
            }
            req.query.date_from = moment().utcOffset(offset).hour(0).minute(0).second(0).millisecond(0).toISOString();
            //console.log(req.query.date_from);
            req.query.date_to = moment(req.query.date_from).add(1, "day").toISOString();
        } else {
            //no permission to do this
            return res.sendStatus(403);
        }
    } else {
        if(utils.checkDashboards(req.user.userGroup, ["teacher"]) && req.user.id !== req.params.accountID) {
            return res.sendStatus(403);
        }
    }
    
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

/** Sends an activation email to the user.  Will error if account is already activated   
    * @function sendActivationEmail
    * @link module:api/account/user
    * @api POST /api/account/:accountID/send-activation/
    * @apiparam {String} accountID - The account id to send the email to
    * @apiresponse {String} Status Code or Error
*/
router.post("/:accountID/send-activation", allowMeAndUserGroup(["administrator"]), function sendActivationEmail(req, res, next) {
    accountJS.sendActivation(req.params.accountID).then(() => {
        //just return 202 
        return res.sendStatus(202);
    }).catch((err) => {
        return next(err);
    });
});


module.exports = router;