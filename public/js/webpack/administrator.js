/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 20);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ (function(module, exports) {

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
/**
* Browser Utilities.
* @module webpack/utils
*/

/**
* Takes an Object and returns a URL Query string
* @link module:webpack/utils
* @param {Object} params
* @returns {String}
*/
exports.urlQuery = (params) => {
    return query = Object.keys(params)
        .filter(function(e) { return ((params[e] !== undefined) && params[e] !== null); }) //removes 
        .map(k => encodeURIComponent(k) + "=" + encodeURIComponent(params[k]))
        .join("&");
};

/**
* Parses an error, and triggers a toast 
* @link module:webpack/utils
* @param {Error} err
* @returns {undefined}
*/
exports.throwError = (err) => {
    //Do more Later
    if(err.isFetch) {
        var $toastHTML = $("<span> ERROR: " + err.response.status + " " + err.message + "</span>").append($("<br/> <span> <strong>" + decodeURIComponent(err.response.headers.get("errormessage")) + "</strong> </span>"));
    } else if(err.status) {
    //AJAX ERROR
        var $toastHTML = $("<span> ERROR: " + err.status + " " + err.statusText + "</span>").append($("<br/> <span> <strong>" + decodeURIComponent(err.getResponseHeader("errormessage")) + "</strong> </span>"));
    } else if(err.message) {
        var $toastHTML = $("<span> ERROR: " + err.message + "</span>");
    } else {
        var $toastHTML = $("<span> ERROR! Check The Console For More Details.</span>");
    }
    Materialize.toast($toastHTML, 4000);
    console.error(err);
};

/**
* An wrapper for the fetch api to make code clean   
* @link module:webpack/utils
* @param {String} method - GET, POST, PATCH, PUT, DELETE, ect.
* @param {String} url - Url to send request to.
* @param {(Object|undefined)} data
* @param {(Object|undefined)} data.query - JSON key pair to add to the URL as a query
* @param {(Object|undefined)} data.body - Data to send in the body of the request.  May not work with GET and DELETE
* @param {(Boolean|undefined)} data.head - Data to be sent as the header. Json object
* @param {(Boolean|undefined)} data.auth - If true, it will send the XSRF-TOKEN to the server
* @returns {Promise}
*/
exports.fetch = (method, url, data) => {
    return new Promise((resolve, reject) => {
        if(!data) {data = {};}
        if(data.query) {data.query = "?" + exports.urlQuery(data.query);} else {data.query = "";}
        if(!data.head) {data.head = {};}
        if(data.auth) {data.head["x-xsrf-token"] = exports.getCookie("XSRF-TOKEN");}
        if(data.body && typeof data.body === "object") {
            data.head["Content-Type"] = "application/json";
            data.body = JSON.stringify(data.body);
        }
        fetch(url + data.query, {
            method: method,
            headers: new Headers(data.head),
            body: data.body,
            credentials: "same-origin"
        }).then(exports.fetchStatus).then(exports.fetchJSON).then((json) => {
            return resolve(json);
        }).catch((err) => {
            return reject(err);
        });
    });
};

/**
* Parses a fetch response and either throws an error, or it returns a promise  
* @link module:webpack/utils
* @param {Response} response
* @returns {Promise}
*/
exports.fetchStatus = (response) => {
    //console.log(response)
    if (response.status >= 200 && response.status < 300) {
        return response;
    } else {
        var error = new Error(response.statusText);
        error.isFetch = true;
        error.response = response;
        //exports.throwError(error)
        throw error;
    }
};

/**
* Converts response to json   
* @link module:webpack/utils
* @param {Response} response
* @returns {Promise}
*/
exports.fetchJSON = (response) => {
    return response.text().then(function(text) {
        return text ? JSON.parse(text) : {};
    });
};

/**
* Creates a UUID V4 Id    
* @link module:webpack/utils
* @returns {String}
*/
exports.uuidv4 = () => {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => 
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
};

/**
* Sets a browser cookie   
* @link module:webpack/utils
* @param {String} cname - Value to name the cookie
* @param {String} cvalue - Value of the cookie
* @param {Number} exdays - Days until expired
* @returns {undefined}
*/
exports.setCookie = (cname, cvalue, exdays) => {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
};

/**
* Gets a browser cookie   
* @link module:webpack/utils
* @param {String} cname - Name of the cookie
* @returns {String}
*/
exports.getCookie = (name) => {
    /*var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";*/
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();

};

/**
* Returns a list of every distinct key in the object   
* @link module:webpack/utils
* @param {Object[]} arr - Array of the json objects with keys to test
* @returns {String[]}
*/
exports.distinctKeys = (arr) => {
    return Object.keys(arr.reduce(function(result, obj) {
        return Object.assign(result, obj);
    }, {}));
};

/**
* Returns the current user's ID 
* @link module:webpack/utils
* @returns {String}
*/
exports.thisUser = () => {
    return exports.getCookie("ACCOUNT-ID");
};

/**
* Material full screen response for major actions
* @link module:webpack/utils
* @param {string} icon - Can be "check" or "cancel"
* @param {string} colorClass - Either a css class to apply to the background or presets: "success" "error" or "warning"
* @returns {function} done
*/
exports.materialResponse = (icon, colorClass, done) => {
    switch(colorClass){
    case "success": 
        colorClass = "green accent-3";
        break;
    case "error": 
        colorClass = "red accent-4";
        break;
    case "warning": 
        colorClass = "orange accent-4";
        break;
    }

    //Set the elements 
    $("body").prepend("<div id=\"circleThingContainer\" class=\"circleThingContainer\"><div id=\"circleThing\" class=\"circleThing\"></div></div><span id=\"Xleft\"></span><span id=\"Xright\"></span><div id=\"checkmarkContainer\"><span id=\"Cleft\"></span><span id=\"Cright\"></span></div>");
    //setup green grow
    if(icon == "check") {
        $("#checkmarkContainer").addClass("checkmarkContainer checkmarkContainerIn");
        //Check marks 
        $("#Cleft").addClass("Cleft CleftIn");
        $("#Cright").addClass("Cright CrightIn");
    }
    if(icon == "cancel") {
        //X marks 
        $("#Xleft").addClass("Xleft XleftIn");
        $("#Xright").addClass("Xright XrightIn");
    }

    $("#circleThing").removeClass().addClass("circleThing circleGrow");
    //addcolor
    $("#circleThing").addClass(colorClass);

    //on circle complete 
    $("#circleThing").one("webkitAnimationEnd oanimationend msAnimationEnd animationend", function(e) {
      
        $("#circleThingContainer").addClass(colorClass);
        $("#circleThing").removeClass().addClass("circleThing");
        //wait for 1 second
        setTimeout(function() {
            if(icon == "check") {
                $("#checkmarkContainer").removeClass("checkmarkContainerIn").addClass("checkmarkContainerOut");
                $("#Cleft").removeClass("CleftIn").addClass("CleftOut");
                $("#Cright").removeClass("CrightIn").addClass("CrightOut");
            }
            if(icon == "cancel") {
            //X marks 
                $("#Xleft").removeClass("XleftIn").addClass("XLeftOut");
                $("#Xright").removeClass("XrightIn").addClass("XrightOut");
            }

            $("#circleThing").removeClass().addClass("circleThing circleGrow grey darken-4");
            //$('#circleThing').css("background-color", "rgba(0, 0, 0, 0)")
            //when final one ends
            $("#circleThing").one("webkitAnimationEnd oanimationend msAnimationEnd animationend", function(e) {
                $("#circleThingContainer").removeClass(colorClass).addClass("grey darken-4");
                setTimeout(function() {
                    $("#Xleft").remove();
                    $("#Xright").remove();
                    $("#Cleft").remove();
                    $("#Cright").remove();
                    $("#checkmarkContainer").remove();
                    $("#circleThingContainer").fadeOut("fast", function() {
                        $("#circleThingContainer").remove();
                    });
                    $("#circleThing").remove();
                    if(typeof done == "function") {
                        return done();
                    }
                }, 500);
            });
        }, 1000);
    });
};

/** 
* Opens a mustache Mixen page
* @link module:webpack/utils
* @param {string} pageID - ID of the page element containing the mixen 
*/
exports.openPage = (pageID) => {
    $("#" + pageID).addClass("active");
};
/** 
* close a mustache Mixen page
* @link module:webpack/utils
* @param {string} pageID - ID of the page element containing the mixen 
*/
exports.closePage = (pageID) => {
    $("#" + pageID).removeClass("active");
};

/** 
* Returns a Materialize loader element
* @link module:webpack/utils
* @param {Object} [options]
* @param {string} [options.size=medium] - ("big" or "small")
* @param {string} [options.color=multi] - ("red", "yellow", "green", "blue")
* @param {boolean} [options.active=true]
* @returns {Object} - JQuery element
*/
exports.loader = ({size, color, active}) => {
    if(!size) {size = "";}
    if(active !== false) {active = "active"} else {active = ""}
    let htmlLoader = $("<div/>").addClass("preloader-wrapper " + active + " " + size);
    
    
    let itt = !color?4:1;
    for(let x = 0; x < itt; x++) {
        let rowCol = typeof color === "string" ? color + "-only" : x === 0? "blue" : x === 1? "red" : x === 2? "yellow" : x === 3? "green" : ""; 
        htmlLoader.append($("<div class=\"spinner-layer spinner-" + rowCol + `">
      <div class="circle-clipper left">
        <div class="circle"></div>
      </div><div class="gap-patch">
        <div class="circle"></div>
      </div><div class="circle-clipper right">
        <div class="circle"></div>
      </div>
    </div>
    `));
    }
    return htmlLoader;
};

/***/ }),

