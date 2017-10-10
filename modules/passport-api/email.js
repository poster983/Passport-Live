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
* Apis for sending mail to users
* @module js/email
*/

var r = require('rethinkdb');
var db = require('../../modules/db/index.js');
var config = require('config');
const nodemailer = require('nodemailer');

var SMTPTransporter = nodemailer.createTransport(config.get("email.nodemailerConfig"));


/** 
* Lowish level wrapper for nodemailer's sendMail function.  Includes Job queue.
* @function sendMail
* @link module:js/email
* @param {emailHeader} messageConfig - Nodemailer Message options. See: {@link emailHeader}
* @param {Object} options
* @param {boolean} options.jobQueue - Default: true
* @returns {Promise} 
*/
exports.sendMail = function(messageConfig, options) {
    return new Promise(function(resolve, reject) {
        if(messageConfig) {
            if(!messageConfig.from) {
                messageConfig.from = "";
                if(config.has("email.defaults.fromName")) {
                    messageConfig.from += config.get("email.defaults.fromName")
                }
                if(config.has("email.defaults.fromEmail") && config.get("email.defaults.fromEmail")) {
                    messageConfig.from += " <" + config.get("email.defaults.fromEmail") + ">";
                } else {
                    messageConfig.from += " <" + config.get("email.nodemailerConfig").auth.user + ">";
                }
            }
            console.log(messageConfig, config.get("email.nodemailerConfig"))
            SMTPTransporter.sendMail(messageConfig).then(function(resp) {
                return resolve(resp)
            }).catch(function(err) {
                return reject(err)
            })
        } else {
            var err = new Error("messageConfig undefined");
            err.status = 500;
            return reject(err)
        }
    })
}




/**
 * Nodemailer Message options. Can use any property found [Here]{@link: https://nodemailer.com/message/}
 * @typedef {Object} emailMessageConfig
 * @property {(String|null|undefined)} from - if null or undefined, passport will use configuration defalts "[email.defaults.fromName] <[email]>"
 * @property {String} to - Emails to send this to. Separated by ","
 * @property {String} subject
 * @property {String} text - Plaintext version of the message
 * @property (String) html - HTML version of the message
 * {
 *   from: 'sender@server.com',
 *   to: 'receiver@sender.com',
 *   subject: 'Message title',
 *   text: 'Plaintext version of the message',
 *   html: '<p>HTML version of the message</p>'
 *   }
 */