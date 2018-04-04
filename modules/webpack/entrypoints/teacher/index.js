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
require("../../components/styles/default-theme.js");
require("../../components/pass-list/pass-list.js");
require("../../components/search-accounts/search-accounts.js");
require("../../components/responsive-dialog/responsive-dialog.js");
require("@polymer/paper-icon-button/paper-icon-button");
require("@polymer/iron-icons/iron-icons.js");
require("@polymer/app-layout/app-toolbar/app-toolbar.js");
require("@polymer/paper-button/paper-button.js");

/** require modules **/
var utils = require("../../utils/index.js");

//Main Elements
let toPersonList = document.getElementById("toPersonList");
let fromPersonList = document.getElementById("fromPersonList");
let subModeAccount = document.getElementById("subModeAccount");
let subModeButton = document.getElementById("subModeButton");
let subModeDialog = document.getElementById("subModeDialog");

window.onload = function() {
    //listen for errors
    toPersonList.addEventListener("error", (e) => {
        utils.throwError(e.detail.error);
    });
    fromPersonList.addEventListener("error", (e) => {
        utils.throwError(e.detail.error);
    });
    subModeAccount.addEventListener("error", (e) => {
        utils.throwError(e.detail.error);
    });

    //Generate today's date
    let date = new Date();
    date = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
    //Set the filter for the pass lists 
    toPersonList.filter = {date_from: date, toPerson: utils.thisUser()};
    toPersonList.refreshPasses();

    fromPersonList.filter = {date_from: date, date_to: date, fromPerson: utils.thisUser()};
    fromPersonList.refreshPasses();
};

/* Table of contents:
    - Sub Mode (T01)
*/
/* START SUB MODE (T01)*/
//Listen for the modal open button to be clicked 
subModeButton.addEventListener("click", () => {
    //open modal
    subModeDialog.open();
});

//listen for the closing of the dialog 
subModeDialog.addEventListener("iron-overlay-closed", (e) => {
    /*console.log(subModeAccount.value)
    console.log(e)*/
    //if confirmed
    if(e.detail.confirmed) {
        //enable/disable sub mode
        if(subModeAccount.value) {
            fromPersonList.forUser = subModeAccount.value.value.id;
            fromPersonList.substitute = true;
            subModeButton.style.color="var(--accent-color)";
        } else {
            fromPersonList.substitute = undefined;
            fromPersonList.forUser = "me";
            subModeButton.style.color="var(--primary-text-color)";
        }
        fromPersonList.refreshPasses();
    } else {
        //canceled so clear the input
        subModeAccount.query = "";
    }
    subModeDialog.closingReason.confirmed = false;
});

/* END SUB MODE */