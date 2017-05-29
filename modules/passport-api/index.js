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
//All functions that make the api function.
module.exports = { //function API(test) 
    /**
    ACCOUNTS 
    **/
    //Creates a new account 
    //groupFields takes a json object.
    //done(err, newID);
    
    newAccount: function(dbConn, userGroup, firstName, lastName, email, password, groupFields, done) {
        if(password != passwordVer) {
            done(new Error("Passwords Don't Match"))            
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
                    res.status(201);
                    res.end("TODO: Confirmation Email and prompt student to goto their email");
                  });
                }
              });
            });
          }
    },
    

    tester: function(hello, done) {
        console.log(hello);
        done(null, hello);
    }
}