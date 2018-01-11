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

let utils = require("../../utils/index.js");
let buttonLoader = require("../../common/buttonLoader");


let pageLoadProm = [];
window.onload = function() {
    
};

/** START[New Account Permission key Card]**/

//Listen for click on submit button.  Check validity 
$("#accountPermKey-submit").on("click", (e) => {
    buttonLoader.load("#accountPermKey-submit");
    let userGroups = $("#accountPermKey-userGroups");
    let date = $("input#accountPermKey-date");
    let time = $("input#accountPermKey-time");
    let tally = $("input#accountPermKey-tally");
    console.log(userGroups.val())
    if(userGroups.val() && date.val() && time.val() && tally.val()) {
        buttonLoader.success("#accountPermKey-submit", 2000)
    } else {
        buttonLoader.warn("#accountPermKey-submit", 2000)
    }
})



/** END[account permission key card] **/