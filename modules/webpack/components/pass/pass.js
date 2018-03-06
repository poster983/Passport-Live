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
let view = require("./pass.template.html");

//components
require("@polymer/paper-styles/color.js");
require("../pass-state-buttons/pass-state-buttons.js");
require("@polymer/iron-icons/iron-icons.js");
require("@polymer/paper-item/paper-icon-item.js");
/**
 * Polymer Element that displays a pass.  
 * @class 
 * @property {Boolean} [showStateButtons=true] - if true, the buttons to change the state will be shown.  
 * @property {String} passId - The ID of the pass.  If undefined, showStateButtons will be set to false
 * @property {String} avatarId - id of user to show avatar,
 * @property {String} date - ISO String 
 * @example
 * <passport-pass showStateButtons></passport-pass>
 */
class PassportPass extends polymer.Element {
    static get template() {
        return view;
    }
    constructor() {
        super();
    }
    ready() {
        super.ready();
        if(typeof this.passId !== "string") {
            this.showStateButtons = false;
        }
    }
    static get properties() {
        return {
            showStateButtons: {
                type: Boolean,
                reflectToAttribute: true,
                value: true
            },
            passId: {
                type: String
            },
            avatarId: {
                type: String
            }, 
            focus: {
                type: String,
                observer: "_mainFocus"
            },
            date: {
                type: String
            },
            period: {
                type: String
            },
            migrator: {
                type: String
            },
            fromPerson: {
                type: String
            },
            toPerson: {
                type: String
            },
            requester: {
                type: String
            },
            hasViewed: {
                type: Boolean,
                observer: "_hasViewed"
            }
        };
    }
    _hasViewed() {

    }
    _mainFocus() {
        if(this.focus === "migrator") {
            //hide toPerson 
        }
    }
}



module.exports = PassportPass;
customElements.define("passport-pass", module.exports);