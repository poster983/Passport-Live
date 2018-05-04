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
let view = require("./search-accounts.template.html");

let accountJS = require("../../api/account.js");

/** Components **/
require("paper-autocomplete/paper-autocomplete-suggestions");
require("@polymer/paper-input/paper-input");
require("@polymer/paper-icon-button/paper-icon-button");
require("@polymer/iron-icons/iron-icons.js");
require("@polymer/iron-icon/iron-icon.js");

/**
   * Fired when an error occurs
   *
   * @event error
   * @param {Error} error
   */

/**
 * A Paper autocomplete input for passport accounts.  (polymer)
 * @class
 * @property {Object[]} [accounts] - An array of account objects and
 * @property {Object} [value] - The selected account.  (Notified).
 * @property {String} [query] - The current value of the input
 * @property {Nunber} [queryLengthThreshold=2] - after how many letters should the request be sent to the server
 * @property {Boolean} [disabled] - Grays out the input
 * @property {Boolean} [required] - Requires the input to be filled 
 * @property {Boolean} [valid] - True if the input is valid. (Notified).
 * @example
 * <passport-search-accounts required></passport-search-accounts>
 */
class PassportSearchAccounts extends polymer.PolymerElement {

    static get template() {
        return view;
    }
    constructor() {
        super();
    }
    ready() {
        super.ready();
        this.shadowRoot.querySelector("#suggestions").queryFn = this.queryFn;
    }
    static get properties() {
        return {
            /** Array of account objects and the names to search for */
            accounts: {
                type: Array
            },
            /** The account object of the selected account and the text that was searched */
            value: {
                type: Object,
                notify: true
            },
            /** Would hold the account name */
            query: {
                type: String,
                observer: "_queryChanged"
            },
            /** How many characters should trigger a database search */
            queryLengthThreshold: {
                type: Number,
                value: 2
            },
            /** Grays out the input */
            disabled: {
                type: Boolean
            },
            /** The user must fill this or validation fails */
            required: {
                type: Boolean
            },
            /** If the element is valid.  If the user has clicked on a autocomplete option and has not changed anything */
            valid: {
                type: Boolean,
                reflectToAttribute: true,
                notify: true,
                readOnly: true
            }
        };
    }
    _clearInput() {
        this.query = "";
    }

    _inputFocusChanged() {
        //restore previous selection if no valid selection was made
        if(this.query && this.query.length > 0) {
            this.resetQuery();
        }
    }

    _queryChanged() {
        if(this.query && this.query.length >0) {
            //show clear button 
            this.shadowRoot.querySelector("#clear").style.visibility = "visible";

            //check if the user has clicked an autocomplete option 
            if(this.value) {
                this.invalidQuery();
            } else {
                this.invalidQuery("Please select a user from the list");
            }
        } else {
            //hide clear button 
            this.shadowRoot.querySelector("#clear").style.visibility = "hidden";
            //check if the input is a required field
            if(this.required) {
                this.invalidQuery("This field is required");
            } else if(!this.value) {
                this.invalidQuery();
            }
            //delete value
            this.value = undefined;
        }

        if(this.query.length === this.queryLengthThreshold) {
            //fetch accounts 
            accountJS.get({
                name: this.query
            })
                .then((accounts) => {
                    let suggestions = [];
                    for(let x = 0; x < accounts.length; x++) {
                        suggestions.push({text: accounts[x].name.salutation + " " + accounts[x].name.first + " " + accounts[x].name.last, value: accounts[x]});
                    }
                    this.accounts = suggestions;
                })
                .catch((err) => {
                    this._error(err);
                });
        }
    }

    /**
   * Query function is called on each keystroke to query the data source and returns the suggestions that matches
   * with the filtering logic included.
   * @param {Array} datasource - An array containing all items before filtering
   * @param {string} query - Current value in the input field
   * @returns {Array} an array containing only those items in the data source that matches the filtering logic.
   */
    queryFn(datasource, query) {
        //return array 
        let suggestions = [];
        //main loop 
        for(let x = 0; x < datasource.length; x++) {
            //if this itt includes the query text, put it in the return array
            if(datasource[x].text.toLowerCase().includes(query.toLowerCase())) {
                suggestions.push(datasource[x]);
            }
        }
        return suggestions;
    }
    /** 
     * Shows an error message on the input
     * @param {String} [message] - if omitted, invalid will be set to false
     */
    invalidQuery(message) {
        let input = this.shadowRoot.querySelector("#input");
        if(message) {
            input.errorMessage = message;
            input.invalid = true;
            this._setValid(false);
        } else {
            input.invalid = false;
            this._setValid(true);
        }
    }
    /** 
     * Restores the query to the saved state
     * */
    resetQuery() {
        if(this.value && this.value.text) {
            this.query = this.value.text; 
        }
    }


    _error(error) {
        this.dispatchEvent(new CustomEvent("error", {detail: {error: error}}));
    }

    
}



module.exports = PassportSearchAccounts;
customElements.define("passport-search-accounts", module.exports);