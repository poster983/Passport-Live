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
* @module accountRESTAPI
*/
var express = require("express");
var router = express.Router();
var r = require("../../modules/db/index.js");
var cors = require('cors');
var utils = require("../../modules/passport-utils/index.js");
var api = require("../../modules/passport-api/accounts.js"); //("jdsfak"); 
var passport = require("passport");
var config = require("config");
var ssarv = require("ssarv")

var miscApi = require("../../modules/passport-api/index.js");


//var for backwards compadability.  neads to be removed later 



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


//NEW ACCOUNT//



/**
    * Creates A New Account
    * @function handleNewAccount
    * @api POST /api/account/:userGroup/
    * @apiparam {userGroup} userGroup - A Usergroup constant defined in the config
    * @apibody {(application/json | application/x-www-form-urlencoded)}
    * @example 
    * <caption>Body Structure (application/json): </caption>
    * {
    *    "email": "teacher@gmail.com",
    *    "password": "123abc",
    *    "passwordVerification": "123abc",
    *    "firstName": "Teacher",
    *    "lastName": "McTeacher Face",
    *    "groupFields": {
    *        "teacherID": "1598753"
    *    },
    *    "permissionKey": HJhd38
    * }
    */
    router.post("/:userGroup/", function handleNewAccount(req, res, next) {
    //Get Params
    
    var email=req.body.email;
    var password=req.body.password;
    var passwordVerification=req.body.passwordVerification;
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var groupFields = req.body.groupFields
    var permissionKey = req.body.permissionKey;
    var userGroup = req.params.userGroup;
    console.log(userGroup);
    //Checks to see if the account needs a verification key
    var promise = new Promise(function(resolve, reject) {

        if(config.get('userGroups.' + userGroup + ".verifyAccountCreation")) {
            if(!permissionKey) {
                var err = new Error("Permission Key Required");
                    err.status = 403;
                    reject(err);
            }
            miscApi.checkPermissionKey(r.conn(), permissionKey, function(err, data) {
                if(err) {
                    reject(err);
                } 
                //CHeck  if usergroup is present
                else if(!data.permissions.userGroups.includes(userGroup)) {
                    var err = new Error("Permission Needed");
                    err.status = 403;
                    reject(err);
                } else {
                    resolve();
                }
            });
        } else {
            resolve();
        }
    })

    promise.then(function(result) {
        if(password != passwordVerification) {
            res.sendStatus(422);
        } else {
            api.createAccount(r.conn(), userGroup, firstName, lastName, email, password, groupFields, function(err, resp) {
                if(err){
                    next(err);
                } else {
                    res.sendStatus(201);
                    
                }
            });
        }
    }, function(err) {
        next(err);
    })
});


/**
    * GETs accounts by id
    * @function handleGetAccountsById
    * @async
    * @param {request} req
    * @param {response} res
    * @param {nextCallback} next
    * @api GET /api/account/id/:id
    * @apiparam {userGroup} id - The id of the user
    * @apiresponse {json} Returnes the safe info
    * @returns {callback} - See: {@link #params-params-nextCallback|<a href="#params-nextCallback">Callback Definition</a>} 
    */
//GET FULL ACCOUNT (WITH SAFTEY REMOVAL)//
router.get("/id/:id/", function handleGetAccountsById(req, res, next) {
    var id = req.params.id;
    api.getUserByID(r.conn(), id, function(err, data) {
        if(err) {
            return next(err) 
        }
        res.json(utils.cleanUser(data));
    })
});


/**
    * GETs all accounts by usergroup
    * @function handleGetAccountsByUserGroup
    * @async
    * @param {request} req
    * @param {response} res
    * @param {nextCallback} next
    * @api GET /api/account/userGroup/:userGroup/
    * @apiparam {userGroup} userGroup - A Usergroup constant defined in the config
    * @apiresponse {json} Returns in a json object from the database, the name object, the email, the userGroup, and ID
    * @returns {callback} - See: {@link #params-params-nextCallback|<a href="#params-nextCallback">Callback Definition</a>} 
    */
router.get("/userGroup/:userGroup/", function handleGetAccountsByUserGroup(req, res, next) {
    var userGroup = req.params.userGroup;

    
    api.getUserGroupAccountByUserGroup(r.conn(), userGroup, function(err, acc) {
        if(err) {
            next(err);
        }
        console.log(acc)
        var ret = [];
        for (var i = 0; i < acc.length; i++) {
            /*var safeUser = {
                name: acc[i].name, 
                email: acc[i].email, 
                userGroup: acc[i].userGroup, 
                id: acc[i].id, 
                groupFields: acc[i].groupFields[userGroup]
                
            }*/
            ret.push(utils.cleanUser(acc[i]));
        }
        res.json(ret);
    }); 
});


/**
    * GETs accounts by name
    * @function handleGetAccountsByName
    * @async
    * @param {request} req
    * @param {response} res
    * @param {nextCallback} next
    * @api GET /api/account/userGroup/:userGroup/name/:name/
    * @apiparam {userGroup} userGroup - A Usergroup constant defined in the config
    * @apiparam {string} name - A user's name.  Can be in any name format.
    * @apiresponse {json} Returns in a json object from the database, the name object, the email, the userGroup, ID, and some group fields
    * @returns {callback} - See: {@link #params-params-nextCallback|<a href="#params-nextCallback">Callback Definition</a>} 
    */
