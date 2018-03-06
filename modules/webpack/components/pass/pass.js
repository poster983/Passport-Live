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
require("../pass-state-badge/pass-state-badge.js");
require("time-elements/dist/time-elements.js");
require("../styles/default-theme.js");
//require("@polymer/iron-icons/iron-icons.js");
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
        //initial requester format
        //this._requesterPhrase = this._requesterChanged(this.requester, this.dateRequested)
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
            header: {
                type: String,
            },
            date: {
                type: String
            },
            dateRequested: {
                type: String
            },
            period: {
                type: String
            },
            _formattedPeriod: {
                type: String,
                computed: "_formatPeriod(period)"
            },
            migrator: {
                type: String,
                observer: "_migratorChanged"
            },
            fromPerson: {
                type: String,
                observer: "_fromPersonChanged"
            },
            toPerson: {
                type: String,
                observer: "_toPersonChanged"
            },
            requester: {
                type: String,
            },
            _requesterPhrase: {
                type: String,
                computed: "_requesterChanged(requester, dateRequested)",
                value: ""
            },
            state: {
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
    _migratorChanged(newVal) {
        this.shadowRoot.querySelector("#migrator").style.display = newVal?"":"none";
    }
    _fromPersonChanged(newVal) {
        this.shadowRoot.querySelector("#fromPerson").style.display = newVal?"":"none";
    }
    _toPersonChanged(newVal) {
        this.shadowRoot.querySelector("#toPerson").style.display = newVal?"":"none";
    }
    //If the period is a 1 or two letter word, it adds "period" to the end, if not, it quotes it. This var is used after the date.
    _formatPeriod(period) {
        if(!period || period.length < 1) {
            return "";
        } else if (period.length<=2) {
            return "during " + period.toUpperCase() + " period";
        } else {
            return "during period: \""+ period.toUpperCase() + "\"";
        }
    }
    //hides or shows "this" if there is a requestor 
    _requesterChanged(requester, dateRequested) {
        //if nothing
        if((!requester || requester.length<1) && (!dateRequested || dateRequested.length<1)) {
            return "";
        } else if (!requester || requester.length<1) {
            //if we only have the date requested
            return "Requested ";
        } else {
            //if we only have the person or have everything 
            return requester + "requested this ";
        }
    }
}



module.exports = PassportPass;
customElements.define("passport-pass", module.exports);