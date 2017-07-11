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

var r = require('rethinkdb');
var db = require('../../modules/db/index.js');
var config = require("config");

exports.newBlackout = function(day, periods, creator, message, done) {
    r.table("blackouts").insert({
        day: day,
        periods: periods,
        creator: creator,
        message: message
    }).run(db.conn(), function(err, data) {
        if (err) {
            return done(err);
        }
        return done(null, data);
    })
}