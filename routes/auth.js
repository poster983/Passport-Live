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
        r.connect( {host: config.get('rethinkdb.host'), port: config.get('rethinkdb.port'), db: config.get('rethinkdb.database')}, function(err, conn) {
            if (err) throw err;
            connection = conn;
        });



/* GET home page. */

router.get('/login', function(req, res, next) {
  res.render('auth/login', { doc_Title: 'Login -- Passport', message: req.flash('loginMessage')});
});
router.post('/login', passport.authenticate('local-login', { 
  successRedirect: '/',
  failureRedirect: '/auth/login',
  failureFlash: true,
  session: true
}));


//et signup
router.get('/signup/student', function(req, res, next) {
  res.render('auth/signup', { doc_Title: 'Signup -- Passport', sendTo:'/auth/signup/student', message: req.flash('signupMessage')});
});

// POST MAke New Account 
//THIS WILL BE MOVED TO THE API LATER!!!
router.post('/signup/student', function(req, res) {
  var email=req.body.email;
  var password=req.body.password;
  var passwordVerification=req.body.passwordVerification;
  var firstName = req.body.firstName;
  var lastName = req.body.lastName;
  var groupFields = req.body.groupFields
  var userGroup = req.params.userGroup;

  
  if(password != passwordVer) {
    req.flash('signupMessage', 'Passwords Don\'t Match');
    res.redirect('/auth/signup/student');
    
  } else {
      api.createAccount(connection, "student", fn, ln, email, password, {stuID: stuID}, function(err, resp) {
        if(err) {
          console.log(err);
          req.flash('signupMessage', resp.englishResp);
          res.status(resp.code).redirect('/auth/signup/student');
        } else {
          if(resp.code == 201) {
            req.flash('loginMessage', resp.englishResp);
            res.status(resp.code).redirect('/auth/login');
          } else {
            req.flash('signupMessage', resp.englishResp);
            res.status(resp.code).redirect('/auth/signup/student');
          }
        }
      });
  }
});

/*io.on('connection', function(socket){
  console.log('a user connected');
});*/


router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/auth/login');
});


module.exports = router;
