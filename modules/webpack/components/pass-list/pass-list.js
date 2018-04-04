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
let passJS = require("../../api/passes.js");
let accountJS = require("../../api/account.js");

/** COMPONENTS **/
//require("../styles/default-theme.js");
require("@polymer/paper-listbox/paper-listbox.js");
require("@polymer/iron-icons/social-icons.js");
require("@polymer/iron-icon/iron-icon.js");
require("@polymer/paper-spinner/paper-spinner.js");
require("../pass/pass.js");
/**
 * Polymer Element that displays and fetches a list of <passport-pass> elements.  
 * Errors trigger the "error" event. Error found in the "detail" key 
 * @class 
 * @property {Object[]} [passes] - The list of raw pass objects  
 * @property {Boolean} [noAutoFetch=false] - if true, the element will NOT fetch the passes from the server automatically
 * @property {String} [forUser] - Gets all passes that involve this user.  Use "me" for current user
 * @property {Object} [filter] - Please See {@link module:api/passes.getPasses} for filter keys. 
 * @property {Boolean} [substitute] - Enables substitute mode on the state buttons.  Acts if you were the fromPerson.  Only if you have teacher permissions. forUser must be set
 * @example
 * <passport-pass-list noAutoFetch></passport-pass-list>
 */
class PassportPassList extends polymer.PolymerElement {
    static get template() {
        return view;
    }
    constructor() {
        super();
    }
    ready() {
        super.ready();
        if((!this.filter && !this.forUser) && !this.noAutoFetch) {
            //fetch all passes without filter
            this.refreshPasses();
        }
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
                observer: "_filtersChanged"
            },
            filter: {
                type: Object,
                observer: "_filtersChanged"
            },
            loading: {
                type: Boolean,
                notify: true,
                readOnly: true
            },
            _errored: {
                type: Boolean
            },
            substitute: {
                type: Boolean
            }
        };
    }
    /** OBSERVERS **/
    _filtersChanged() {
        if(this.forUser.toLowerCase() === "me") {
            this.forUser = utils.thisUser();
        } else if(typeof this.filter === "string") {
            //parse it
            this.filter = JSON.parse(this.filter);
        } else {
            if(!this.noAutoFetch) {
                this.refreshPasses();
            }
        }
        
    } 
    /**
     * Fetches pass array from server
     */
    refreshPasses() {
        this._errored = false;
        this._setLoading(true);
        let fetchTrans = null;
        if(this.forUser) {
            fetchTrans = accountJS.getPasses(this.forUser, Object.assign(this.filter, {substitute: this.substitute}));
        } else {
            fetchTrans = passJS.get(this.filter);
        }
        fetchTrans.then((passes) => {
            this._setLoading(false);
            this.passes = passes;
        }).catch((err) => {
            this._setLoading(false);
            this._error(err);
        });
        /*
        DAMMIT SAFARI
        .finally(() => {
            this._setLoading(false);
        });*/
    }
    /**
     * An array.sort callback function for sorting the passes property
     * Sorts by date ONLY right now
     */
    sort(a, b) {
        a.date = new Date(a.date);
        b.date = new Date(b.date);
        if(a.date > b.date) {
            return 1;
        } else if(a.date < b.date) {
            return -1;
        } else {
            return 0;
        }
    }

    _getPassHead(pass) {

        if(this.forUser === pass.migrator.id) {
            //show toPerson in title
            return this._formatName(pass.toPerson.name);
        } else if(this.forUser === pass.toPerson.id) {
            //show migrator in title
            return this._formatName(pass.migrator.name);
        } else {
            //if no main user is provided,
            return this._formatName(pass.migrator.name) + " to " + this._formatName(pass.toPerson.name);
        }
    }


    _getAvatarID(pass) {
        if(this.forUser === pass.migrator.id) {
            //show toPerson's avatar 
            return pass.toPerson.id;
        } else {
            //return migrator for everything else
            return pass.migrator.id;
        }
    }

    _formatName(nameObject) {
        if(!nameObject) {return undefined;}
        //chack if the key is a string, if not set var as an empty string
        let first = typeof nameObject.first === "string"?utils.capitalizeFirstLetter(nameObject.first):"";
        let last = typeof nameObject.last === "string"?utils.capitalizeFirstLetter(nameObject.last):"";
        return first + " " + last;
    }


    _error(err) {
        this._errored = true;
        this.dispatchEvent(new CustomEvent("error", {detail: {error: err}}));
    }
}

module.exports = PassportPassList;
customElements.define("passport-pass-list", module.exports);