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
var bcrypt = require('bcrypt-nodejs');
var config = require('config');

/*
var httpv = require('http').Server(router);
var io = require('socket.io')(httpv);
*/
//var r = require('../modules/db/index.js')();
var passport = require('passport')
//  , LocalStrategy = require('passport-local').Strategy;
var api = require('../modules/passport-api/index.js');



  // Rethink db connection
var connection = null;
        r.connect( {host: config.get('rethinkdb.host'), port: config.get('rethinkdb.port'), db: config.get('rethinkdb.database'), password: config.get("rethinkdb.password")}, function(err, conn) {
            if (err) throw err;
            connection = conn;
        });


/** 
  Google Login
**/

router.get('/google/', function googleOAuth2(req, res, next) {
    //req.session.permissionKey = req.query.pk;
    if(req.query.dscm) {
      req.session.googleDSCM = true;
    } else {
      req.session.googleDSCM = false;
    }

    
    next();
}, function(req, res, next) {
  var prom = null;
  if(req.query.failGoogle) {
    prom = "select_account"
  }
  passport.authenticate('google', { scope: 
    [ "profile", "email" ],
    prompt: prom}
  )(req, res, function(err) {
    if(err) {
      return next(err);
    }
    return next();
  })
});

/*
router.get('/google/dscm', function (req, res, next) {
    //req.session.permissionKey = req.query.pk;
    req.session.googleDSCM = true;
    next();
}, passport.authenticate('google', { scope: 
    [ "profile", "email" ] }
));*/

//'https://www.googleapis.com/auth/plus.profile.emails.read'
router.get('/login', function(req, res, next) {
  var msg = "";
  var googleQuery = "";
  if(req.query.msg) {
    msg = req.query.msg;
  }
  if(req.query.failGoogle) {

    googleQuery += "&failGoogle=true";
  }
  res.render('auth/login', { doc_Title: 'Login -- Passport', message: msg, googleQuery: googleQuery});
});




//et signup
router.get('/signup/', function(req, res, next) {
  var msg = null;
  
  res.render('auth/signup', { doc_Title: 'Signup -- Passport', message: msg});
});


/*io.on('connection', function(socket){
  console.log('a user connected');
});*/


router.get('/logout', function(req, res, next){
  //req.logout();

  if(!config.get('misc.storeSessionToDisc')) {
    req.session = null;
    req.logout();
    res.redirect('/auth/login');
  } else {
    req.session.destroy(function (err) {
      if(err) {
        return next(err)
      }
      res.redirect('/auth/login'); 
    });
  }
 

  //res.redirect('/auth/login');
});




module.exports = router;