/***/ 20:
/***/ (function(module, exports, __webpack_require__) {

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

let utils = __webpack_require__(0);
let buttonLoader = __webpack_require__(21);
//let moment = require("moment")


let pageLoadProm = [];
window.onload = function() {
    $(".button-collapse").sideNav();
    $('.datepicker').pickadate({
      formatSubmit: 'yyyy-mm-dd',
      hiddenName: true,
      selectMonths: true, // Creates a dropdown to control month
      selectYears: 15 // Creates a dropdown of 15 years to control year
    });
    $('.timepicker').pickatime({
      default: 'now', // Set default time
      fromnow: 0,       // set default time to * milliseconds from now (using with default = 'now')
      twelvehour: true, // Use AM/PM or 24-hour format
      donetext: 'OK', // text for done-button
      cleartext: 'Clear', // text for clear-button
      canceltext: 'Cancel', // Text for cancel-button
      autoclose: false, // automatic close timepicker
      ampmclickable: true, // make AM PM clickable
      aftershow: function(){} //Function for after opening timepicker  
    });
    $('select').material_select();

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
    console.log(date.val() + " " + time.val())
    console.log(datetime)
    console.log(datetime.toISOString())
    console.log(time.val())
    //console.log(new Date(date).)
    if(!date.val() && time.val()) {
        buttonLoader.warning("#accountPermKey-submit", 2000)
        return Materialize.toast('Date required for timeout', 4000)
    }

    //check tally 
    let tallyNum = parseInt(tally.val())
    if(tally.val() && isNaN(tallyNum)) {
        Materialize.toast('Invalid tally ', 4000)
        return buttonLoader.warning("#accountPermKey-submit", 2000)
    }
    if(userGroups.val().length > 0) {

        buttonLoader.success("#accountPermKey-submit", 2000)

        //Submit
        let returner = {
            userGroups: userGroups.val()
        }
        if(datetime.isValid() || !isNaN(tallyNum)) {
            returner.timeout = {}
        }
        if(datetime.isValid()) {
            returner.timeout.time = datetime.toISOString()
        }
        if(!isNaN(tallyNum)) {
            returner.timeout.tally = tallyNum;
        }
        console.log(returner)

    } else {
        Materialize.toast('User Group Required', 4000)
        buttonLoader.warning("#accountPermKey-submit", 2000)
    }
})



/** END[account permission key card] **/

/***/ }),

