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
var emailTemplates = require('./emailTemplates/index.js');
var securityJS = require("./security.js");
//console.log(config.get("email.nodemailerConfig"))
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
            //console.log(messageConfig, config.get("email.nodemailerConfig"))
            //console.log(SMTPTransporter)
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


/*
* Sends the new passport id templeate email with one time use password.
* @function sendNewAccountWithPassEmail
* @link module:js/email
* @param {(Object | Object[])} mailOptions
* @param {String} mailOptions.to - Email address(s) to the email to.  Multiple emails separated by commas 
* @param {Object} mailOptions.name - Name object.
* @param {Object} mailOptions.name.first - User's First Name.
* @param {String} mailOptions.accountEmail - Passport email in the database
* @param {String} mailOptions.password - Unhashed password.  
* @returns {Promise} - Job Cursor.  Kinda Useless.
*/
/*
exports.sendNewAccountWithPassEmail = function(mailOptions) {
    return new Promise((resolve, reject) => {
        if(Array.isArray(mailOptions)) {
            var jobs = [];
            if(mailOptions.length)
            for(var x = 0; x < mailOptions.length; x++) {
                var job = db.queue.newAccountEmail().createJob()
                job.to = mailOptions[x].to;
                job.name = mailOptions[x].name;
                job.accountEmail = mailOptions[x].accountEmail;
                job.password = mailOptions[x].password;
                jobs.push(job);
                if(x >= mailOptions.length-1) {
                    db.queue.newAccountEmail().addJob(jobs).then((cur) => {
                        return resolve(cur);
                    });
                }
            }
        } else if (typeof mailOptions === "object") {
            var job = db.queue.newAccountEmail().createJob();
            job.to = mailOptions.to;
            job.name = mailOptions.name;
            job.accountEmail = mailOptions.accountEmail;
            job.password = mailOptions.password;
            db.queue.newAccountEmail().addJob(job).then((cur) => {
                return resolve(cur);
            });
        } else {
            console.log(typeof mailOptions)
            return reject(new Error("mailOptions must be either an array or an object."))
        }
    })  
}*/



/* JOBS */

//sendNewAccountWithPassEmail
/*
db.queue.newAccountEmail().process((job, next) => {
  // Send email using job.recipient as the destination address
    var messageConfig = {
        to: job.to,
        subject: "Your New Passport ID",
        text: "Email: " + job.accountEmail + " | Password: " + job.password,
        html: emailTemplates.newAccount.withPass(job.name, job.accountEmail, job.password).html
    }
    exports.sendMail(messageConfig).then((trans) => {
        console.log(trans);
        return next(null, trans)
    }).catch((err) => {
        return next(err);
    });
})
*/

//sendActivation Email 
db.queue.activateEmail().process((job, next) => {
    securityJS.newKey.activateAccount(job.accountID).then((key) => {
        var messageConfig = {
            to: job.to,
            subject: "Activate Your New Passport ID",
            text: "",
            html: emailTemplates.newAccount.withPass(job.name, job.accountEmail, job.password).html
        }
    })
    
})

/**
 * Nodemailer Message options. Can use any property found [Here]{@link: https://nodemailer.com/message/}
 * @typedef {Object} emailMessageConfig
 * @property {(String|null|undefined)} from - if null or undefined, passport will use configuration defalts "[email.defaults.fromName] <[email]>"
 * @property {String} to - Emails to send this to. Separated by ","
 * @property {String} subject
 * @property {String} text - Plaintext version of the message
 * @property (String) html - HTML version of the message
 * @example
 * {
 *   from: 'sender@server.com',
 *   to: 'receiver@sender.com',
 *   subject: 'Message title',
 *   text: 'Plaintext version of the message',
 *   html: '<p>HTML version of the message</p>'
 *   }
 */