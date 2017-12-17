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
/** CREATES ALL TABLES AND DBs **/

var r = require('rethinkdb');
const util = require('util')
var config = require('config');
var db = require('./index.js');
module.exports = () => {
    return new Promise((resolveRet, rejectRet) => {
        db.setup({noDefaultDB: true, skipGlobal: true}).then((conn) => {
          r.dbList().run(conn).then((dbArray) => {
            //checks for database, if not existant, it creates one
            var dbCreateProm = new Promise((resolve, reject) => {
              if(dbArray.includes(config.get('rethinkdb.database'))) {
                return resolve(false);
              } else {
                r.dbCreate(config.get('rethinkdb.database')).run(conn).then(() => {
                  return resolve(true);
                }).catch((err) => {
                  return reject(err);
                })
              }
            })

            dbCreateProm.then((dbResult) => {
              if(dbResult) {
                console.log("Database \"" + config.get('rethinkdb.database') + "\" created.");
              } else {
                console.log("Database \"" + config.get('rethinkdb.database') + "\" exists, skipping.");
              }
              r.db(config.get('rethinkdb.database')).tableList().run(conn).then((tables) => {
                //console.log(tables)
                var tableArr = [];
                //create tables
                if(!tables.includes("accounts")) {
                  tableArr.push(r.db(config.get('rethinkdb.database')).tableCreate('accounts').run(conn));
                }
                if(!tables.includes("brute")) {
                  tableArr.push(r.db(config.get('rethinkdb.database')).tableCreate('brute').run(conn));
                }
                if(!tables.includes("permissionKeys")) {
                  tableArr.push(r.db(config.get('rethinkdb.database')).tableCreate('permissionKeys').run(conn));
                }
                if(!tables.includes("scheduleDefinitions")) {
                  tableArr.push(r.db(config.get('rethinkdb.database')).tableCreate('scheduleDefinitions').run(conn));
                }
                if(!tables.includes("scheduleCalendar")) {
                  tableArr.push(r.db(config.get('rethinkdb.database')).tableCreate('scheduleCalendar').run(conn));
                }
                if(!tables.includes("userSchedules")) {
                  tableArr.push(r.db(config.get('rethinkdb.database')).tableCreate('userSchedules').run(conn));
                }
                if(!tables.includes("scheduleRepeating")) {
                  tableArr.push(r.db(config.get('rethinkdb.database')).tableCreate('scheduleRepeating').run(conn));
                }
                if(!tables.includes("apiKeys")) {
                  tableArr.push(r.db(config.get('rethinkdb.database')).tableCreate('apiKeys').run(conn));
                }
                if(!tables.includes("blackouts")) {
                  tableArr.push(r.db(config.get('rethinkdb.database')).tableCreate('blackouts').run(conn));
                }
                if(!tables.includes("bulkImports")) {
                  tableArr.push(r.db(config.get('rethinkdb.database')).tableCreate('bulkImports').run(conn));
                }
                if(!tables.includes("passes")) {
                  tableArr.push(r.db(config.get('rethinkdb.database')).tableCreate('passes').run(conn));
                }
                
                Promise.all(tableArr).then((results) => {
                  console.log("Success!");
                  if(results.length == 0) {
                    return resolveRet();
                  } else {
                    return resolveRet(util.inspect(results, {showHidden: false, depth: null}))
                  }
                }).catch((err) => {
                  console.log("ERROR!");
                  return rejectRet(err);
                })
              }).catch((err) => {
                return rejectRet(err);
              });
            }).catch((err) => {
              return rejectRet(err);
            })
          }).catch((err) => {
            return rejectRet(err);
          });
        })
    });
}
