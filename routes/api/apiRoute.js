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
var express = require('express');
var router = express.Router();
var r = require('rethinkdb');
//var bcrypt = require('bcrypt-nodejs');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var config = require('config');
var utils = require('../../modules/passport-utils/index.js');
var api = require('../../modules/passport-api/index.js'); //("jdsfak"); 

  // Rethink db connection
var connection = null;
r.connect( {host: config.get('rethinkdb.host'), port: config.get('rethinkdb.port'), db: config.get('rethinkdb.database')}, function(err, conn) {
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
function serializeUser(req, res, done) {
    console.log(req.user[0]);
    //REMOVE SECRET INFO LIKE PASSWORDS
    //delete req.user[0].password;
    //req.user = req.user[0];
    req.user = utils.cleanUser(req.user);
    done();
};


//debug function
function getHead(req, res, done) {
    console.log(req.header("Authorization"));
    done();
};

/** 
AUTH 
**/

router.post('/auth/login', passport.authenticate('local-login', {
  session: false
}), function(req, res, next) {
    //Make a token
    var token = jwt.sign({
        id: req.user[0].id,
      }, config.get('secrets.api-secret-key'), {
        expiresIn: 60*60*24
    });
    //Return token to user
    res.status(200).json({
        token: "JWT " + token
    });
});

/** 
ACCOUNTS
**/
//New Account 
/*
Route:
`/api/account/new/:userGroup`

:userGroup = a userGroup set in the config files. 


The the post body is form-urlencoded
Body Data:

|Key|Data Type|
|---|---------|
|email|`String` The user's email address|
|password|`String` The user's requested password|
|passwordVerification|`String` A safety measure to verify that the user didn't mistype their password|
|firstName|`String` The user's given name|
|lastName|`String` The user's family name|
|groupFields|`JSON Object` any special fields that may pertain to any userGroup (like a student ID)|
|permissionKey|`String` (Optional, depending on userGroup Config) verifies that the user has permission to make an account|

Possible Status Codes: 
* 422 - The passwords don't match;
* 500 - The server encountered an error.  It's on our end.
* 409 - The email has already been taken
* 201 - Account was created!

*/
router.post('/account/:userGroup/', function(req, res, next) {
    //Get Params
    
    var email=req.body.email;
    var password=req.body.password;
    var passwordVerification=req.body.passwordVerification;
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var groupFields = req.body.groupFields
    var permissionKey = req.body.permissionKey;
    var userGroup = req.params.userGroup;

    //Checks to see if the account needs a verification key
    if(config.get('userGroups.' + userGroup + ".verifyAccountCreation")) {
        
    } else {
        if(password != passwordVer) {
            res.status(422);
        } else {
            api.createAccount(connection, userGroup, firstName, lastName, email, password, groupFields, function(err, resp) {
                if(err){
                    next(err);
                } else {
                    res.status(201);
                    next(null);
                }
            });
        }
    }
});

/** 
PASSES
**/


/**
SECURITY 
**/
//WILL NEED ACCOUNT PROTECTION 
router.post('/security/key/', function(req, res, next) {
    //res.json(req.body.permissions);
    
    var permissions=req.body.permissions;
    var parms=req.body.parms;
    var timeout=req.body.timeout;

    api.createPermissionKey(connection, permissions, parms, timeout, function(err, key) {
        if(err) {
            console.error(err);
            res.status(500)
        }
        res.status(201).send({
            key: key
        })
    })
    
});



/**
    TESTING
**/

router.post('/test', getHead, passport.authenticate('jwt', { session: false}), function(req, res, next) {
    api.tester("hi There", function(err, resp) {
        console.log("Error: " + err + " Callback: " + resp);
    });
    res.status(200).json(req.user);
});

router.get('/test/key/:key', function(req, res, next) {
    console.log(req.params.key)
    api.checkPermissionKey(connection, req.params.key, function(err, document) {
        if(err) {
            next(err);
        } else {
            res.json(document);
        }
        
    });
})

//default Responce
router.get('/', function(req, res, next) {
  res.status(418)
	res.send('Brewing your coffee');

});
module.exports = router;
