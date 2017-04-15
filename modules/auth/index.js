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
//'use strict';

var LocalStrategy   = require('passport-local').Strategy;

module.exports = function(passport, r, bcrypt) { // takes the passportjs object and a rethinkdb object


var connection = null;
        r.connect( {host: 'localhost', port: 28015, db: 'passport'}, function(err, conn) {
            if (err) throw err;
            connection = conn;
        });


passport.serializeUser(function(user, done) {
  done(null, user[0].id);
  console.log(user);
});

passport.deserializeUser(function(id, done) {
     r.table("accounts").get(id).run(connection, function(err, user) {
    done(err, user);
    console.log("deserializeUser");
  });

});

/*Local  PASSPORT.js auth*/
passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'passwd',
    session: true,
    passReqToCallback: true
    },
  function(req, email, password, done) {
    r.table("accounts").filter({
        "email": email
    }).run(connection, function(err, cursor){
        cursor.toArray(function(errs, user) {
            if (err) {
              console.log(errs)
              return done(errs); 
            }
            //console.log(JSON.stringify(user, null, 2));
        
      //console.log(JSON.stringify(user.id));

      
         if (err) { 
            return done(err); 
          }
         if(user.length < 1) { // if no users are returned in the array 
            return done(null, false, req.flash('loginMessage', 'Incorrect Email or Password'));
          }
          if(!bcrypt.compareSync(password, user[0].password)) {
            return done(null, false, req.flash('loginMessage', 'Incorrect Email or Password'));
          }
          return done(null, user);
      });
    });
  }
));





}