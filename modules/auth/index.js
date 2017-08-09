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
var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
var config = require('config');
var utils = require('../passport-utils/index.js');


module.exports = function(passport, r, bcrypt) { // takes the passportjs object and a rethinkdb object


var connection = null;
        r.connect( {host: config.get('rethinkdb.host'), port: config.get('rethinkdb.port'), db: config.get('rethinkdb.database'), password: config.get("rethinkdb.password")}, function(err, conn) {
            if (err) throw err;
            connection = conn;
        });


passport.serializeUser(function(user, done) {
  done(null, user[0].id);
  //console.log(user);
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
    passwordField: 'password',
    //session: true,
    passReqToCallback: true
    },
  function(req, email, password, done) {
    r.table("accounts").filter({
        "email": email
    }).run(connection, function(err, cursor){
      if (err) {
        return done(err)
      }
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
            console.log("Wrong email");
            return done(null, false);// , req.flash('loginMessage', 'Incorrect Email or Password')
          }
          if(!bcrypt.compareSync(password, user[0].password)) {
            console.log("Wrong Pwd");
            return done(null, false); // , req.flash('loginMessage', 'Incorrect Email or Password')
          }
          return done(null, user);
      });
    });
  }
));

/**
  JSON Wev Token Auth for API 
**/

var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeader(); // Header: "Authorization"
opts.secretOrKey = config.get('secrets.api-secret-key');
//opts.issuer = "localhost";
//opts.audience = "localhost";

//TODO: Reissue a new JWT if it has been 10 min from last reissuing 
passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
  //console.log("HELLOO");
  //console.log(jwt_payload.id);
  //console.log(jwt_payload);
  //Get account by ID and then upt it into req.user by calling done(null, doc);
  r.table('accounts').get(jwt_payload.id).run(connection, function(err, doc) {
    if (err) {
      return done(err); 
    } else if(doc) {
      return done(null, utils.cleanUser(doc));
    } else {
      return done(null, false);
    }
    
  });
}));



}