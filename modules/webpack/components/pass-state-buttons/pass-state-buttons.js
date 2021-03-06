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
require("@polymer/iron-icons/maps-icons.js");
require("@polymer/paper-styles/color.js");
require("@polymer/paper-tooltip/paper-tooltip.js");
 
/**
   * Fired when an error occurs
   *
   * @event error
   * @param {Error} error
   */

/**
 * Polymer Element that holds pass state manupulation buttons.  
 * Errors trigger the "error" event
 * @class 
 * @property {String} passId - Id of the pass in the DB
 * @property {Object} allowedChanges - Object of allowed state changes
 * @property {String} state - the actual state of the pass in the database.  This string should be presented to the user.
 * @property {Boolean} disabled - Grays out the buttons
 * @property {Boolean} substitute - Enables substitute mode on the request.  Acts if you were the fromPerson.  Only if you have teacher permissions
 * @example
 * <passport-pass-state-buttons pass-id="sad5-fd4s-d45f6s-56sdf4-56sdf"></passport-pass-state-buttons>
 */
class PassportPassStateButtons extends polymer.PolymerElement {

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
                notify: true
            },
            stateType: {
                type: String
            },
            allowedChanges: {
                type: Object,
                notify: true,
                observer: "_updateButtons"
            },
            disabled: {
                type: Boolean,
                notify: true,
                observer: "_observeAllDisabled"
            },
            status: {
                type: Object
            },
            _leftButtonAction: {
                type: String
            },
            _rightButtonAction: {
                type: String
            },
            _errorRetry: {
                type: Boolean,
                value: true
            },
            verticalAlign: {
                type: Boolean,
                observer: "_alignmentChanged"
            },
            substitute: {
                type: Boolean,
                observer: "_passIDChanged"
            }
        };
    }
    _alignmentChanged() {
        let update = "";
        if(this.verticalAlign) {
            update = "block";
        }
        this.updateStyles({
            "--pass-state-buttons-fab-display": update
        });
    }
    _passIDChanged() {
        this.updateState();
    }
    //observer: "_updateButtons"
    _observeAllDisabled(newVal) {
        if(newVal === false) {
            this._updateButtons();
        }
    }
    _updateButtons() {
        let arrivedButton = this.shadowRoot.querySelector("#arrived");
        let acceptedButton = this.shadowRoot.querySelector("#check");
        let canceledButton = this.shadowRoot.querySelector("#block");
        //check if pass state is enroute or arrived
        
        if(this.allowedChanges.arrived === null) {
            //Check if the button should be shown
            arrivedButton.style.display = "none";
        } else {
            //reset display to default
            arrivedButton.style.display = "";
            if(this.allowedChanges.arrived) {
                //enable arrived button
                arrivedButton.disabled = false;
            } else {
                arrivedButton.disabled = true;
            }
        }

        if(this.allowedChanges.accepted) {
            //enable accepted 
            this._makeAccepted("#check");
            this._leftButtonAction = "accepted";
        } else if(this.allowedChanges.enroute) {
            this._makeEnroute("#check");
            this._leftButtonAction = "enroute";
        } else {
            //dissable leftbutton action
            acceptedButton.disabled = true;
        }
        if(this.allowedChanges.canceled) {
            //enable cancel
            this._makeCanceled("#block");
            this._rightButtonAction = "canceled";
        } else {canceledButton.disabled = true;}
        //find a spot for an undo button.  Dont show if state is equal to what the undo action does
        if(this.allowedChanges.undo && (this.allowedChanges.undo.toLowerCase() !== this.stateType.toLowerCase())) {
            //set undo button 
            if(this.allowedChanges.accepted && !this.allowedChanges.canceled) {
                // make the canceled button an undo  button 
                this._makeUndo("#block");
                this._rightButtonAction = "undo";
            } else if((!this.allowedChanges.accepted && this.allowedChanges.canceled) || (!this.allowedChanges.accepted && !this.allowedChanges.canceled)) {
                // make the accepted button an undo  button 
                this._makeUndo("#check");
                this._leftButtonAction = "undo";
            }
        }
    }
    _makeUndo(selector) {
        let button = this.shadowRoot.querySelector(selector);
        let tooltip = this.shadowRoot.querySelector(selector+"Tooltip");
        button.disabled = false;
        button.icon = "icons:undo";
        button.className = "undo";
        tooltip.innerHTML = "Undo";
    }
    _makeAccepted(selector) {
        let button = this.shadowRoot.querySelector(selector);
        let tooltip = this.shadowRoot.querySelector(selector+"Tooltip");
        button.disabled = false;
        button.icon = "icons:check";
        button.className = "accept";
        tooltip.innerHTML = "Accept";
    }
    _makeCanceled(selector) {
        let button = this.shadowRoot.querySelector(selector);
        let tooltip = this.shadowRoot.querySelector(selector+"Tooltip");
        button.disabled = false;
        button.icon = "icons:block";
        button.className = "cancel";
        tooltip.innerHTML = "Cancel";
    }
    _makeEnroute(selector) {
        let button = this.shadowRoot.querySelector(selector);
        let tooltip = this.shadowRoot.querySelector(selector+"Tooltip");
        button.disabled = false;
        button.icon = "maps:transfer-within-a-station";
        button.className = "accept";
        tooltip.innerHTML = "Enroute";
    }

    _leftButtonClicked() {
        //console.log(this._leftButtonAction);   
        this.setState(this._leftButtonAction);
    }
    _rightButtonClicked() {
        //console.log(this._rightButtonAction);
        this.setState(this._rightButtonAction);
    }
    _arrivedButtonClicked() {
        this.setState("arrived");
    }
    setState(newStateType) {
        //Start loader 
        this.disabled = true;
        let fetch = null;
        if(newStateType === "undo") {
            fetch = passAPI.undoState(this.passId, this.substitute);
        } else {
            fetch = passAPI.setState(this.passId, newStateType, this.substitute);
        }
        fetch.then((res) => {
            //console.log(res)
            
            this.state = res.state;
            this.stateType = res.type;
            this.allowedChanges = res.allowedChanges;
            //End loader
            this.disabled = false;
            this._errorRetry = true;
        })
            .catch((err) => {
            //end loader, show error
                this._error(err);
            });
        return fetch;
    }

    /** Syncs the pass state on the server with the client */
    updateState() {
        this.disabled = true;
        passAPI.getState(this.passId, this.substitute)
            .then((data) => {
                //check if the pseudo states are active
                if(data.status.migration.arrivedTime) {
                    this.state = "arrived";
                } else if(data.status.migration.excusedTime) {
                    this.state = "enroute";
                } else {
                    this.state = data.status.confirmation.state;
                }
                //console.log(data)
                this.stateType = data.type;
                this.status = data.status;
                this.allowedChanges = data.allowedChanges;
                this.disabled = false;
                
            })
            .catch((err) => {
                this._error(err);
            });
    }
    _error(error) {
        //try regetting the state
        if(this._errorRetry) {
            this._errorRetry = false;
            this.updateState();

        } else {
            this.shadowRoot.querySelectorAll("paper-fab").forEach((e) => {
                e.icon = "icons:error-outline";
            });
            //event 
            this.dispatchEvent(new CustomEvent("error", {detail: {error: error}}));
        }
    }
}
module.exports = PassportPassStateButtons;
customElements.define("passport-pass-state-buttons", module.exports);