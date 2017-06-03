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
var bcrypt = require('bcrypt-nodejs');
var r = require('rethinkdb');
var shortid = require('shortid');
var utils = require('../passport-utils/index.js');

//All functions that make the api function.
module.exports = { //function API(test) 
    /**
    ACCOUNTS 
    **/

    //Creates a new account 
    //groupFields takes a json object.
    //done(err);
    /*
        Group field can contain for example {stuID: 123} Or {myCustomField: "Hello"}
    */
    createAccount: function(dbConn, userGroup, firstName, lastName, email, password, groupFields, done) {
        bcrypt.hash(password, null, null, function(err, hash) {
            if(err) {
                console.error(err);
                return done(err, null);
            }
          // Store hash in your password DB.
          r.table("accounts")('email').contains(email).run(dbConn, function(err, con){
            if(err) {
                console.error(err);
                return done(err);
            }
            //Checks to see if there is already an email in the DB            
            if(con){
              //THe email has been taken
              var err = new Error("Email Taken");
              err.status = 409
              return done(err);
            } else {
                //insert new account
                promice = r.table("accounts").insert({
                  firstName: firstName,
                  lastName: lastName,
                  email: email,
                  password: hash,
                  userGroup: userGroup, // should be same as a usergroup in config/default.json
                  groupFields: groupFields
                }).run(dbConn);
                promice.then(function(conn) {
                    //Returns no error.
                    return done(null);
              });
            }
          });
        });   
    },

        
    /**
    SECURITY
    **/
    /*
    Creates a short permission key 

    Callback: done(err, key)
    "permissions": a JSON object with a custom permission payload 
    "parms": per Use case
    "timeout": Must be a Json object either:
    {
        on: "click", //will only work once
        tally: 5
    }
    OR 
    {
        on: "time",
        time: Date-time object
    }
    */
    createPermissionKey: function(dbConn, permissions, parms, timeout, done) {
        var key = shortid.generate()
        r.table("permissionKeys").insert({ 
            key: key,
            permissions: permissions,
            parms: parms,
            timeout: timeout
        }).run(dbConn, function(err) {
            if(err) {
                return done(err, null);
            }
            return done(null, key);
        })
    },
    //This checks to see if the Permission key is valid and returns a json object with the permissions.
    //Callback: done(err, perms)
    //SHould only return one
    checkPermissionKey: function(dbConn, key, done) {
        /*
        err = new Error('THIS IS A TEST');
        err.status = 418;
        return done(err, null);
        */
        
        r.table("permissionKeys").filter({
            key: key,
        }).run(dbConn, function(err, document) {
            if(err) {
                return done(err, null);
            }

            document.toArray(function(err, arr) {
                console.log(arr)
                //Found key
                if(0<arr.length) {
                    if(arr[0].timeout.on == "time") {
                        if(utils.compareDateWithToday(arr[0].timeout.time)) {
                            return done(null, arr[0].permissions);
                        } else {
                            var err = new Error("Key Not Valid");
                            err.status = 422;
                            return done(err, null);
                        }
                    } else if(arr[0].timeout.on == "click") {
                        if(arr[0].timeout.tally >= 1) {
                            
                        }
                    } else {

                    }
                    //return done(null, arr[0]);
                } else {
                    err = new Error("Key Not Found");
                    err.status = 404;
                    return done(err, null);
                }
            });
        });
    },

    tester: function(hello, done) {
        console.log(hello);
        done(null, hello);
    }
}