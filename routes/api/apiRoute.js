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


//https://blog.jscrambler.com/implementing-jwt-using-passport/


/**
PASSPORT AUTH
**/



/*
NEED TO MOVE TO OWN FILE, OR MAKE MORE EFFICIENT
*/
var connection = null;
        r.connect( {host: 'localhost', port: 28015, db: 'passport'}, function(err, conn) {
            if (err) throw err;
            connection = conn;
        });


/**
AUTH
**/

//serializeUser becaule the default passport.serializeUser function wont be called without session
function serializeUser(req, res, done) {
    console.log(req.user[0]);
    //REMOVE SECRET INFO LIKE PASSWORDS
    delete req.user[0].password;
    req.user = req.user[0];
    /*
    req.user = {
      id: req.user[0].id,
      email: req.user[0].id
    };
    */
  done();
  console.log(req.user);
};

//Generates a unique Json Web Token for Auth

function generateToken(req, res, done) {
    req.token = jwt.sign({
        id: req.user.id,
      }, config.get('secrets.api-secret-key'), {
        expiresIn: 60*60*24
    });
    done();
}

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
        token: token
    });
});




/**
    TESTING
**/

router.post('/test', passport.authenticate('jwt', { session: false}), function(req, res, next) {
    res.status(200).json(req.user);
    res.send("Hello");
});


//default Responce
router.get('/', function(req, res, next) {
  res.status(418)
	res.send('Brewing your coffee');

});
module.exports = router;
