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
let view = require("./pass-state-badge.template.html");

//components
require("@polymer/paper-styles/color.js");

/**
 * Polymer Element that displays a pass state on a badge.  
 * @class 
 * @property {String} state - state string.  can be pending, waitlisted, accepted, denied, canceled, enroute, or arrived
 * @example
 * <passport-pass-state-badge state="pending"></passport-pass-state-badge>
 */
class PassportPassStateBadge extends polymer.Element {
    static get template() {
        return view;
    }
    constructor() {
        super();
    }
    static get properties() {
        return {
            state: {
                type: String,
                observer: "stateColor"
            },
            _state: {
                type: String,
                computed: "_computeState(state)",
                
            }
        };
    }
    _computeState(state) {
        return state.charAt(0).toUpperCase() + state.slice(1).toLowerCase();
    }
    /**
     * Updates the color of the badge with a color for each state
     * @param {String} state
     */
    stateColor(state) {
        state = state.toLowerCase();
        let display = "inline";
        let bg = "black";
        let color = "white";
        if(!state || state.length<1) {
            display = "none";
        }
        switch(state) {
        case "pending": 
            bg = "paper-cyan-a700";
            color = "white";
            break;

        case "accepted": 
            bg = "paper-green-500";
            color = "white";
            break;
        
        case "denied":
        case "canceled": 
            bg = "paper-red-500";
            color = "white";
            break;

        case "waitlisted": 
            bg = "paper-orange-500";
            color = "black";
            break;

        case "enroute": 
            bg = "paper-blue-500";
            color = "white";
            break;

        case "arrived": 
            bg = "paper-green-a400";
            color = "black";
            break;
        }
        this.updateStyles({
            "--pass-state-badge-background-color": "var(--" + bg + ")",
            "--pass-state-badge-color": color,
            "--pass-state-badge_-_display": display,
        });
    }
}


module.exports = PassportPassStateBadge;
customElements.define("passport-pass-state-badge", module.exports);