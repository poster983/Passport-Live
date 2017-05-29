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
//All functions that make the api function.
module.exports = { //function API(test) 
    /**
    ACCOUNTS 
    **/
    //Creates a new account 
    //groupFields takes a json object.
    //done(err, httpCode);
    /*
        Group field can contain for example {stuID: 123} Or {myCustomField: "Hello"}
    */
    createAccount: function(dbConn, userGroup, firstName, lastName, email, password, groupFields, done) {
        bcrypt.hash(password, null, null, function(err, hash) {
            if(err) {
                console.error(err);
                return done(err, {
                    code: 500,
                    englishResp: "Server Error"
                });
            }
          // Store hash in your password DB.
          r.table("accounts")('email').contains(email).run(dbConn, function(err, con){
            if(err) {
                console.error(err);
                return done(err, {
                    code: 500,
                    englishResp: "Server Error"
                });
            }
            //Checks to see if there is already an email in the DB            
            if(con){
              //THe email has been taken
              return done(null, {
                    code: 409,
                    englishResp: "Email Taken"
                });
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
                    //Returns 201
                    return done(null, {
                        code: 201,
                        englishResp: "Created"
                    });
              });
            }
          });
        });   
    },
    

    tester: function(hello, done) {
        console.log(hello);
        done(null, hello);
    }
}