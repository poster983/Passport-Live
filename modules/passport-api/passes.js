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


/**
    * Creates a new account
    * @function newPass
    * @async
    * @param {userId} toPerson - Id of the account recieving the migrating person
    * @param {userId} fromPerson - Id of the account releasing the migrating person
    * @param {userId} migrator - Id of the account moving between people
    * @param {userId} requester - Id of the account who requested the pass
    * @param {string} period
    * @param {date} date
    * @param {function} done - callback
    * @returns {done} Error, or a transaction statement 
    */
exports.newPass = function(toPerson, fromPerson, migrator, requester, period, date, done) {
    //validate
    if(!toPerson || typeof toPerson != "string") {
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
    }

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

/**
    * Gets passes with flexable id search
    * @function flexableGetPasses
    * @async
    * @param {userId} id - Id of the account
    * @param {string} byColl - Where to search for the id.  Possible values: "fromPerson", "toPerson", "migrator", "requester"
    * @param {date} fromDay - low range date to search for
    * @param {function} done - callback
    * @returns {done} Error, or a transaction statement 
    */
exports.flexableGetPasses = function(id, byColl, fromDate, done) {
    if(!id || typeof id != "string") {
        var err = new Error("Invalid ID");
            err.status = 400;
            return done(err)
    }
    if(!byColl || typeof byColl != "string" || byColl != "fromPerson" || byColl != "toPerson" || byColl != "migrator" || byColl != "requester" ||) {
        var err = new Error("By Column Is Invalid");
            err.status = 400;
            return done(err)
    }



    r.table("passes").filter(
        r.row(byColl).eq(id).and(r.row())
    ).run(db.conn(), function(err, dataCur) {
        if(err) {
            return done(err);
        }
        dataCur.toArray(function(err, data) {
            if(err) {
                return done(err);
            }
            return done(null, data)
        })
    })

}
