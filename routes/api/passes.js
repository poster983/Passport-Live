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
* @module api/passes
*/

var express = require("express");
var router = express.Router();
var r = require("../../modules/db/index.js");
var r_ = r.dash();
var cors = require("cors");
var utils = require("../../modules/passport-utils/index.js");
var api = require("../../modules/passport-api/passes.js");
var passport = require("passport");
var config = require("config");
var moment = require("moment");
var typeCheck = require("type-check").typeCheck;

router.use(cors());
router.options("*", cors());


/**
* Gets all passes from passport or filters them. 
* JWT Required 
* Only for admins
* @function getPasses
* @link module:api/passes
* @api GET /api/passes/
* @apiquery {String} [id] - ID of the pass itself (will still return an array)
* @apiquery {String} [fromPerson] - User ID of the person that the migrator is leaving from
* @apiquery {String} [toPerson] - User ID of the person that the migrator is going to
* @apiquery {String} [migrator] - User ID of the person that is actually moving
* @apiquery {String} [requester] - User ID of the person that requested the pass
* @apiquery {(String|String[])} [period] - An array string of period constants. (Feed array like "?period=a&period=b&period=c")
* @apiquery {ISOString} [date_from] - Lower limit for the date. inclusive
* @apiquery {ISOString} [date_to] - Upper limit for the date. inclusive
* @apiresponse {Object[]} Array of pass objects
*/
router.get("/", passport.authenticate("jwt", { session: false}), utils.dashboardPermission(["administrator"]), function getPasses(req, res, next) {
    api.get({
        id: req.query.id,
        fromPerson: req.query.fromPerson,
        toPerson: req.query.toPerson,
        migrator: req.query.migrator,
        requester: req.query.requester,
        period: req.query.period,
        date: {
            from: req.query.date_from,
            to: req.query.date_to
        }  
    })
        .then((passes) => {
            return res.json(passes);
        })
        .catch((err) => {
            return next(err);
        });
});

/**
    * Creates a new Pass from/for currently logged in account.
    * This one used the JWT to find the requester and migrator.  this only allows the signed in person to request a pass for themselves 
    * REQUIRES JWT Authorization in headers.
    * @function newPassForMe
    * @async
    * @param {request} req
    * @param {response} res
    * @param {nextCallback} next
    * @api POST /api/passes/me/
    * @apibody {json} See Example
    * @example
    * <caption>Body Structure (application/json): </caption>
    * {
    *    "fromPerson": (id Of Account)
    *    "toPerson": (id Of Account)
    *    "migrator"; (id of account)
    *    "period": (a period constant)
    *    "date": (an date string in iso standered)
    * }
    *
    * @apiresponse {json} Returns rethink db action summery
    * @todo rewrite to support toPerson to be requestor
    */
router.post("/me", passport.authenticate("jwt", { session: false}), function newPassForMe(req, res, next) {
    var fromPerson = req.body.fromPerson;
    var toPerson = req.body.toPerson;
    var migrator = req.user.id;
    var period = req.body.period;
    var date = req.body.date;

    api.newPass({toPerson: toPerson, fromPerson: fromPerson, requester: migrator, migrator: migrator, period: period, date: date}).then((trans) => {
        res.status(201).json(trans);
    }).catch((err) => {return next(err);});
});


/**
* gets the pass state object
* REQUIRES JWT Authorization in headers.
* @function getPassState
* @param {request} req
* @param {response} res
* @param {nextCallback} next
* @apiparam {String} passID - The id of the Pass
* @apiquery {String} userID - run the query as this user.
* @api GET /api/passes/:passID/state
* @apiresponse {Object} Object with the state object (key: status) and the allowed changes (key: allowedChanges)
*/
router.get("/:passID/state", passport.authenticate("jwt", { session: false}), function getPassState(req, res, next) {
    if(!req.params.passID) {
        let err = new TypeError("passID expected a string");
        err.status = 400;
        return next(err);
    }
    // determine what user to run as 
    r_.table("passes").get(req.params.passID).run()
        .then((passData) => {
            //check if pass exists
            if(!passData) {
                let err = new Error("Pass not found");
                err.status = 404;
                throw err;
            }
            return passData.status;
        })
        .then((final) => {
            //get allowed changes 
            api.state.allowedChanges(req.params.passID, typeof req.query.userID === "string"?req.query.userID:req.user.id)
                .then((allowedChanges) => {
                    //send object to user
                    return res.json({status: final, type: api.state.type(final.confirmation.state), allowedChanges: allowedChanges});
                });
        })
        .catch((err) => {
            return next(err);
        });
});
/**
    * Sets Pass State by state type 
    * Can be set by toPerson and Migrator and fromPerson
    * REQUIRES JWT Authorization in headers.
    * @function updatePassState
    * @param {request} req
    * @param {Object} req.body - Body of the request
    * @param {String} req.body.type - can be "neutral", "accepted", "canceled", "arrived", or "enroute"
    * @param {response} res
    * @param {nextCallback} next
    * @apiparam {String} passID - The id of the Pass
    * @api PATCH /api/passes/:passID/state
    * @apiresponse {Object} Object with the new state (key: state) a RethinkDB transaction statement (key: transaction) and the new allowed changes (key: allowedChanges), and the state type (key: type)
    */
