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
let polymer = require("@polymer/polymer/polymer-element");
let view = require("./pass-list.template.html");

let utils = require("../../utils/index.js");

/** COMPONENTS **/
require("@polymer/paper-listbox/paper-listbox.js");
require("../pass/pass.js");
/**
 * Polymer Element that displays and fetches a list of <passport-pass> elements.  
 * @class 
 * @property {Object[]} [passes] - The list of raw pass objects  
 * @property {Boolean} [noAutoFetch=false] - if true, the element will NOT fetch the passes from the server automatically
 * @property {String} [forUser] - Gets all passes that involve this user.  Use "me" for current user
 * @property {Object} [filter] - Please See {@link module:api/passes.getPasses} for filter keys. 
 * @example
 * <passport-pass-list noAutoFetch></passport-pass-list>
 */
class PassportPassList extends polymer.Element {
    static get template() {
        return view;
    }
    constructor() {
        super();
    }
    static get properties() {
        return {
            //Raw pass object array
            passes: {
                type: Array,
                notify: true
            },
            noAutoFetch: {
                type: Boolean,
                value: false
            },
            forUser: {
                type: String,
                notify: true
            },
            filter: {
                type: Object
            },

        };
    }
    /** OBSERVERS **/

    /**
     * Fetches pass array from server
     * Uses 
     */
    refreshPasses() {

    }

    _getPassHead(pass) {
        if(this.forUser === pass.migrator.id) {
            //show toPerson in title
            return this._formatName(pass.toPerson);
        } else if(this.forUser === pass.migrator.id) {
            //show migrator in title
            return this._formatName(pass.migrator);
        } else {
            //if no main user is provided,
            return this._formatName(pass.migrator) + " to " + this._formatName(pass.toPerson);
        }
    }

    
    _formatName(nameObject) {
        //chack if the key is a string, if not set var as an empty string
        let first = typeof nameObject.first === "string"?utils.capitalizeFirstLetter(nameObject.first):"";
        let last = typeof nameObject.last === "string"?utils.capitalizeFirstLetter(nameObject.last):"";
        
        return first + " " + last;
    }
}

module.exports = PassportPassList;
customElements.define("passport-pass-list", module.exports);