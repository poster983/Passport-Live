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
/*
var httpv = require('http').Server(router);
var io = require('socket.io')(httpv);
*/
//var r = require('../modules/db/index.js')();
var passport = require('passport')
//  , LocalStrategy = require('passport-local').Strategy;




  // Rethink db connection
var connection = null;
        r.connect( {host: 'localhost', port: 28015, db: 'passport'}, function(err, conn) {
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
//THIS IS NOT FINAL MUST BE REWRITAIN 
router.post('/signup/student', function(req, res) {
  var email=req.body.email;
  var password=req.body.password;
  var passwordVer=req.body.passwordVer;
  var fn = req.body.firstname;
  var ln = req.body.lastname;
  var stuID = req.body.studentID;

  if(password != passwordVer) {
    req.flash('signupMessage', 'Passwords Don\'t Match');
    res.redirect('/auth/signup/student');
    
  } else {
    bcrypt.hash(password, null, null, function(err, hash) {
      // Store hash in your password DB.

      r.table("accounts")('email').contains(email).run(connection, function(err, con){
          console.log(con)
        
        if(con){
          console.log("Taken");
          req.flash('signupMessage', 'Email Already Taken');
          res.redirect('/auth/signup/student');
        } else {
        //console.log("User name = "+email+", password is "+password);
        promice = r.table("accounts").insert({
          firstName: fn,
          lastName: ln,
          stuID: stuID,
          email: email,
          password: hash,
          userGroup: "student" // should be same as a usergroup in config/default.json
        }).run(connection);
          promice.then(function(conn) {
            res.end("TODO: Confirmation Email and prompt student to goto their email");
          });
        }
      });
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
