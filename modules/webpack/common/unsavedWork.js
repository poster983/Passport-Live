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
* Browser module for storing if work is unsaved and then notifying the user.
* This is ment to be used with the back buttons on the mustache mixen pages.
* If the button is clicked and there is unsaved work, the button will need to be pressed again for the button action to go through.
* @module webpack/unsavedWork
*/

/**
* Initiates a button for tracking if work is unsaved.
* @link module:webpack/unsavedWork
* @param {(Object|string)} element - The element to initiate for trackeing
* @param {Object} [callbacks] 
* @param {function} [callbacks.onAction] - called when the button action goes through. IE The page is discarded. The click event and the element are passed
* @param {function} [callbacks.onDiscard] - called when the button is pressed after being warned. Like callbacks.onAction, but not called if everything is saved.
* @param {function} [callbacks.onWarn] - called when the button action is canceled and a warning should be showed. The click event and the element are passed 
* @param {function} [callbacks.onSave] - called when the element is saved and it is save to discard. The Element is passed
* @param {function} [callbacks.onReset] - called when the element is reset to default values. The Element is passed
*/
exports.button = (element, callbacks) => {
    if(!callbacks || typeof callbacks !== "object") {callbacks = {};}
    element = $(element);
    //bind callback to element
    if(typeof callbacks.onSave === "function") {
        element.data("onSave", callbacks.onSave);
    }
    if(typeof callbacks.onReset === "function") {
        element.data("onReset", callbacks.onReset);
    }
    element.attr("data-unsaved", false);
    element.attr("data-willdiscard", false);
    element.off("click");
    element.on("click", (event) => {
        if(element.attr("data-willdiscard") === "true") {
            if(typeof callbacks.onAction === "function") {
                callbacks.onAction({event: event, element: element});
            }
            if(typeof callbacks.onDiscard === "function") {
                callbacks.onDiscard({event: event, element: element});
            }
        } else {
            if(element.attr("data-unsaved") === "true") {
                element.attr("data-willdiscard", true);
                //stop any href or onclick.
                event.preventDefault();
                if(typeof callbacks.onWarn === "function") {
                    return callbacks.onWarn({event: event, element: element});
                }
            } else {
                if(typeof callbacks.onAction === "function") {
                    return callbacks.onAction({event: event, element: element});
                }
            }
        }
    })
}


/**
* Call this when data is changed and thus unsaved.
* [Button]{@link module:webpack/unsavedWork.button} must be called first.
* @link module:webpack/unsavedWork
* @param {(Object|string)} element - The element to notify about the change.
*/
exports.changed = (element) => {
    element = $(element);
    if(typeof element.attr("data-unsaved") === "undefined" || typeof element.attr("data-willdiscard") === "undefined") {
        throw new Error("Please call .button(element, ondiscard) on this element before calling .changed(element)");
    }
    element.attr("data-unsaved", true);
    element.attr("data-willdiscard", false);
}


/**
* Resets the values to a saved state.
* [Button]{@link module:webpack/unsavedWork.button} must be called first.
* @link module:webpack/unsavedWork
* @param {(Object|string)} element - The element to notify about the change.
*/
exports.reset = (element) => {
    element = $(element);
    if(typeof element.attr("data-unsaved") === "undefined" || typeof element.attr("data-willdiscard") === "undefined") {
        throw new Error("Please call .button(element, ondiscard) on this element before calling .saved(element)");
    }
    element.attr("data-unsaved", false);
    element.attr("data-willdiscard", false);
    if(typeof element.data("onReset") === "function") {
        element.data("onReset")(element);
    }
}

/**
* Call this when data is saved and it is ok to click the button. IE. a [reset]{@link module:webpack/unsavedWork.reset}
* Also calles the "onSave" and "onReset" callbacks.
* [Button]{@link module:webpack/unsavedWork.button} must be called first.
* @link module:webpack/unsavedWork
* @param {(Object|string)} element - The element to notify about the change.
*/

exports.saved = (element) => {
    element = $(element);
    exports.reset(element);
    if(typeof element.data("onSave") === "function") {
        element.data("onSave")(element);
    }
}


/**
* Removes all bindings from the element and removes the data and attrs.  The element itself will not be deleted
* [Button]{@link module:webpack/unsavedWork.button} must be called first.
* @link module:webpack/unsavedWork
* @param {(Object|string)} element - The element to destroy.
*/
exports.destroy = (element) => {
    element = $(element);
    if(typeof element.attr("data-unsaved") === "undefined" || typeof element.attr("data-willdiscard") === "undefined") {
        throw new Error("Please call .button(element, ondiscard) on this element before calling .destroy(element)");
    }
    element.attr("data-unsaved", null);
    element.attr("data-willdiscard", null);
    element.data("onSave", null);
    element.data("onReset", null);
    element.off("click");
}