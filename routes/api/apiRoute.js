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
var passport = require('passport')

//https://blog.hyphe.me/token-based-authentication-with-node/

/**
PASSPORT AUTH
**/



/*
NEED TO MOVE TO OWN FILE, OR MAKE MORE EFFICIENT
*/
var connection = null;
        r.connect( {host: 'localhost', port: 28015, db: 'passport'}, function(err, conn) {
            if (err) throw err;
            connection = conn;
        });


/**
AUTH
**/

router.post('/auth/login', function(req, res, next) {

});

//default Responce
router.get('/', function(req, res, next) {
	res.send('This is an API.  This is not a valid route');
});
module.exports = router;
