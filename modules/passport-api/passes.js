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
 * @module js/passes
 */

var r = require("rethinkdb");
var db = require("../db/index.js");
var r_ = db.dash();
var utils = require("../passport-utils/index.js");
var moment = require("moment");
var validator = require("validator");
var typeCheck = require("type-check").typeCheck;

var accountScheduleJS = require("./accountSchedule.js");

/**
 * Creates a new account
 * @link module:js/passes
 * @param {string} toPerson - Id of the account recieving the migrating person
 * @param {string} [fromPerson=null] - Id of the account releasing the migrating person
 * @param {string} migrator - Id of the account moving between people
 * @param {string} requester - Id of the account who requested the pass
 * @param {string} period
 * @param {(date|ISOString)} date
 * @param {boolean} checkDupe - Sheck if there is an identical pass in the system already.
 * @param {function} done - callback
 * @returns {done} Error, or a transaction statement 
 */
exports.newPass = function (pass, toPerson, fromPerson, migrator, requester, period, date, checkDupe, done) {
    //validate
    let passType = "{toPerson: String, fromPerson: Maybe String, migrator: String, requester: String, period: period, date: Date|ISODate}";
    if (typeCheck(passType, pass, utils.typeCheck)) {
        
    }
    if (!toPerson || typeof toPerson != "string") {
        var err = new Error("toPerson Not Valid");
        err.status = 400;
        return done(err);
    }
    if (!fromPerson || typeof fromPerson != "string") {
        /*var err = new Error("fromPerson Not Valid");
            err.status = 400;
            return done(err)*/
        fromPerson = null;
    }
    if (!migrator || typeof migrator != "string") {
        var err = new Error("Migrator Not Valid");
        err.status = 400;
        return done(err);
    }
    if (!requester || typeof requester != "string") {
        var err = new Error("Requester Not Valid");
        err.status = 400;
        return done(err);
    }
    utils.checkPeriod(period, function (err, bool) {
        if (err) {
            return done(err);
        }
        if (!bool) {
            err = new Error("Period Not Valid");
            err.status = 400;
            return done(err);
        }
    });
    if (!typeCheck("Date | ISODate", date, utils.typeCheck)) {
        var err = new TypeError("date expected to be a \"Date\" or an ISODate. Got: " + typeof date);
        err.status = 400;
        return done(err);
    } else if (typeCheck("Date", date)) {
        date = moment(date).toISOString();
    }
    //console.log(date)
    //check for dupe 
    var promise = new Promise(function (resolve, reject) {
        if (checkDupe) {
            r.table("passes").filter({
                toPerson: toPerson,
                fromPerson: fromPerson,
                migrator: migrator,
                requester: requester,
                period: period,
                date: r.ISO8601(date)
            }).run(db.conn(), function (err, cur) {
                if (err) {
                    return done(err);
                }
                cur.toArray(function (err, data) {
                    if (err) {
                        return done(err);
                    }
                    if (data.length > 0) {
                        var err = new Error("Duplicate Pass Found.  Aborting.");
                        err.status = 409;
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        } else {
            resolve();
        }
    });

    //resolve promice
    promise.then(function () {
        r.table("passes").insert({
            toPerson: toPerson,
            fromPerson: fromPerson,
            migrator: migrator,
            requester: requester,
            period: period,
            date: r.ISO8601(date),
            dateTimeRequested: r.now(),
            status: {
                confirmation: {
                    state: "pending",
                    setByUser: null,
                    msg: null
                },
                migration: {
                    excusedTime: null,
                    inLimbo: false,
                    arrivedTime: null
                }
            },
            seen: {
                email: [],
                web: []
            }
        }).run(db.conn(), function (err, trans) {
            if (err) {
                return done(err);
            }
            return done(null, trans);
        });
    }, function (err) {
        return done(err);
    });
};

/**
 * Gets passes with flexable id search
 * @link module:js/passes
 * @param {string} id - Id of the account
 * @param {string} byColl - Where to search for the id.  Possible values: "fromPerson", "toPerson", "migrator", "requester"
 * @param {date} fromDate - low range date to search for.  
 * @param {date} toDate - High range date to search for.  set null for none
 * @param {array} periods - Only return passes with these periods.  set null for none
 * @param {function} done - callback
 * @returns {done} Error, or a transaction statement 
 */
exports.flexableGetPasses = function (id, byColl, fromDate, toDate, periods, done) {
    console.log(periods);
    if (!id || typeof id != "string") {
        var err = new Error("Invalid ID");
        err.status = 400;
        return done(err);
    }
    if (!byColl || typeof byColl != "string" || (byColl != "fromPerson" && byColl != "toPerson" && byColl != "migrator" && byColl != "requester")) {
        var err = new Error("By Column Is Invalid");
        err.status = 400;
        return done(err);
    }
    if (!moment(fromDate, "Y-MM-DD", true).isValid()) {
        var err = new Error("fromDate Not Valid");
        err.status = 400;
        return done(err);
    } else {

        fromDate = moment(fromDate).toISOString();
    }

    if (!moment(toDate, "Y-MM-DD", true).isValid()) {
        toDate = null;
    } else {

        toDate = moment(toDate).toISOString();

    }


    if (periods != null && !Array.isArray(periods)) {
        var err = new Error("Expected periods to be either undefined, null or an array.  Got: " + typeof periods);
        err.status = 400;
        return done(err);
    }



    r.table("passes")

        .filter(function (person) {
            return person(byColl).eq(id);
        })
        .filter(function (day) {
            if (!toDate) {
                return day("date").date().gt(r.ISO8601(fromDate).date()).or(
                    day("date").date().eq(r.ISO8601(fromDate).date()));
            } else {
                return day("date").date().during(r.ISO8601(fromDate).date(), r.ISO8601(toDate).date());
            }
        })
        .filter(function (period) {
            if (!periods) {
                return true;
            } else {
                console.log(period("period"));
                return r.expr(periods).contains(period("period"));
            }
        })
        //join optional fromPerson value
        .outerJoin(r.table("accounts"), function (passRow, accountRow) {
            return passRow("fromPerson").eq(accountRow("id"));
        })
        .map(r.row.merge(function (ro) {
            return ro("left");
        }))
        .without("left")
        .map(r.row.merge(function (ro) {
            return {

                "fromPerson": ro("right").pluck("id", "name", "email", "schedules").default(null)

            };
        }))
        .without("right")
        //_______
        //merge toPerson

        .eqJoin("toPerson", r.table("accounts"))
        //remove left
        .map(r.row.merge(function (ro) {
            return ro("left");
        }))
        .without("left")
        .map(r.row.merge(function (ro) {
            return {
                "toPerson": ro("right").pluck("id", "name", "email", "schedules")
            };
        }))
        .without("right")
        //___________
        //merge Requester

        .eqJoin("requester", r.table("accounts"))
        //remove left
        .map(r.row.merge(function (ro) {
            return ro("left");
        }))
        .without("left")
        //merge correct values
        .map(r.row.merge(function (ro) {

            return {
                "requester": ro("right").pluck("id", "name", "email", "schedules")
            };
        }))
        .without("right")

        //___________
        //migrator Requester

        .eqJoin("migrator", r.table("accounts"))
        //remove left
        .map(r.row.merge(function (ro) {
            return ro("left");
        }))
        .without("left")
        //merge correct values
        .map(r.row.merge(function (ro) {
            return {
                "migrator": ro("right").pluck("id", "name", "email", "schedules")
            };
        }))
        .without("right")

        .run(db.conn(), function (err, dataCur) {
            if (err) {
                return done(err);
            }
            dataCur.toArray(function (err, data) {
                if (err) {
                    return done(err);
                }
                return done(null, data);
            });
        });

};



/**
 * Gets pass by Primary key
 * @link module:js/passes
 * @param {UUID} passId - Id of the Pass
 * @param {function} done - callback
 * @returns {done} Error, or pass object 
 */
exports.getPass = function (passId, done) {
    if (!validator.isUUID(passId)) {
        var err = new Error("Not a valid passId");
        err.status = 400;
        return done(err);
    }

    r.table("passes").get(passId).run(db.conn(), function (err, pass) {
        if (err) {
            return done(err);
        }
        return done(null, pass);
    });

};

/**
 * Updates pass fields
 * @link module:js/passes
 * @param {UUID} passId - Id of the Pass
 * @param {json} doc - Json object to update / insert into the db 
 * @param {function} done - callback
 * @returns {done} Error, or a transaction statement 
 */

exports.updatePass = function (passId, doc, done) {
    if (!validator.isUUID(passId)) {
        var err = new Error("Not a valid passId");
        err.status = 400;
        return done(err);
    }
    if (!doc || typeof doc != "object") {
        var err = new Error("Invalid Doc");
        err.status = 400;
        return done(err);
    }


    r.table("passes").get(passId).update(doc).run(db.conn(), function (err, trans) {
        if (err) {
            return done(err);
        }
        return done(null, trans);
    });
};

/**
 * Gets the pass tally for a user
 * @link module:js/passes
 * @param {string} userID - account id of user to tally up passes (AKA toPerson)
 * @param {string} period - a period constant to check for 
 * @param {(Date|ISOstring)} date - the day to tally up
 * @returns {Promise} passes tally and passLimit 
 */
exports.limitTally = (userID, period, date) => {
    return new Promise((resolve, reject) => {
        //get toPerson's passLimit
        accountScheduleJS.getTeacherSchedule(userID, {
            periods: [period]
        }).then((tSchedule) => {
            let outOf = null;
            if (typeCheck("{schedule: {" + period + ": {passLimit: Number, ...}}}", tSchedule)) {
                outOf = tSchedule.schedule[period].passLimit;
            }
            //get tally count
            r_.table("passes").filter(function (doc) {
                    return doc("date").date().eq(r_.ISO8601(date).date())
                        .and(doc("toPerson").eq(userID))
                        .and(doc("period").eq(period));
                }).count()
                .do(function (count) {
                    return {
                        tally: count,
                        passLimit: outOf
                    };
                }).run().then((tally) => {
                    return resolve(tally);
                }).catch((err) => {
                    return reject(err);
                });
        }).catch((err) => {
            return reject(err);
        });

    });
};
/*
exports.tally("b17c14ad-4799-4644-85e0-bd029475a17b", "a", "2018-01-08T06:00:00+00:00").then((res) => {
    console.log(res)
}).catch((err) => {
    console.error(err)
})*/