router.patch("/:passID/state", passport.authenticate("jwt", { session: false}), function updatePassState(req, res, next) {
    //check given state type 
    let bodyType = "{type: String}";
    if(!typeCheck(bodyType, req.body)) {
        let err = new TypeError("Body structure not valid.  Expected: " + bodyType);
        err.status = 400;
        return next(err);
    }
    if(req.body.type !== "neutral" && req.body.type !== "accepted" && req.body.type !== "canceled" && req.body.type !== "arrived" && req.body.type !== "enroute") {
        let err = new Error("type must be either \"neutral\", \"accepted\", \"canceled\", \"arrived\", or \"enroute\"");
        err.status = 400;
        return next(err);
    }
    //check change permissions 
    api.state.allowedChanges(req.params.passID, req.user.id)
        .then((permissions) => {
            //common error 
            let err = new Error("Forbidden");
            err.status = 403;
            //neutral type
            if(req.body.type === "neutral" ) {
                if(permissions.neutral) {
                    //allowed to change
                    return api.state.neutral(req.params.passID, req.user.id);
                } else {
                    //not allowed
                    throw err;
                }
            } else if(req.body.type === "accepted" ) {
                if(permissions.accepted) {
                    //allowed to change
                    return api.state.accepted(req.params.passID, req.user.id);
                } else {
                    //not allowed
                    throw err;
                }
            } else if(req.body.type === "canceled" ) {
                if(permissions.canceled) {
                    //allowed to change
                    return api.state.canceled(req.params.passID, req.user.id);
                } else {
                    //not allowed
                    throw err;
                }
            } else if(req.body.type === "arrived") {
                if(permissions.arrived) {
                    return api.state.arrived(req.params.passID);
                } else {
                    throw err;
                }
            } else if(req.body.type === "enroute") {
                if(permissions.enroute) {
                    return api.state.enroute(req.params.passID);
                } else {
                    throw err;
                }
            } else {
                let impErr = new Error("type must be either \"neutral\", \"accepted\", or \"canceled\"");
                impErr.status = 400;
                throw impErr;
            }
        })

        .then((final) => {
            //get new allowed changes
            api.state.allowedChanges(req.params.passID, req.user.id)
                .then((allowedChanges) => {
                    //return new object
                    return res.json(Object.assign(final, {allowedChanges: allowedChanges, type: api.state.type(final.state)}));
                });
        })
        .catch((err) => {return next(err);});
});

/**
    * Undos a pass state to the previous state 
    * Can be set by toPerson and Migrator
    * REQUIRES JWT Authorization in headers.
    * @function undoPassState
    * @param {request} req
    * @param {response} res
    * @param {nextCallback} next
    * @apiparam {String} passID - The id of the Pass
    * @api PATCH /api/passes/:passID/state/undo
    * @apiresponse {Object} Object with the new state (key: state) a RethinkDB transaction statement (key: transaction) and the new allowed changes (key: allowedChanges), and the state type (key: type)
    */
router.patch("/:passID/state/undo", passport.authenticate("jwt", { session: false}), function undoPassState(req, res, next) {
    api.state.allowedChanges(req.params.passID, req.user.id)
        .then((permissions) => {
            //check undo actions 
            if(permissions.undo === "UNDO") {
                //undo the pass 
                return api.state.undo(req.params.passID, req.user.id, true);
            } else if(permissions.undo === "NEUTRAL") {
                //set the pass state to a neutral state  
                return api.state.neutral(req.params.passID, req.user.id);
            } else {
                //pass locked cannot change
                let err = new Error("Forbidden");
                err.status = 403;
                throw err;
            }
        })

        .then((final) => {
            //get new allowed changes
            api.state.allowedChanges(req.params.passID, req.user.id)
                .then((allowedChanges) => {
                    //return new object
                    return res.json(Object.assign(final, {allowedChanges: allowedChanges, type: api.state.type(final.state)}));
                });
        })
        .catch((err) => {return next(err);});
});

module.exports = router;