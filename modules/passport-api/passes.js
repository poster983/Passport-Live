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
/** 
* @module passportPassApi
*/

var r = require("rethinkdb")
var db = require("../db/index.js");
var utils = require("../passport-utils/index.js");
var moment = require("moment");



exports.newPass = function(toPerson, fromPerson, migrator, requester, period, date, done) {
    //validate
    /*if(!toPerson || typeof toPerson != "string") {
        var err = new Error("toPerson Not Valid");
            err.status = 400;
            return done(err)
    }
    if (!fromPerson || typeof fromPerson != "string") {
        var err = new Error("fromPerson Not Valid");
            err.status = 400;
            return done(err)
    }
    if(!migrator || typeof migrator != "string") {
        var err = new Error("Migrator Not Valid");
            err.status = 400;
            return done(err)
    }
    if(!requester || typeof requester != "string") {
        var err = new Error("Requester Not Valid");
            err.status = 400;
            return done(err)
    }
    utils.checkPeriod(period, function(err, bool) {
        if(err) {
            return done(err);
        }
        if(!bool) {
            err = new Error("Period Not Valid");
            err.status = 400;
            return done(err)
        }
    });
    if(!moment(date, "Y-MM-DD", true).isValid()) {
        var err = new Error("Date Not Valid");
            err.status = 400;
            return done(err)
    } else {
        date = moment(date).format("Y-MM-DD");
    }*/

    r.table("passes").insert({
        toPerson: toPerson,
        fromPerson: fromPerson,
        migrator: migrator,
        requester: requester,
        period: period,
        date: date,
        status: "pending"
    }).run(db.conn(), function(err, trans) {
        if(err) {
            return done(err);
        }
        return done(null, trans)
    })

}