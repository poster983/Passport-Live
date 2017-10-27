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


var r = require('rethinkdb');
var connection = null;
var config = require('config');

exports.setup = function(noDefaultDB) {
        return new Promise(function(resolve, reject) {
            var connOpt = {};
            if(!noDefaultDB) {
                connOpt.db = config.get('rethinkdb.database');
            }
            connOpt.host = config.get('rethinkdb.host');
            connOpt.port = config.get('rethinkdb.port');
            connOpt.password = config.get("rethinkdb.password");
            r.connect(connOpt, function(err, conn) {
                if (err) {
                    throw err;
                }
                console.log("DB Connected")
                connection = conn;
                resolve(conn);
            });
        }) 
}

exports.get = function() {
        return r;
}
exports.conn = function() {
    return connection;
}

//return module.exports