router.get("/userGroup/:userGroup/name/:name", function handleGetAccountsByName(req, res, next) {
    var userGroup = req.params.userGroup;
    var name = req.params.name;

    
    api.getUserGroupAccountByName(r.conn(), name, userGroup, function(err, acc) {
        if(err) {
            next(err);
        }
        console.log(acc)
        var ret = [];
        for (var i = 0; i < acc.length; i++) {
             var safeUser = {
                name: acc[i].name, 
                email: acc[i].email, 
                userGroup: acc[i].userGroup, 
                id: acc[i].id, 
                groupFields: acc[i].groupFields[userGroup]
                
            }
            ret.push(safeUser);
        }
        res.json(ret);
    }); 
});

//Special dashboard specific gets//


//MAKE CHANGES.  REQUIRES AUTH AND PERMISSION.  

/**
    * Updates usergroup specific data.
    * REQUIRES JWT Authorization in headers.
    * account must be in the usergroup for it to update
    * Check Example usergroup model for more examples 
    * @function handleUpdateAccountGroupFieldsByUser
    * @async
    * @param {request} req
    * @param {response} res
    * @param {nextCallback} next
    * @api PATCH /api/account/groupfields/
    * @apiresponse {json} Returns rethink db action summery
    * @example 
    * <caption>Body Structure (application/json): </caption>
    * {
    *     "id": 123456, //school id
    *     "student": { //any dashboard name
    *        "periodSchedule": {
    *                "a": {
    *                    "teacherID": "46545645-456-4-45645-45646" //id from database
    *                },
    *                "b": {
    *                    "teacherID": "456486-5190814-4567" //id from database
    *                },
    *                "lunch1": {
    *                    "teacherID": null, //if teacherID is null or undefined, passport expects data about where the period takes place
    *                    "room": "Cafeteria"
    *                }
    *            }, 
    *         "settings": {
    *             "test": false
    *          }
    *      }
    *  }
    * 
    * @returns {callback} - See: {@link #params-params-nextCallback|<a href="#params-nextCallback">Callback Definition</a>} 
    */
router.patch("/groupfields/", passport.authenticate('jwt', { session: false}), function handleUpdateAccountGroupFieldsByUser(req, res, next) {
    var updateDoc = req.body;

     api.updateAccountGroupFieldsByID(r.conn(), req.user.id, updateDoc, function(err, data) {
        if(err) {
            return next(err);
        }
        return res.send(data);
    })
});

router.post("/schedule/:dashboard", passport.authenticate('jwt', { session: false}), function setUserSchedule(req, res, next) {
    var dashboard = req.params.dashboard;
    var schedule = req.body;
    console.log(dashboard)
    api.newUserSchedule(req.user.id, dashboard, schedule, function(err, data) {
        if(err) {
            return next(err);
        }
        res.send(data)
    })
});

router.patch("/schedule/:dashboard", passport.authenticate('jwt', { session: false}), function setUserSchedule(req, res, next) {
    var dashboard = req.params.dashboard;
    var schedule = req.body;
    if(!req.user.schedules || !req.user.schedules[dashboard]) {
        var err = new Error("Schedule refrence not found");
        err.status = 404;
        return next(err)
    }
    console.log(dashboard)
    api.updateUserSchedule(req.user.schedules[dashboard], dashboard, schedule, function(err, data) {
        if(err) {
            return next(err);
        }
        res.send(data)
    })
});

/** GETs account schedules for student dash
    * @function getSchedulesForStudentDash
    * @async
    * @param {request} req
    * @param {response} res
    * @param {nextCallback} next
    * @api GET /api/account/schedule/student/id/:id/
    * @apiparam {string} id - A user's ID.
    * @apiresponse {json} Returns Joined data of the schedule
    * @returns {callback} - See: {@link #params-params-nextCallback|<a href="#params-nextCallback">Callback Definition</a>} 
    * @todo Auth
*/
//MAKE REQ.USER SUPPLY THE ID
router.get('/schedule/student/id/:id/', passport.authenticate('jwt', { session: false}), function getSchedulesForStudentDash(req, res, next) {
    if(!req.params.id) {
        var err = new Error("ID Required");
        err.status = 400;
        return next(err)
    }
    //console.log("HIIIIIIIIIIIIIIIIIii")
    api.getStudentSchedule(req.params.id, function(err, data) {
        if(err) {
            return next(err);
        }
        
        res.send(data)
    })
});

/** Checks if an accuunt is missing required fields by that dashboard  
    * @function studentCheckIfIncomplete
    * @async
    * @param {request} req
    * @param {response} res
    * @param {nextCallback} next
    * @api GET /api/account/incomplete/dashboard/studen
    * @apiresponse {json} Returns missing fields
    * @returns {callback} - See: {@link #params-params-nextCallback|<a href="#params-nextCallback">Callback Definition</a>} 
    * @todo SSARV
*/
router.get('/incomplete/dashboard/student', passport.authenticate('jwt', { session: false}), function studentCheckIfIncomplete(req, res, next) {
    //todo 
});
getUserByID

module.exports = router;

/**
 * A name of a userGroup defined in the configs
 * @typedef {string} userGroup
 */
 /**
 * The request object 
 * @typedef {object} request
 */

  /**
 * The response object sent to the requester 
 * @typedef {object} response
 */


 /**
 * @callback nextCallback
 * @param {object} err - Any errors that may arrise should be passed through here
 */