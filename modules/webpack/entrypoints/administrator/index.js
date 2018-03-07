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
let securityJS = require("../../api/security.js");
//let moment = require("moment")


let pageLoadProm = [];
window.onload = function() {
    $(".button-collapse").sideNav();
    $(".datepicker").pickadate({
        formatSubmit: "yyyy-mm-dd",
        hiddenName: true,
        selectMonths: true, // Creates a dropdown to control month
        selectYears: 15 // Creates a dropdown of 15 years to control year
    });
    $(".timepicker").pickatime({
        default: "now", // Set default time
        fromnow: 0,       // set default time to * milliseconds from now (using with default = 'now')
        twelvehour: true, // Use AM/PM or 24-hour format
        donetext: "OK", // text for done-button
        cleartext: "Clear", // text for clear-button
        canceltext: "Cancel", // Text for cancel-button
        autoclose: false, // automatic close timepicker
        ampmclickable: true, // make AM PM clickable
        aftershow: function(){} //Function for after opening timepicker  
    });
    $("select").material_select();

};

/** START[New Account Permission key Card]**/

//Listen for click on submit button.  Check validity 
$("#accountPermKey-submit").on("click", (e) => {
    buttonLoader.load("#accountPermKey-submit");
    let userGroups = $("#accountPermKey-userGroups");
    let date = $("input[name=accountPermKey-date]");
    let time = $("input#accountPermKey-time");
    let tally = $("input#accountPermKey-tally");
    let datetime = moment(date.val() + " " + time.val(), "YYYY-MM-DD hh:mmA");
    /*console.log(date.val() + " " + time.val())
    console.log(datetime)
    console.log(datetime.toISOString())
    console.log(time.val())*/
    //console.log(new Date(date).)
    if(!date.val() && time.val()) {
        buttonLoader.warning("#accountPermKey-submit", 2000);
        return Materialize.toast("Date required for timeout", 4000);
    }

    //check tally 
    let tallyNum = parseInt(tally.val());
    if(tally.val() && isNaN(tallyNum)) {
        Materialize.toast("Invalid tally", 4000);
        return buttonLoader.warning("#accountPermKey-submit", 2000);
    }
    if(userGroups.val().length > 0) {

        //Submit
        let returner = {
            userGroups: userGroups.val()
        };
        if(datetime.isValid() || !isNaN(tallyNum)) {
            returner.timeout = {};
        }
        if(datetime.isValid()) {
            returner.timeout.time = datetime.toISOString();
        }
        if(!isNaN(tallyNum)) {
            returner.timeout.tally = tallyNum;
        }
        //console.log(returner)
        securityJS.newAccount(returner).then((res) => {
            if(res.key) {
                buttonLoader.success("#accountPermKey-submit", 2000);
                let fullURL = location.protocol+"//"+location.hostname+(location.port ? ":"+location.port: "");
                let link = fullURL + "/auth/signup?pk=" + res.key;
                $("#accountPermKey-response").html("<p>Permission Key: <strong>" + res.key + "</strong></p><br> <p>Signup link: <a href=\"" + link + "\">" + link + "</a></p>");
                userGroups.val(null);
                userGroups.material_select();
                return true;
            } else {
                Materialize.toast("Key was not returned. Please try again.", 4000);
                return buttonLoader.warning("#accountPermKey-submit", 2000);
            }
        });
        

    } else {
        Materialize.toast("User Group Required", 4000);
        buttonLoader.warning("#accountPermKey-submit", 2000);
    }
});



/** END[account permission key card] **/