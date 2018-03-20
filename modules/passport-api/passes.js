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

var db = require("../db/index.js");
var r = db.dash();
var utils = require("../passport-utils/index.js");
var moment = require("moment");
var validator = require("validator");
var typeCheck = require("type-check").typeCheck;

var accountScheduleJS = require("./accountSchedule.js");


/**
ENUM TYPES
**/
/**
 * Pass state values.
 * @readonly
 * @enum {String}
 */
exports.passStates = {
    /** One of the default states */
    PENDING: "pending", 
    /** One of the default states Used when the toPerson's period limit is full*/
    WAITLISTED: "waitlisted", 
    /** The pass has been seen by toPerson or migrator, and migrator has permission to come/is coming */
    ACCEPTED: "accepted",
    /** The migrator does not have permission / will not go see to go see toPerson. */
    DENIED: "denied",
    /** The pass has been previously accepted, but now is canceled */
    CANCELED: "canceled",
    /** The migrator has been excused and is moving to the toPerson.  This is a pseudo state and is determined if the excusedTime key is set */
    ENROUTE: "enroute",
    /** The migrator has arrived at the toPerson.  This is a pseudo state and is determined if the arrivedTime key is set.  arrivedTime overrides enroute if both are set */
    ARRIVED: "arrived"
};
exports.passStates = Object.freeze(exports.passStates);

/**
 * Pass types.
 * @readonly
 * @enum {String}
 */
exports.stateTypes = {
    /** Can be either pending or waitlisted */
    NEUTRAL: "neutral", 
    /** The pass has been seen by toPerson or migrator, and migrator has permission to come/is coming */
    ACCEPTED: "accepted",
    /** The pass has been previously accepted, but now is canceled */
    CANCELED: "canceled"
};
exports.stateTypes = Object.freeze(exports.stateTypes);




/**
 * Creates a new pass
 * @link module:js/passes
 * @param {Object} pass
 * @param {string} pass.toPerson - Id of the account recieving the migrating person
 * @param {string} [pass.fromPerson=null] - Id of the account releasing the migrating person
 * @param {string} pass.migrator - Id of the account moving between people
 * @param {string} pass.requester - Id of the account who requested the pass
 * @param {string} pass.period - must be a valid period set in the configs
 * @param {(Date|ISOString)} pass.date
 * @param {Object} [options]
 * @param {boolean} [options.checkLimit=true] - Checks if toPerson is full. If so, the pass will be set as "waitlisted"
 * @param {boolean} [options.checkDupe=true] - Sheck if there is an identical pass in the system already.
 * @returns {Promise} Error, or a transaction statement 
 */
