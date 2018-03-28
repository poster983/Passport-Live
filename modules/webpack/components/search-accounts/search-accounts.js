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
//require("@polymer/paper-input/paper-input-container");
//require("@polymer/paper-input/paper-input-error");
require("@polymer/iron-icons/iron-icons.js");
require("@polymer/iron-icon/iron-icon.js");

/**
   * Fired when an error occurs
   *
   * @event error
   * @param {Error} error
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
        let autocomplete = this.shadowRoot.querySelector("#suggestions");
        autocomplete.queryFn = this.queryFn;
    }
    static get properties() {
        return {
            /** Array of account objects */
            accounts: {
                type: Array
            },
            /** The account object of the selected account */
            value: {
                type: Object,
                reflectToAttribute: true,
                notify: true,
                observer: "test"
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
            }
        };
    }
    _clearInput() {
        this.query = "";
        this.value = undefined;
    }

    _queryChanged() {
        if(this.query.length >0) {
            //show clear button 
            this.shadowRoot.querySelector("#clear").style.visibility = "visible";
        } else {
            //hide clear button 
            this.shadowRoot.querySelector("#clear").style.visibility = "hidden";
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
   * @param {Array} datasource An array containing all items before filtering
   * @param {string} query Current value in the input field
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
    test() {
        console.log(this.value);
    }

    _error(error) {
        
        this.dispatchEvent(new CustomEvent("error", {detail: {error: error}}));
    }
}



module.exports = PassportSearchAccounts;
customElements.define("passport-search-accounts", module.exports);