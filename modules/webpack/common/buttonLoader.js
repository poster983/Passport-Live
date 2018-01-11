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
let utils = require("../utils/index.js");


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