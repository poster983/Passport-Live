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
let view = require("./pass-state-buttons.template.html");

let passAPI = require("../../api/passes.js");

/** Components **/
require("@polymer/paper-fab/paper-fab.js");
require("@polymer/iron-icons/iron-icons.js");
require("../styles/default-theme.js");
require("@polymer/paper-styles/color.js");
//require("@polymer/paper-styles/paper-styles.js"); //FOR ALL STYLES 

/**
 * Polymer Element that holds pass state manupulation buttons.  
 * Errors trigger the "error" event
 * @class 
 * @property {String} passId - Id of the pass in the DB
 * @property {Object} allowedChanges - Object of allowed state changes
 * @property {String} state - the actual state of the pass in the database.  This string should be presented to the user.
 * @property {Boolean} disabled - Grays out the buttons
 * @example
 * <passport-pass-state-buttons pass-id="sad5-fd4s-d45f6s-56sdf4-56sdf"></passport-pass-state-buttons>
 */
class PassportPassStateButtons extends polymer.Element {

    //<template>
    static get template() {
        return view;
    }
    constructor() {
        super();
    }
    /*ready() {
        super.ready();
    }*/
    static get properties() {
        return {
            passId: {
                type: String,
                notify: true,
                observer: "_passIDChanged"
            },
            state: {
                type: String,
                reflectToAttribute: true,
                notify: false
            },
            allowedChanges: {
                type: Object,
                reflectToAttribute: true,
                notify: true,
                observer: "_updateButtons"
            },
            disabled: {
                type: Boolean,
                notify: true,
                observer: "_observeAllDisabled"
            },
            status: {
                type: Object,
                reflectToAttribute: true,
                notify: false
            }
        };
    }

    _passIDChanged() {
        this.updateState();
    }
    //observer: "_updateButtons"

    _updateButtons(newVal, oldVal) {
        let leftButton = this.shadowRoot.querySelector("#check");
        let rightButton = this.shadowRoot.querySelector("#block");
        console.log(leftButton)
        if(this.allowedChanges.accepted) {
            //enable accepted 
            leftButton.disabled = false;
        } else {leftButton.disabled = true;}
        if(this.allowedChanges.canceled) {
            //enable cancel
            rightButton.disabled = false;
        } else {rightButton.disabled = true;}
    }

    /** Syncs the pass state on the server with the client */
    updateState() {
        passAPI.getState(this.passId)
            .then((data) => {
                if(data.status.migration.arrivedTime) {
                    this.state = "arrived";
                } else if(data.status.migration.excusedTime) {
                    this.state = "enroute";
                } else {
                    this.state = data.status.confirmation.state;
                }

                this.allowedChanges = data.allowedChanges;
                this.status = data.status;
            })
            .catch((err) => {
                this._error(err);
            });
    }
    _error(error) {
        console.error(error);
        //event 
        this.dispatchEvent(new CustomEvent("error", {detail: {error: error}}));
    }
    _test(e) {
        console.log(this.passId);

    }
}
module.exports = PassportPassStateButtons;
customElements.define("passport-pass-state-buttons", module.exports);