exports.newPass = function (pass, options) {
    return new Promise((resolve, reject) => {
        //validate
        let passType = "{toPerson: String, fromPerson: Maybe String, migrator: String, requester: String, period: period, date: Date|ISODate}";
        if (!typeCheck(passType, pass, utils.typeCheck)) {
            var err = new Error("\"pass\" expected object with structure: " + passType);
            err.status = 400;
            return reject(err);
        }
        if (typeCheck("Date", pass.date)) {
            pass.date = moment(pass.date).toISOString();
        }
        if (!pass.fromPerson) {
            pass.fromPerson = null;
        }
        if(!options) {
            options = {};
        }
        /*
        if (!toPerson || typeof toPerson != "string") {
            var err = new Error("toPerson Not Valid");
            err.status = 400;
            return reject(err);
        }*/
        
        /*
        if (!migrator || typeof migrator != "string") {
            var err = new Error("Migrator Not Valid");
            err.status = 400;
            return reject(err);
        }
        if (!requester || typeof requester != "string") {
            var err = new Error("Requester Not Valid");
            err.status = 400;
            return reject(err);
        }
        utils.checkPeriod(period, function (err, bool) {
            if (err) {
                return reject(err);
            }
            if (!bool) {
                err = new Error("Period Not Valid");
                err.status = 400;
                return reject(err);
            }
        });
        if (!typeCheck("Date | ISODate", date, utils.typeCheck)) {
            var err = new TypeError("date expected to be a \"Date\" or an ISODate. Got: " + typeof date);
            err.status = 400;
            return reject(err);
        } else if (typeCheck("Date", date)) {
            date = moment(date).toISOString();
        }*/
        //console.log(date)
        let preChecks = [];
        //check for tally limit
        preChecks.push(new Promise((limResolve, limReject) => {
            if (options.checkLimit !== false) {
                exports.limitTally(pass.toPerson, pass.period, pass.date).then((limit) => {
                    if(typeof limit.passLimit !== "number" || limit.tally < limit.passLimit) {
                        return limResolve("pending");
                    } else {
                        return limResolve("waitlisted");
                    }
                }).catch((err) => {return limReject(err);});
            } else {
                return limResolve("pending");
            }
        }));

        //check for dupe 
        
        preChecks.push(new Promise(function (dupeResolve, dupeReject) {
            if (options.checkDupe !== false) {
                r.table("passes").filter({
                    toPerson: pass.toPerson,
                    fromPerson: pass.fromPerson,
                    migrator: pass.migrator,
                    requester: pass.requester,
                    period: pass.period,
                    date: r.ISO8601(pass.date)
                }).run(function (err, data) {
                    if (err) {
                        return dupeReject(err);
                    }
                    if (data.length > 0) {
                        let err = new Error("Duplicate pass found");
                        err.status = 409;
                        dupeReject(err);
                    } else {
                        dupeResolve();
                    }
                });
            } else {
                dupeResolve();
            }
        }));

        //resolve promice
        Promise.all(preChecks).then(function ([state]) {
            r.table("passes").insert({
                toPerson: pass.toPerson,
                fromPerson: pass.fromPerson,
                migrator: pass.migrator,
                requester: pass.requester,
                period: pass.period,
                date: r.ISO8601(pass.date),
                dateTimeRequested: r.now(),
                status: {
                    confirmation: {
                        state: state,
                        setByUser: null,
                        msg: null,
                        previousState: null
                    },
                    migration: {
                        excusedTime: null,
                        arrivedTime: null
                    }
                },
                seen: {
                    email: [],
                    web: []
                }
            }).run(function (err, trans) {
                if (err) {
                    return reject(err);
                }
                return resolve({transaction: trans, state: state});
            });
        }, function (err) {
            return reject(err);
        });
    });
};

/*
 * Gets passes
 * @link module:js/passes
 * @param {string} id - Id of the account
 * @param {string} byColl - Where to search for the id.  Possible values: "fromPerson", "toPerson", "migrator", "requester"
 * @param {date} fromDate - low range date to search for.  
 * @param {date} toDate - High range date to search for.  set null for none
 * @param {array} periods - Only return passes with these periods.  set null for none
 * @param {function} done - callback
 * @returns {done} Error, or a transaction statement 
 */

/**
 * Gets passes
 * @link module:js/passes
 * @param {Object} [filter] - Object with fields to filter by.  You can also include fields of the pass that are not documented 
 * @param {String} [filter.id] - ID of the pass itself (will still return an array)
 * @param {String} [filter.fromPerson] - User ID of the person that the migrator is leaving from
 * @param {String} [filter.toPerson] - User ID of the person that the migrator is going to
 * @param {String} [filter.migrator] - User ID of the person that is actually moving
 * @param {String} [filter.requester] - User ID of the person that requested the pass
 * @param {(String|String[])} [filter.period] - An array r string of period constants.
 * @param {Object} [filter.date]
 * @param {(Date|String)} [filter.date.from] - Lower limit for the date. inclusive. USE ISOString for string
 * @param {(Date|String)} [filter.date.to] - Upper limit for the date. inclusive. USE ISOString for string
 * @param {String} [filter.forUser] - filters every pass that involves this person. 
 * 
 * @param {Object} [options] -- unused
 * 
 * @returns {Promise} - Array of passes
 * @throws {(TypeError|Error|ReQL)}
 */
