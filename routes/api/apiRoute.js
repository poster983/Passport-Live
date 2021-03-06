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
* @module apiRoute
*/
var express = require("express");
var router = express.Router();
var r = require("rethinkdb");
//var bcrypt = require('bcrypt-nodejs');
var passport = require("passport");
var config = require("config");
var utils = require("../../modules/passport-utils/index.js");
var api = require("../../modules/passport-api/index.js"); //("jdsfak"); 
var cors = require("cors");

var accountApi = require("../../modules/passport-api/accounts.js");

router.use(cors());
router.options("*", cors());


// Rethink db connection
var connection = null;
r.connect( {host: config.get("rethinkdb.host"), port: config.get("rethinkdb.port"), db: config.get("rethinkdb.database"), password: config.get("rethinkdb.password")}, function(err, conn) {
    if (err) throw err;
    connection = conn;
});

//https://blog.jscrambler.com/implementing-jwt-using-passport/


/**
PASSPORT AUTH
**/



/*
NEED TO MOVE TO OWN FILE, OR MAKE MORE EFFICIENT
*/
/*
var connection = null;
        r.connect( {host: config.get('rethinkdb.host'), port: config.get('rethinkdb.port'), db: config.get('rethinkdb.database')}, function(err, conn) {
            if (err) throw err;
            connection = conn;
        });
*/

/**
AUTH
**/

//serializeUser becaule the default passport.serializeUser function wont be called without session
/**
* takes req.user and makes it useable in the session.  Called automaticly 
* @function serializeUser
* @ignore
*/
function serializeUser(req, res, done) {
    console.log(req.user[0]);
    //REMOVE SECRET INFO LIKE PASSWORDS
    //delete req.user[0].password;
    //req.user = req.user[0];
    req.user = utils.cleanUser(req.user);
    done();
}


//debug function
function getHead(req, res, done) {
    console.log(req.headers);
    console.log(req.header("Authorization"));
    done();
}

/** 
AUTH 
**/
/*
router.post('/auth/login', passport.authenticate('local-login', {
  session: false
}), handleAuthLogin);*/
/**
* Logges the user in using passport.authenticate
* @function handleAuthLogin
* @async
* @param {request} req
* @param {response} res
* @api POST /api/auth/login/
* @apibody {application/x-www-form-urlencoded}
* @example 
* <caption>Body structure: </caption>
* email:<user's email>,
* password:<user's password>
* @todo Test application/json
* @apiresponse {json} Returns in a json object with key: "token" and the value has a PassportJS compatible JWT
* @todo Require passport to run over https
*//*
function handleAuthLogin(req, res) {
    //Make a token
    /*
    var token = jwt.sign({
        id: req.user[0].id,
      }, config.get('secrets.api-secret-key'), {
        expiresIn: 60*60*24
    });*
    //Return token to user
    res.status(200).json({
        token: "JWT " + token
    });
}*/





/** 
PASSES
**/


/**
SECURITY 
**/
//WILL NEED ACCOUNT PROTECTION 
//ssarv(["admin", "dev"], {locationOfRoles: "user.userGroup"}),


/**
schedule
**/
//new Schedule Definition 
router.post("/schedule/definition", passport.authenticate("jwt", { session: false}), utils.dashboardPermission(["administrator"]), function(req, res, next) {
    var name=req.body.name;
    var scheduleData=req.body.scheduleData;

    api.newScheduleDefinition(connection, name, scheduleData, function(err, data) {
        if(err) {
            return next(err);
        }
        res.status(201).json(data);
    });
});
//get All Schedule Definition
//ssarv(["teacher", "counselor", "lc", "dev", "admin"], {locationOfRoles: "user.userGroup"}), 
router.get("/schedule/definition", passport.authenticate("jwt", { session: false}), function(req, res, next) {

    api.getScheduleDefinition(connection, null, function(err, data) {
        if(err) {
            return next(err);
        }
        res.json(data);
    });
});

//get Schedule Definition
router.get("/schedule/definition/:id", passport.authenticate("jwt", { session: false}), function(req, res, next) {
    var id=req.params.id;

    api.getScheduleDefinition(connection, id, function(err, data) {
        if(err) {
            return next(err);
        }
        res.json(data);
    });
});
//schedule Single Schedule Definition

router.post("/schedule/date", passport.authenticate("jwt", { session: false}), utils.dashboardPermission(["administrator"]), function(req, res, next) {
    var SCid=req.body.ScheduleDefinitionID;
    var date=req.body.date;

    api.scheduleSingleScheduleDefinition(connection, SCid, date, function(err, data) {
        if(err) {
            return next(err);
        }

        res.status(201).json(data);
    });
});
router.get("/schedule/date/:id", function(req, res, next) {
    res.sendStatus(501);
});

