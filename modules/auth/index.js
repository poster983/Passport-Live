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
var GoogleStrategy = require('passport-google-oauth20').Strategy;
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
    //console.log("deserializeUser");

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
  Google OAuth 2.0
**/

passport.use(new GoogleStrategy({
    clientID:     config.get("secrets.OAuth.google.clientID"),
    clientSecret: config.get("secrets.OAuth.google.clientSecret"),
    callbackURL: config.get("server.domain") + "/api/auth/google/callback",
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
    console.log(profile, "profile");
    console.log(accessToken, "accessToken");
    console.log(refreshToken, "refreshToken");
    console.log(request.session.permissionKey, "permissionkey")

    if(profile.emails.length <1) {
      var err = new Error("No email attached to account")
      err.status = 412;
      return done(err);
      
    }
    var prom = new Promise(function(resolve, reject) {
      for(var x = 0; x < profile.emails.length; x++) {
        if(profile.emails[x].type == "account") {
          return resolve(profile.emails[x].value);
        }
        if(x >= profile.emails.length -1) {
          var err = new Error("No account email attached to google account");
          err.status = 412;
          return reject(err);
        }
      }
    });
    prom.then(function(googleEmail) {
      //find the oauth key if any
      r.table("accounts").filter({
          "integrations": {
            "google": {
              "id": profile.id
            }
          }
      }).run(connection, function(err, cursor){
        if (err) {
          return done(err)
        }
        cursor.toArray(function(err, accounts) {
          if(err) {
            return done(err);
          }
          if(accounts.length < 1) {
            //check if google email fits any existing accounts 
            r.table("accounts").filter({
                "email": googleEmail
            }).run(connection, function(err, eCursor){
              if(err) {
                return done(err);
              }
              eCursor.toArray(function(err, emailAccounts) {
                if(err) {
                  return done(err);
                }
                if(emailAccounts.length < 1) { 
                  //create account;
                  console.log("TODO: CREATE NEW ACCOUNT ")
                  return done(null, accounts);
                }

                if(accounts.length > 1) {
                  //console.log("Email Conflict ")
                  var err = new Error("Email Conflict")
                  err.status = 409;
                  return done(err);
                }
                if(accounts.length == 1) {
                  console.log("TODO: LINK ACCOUNTS ")
                  return done(null, accounts);
                }

              });
            });
          }
          if(accounts.length > 1) {
            var err = new Error("Account Conflict")
            err.status = 409;
            return done(err);
          }
          if(accounts.length == 1) {
            return done(null, accounts);
          }
        })
      });
    }, function(err) {
      return done(err);
    })
    

  }
));

/**
  JSON Web Token Auth for API 
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