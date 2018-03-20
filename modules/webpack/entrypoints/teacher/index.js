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

/**Work-around for lastpass issue on firefox**/
document.createElement = Document.prototype.createElement;
/** require webcomponents **/
require("@polymer/paper-card/paper-card.js");
require("@polymer/paper-listbox/paper-listbox.js");
require("../../components/pass-list/pass-list.js");
require("../../components/pass/pass.js");


/** require modules **/
var utils = require("../../utils/index.js");

//Main Elements
let toPersonList = document.getElementById("toPersonList");

window.onload = function() {
    //check for errors TEST
    $("passport-pass-list").on("error", (e) => {
        //console.log(e);
        utils.throwError(e.originalEvent.detail.error);
    });

    //Set the filter for the pass lists 
    
    toPersonList.filter = {date_from: new Date().toISOString()};
    toPersonList.refreshPasses();
};