router.post("/schedule/repeat", passport.authenticate("jwt", { session: false}), utils.dashboardPermission(["administrator"]), function(req, res, next) {
    var SCid=req.body.ScheduleDefinitionID;
    var repeatingRule=req.body.repeatingRule;

    api.scheduleRepeatingScheduleDefinition(connection, SCid, repeatingRule, function(err, data) {
        if(err) {
            return next(err);
        }
        res.status(201).json(data);
    });
});

router.get("/schedule/repeat/:id", function(req, res, next) {
    res.sendStatus(501);
});

router.get("/schedule/for/:date", passport.authenticate("jwt", { session: false}), function(req, res, next) {
    var date=req.params.date;
    api.getScheduleOfADate(connection, date, false, function(err, data) {
        if(err) {
            return next(err);
        }

        res.json(data);
    });
});

/**
SERVER
**/

/**
    * GETs pass groups defined in the config
    * @function getScheduleConstants
    * @async
    * @param {request} req
    * @param {response} res
    * @param {nextCallback} next
    * @api GET /api/server/config/schedule/
    * @apiresponse {object} Returns Array with all constants
    * @returns {callback} - See: {@link #params-params-nextCallback|<a href="#params-nextCallback">Callback Definition</a>} 
    */ 
router.get("/server/config/schedule/", utils.rateLimit.publicApiBruteforce.prevent, function getScheduleConstants(req, res, next) {
    try {
        res.json(config.get("schedule"));
    } catch (e) {
        next(e);
    }
});

/**
    * GETs all user groups defined in the config
    * @function getUserGroups
    * @async
    * @param {request} req
    * @param {response} res
    * @param {nextCallback} next
    * @api GET /api/server/config/userGroups/
    * @apiresponse {json} All usergroup data
    * @returns {callback} - See: {@link #params-params-nextCallback|<a href="#params-nextCallback">Callback Definition</a>} 
    */ 
router.get("/server/config/userGroups/", utils.rateLimit.publicApiBruteforce.prevent, function getUserGroups(req, res, next) {
    try {
        res.json(config.get("userGroups"));
    } catch (e) {
        next(e);
    }
});

router.get("/server/config/passGroup", utils.rateLimit.publicApiBruteforce.prevent, getPassGroups);
/**
    * GETs pass groups defined in the config
    * @function handleGetAccountsByName
    * @async
    * @param {request} req
    * @param {response} res
    * @param {nextCallback} next
    * @api GET /api/server/config/passGroup/
    * @apiresponse {json} Returns json with all passGroups
    * @returns {callback} - See: {@link #params-params-nextCallback|<a href="#params-nextCallback">Callback Definition</a>} 
    */
function getPassGroups(req, res, next) {
    api.getPassGroups(function(err, data) {
        if(err) {return next(err);}

        res.json(data);  
    });
}



/**
    TESTING
**/
/*
router.post('/test', getHead, function(req, res, next) {
    res.status(200).json({});
});*/

/*
router.post('/test', getHead, passport.authenticate('jwt', { session: false}), function(req, res, next) {
    api.tester("hi There", function(err, resp) {
        console.log("Error: " + err + " Callback: " + resp);
    });
    res.status(200).json(req.user);
});*/
/*
router.post('/test/db', function(req, res, next) {
    /*r.table("scheduleCalendar").eqJoin("ScheduleDefinitionID", r.table("scheduleDefinitions")).map( r.row.merge({
            "c_id": r.row("id")
    })).without({"left": {"ScheduleDefinitionID": true}}).zip().run(connection, function(err, cursor) {
        if(err) return next(err);
        cursor.toArray(function(err, results) {
            if(err) return next(err);
            res.send(results);
        });
        
    })*//*
    r.table("scheduleCalendar").map( r.row.merge(function(ro) {
        return {ider: r.table('scheduleDefinitions').get(ro('ScheduleDefinitionID'))}
    })).run(connection, function(err, cursor) {
        if(err) return next(err);
        cursor.toArray(function(err, results) {
            if(err) return next(err);
            res.send(results);
        });
        
    })
});*/

/*
router.get('/test/key/:key', function(req, res, next) {
    console.log(req.params.key)
    api.checkPermissionKey(connection, req.params.key, function(err, document) {
        if(err) {
            next(err);
        } else {
            res.json(document);
        }
        
    });
})*/
/*
router.get("/test/date/:dateTime", function(req, res, next) {
    scheduleApi.getActivePeriodsAtDateTime(req.params.dateTime, function(err, resp) {
        if(err) {
            return next(err)
        }
        return res.send(resp)
    })
})*/


//default Responce
router.get("/", function(req, res, next) {
    res.status(418);
    res.send("Brewing your coffee");

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