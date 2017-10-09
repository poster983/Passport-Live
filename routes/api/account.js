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


var scheduleApi = require("../../modules/passport-api/schedules.js");
var passApi = require("../../modules/passport-api/passes.js");
var moment = require("moment");

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
    *    "schoolID": "02556",
    *    "graduationYear": 2018,
    *    "password": "123abc",
    *    "passwordVerification": "123abc",
    *    "name": {
    *        "salutation": "Mx.",
    *        "first": "Teacher",
    *        "last": "McTeacher Face"
    *      },
    *    "groupFields": {},
    *    "permissionKey": HJhd38
    * }
    */
    router.post("/:userGroup/", function handleNewAccount(req, res, next) {
    //Get Params
    
    var email=req.body.email;
    var password=req.body.password;
    var passwordVerification=req.body.passwordVerification;
    var name = req.body.name 
    var groupFields = req.body.groupFields
    var permissionKey = req.body.permissionKey;
    var userGroup = req.params.userGroup;
    var schoolID = req.body.schoolID;
    var graduationYear = req.body.graduationYear;
    console.log(userGroup);
    //Checks to see if the account needs a verification key
    var promise = new Promise(function(resolve, reject) {
        if (config.has('userGroups.' + userGroup)) {
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
        } else {
            var err = new Error("Usergroup Not Found");
            err.status = 404;
            reject(err);
        }
    })

    promise.then(function(result) {
        if(password != passwordVerification) {
            res.sendStatus(422);
        } else {
            api.createAccount(userGroup, name, email, password, schoolID, graduationYear, groupFields, function(err, resp) {
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
    * @apiparam {uuid} id - The id of the user
    * @apiresponse {json} Returnes the safe info
    * @returns {callback} - See: {@link #params-params-nextCallback|<a href="#params-nextCallback">Callback Definition</a>} 
    */
//GET FULL ACCOUNT (WITH SAFTEY REMOVAL)//
router.get("/id/:id/", passport.authenticate('jwt', { session: false}), function handleGetAccountsById(req, res, next) {
    var id = req.params.id;
    api.getUserByID(r.conn(), id, function(err, data) {
        if(err) {
            return next(err) 
        }
        res.json(utils.cleanUser(data));
    })
});

/**
    * GETs accounts by email
    * @function getAccountsByEmail
    * @async
    * @param {request} req
    * @param {response} res
    * @param {nextCallback} next
    * @api GET /api/account/email/:email/
    * @apiparam {string} email - The Email of the user
    * @apiresponse {json} Returnes the safe info
    * @returns {callback} - See: {@link #params-params-nextCallback|<a href="#params-nextCallback">Callback Definition</a>} 
    * @todo KILL OFF WHEN AUTOCOMPLETE WITH IDs ARE ADDED.  PRIVACY RISK!
    */
router.get("/email/:email/", passport.authenticate('jwt', { session: false}), function getAccountsByEmail(req, res, next) {
    var email = req.params.email;
    api.getAccountByEmail(email, function(err, data) {
        if(err) {
            return next(err) 
        }
        var resp = [];
        if(data.length <=0) {
            res.json(resp);
        }
        for(var x = 0; x < data.length; x++) {
            resp.push(utils.cleanUser(data[x]));
            if(x >= data.length-1) {
                res.json(resp);
            }
        }
        
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
router.get("/userGroup/:userGroup/", passport.authenticate('jwt', { session: false}), function handleGetAccountsByUserGroup(req, res, next) {
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
    * GETs accounts by name and usergroup
    * @function handleGetAccountsByNameAndUserGroup
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
router.get("/userGroup/:userGroup/name/:name", passport.authenticate('jwt', { session: false}), function handleGetAccountsByNameAndUserGroup(req, res, next) {
    var userGroup = req.params.userGroup;
    var name = req.params.name;

    
    api.getUserGroupAccountByName(r.conn(), name, userGroup, function(err, acc) {
        if(err) {
            return next(err);
        } else if(acc == null) {
            return res.json([]) 
        }
        
        var ret = [];
        if(acc.length <= 0) {
            return res.json([]);
        }
        for (var i = 0; i < acc.length; i++) {
            ret.push(utils.cleanUser(acc[i]))
            if(i>= acc.length -1) {
                return res.json(ret);
            }
        }
    }); 
});

/**
    * GETs accounts by name
    * @function handleGetAccountsByName
    * @async
    * @param {request} req
    * @param {response} res
    * @param {nextCallback} next
    * @api GET /api/account/name/:name/
    * @apiparam {string} name - A user's name.  Can be in any name format.
    * @apiresponse {json} Returns in a json object from the database, the name object, the email, the userGroup, ID, and some group fields
    * @returns {callback} - See: {@link #params-params-nextCallback|<a href="#params-nextCallback">Callback Definition</a>} 
    */
router.get("/name/:name", passport.authenticate('jwt', { session: false}), function handleGetAccountsByName(req, res, next) {
    var name = req.params.name;

    
    api.getUserGroupAccountByName(r.conn(), name, ".", function(err, acc) {

        if(err) {
            return next(err);
        } else if(acc == null) {
            return res.json([]) 
        }
        
        var ret = [];
        if(acc.length <= 0) {
            return res.json([]);
        }
        for (var i = 0; i < acc.length; i++) {
            ret.push(utils.cleanUser(acc[i]))
            if(i>= acc.length -1) {
                return res.json(ret);
            }
        }
        
    }); 
});

/**
    * GETs accounts That have hasClasses option set to true in the configs
    * @function getAccountsWithClasses
    * @async
    * @param {request} req
    * @param {response} res
    * @param {nextCallback} next
    * @api GET /api/account/hasClasses
    * @apiresponse {json} Returns in a json object from the database, the full account
    * @returns {callback} - See: {@link #params-params-nextCallback|<a href="#params-nextCallback">Callback Definition</a>} 
    */
router.get("/hasClasses/", passport.authenticate('jwt', { session: false}), function getAccountsWithClasses(req, res, next) {
    var uG = config.get('userGroups');
    var valKeys = [];
        var i = 0;
        for (var key in uG) {

            
            console.log(i)
            if (uG.hasOwnProperty(key) && config.has('userGroups.' + key + '.hasClasses') && config.get('userGroups.' + key + '.hasClasses') == true) {
               
               valKeys.push(key);
            } 
            
            if(i >= Object.keys(uG).length-1) {
                recurrConcatHasClass(valKeys, [], function(err, finalArr) {
                    if(err) {
                        return next(err);
                    }
                    return res.json(finalArr)
                })                
            }
            i++;
        }
});

function recurrConcatHasClass(keys, finalArr, done) {
    if(keys.length <= 0) {
        return done(null, finalArr);
    }
    api.getUserGroupAccountByUserGroup(r.conn(), keys[0], function(err, acc) {
        if(err) {
            return done(err);
        }
        var clean = [];
        //skip usergroup
        if(acc.length <= 0) {
            return recurrConcatHasClass(keys.slice(1), finalArr, done);
        }
        for(var x = 0; x < acc.length; x++) {
            clean.push(utils.cleanUser(acc[x]));
            if(x >= acc.length-1) {
                finalArr = finalArr.concat(clean);
                return recurrConcatHasClass(keys.slice(1), finalArr, done);
            }
        }
        
    });
}

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

/** Sets a user schedule for a dashboard
    * @function setUserSchedule
    * @async
    * @param {request} req
    * @param {response} res
    * @param {nextCallback} next
    * @api POST /api/account/schedule/:dashboard
    * @apiparam {string} dashboard - The dashboard this is referring to (student, teacher)
    * @apiresponse {json} Returns rethinkDB action summery
    * @example 
    * <caption>Body Structure For Student Dashboard (application/json): </caption>
    * {
    *    "<periodConst>": {  //
    *       "teacherID": 1367081a-63d7-48cf-a9ac-a6b47a851b13 || null //an ID present means that it will link to that user,  null means that there is no teacher for that period.
    *   },
    *    "<periodConst>": null //this means that the period is dissabled and won't be returned
    * }
    * @returns {callback} - See: {@link #params-params-nextCallback|<a href="#params-nextCallback">Callback Definition</a>} 
*/

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
/** Updates the user's schedule for a dashboard
    * @function updateUserSchedule
    * @async
    * @param {request} req
    * @param {response} res
    * @param {nextCallback} next
    * @api PATCH /api/account/schedule/:dashboard
    * @apiparam {string} dashboard - The dashboard this is referring to (student, teacher)
    * @apiresponse {json} Returns rethinkDB action summery
    * @example 
    * <caption>Body Structure For Student Dashboard (application/json): </caption>
    * {
    *    "<periodConst>": {  //
    *       "teacherID": 1367081a-63d7-48cf-a9ac-a6b47a851b13 || null //an ID present means that it will link to that user,  null means that there is no teacher for that period.
    *   },
    *    "<periodConst>": null //this means that the period is dissabled and won't be returned
    * }
    * @returns {callback} - See: {@link #params-params-nextCallback|<a href="#params-nextCallback">Callback Definition</a>} 
*/
router.patch("/schedule/:dashboard", passport.authenticate('jwt', { session: false}), function updateUserSchedule(req, res, next) {
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

/** GETs account schedules for teacher dash
    * @function getSchedulesForTeacherDash
    * @async
    * @param {request} req
    * @param {response} res
    * @param {nextCallback} next
    * @api GET /api/account/schedule/teacher/id/:id/
    * @apiparam {string} id - A user's ID.
    * @apiresponse {json} Returns the schedule
    * @returns {callback} - See: {@link #params-params-nextCallback|<a href="#params-nextCallback">Callback Definition</a>} 
*/
router.get('/schedule/teacher/id/:id/', passport.authenticate('jwt', { session: false}), function getSchedulesForTeacherDash(req, res, next) {
    if(!req.params.id) {
        var err = new Error("ID Required");
        err.status = 400;
        return next(err)
    }
    //console.log("HIIIIIIIIIIIIIIIIIii")
    api.getTeacherSchedule(req.params.id, function(err, data) {
        if(err) {
            return next(err);
        }
        
        res.send(data)
    })
});


/** GETs All account schedule types for an account
    * @function getAllSchedules
    * @async
    * @param {request} req
    * @param {response} res
    * @param {nextCallback} next
    * @api GET /api/account/schedule/id/:id/
    * @apiparam {string} id - A user's ID.
    * @apiresponse {json} Returns the schedule
    * @returns {callback} - See: {@link #params-params-nextCallback|<a href="#params-nextCallback">Callback Definition</a>} 
*/
router.get('/schedule/id/:id/', passport.authenticate('jwt', { session: false}), function getAllSchedules(req, res, next) {
    if(!req.params.id) {
        var err = new Error("ID Required");
        err.status = 400;
        return next(err)
    }
    var prom = [];

    prom.push(new Promise(function(resolve, reject) {
        api.getStudentSchedule(req.params.id, function(err, data) {
            if(err && err.status != 404) {
                return reject(err);
            }
            
            return resolve(data)
        })
    }))

    prom.push(new Promise(function(resolve, reject) {
        api.getTeacherSchedule(req.params.id, function(err, data) {
            if(err && err.status != 404) {
                return reject(err);
            }
            
            return resolve(data)
        })
    }))

    Promise.all(prom).then(function(arr) {
        res.json({studentType: arr[0], teacherType: arr[1]});
    }).catch(function(err) {
        return next(err)
    });
});


/** GETs Current Period Location regardless of dashboard
    * @function getCurrentLocation
    * @async
    * @param {request} req
    * @param {response} res
    * @param {nextCallback} next
    * @api GET /api/account/location/datetime/:dateTime/id/:id/
    * @apiparam {string} id - A user's ID.
    * @apiparam {string} dateTime - An ISO dateTime string WITH timezone.
    * @apiresponse {json} Returns Both teacher and studnet locations 
    * @returns {callback} - See: {@link #params-params-nextCallback|<a href="#params-nextCallback">Callback Definition</a>} 
*/

router.get('/location/datetime/:dateTime/id/:id/', passport.authenticate('jwt', { session: false}), function getCurrentLocation(req, res, next) {
    var promises = [];
    if(!req.params.id) {
        var err = new Error("ID Required");
        err.status = 400;
        return next(err)
    }
    scheduleApi.getActivePeriodsAtDateTime(req.params.dateTime, function(err, currentSchedules) {
        if(err) {
            return next(err);
        }
        if(currentSchedules.length <=0 ) {
            return res.json({})
        }
        var forPeriods = currentSchedules.map(function(x) {
            return x.period
        })
        console.log(forPeriods)
        //get user's location 
        promises.push(getPeriodsInScheduleThenReformat(req.params.id, forPeriods, "schedule"));

        //Check for Passes 
        promises.push(new Promise(function(doneResolve, doneReject) {
            passApi.flexableGetPasses(req.params.id, "migrator", moment(req.params.dateTime).utc().format("Y-MM-DD"), moment(req.params.dateTime).add(1, "days").utc().format("Y-MM-DD"), forPeriods, function(err, passes) {
                if(err) {
                    return doneReject(err);
                }
                var passPromise = [];
                if(passes.length <= 0) {
                    return doneResolve({pass: null})
                }
                console.log(passes.length)
                for(var x = 0; x < passes.length; x++) {
                    if(!passes[x].toPerson || !passes[x].toPerson.schedules) {
                        passPromise.push(new Promise(function(resolve, reject) {
                            return resolve({pass: null})
                        }));
                        
                    } else {
                        if(!passes[x].toPerson.schedules.teacher && !passes[x].toPerson.schedules.student) {
                        //console.log(passes[x].toPerson)
                            passPromise.push(new Promise(function(resolve, reject) {
                                return resolve({pass: null})
                            }));
                        } else {
                            passPromise.push(getPeriodsInScheduleThenReformat(passes[x].toPerson.id, forPeriods, "pass", {passId: passes[x].id, toPerson: passes[x].toPerson}));
                        }
                    }
                    
                    

                    if(x >= passes.length - 1) {
                        //console.log("hello")
                        Promise.all(passPromise).then(function(data) {
                            var finalPassData = {};
                            var studentPassArr = [];
                            var teacherPassArr = [];
                            
                            if(data.length <= 0) {
                                return doneResolve({});
                            }
                            for(var i = 0; i < data.length; i++) {
                                if(data[i].pass && data[i].pass.student) {
                                   studentPassArr= studentPassArr.concat(data[i].pass.student)
                                }

                                if(data[i].pass && data[i].pass.teacher) {
                                    teacherPassArr = teacherPassArr.concat(data[i].pass.teacher);
                                }

                                if(i >= data.length -1 ) {

                                    console.log(finalPassData, "tru")
                                    return doneResolve({pass: {student: studentPassArr, teacher: teacherPassArr}})
                                }
                            }
                            
                        }).catch(function(err) {
                            return doneReject(err)
                        });
                    }
                }
                


                
            });
        }));

        Promise.all(promises).then(function(data) {

            return res.json(Object.assign({}, data[0], data[1]))
        }).catch(function(err) {
            return next(err)
        });
    })
});

function getPeriodsInScheduleThenReformat(userID, forPeriods, scheduleKeyName, extraData) {
    return new Promise(function(doneResolve, doneReject) {
        var promises = [];
         api.getSpecificPeriods(userID, forPeriods, function(err, periodData) {
            if(err) {
                return doneReject(err)
            }
            //return res.json(periodData)
            if(!periodData) {
                var err = new Error("getSpecificPeriods did not return anything ");
                err.status = 500;
                return doneReject(err)
            }
            //Get student.schedule return data
            var scheduleLocationReturn = {};
            scheduleLocationReturn[scheduleKeyName] = {};
            promises.push(new Promise(function(resolve, reject) {
                if(periodData.student) {
                    //scheduleLocationReturn[scheduleKeyName].student = [];
                    var pS = periodData.student;
                    var tS = [];
                    if(pS.length <=0) {
                        return resolve();
                    }
                    for(var x = 0; x < pS.length; x++) {
                        if(pS[x].periodData) {
                            //check if they have a teacher or not
                            if(pS[x].periodData.teacher) {
                                //check if the teacer has a schedule set
                                tS.push(Object.assign({},{period: pS[x].period}, pS[x].periodData, extraData))
                            } else {
                                tS.push(Object.assign({},{period: pS[x].period, teacher: null}, extraData))
                            }
                        }
                        //end
                        if(x >= pS.length - 1) {
                            scheduleLocationReturn[scheduleKeyName].student = tS
                            return resolve();
                        }
                    }
                } else {
                    return resolve();
                }
            }));

            //get teacher.schedule 
            promises.push(new Promise(function(resolve, reject) {
                if(periodData.teacher) {
                    //scheduleLocationReturn[scheduleKeyName].teacher = [];
                    var pT = periodData.teacher;
                    var tT = [];
                    if(pT.length <=0) {
                        return resolve();
                    }
                    for(var x = 0; x < pT.length; x++) {
                        if(pT[x].periodData) {
                            tT.push(Object.assign({},{period: pT[x].period}, pT[x].periodData, extraData))
                        }
                        if(x >= pT.length-1) {
                            scheduleLocationReturn[scheduleKeyName].teacher = tT;
                            return resolve();
                        }
                    }
                    
                } else {
                    return resolve();
                }
            }));

            Promise.all(promises).then(function(data) {
                return doneResolve(scheduleLocationReturn)
            }).catch(function(err) {
                return doneReject(err)
            });
        });

    });
}

/**/

/** Checks if an accuunt is missing required fields by that dashboard  
    * @function studentCheckIfIncomplete
    * @async
    * @param {request} req
    * @param {response} res
    * @param {nextCallback} next
    * @api GET /api/account/incomplete/dashboard/student
    * @apiresponse {json} Returns missing fields
    * @returns {callback} - See: {@link #params-params-nextCallback|<a href="#params-nextCallback">Callback Definition</a>} 
    * @todo SSARV
*/
router.get('/incomplete/dashboard/student', passport.authenticate('jwt', { session: false}), function studentCheckIfIncomplete(req, res, next) {
    //todo 
});


/** Updates user Password   
    * @function updateUserPassword
    * @param {request} req
    * @property {Object} body
    * @property {String} body.current - The user's current password.
    * @property {String} body.new - The user's new password.
    * @param {response} res
    * @param {nextCallback} next
    * @api PATCH /api/account/password/
    * @apiresponse {json} Status Code
    * @returns {callback} - See: {@link nextCallback} 
*/
router.patch("/password/", passport.authenticate('jwt', { session: false}), function updateUserPassword(req, res, next) {
    if(typeof req.body.current === "string" && typeof req.body.new === "string") {
        api.changePassword(req.user.id, req.body.current, req.body.new).then(function(trans) {
            return res.send(trans);
        }).catch(function(err) {
            return next(err);
        })
    } else {
        var err = new Error("Body Malformed")
        err.status = 400;
        return next(err);
    }
});

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