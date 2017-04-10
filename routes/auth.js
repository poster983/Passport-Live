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
var router = express();
var bodyParser = require('body-parser');
var r = require('rethinkdb');
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

  // Rethink db connection
  var connection = null;
r.connect( {host: 'localhost', port: 28015, db: 'passport'}, function(err, conn) {
    if (err) throw err;
    connection = conn;
});

/*Local PASSPORT.js auth*/
passport.use(new LocalStrategy({
    emailField: 'email',
    passwordField: 'passwd',
    session: true
    },
  function(email, password, done) {
    User.findOne({ email: email }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect email.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));


/* GET home page. */

router.get('/login', function(req, res, next) {
  res.render('auth/login', { title: 'Login -- Passport' });
});
//et signup
router.get('/signup', function(req, res, next) {
  res.render('auth/signup', { title: 'Signup -- Passport' });
});

// POST MAke New Account 
//THIS IS NOT FINAL MUST BE REWRITAIN 
router.post('/signup', function(req, res) {
    var email=req.body.email;
  var password=req.body.password;
  console.log("User name = "+email+", password is "+password);
  promice = r.table("accounts").insert({
    email: email,
    password: password
  }).run(connection);
    promice.then(function(conn) {
      res.end("yes");
    });
});


module.exports = router;