/***/ 21:
/***/ (function(module, exports, __webpack_require__) {

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

/**
* Browser module for overlaying a circular loader on a button.
* @module webpack/buttonLoader
*/
let utils = __webpack_require__(0);


/**
 * Applies a loader overlay to any button 
 * @link module:webpack/buttonLoader
 * @param {(String|Object)} element - The element to apply the overlay to
 */
exports.load = (element) => {
    element = $(element);
    element.addClass("disabled");
    let loader = element.find("#" + element.attr("data-button-loader"));
    if(loader.length > 0) {
        loader.find("div.preloader-wrapper").addClass("active");
    } else {
        let id = utils.uuidv4();
        element.attr("data-button-loader", id);        
        element.append($("<div/>").addClass("button-loader").attr("id", id).append(utils.loader({size: "small"})));
    }
};

/**
 * Hides the loading overlay.
 * @link module:webpack/buttonLoader
 * @param {(String|Object)} element - The element with an active overlay.
 */
exports.done = (element) => {
    element = $(element);
    element.removeClass("disabled");
    let loader = element.find("#" + element.attr("data-button-loader"));
    loader.find("div.preloader-wrapper").removeClass("active");
};

/**
 * Like {@link module:webpack/buttonLoader.done} but has a green success animation
 * @link module:webpack/buttonLoader
 * @param {(String|Object)} element - The element with an active overlay. 
 * @param {*} fadeMS - miliseconds to wait until background color is returned to normal 
 */
exports.success = (element, fadeMS) => {
    element = $(element);
    exports.done(element);
    if(!element.hasClass("green")) {
        element.addClass("green");
        setTimeout(() => {
            element.removeClass("green");
        }, fadeMS);
    }
};

/**
 * Like {@link module:webpack/buttonLoader.done} but has a red fail animation
 * @link module:webpack/buttonLoader
 * @param {(String|Object)} element - The element with an active overlay. 
 * @param {*} fadeMS - miliseconds to wait until background color is returned to normal 
 */
exports.fail = (element, fadeMS) => {
    element = $(element);
    exports.done(element);
    if(!element.hasClass("red")) {
        element.addClass("red")
        setTimeout(() => {
            element.removeClass("red")
        }, fadeMS);
    }
}

/**
 * Like {@link module:webpack/buttonLoader.done} but has a orange warning animation
 * @link module:webpack/buttonLoader
 * @param {(String|Object)} element - The element with an active overlay. 
 * @param {*} fadeMS - miliseconds to wait until background color is returned to normal 
 */
exports.warning = (element, fadeMS) => {
    element = $(element);
    exports.done(element);
    if(!element.hasClass("orange")) {
        element.addClass("orange")
        setTimeout(() => {
            element.removeClass("orange")
        }, fadeMS);
    }
}

/***/ })

/******/ });