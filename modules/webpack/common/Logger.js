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
let utils = require("../utils/index.js");
/**
 * Manages a user friendly log for the front end
 * @class
 * @param {(String|Object)} outElement - where the log will be printed
 * @param {Object} [options]
 * @param {Boolean} [options.verbose] - if true, console.log/warn/error may be called automaticly
 */
class Logger {
    constructor(outElement, options) {
        this._id = utils.uuidv4();
        $(outElement).append($("<ul/>").attr("id", this._id));
        this.elmLog = $(outElement).find("ul#" + this._id); 
        this.fullLog = [];
        this.options = options?options:{};
        let defaults = {
            verbose: false,
        };
        this.options = Object.assign(defaults, this.options);
        
    }
    _newEntry(type, data) {
        type = type.toUpperCase();
        this.fullLog.push({type: type, data: data});
        this.elmLog.prepend($("<li/>").append(type + ": " + data));
    }
    /** A simple log
     * @param {String} message
     */
    log(message) {
        if(this.options.varbose){console.log(message);}
        this._newEntry("log", message);
    }
    /** Called when something is finished
     * @param {String} message
     */
    done(message) {
        if(this.options.varbose){console.log("DONE:", message);}
        this._newEntry("done", message);
    }
    /** Called when something is working
     * @param {String} message
     */
    working(message) {
        if(this.options.varbose){console.log("WORKING:", message);}
        this._newEntry("working", message);
    }
    /** Called when debugging something
     * @param {String} message
     */
    debug(message) {
        if(this.options.varbose){console.log("DEBUG:", message);}
        this._newEntry("debug", message);
    }
    /** Called when warning the user of a non fatal problem
     * @param {String} message
     */
    warn(message) {
        if(this.options.varbose){console.warn(message);}
        this._newEntry("warn", message);
    }
    /** Called when something exploded
     * @param {String} message
     */
    error(message) {
        if(this.options.varbose){console.error(message);}
        this._newEntry("error", message);
    }
    /** Called when a fetch request fails
     * @param {Object} errorObject
     */
    fetchError(errorObject) {
        if(this.options.varbose){console.error(errorObject);}
        var message = errorObject.response.status + " " + errorObject.message + ": " + decodeURIComponent(errorObject.response.headers.get("errormessage"));
        if(this.options.varbose){console.log("FETCH ERROR:", message);}
        this._newEntry("fetch error", message);
    }
}

module.exports = Logger;