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
var config = require('config');
//rethinkdbdash
var rdash = require('rethinkdbdash')({
  servers: [
    {host: config.get('rethinkdb.host'), port: config.get('rethinkdb.port')}
  ],
  user: "admin",
  db: config.get('rethinkdb.database'), 
  password: config.get("rethinkdb.password")
});
//job queues 
const Queue = require('rethinkdb-job-queue');
const QueuecxnOptions = {
  host: config.get('rethinkdb.host'),
  port: config.get('rethinkdb.port'),
  user: "admin",
  password: config.get("rethinkdb.password"),
  db: 'JobQueue' // The name of the database in RethinkDB
}
/*
var queueNewAccountEmail = new Queue(QueuecxnOptions, {
  name: 'NewAccountEmail', // The queue and table name
  masterInterval: 310000, // Database review period in milliseconds
  changeFeed: true, // Enables events from the database table
  concurrency: 100,
  removeFinishedJobs: true, // true, false, or number of milliseconds
});
queueNewAccountEmail.jobOptions = {
  priority: 'normal',
  timeout: 300000,
  retryMax: 3, // Four attempts, first then three retries
  retryDelay: 600000 // Time in milliseconds to delay retries
}*/

var queueActivateEmail = new Queue(QueuecxnOptions, {
  name: 'ActivateEmail', // The queue and table name
  masterInterval: 310000, // Database review period in milliseconds
  changeFeed: true, // Enables events from the database table
  concurrency: 100,
  removeFinishedJobs: true, // true, false, or number of milliseconds
});
queueActivateEmail.jobOptions = {
  priority: 'normal',
  timeout: 300000,
  retryMax: 3, // Four attempts, first then three retries
  retryDelay: 600000 // Time in milliseconds to delay retries
}

//Brute Store 
const BruteRethinkdb = require('brute-rethinkdb')
let bruteStore = new BruteRethinkdb(rdash, {table: 'brute'});

var connection = null;


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
exports.dash = function() {
    return rdash;
}
exports.conn = function() {
    return connection;
}

//queues 
exports.queue = {};
/*
exports.queue.newAccountEmail = function() {
    return queueNewAccountEmail
}*/
exports.queue.activateEmail = () => {
  return queueActivateEmail;
}


//brute
exports.brute = () => {
  return bruteStore;
}

//return module.exports