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

/** COMPONENTS **/
require("@polymer/paper-listbox/paper-listbox.js");
require("../pass/pass.js");
/**
 * Polymer Element that displays and fetches a list of <passport-pass> elements.  
 * @class 
 * @property {Object[]} [passes] - The list of raw pass objects  
 * @property {Boolean} [noAutoFetch=false] - if true, the element will NOT fetch the passes from the server automatically
 * @property {String} [userId] - The ID of the 
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
            userId: {
                type: String,
                notify: true
            },
            filter: {
                type: Object
            }
        };
    }

}

module.exports = PassportPassList;
customElements.define("passport-pass-list", module.exports);