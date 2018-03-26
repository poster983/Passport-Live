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

/** Components **/
//require("paper-autocomplete/paper-autocomplete-suggestions");
require("@polymer/paper-input/paper-input");


class PassportSearchAccounts extends polymer.PolymerElement {

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
            accounts: {
                type: Array,
                value: [{text:"Joseph", value: "sdjkafjhk",}, {text: "hassell", value:"weeeeee"}]
            }
        };
    }
}



module.exports = PassportSearchAccounts;
customElements.define("passport-search-accounts", module.exports);