exports.get = function (filter, options) {
    return new Promise((resolve, reject) => {
        if(!filter) {
            filter = {};
        }
        //check filter type
        let filterType = `
        {
            id: Maybe String,
            fromPerson: Maybe String,
            toPerson: Maybe String,
            migrator: Maybe String,
            requester: Maybe String,
            period: Maybe period|[period],
            date: Maybe {
                from: Maybe ISODate|Date,
                to: Maybe ISODate|Date
            }, 
            forUser: Maybe String,
            ...
        }
        `;
        //Top level type check.
        if(!typeCheck(filterType, filter, utils.typeCheck)) {
            let err = new TypeError("\"filter\" expected an object with structure: " + filterType);
            err.status = 400;
            return reject(err);
        }

        //type check options 
        /*if(!options) {
            options = {};
        }
        let optionsType = `
        {
            includeAllowedChanges: Maybe Boolean
        }
        `
        if(!typeCheck(optionsType, options, utils.typeCheck)) {
            let err = new TypeError("\"options\" expected an object with structure: " + optionsType);
            err.status = 400;
            return reject(err);
        }*/


        // Prepare dates
        if(filter.date && typeCheck("Date", filter.date.from)) {
            filter.date.from = moment(filter.date.from).toISOString();
        }
        if(filter.date && typeCheck("Date", filter.date.to)) {
            filter.date.to = moment(filter.date.to).toISOString();
        }

        //Start query
        let query = r.table("passes");

        //Filter Primary Keys 
        if(filter.id) {
            query = query.getAll(filter.id);
            delete filter.id;
        }

        //filter "for user"
        if(filter.forUser) {
            query = query.filter((doc) => {
                //check migrator
                return r.or(
                    doc("fromPerson").eq(filter.forUser),
                    doc("toPerson").eq(filter.forUser),
                    doc("migrator").eq(filter.forUser),
                    doc("requester").eq(filter.forUser)
                );
            });
            delete filter.forUser;
        }

        //filter date
        if(filter.date && (filter.date.from || filter.date.to)) {
            query = query.filter((date) => {
                if(filter.date && filter.date.from && filter.date.to) {
                    return date("date").during(r.ISO8601(filter.date.from), r.ISO8601(filter.date.to), {leftBound: "closed", rightBound: "closed"});
                } else if(filter.date && filter.date.from) {
                    return date("date").ge(r.ISO8601(filter.date.from));
                } else if(filter.date && filter.date.to) {
                    return date("date").le(r.ISO8601(filter.date.to));
                } else {
                    return true;
                }
            });
            delete filter.date;
        }

        //filter if periods is an array
        if(typeCheck("[period]", filter.period, utils.typeCheck)) {
            query = query.filter(function(period) {
                return r.expr(filter.period).contains(period("period")); 
            });
            delete filter.period;
        }


        //filter everything else
        query = query.filter(filter);            

        //Account Joins: 
        //join optional fromPerson value
        query = query.outerJoin(r.table("accounts"), function (passRow, accountRow) {
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

            

            .run()
            .then((data) => {
                return resolve(data);
            })
            .catch(reject);
        return query;
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

    r.table("passes").get(passId).run(function (err, pass) {
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


    r.table("passes").get(passId).update(doc).run(function (err, trans) {
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
            r.table("passes")
                //filter state (denied and canceled do not count)
                .filter((doc) => {
                    return doc("status")("confirmation")("state").ne(exports.passStates.CANCELED).or(doc("status")("confirmation")("state").ne(exports.passStates.DENIED));
                })
                //filter date and time
                .filter(function (doc) {
                    return doc("date").date().eq(r.ISO8601(date).date())
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


/**
     * Functions for manupulating the state of passes
     * @name state
     * @inner
     * @private
     * @memberof module:js/passes
     * @property {Object} state
     */
var state = {};

/**
* Sets the pass state back to an origin state. Either Pending or Waitlisted
* @function
* @param {String} passID
* @param {String} state
* @param {?String} [setByID=null] - Account ID that set this state.
* @memberof module:js/passes
* @returns {Promise} Transaction Statement
* @throws {(TypeError|ReQL)}
*/
state.set = (passID, state, setByID) => {
    if(!setByID) {setByID = null;}

    return r.table("passes").get(passID).update((pass) => {
        return {
            status: {
                confirmation: {
                    setByUser: setByID,
                    state: state,
                    previousState: r.branch(
                        pass("status")("confirmation")("state").ne(state),
                        pass("status")("confirmation")("state"),
                        pass("status")("confirmation")("previousState")
                    ),
                    /*previousSetByUser: r.branch(
                        pass("status")("confirmation")("setByUser").ne(state),
                        pass("status")("confirmation")("state"),
                        pass("status")("confirmation")("previousState")
                    )*/
                }
            }
        };
    }).run();
};

/**
* Sets the pass state back to a neutral state. Either Pending or Waitlisted
* @function
* @memberof module:js/passes
* @param {String} passID
* @param {?String} [setByID=null] - Account ID that set this state.
* @returns {Promise} Object with Transaction statement (transaction) and the new state (state).
* @throws {(TypeError|ReQL)}
*/
state.neutral = (passID, setByID) => {
    return new Promise((resolve, reject) => {
        //Type check 
        if(!typeCheck("String", passID)) {
            let err = new TypeError("passID expected a string");
            err.status = 400;
            return reject(err);
        }
        

        //get pass data 
        return r.table("passes").get(passID).run()
            .then((passData) => {
                //Check pass id validity
                //console.log(passData)
                if(!passData) {
                    let err = new Error("Pass not found");
                    err.status = 404;
                    throw err;
                }

                //Get limit data for toPerson
                return exports.limitTally(passData.toPerson, passData.period, passData.date.toISOString());
            })
            .then((limit) => {
                //check if limit is reached.  
                if(typeof limit.passLimit !== "number" || limit.tally < limit.passLimit) {
                    return exports.passStates.PENDING;
                } else {
                    return exports.passStates.WAITLISTED;
                }
            })
            .then((newState) => {
                //update state
                return state.set(passID, newState, setByID).then((transaction) => {
                    //ready return 
                    return {state: newState, transaction: transaction};
                });
            })
            .then(resolve)
            .catch((err) => {
                return reject(err);
            });
    });
};

/**
* Determines if the given state is a neutral state (Pending or Waitlisted).
* @function
* @memberof module:js/passes
* @param {String} state
* @returns {Boolean} 
*/
state.isNeutral = (state) => {
    if(state === exports.passStates.PENDING || state === exports.passStates.WAITLISTED) {
        return true;
    }
    return false;
};
/*state.neutral("0bb1ecde-b63e-4961-a5e2-2da40bae1e51", "da6655ec-d98c-4194-8c43-daafe1b648fe").then((res) => {
    console.log(res)
}).catch((err) => {
    console.log(err);
})*/

/**
* Sets the pass state to accepted.
* @function
* @memberof module:js/passes
* @param {String} passID
* @param {?String} [setByID=null] - Account ID that set this state.
* @returns {Promise} Object with Transaction statement (transaction) and the new state (state).
* @throws {(TypeError|ReQL)}
*/

state.accepted = (passID, setByID) => {
    return new Promise((resolve, reject) => {
        //Type check 
        if(!typeCheck("String", passID)) {
            let err = new TypeError("passID expected a string");
            err.status = 400;
            return reject(err);
        }
        //Set pass state to accepted
        return state.set(passID, exports.passStates.ACCEPTED, setByID).then((transaction) => {
            //Check if pass was found
            if(transaction.replaced < 1) {
                let err = new Error("Pass not found");
                err.status = 404;
                throw err;
            }
            //ready return 
            return {state: exports.passStates.ACCEPTED, transaction: transaction};
        })
            .then(resolve)
            .catch((err) => {
                return reject(err);
            });
    });
};

/**
* Determines if the given state is an accepted state (Accepted).
* @function
* @memberof module:js/passes
* @param {String} state
* @returns {Boolean} 
*/
state.isAccepted = (state) => {
    if(state === exports.passStates.ACCEPTED) {
        return true;
    }
    return false;
};

/**
* Sets the pass state to canceled or denied.
* @function
* @memberof module:js/passes
* @param {String} passID
* @param {?String} [setByID=null] - Account ID that set this state.
* @returns {Promise} Object with Transaction statement (transaction) and the new state (state).
* @throws {(TypeError|ReQL)}
*/

state.canceled = (passID, setByID) => {
    return new Promise((resolve, reject) => {
        //Type check 
        if(!typeCheck("String", passID)) {
            let err = new TypeError("passID expected a string");
            err.status = 400;
            return reject(err);
        }

        return r.table("passes").get(passID).run()
            .then((passData) => {
                //Check pass id validity
                //console.log(passData);
                if(!passData) {
                    let err = new Error("Pass not found");
                    err.status = 404;
                    throw err;
                }
                return passData;
            })
            .then((passData) => {
                //check states to determine new state 
                let stateData = passData.status.confirmation;
                if(setByID && state.isNeutral(stateData.state) && setByID !== passData.requester) {
                    return exports.passStates.DENIED;
                } else {
                    return exports.passStates.CANCELED;
                }
            })
            .then((newState) => {
                //Set new state
                return state.set(passID, newState, setByID).then((transaction) => {
                    //Prepare return value 
                    return {state: newState, transaction: transaction};
                });
            })
            .then(resolve)
            .catch((err) => {
                return reject(err);
            });
    });
};

/**
* Determines if the given state is a canceled state (Canceled).
* @function
* @memberof module:js/passes
* @param {String} state
* @returns {Boolean} 
*/
state.isCanceled = (state) => {
    if(state === exports.passStates.CANCELED || state === exports.passStates.DENIED) {
        return true;
    }
    return false;
};


/**
* Sets the migration pass state to enroute.
* @function
* @memberof module:js/passes
* @param {String} passID
* @param {Boolean} [set=true] - if true, excusedTime will be set to now. if false, excusedTime will be set to null
* @returns {Promise} Object with Transaction statement (transaction)
* @throws {(TypeError|ReQL)}
*/
state.enroute = (passID, set) => {
    if(typeof set !== "boolean") {set = true;}
    return r.table("passes").get(passID)
        .update({
            status: {
                migration: {
                    excusedTime: set?r.now():null
                }
            }
        })
        .do((trans) => {
            //calculate new state and generate return value
            return r.table("passes").get(passID).pluck("status").do((status) => {
                status = status("status");
                //check if arrivedTime is set
                return r.branch(
                    //if typeof migration.arrivedTime === "string"
                    status("migration")("arrivedTime").typeOf().eq("STRING"),
                    //then the state is arrived
                    {transaction: trans, state: exports.passStates.ARRIVED},
                    //else. 
                    r.branch(
                        //if set === true
                        r.expr(set).eq(true),
                        //then
                        {transaction: trans, state: exports.passStates.ENROUTE},
                        //else
                        {transaction: trans, state: status("confirmation")("state")}
                    )
                );
            });
        })
        .run();
};


/**
* Sets the migration pass state to arrived.
* @function
* @memberof module:js/passes
* @param {String} passID
* @param {Boolean} [set=true] - if true, arrivedTime will be set to now. if false, arrivedTime will be set to null
* @returns {Promise} Object with Transaction statement (transaction)
* @throws {(TypeError|ReQL)}
*/
state.arrived = (passID, set) => {
    if(typeof set !== "boolean") {set = true;}
    return r.table("passes").get(passID)
        .update({
            status: {
                migration: {
                    arrivedTime: set?r.now():null
                }
            }
        })
        .do((trans) => {
        //calculate new state and generate return value
            return r.table("passes").get(passID).pluck("status").do((status) => {
                status = status("status");
                //check if arrivedTime is set
                return r.branch(
                    //if set === true
                
                    r.expr(set).eq(true),
                    //then the state is arrived
                    {transaction: trans, state: exports.passStates.ARRIVED},
                    //else. 
                    r.branch(
                        //if typeof migration.excusedTime === "string"
                        status("migration")("excusedTime").typeOf().eq("STRING"),
                        //then state is enroute
                        {transaction: trans, state: exports.passStates.ENROUTE},
                        //else state is a real state
                        {transaction: trans, state: status("confirmation")("state")}
                    )
                );
            });
        })
        .run();
};

/**
* Sets the state back to the previous state
* @function
* @memberof module:js/passes
* @param {String} passID
* @param {?String} [setByID=null] - Account ID that set this state.  
* @param {Boolean} [checkMigrationStates=false] - Will prioritize undoing (null) the migration states (arrived and enroue)
* @returns {Promise} Object with Transaction statement (transaction) and the new state (state).  No transaction will be returned if nothing changes. 
* @throws {(TypeError|ReQL)}
*/
state.undo = (passID, setByID, checkMigrationStates) => {
    return new Promise((resolve, reject) => {
        //Type check 
        if(!typeCheck("String", passID)) {
            let err = new TypeError("passID expected a string");
            err.status = 400;
            return reject(err);
        }
        return r.table("passes").get(passID).run()
            .then((passData) => {
                //Check pass id validity
                if(!passData) {
                    let err = new Error("Pass not found");
                    err.status = 404;
                    throw err;
                }
                return passData;
            })
            .then((passData) => {
                
                let migrationData = passData.status.migration;
                let stateData = passData.status.confirmation;
                //console.log(checkMigrationStates, migrationData.arrivedTime, migrationData.excusedTime);
                //check for pseudo states arrived and enroute 
                if(checkMigrationStates && (migrationData.arrivedTime || migrationData.excusedTime)) {
                    
                    //undo the one that has the latest time
                    if(migrationData.arrivedTime && migrationData.excusedTime) {
                        if(moment(migrationData.arrivedTime).isAfter(migrationData.excusedTime)) {
                            //undo arrivedTime
                            return state.arrived(passID, false);
                        } else {
                            //undo excusedTime
                            return state.enroute(passID, false);
                        }
                    } else if(migrationData.arrivedTime) {
                        //undo arrivedTime 
                        return state.arrived(passID, false);
                    } else {
                        //undo Excused time
                        return state.enroute(passID, false);
                    }
                } else if(stateData.previousState) {
                    //determine new state
                    //determine what state change function to call.
                    if(state.isNeutral(stateData.previousState)) {
                        return state.neutral(passID, setByID);
                    } else if(state.isAccepted(stateData.previousState)) {
                        console.log("YES")
                        return state.accepted(passID, setByID);
                    } else if(state.isCanceled(stateData.previousState)) {
                        console.log("YES")
                        return state.canceled(passID, setByID);
                    } else {
                        let err = new Error("Pass state invalid");
                        err.status = 500;
                        throw err;
                    }
                } else {
                    //there was no previous state, don't change anything
                    return {state: passData.status.confirmation.state};
                }
            })
            .then(resolve)
            .catch((err) => {
                return reject(err);
            });
    });
};

/**
 * Calculates the allowed state changes for a particular pass's state.  Also includes the Pseudo migration states: arrived and enroute
 * @function
 * @memberof module:js/passes
 * @param {String} passID 
 * @param {String} forUserID 
 * @returns {Promise} - See Example
 * @throws {(TypeError|ReQL)}
 * @example 
 * <caption>Return Object</caption>
 * {
 *  neutral: (Boolean),
 *  accepted: (Boolean),
 *  canceled: (Boolean),
 *  undo: (Boolean|"UNDO"|"NEUTRAL"),
 *  arrived: (Boolean),
 *  enroute: (Boolean)
 * }
 */
state.allowedChanges = (passID, forUserID) => {
    return new Promise((resolve, reject) => {
        return r.table("passes").get(passID).run()
            .then((passData) => {
                //Check pass id validity
                if(!passData) {
                    let err = new Error("Pass not found");
                    err.status = 404;
                    throw err;
                }
                return passData;
            })
            .then((passData) => {
                //calculate permissions
                let permissions = {
                    neutral: false,
                    accepted: false,
                    canceled: false,
                    arrived: false,
                    enroute: false,
                    undo: false
                };
                let stateData = passData.status.confirmation;
                //check if forUserID is NOT an id in the toPerson or fromPerson or migrator slots  
                if(forUserID !== passData.migrator && forUserID !== passData.toPerson && forUserID !== passData.fromPerson) {
                    return permissions;
                }
                //check if pass is locked, and if forUserID is not the serByUser
                if(state.isCanceled(stateData.state) && forUserID !== stateData.setByUser) {
                    return permissions;
                }

                //check of the forUserID is the from person and give them enroute perms
                if(forUserID === passData.fromPerson && forUserID !== passData.toPerson) {
                    //if migratin, allow them to undo it.  if not allow them to set it unless arrived is set
                    if(!passData.status.migration.arrivedTime) {
                        if(passData.status.migration.excusedTime) {
                            permissions.undo = "UNDO";
                        } else {
                            permissions.enroute = true;
                        }
                    }
                    
                } else if(passData.status.migration.arrivedTime) {
                    // if pseudo state is arrived 
                    if(forUserID === passData.toPerson) {
                        //if user is the to person
                        permissions.undo = "UNDO";
                    }
                } else if(passData.status.migration.excusedTime) {
                    if(forUserID === passData.toPerson) {
                        permissions.arrived = true;
                    }
                } else if(state.isNeutral(stateData.state)) {
                    //change permissions object for neutral type state
                    if(forUserID !== passData.requester) {
                        //if user is the receiver
                        //permissions.neutral = true;
                        permissions.canceled = true;
                        permissions.accepted = true;
                        //permissions.undo = "UNDO";
                        permissions.undo = "NEUTRAL";
                    } else {
                        //If user is requester
                        //permissions.neutral = true;
                        permissions.canceled = true;
                        permissions.undo = "NEUTRAL";
                    }  

                    if(forUserID === passData.toPerson) {
                        //if user is tuPerson, allow them to set the pass to arrived
                        permissions.arrived = true;
                    }
                } else if(state.isAccepted(stateData.state)) {
                    //for accepted type
                    if(forUserID !== passData.requester) {
                        //if user is the receiver
                        permissions.neutral = true;
                        permissions.canceled = true;
                        //permissions.accepted = true;
                        //permissions.undo = "UNDO"
                        permissions.undo = "NEUTRAL";
                    } else {
                        //If user is requester
                        permissions.canceled = true;
                        //permissions.undo = "NEUTRAL";
                    }  
                    if(forUserID === passData.toPerson) {
                        //if user is tuPerson, allow them to set the pass to arrived
                        permissions.arrived = true;
                    }
                } else if(state.isCanceled(stateData.state)) {
                    //for Canceled type
                    if(forUserID !== passData.requester) {
                        //if user is the receiver
                        permissions.neutral = true;
                        //permissions.canceled = true;
                        permissions.accepted = true;
                        //permissions.undo = "UNDO";
                        permissions.undo = "NEUTRAL";
                    } else {
                        //If user is requester
                        permissions.neutral = true;
                        permissions.undo = "NEUTRAL";
                    }  
                } else {
                    let err = new Error("Pass state not valid");
                    err.status = 500;
                    throw err;
                }
                return permissions;
            })
            .then(resolve)
            .catch(reject);
    });
};


state.type = (rawState) => {
    if(state.isNeutral(rawState)) {
        return exports.stateTypes.NEUTRAL;
    } else if(state.isAccepted(rawState)) {
        return exports.stateTypes.ACCEPTED;
    } else if (state.isCanceled(rawState)) {
        return exports.stateTypes.CANCELED;
    } else if(rawState === exports.passStates.ARRIVED) {
        return exports.passStates.ARRIVED;
    } else if(rawState === exports.passStates.ENROUTE) {
        return exports.passStates.ENROUTE;
    } else {
        throw new Error("Not a valid state");
    }
};

/*
    Neutral:
        requester can change to type canceled or type neutral.  when they undo, they go to a neutral state
        non requester can change to type accepted type canceled or type neutral

    Accepted:
        requester can change to type canceled.  when they undo, it goes to state neutral
        not requester can change to type canceled.  When they undo, it goes to previous state
    
    Canceled: LOCKS PASS TO SETBYUSER 
        requester can undo and set type to neutral.  When they undo, it goes to state neutral
        no requester can change type to accepted or neutral. When they undo, it goes to previous state
    
*/


exports.state = state;