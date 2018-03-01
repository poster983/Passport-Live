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
var typeCheck = require("type-check").typeCheck;

/**
* Pairs a caret "^" button with a hidden element.  Shows element when carot is clicked and flips carot.
* @link module:webpack/framework
* @class 
* @param {Selector} caretButton - The clickable element.
* @param {Object} [options] - The clickable element.
* @param {Selector} [options.content] - The element to be shown/hide.
* @param {Boolean} [options.isOpen] - True if the element should be shown by default.
* @param {Number} [options.timing] - How fast the element will be shown. In ms.
* @param {Function} [options.callback] - Passes one argument, "isOpen" (bool). Fires whenever the Caret is clicked.
* @param {Boolean} [options.initialise=true] - Will automaticly call .initialize()
*/
class Caret {
    constructor(caretButton, options) {
        let type = `Maybe {
            isOpen: Maybe Boolean, 
            content: Maybe String|Object, 
            initialise: Maybe Boolean, 
            timing: Maybe Number, 
            callback: Maybe Function
        }`
        if(!typeCheck(type, options)) {
            throw new TypeError("Options expected an object with structure: \" " + type +"\"");
        }
        if(!options) {options = {};}
        this.options = options;
        this.caretButton = caretButton;
        this.contentElm = options.content;
        this.state = (this.options.isOpen || false);
        this.caretButton.css("transition", "transform 0.2s");
        this._showContent(this.state, 0);
        if(options.initialise !== false) {
            this.initialize();
        }
    }
    /** Starts listening for clicks on the button*/
    initialize() {
        this.caretButton.on("click", e=> this.toggle(e));
    }
    /** Stops listening for clicks on the button*/
    destroy() {
        this.caretButton.off("click");
    }
    /**Opens or closes the Caret*/
    toggle() {
        if(this.state) {this.caretButton.css("transform", "rotate(0deg)");} else {this.caretButton.css("transform", "rotate(180deg)");}
        if(typeCheck("Function", this.options.callback)) {this.options.callback(!this.state);}
        this._showContent(!this.state);
    }
    _showContent(isShown, time) {
        if(this.options.content) {
            if(!typeCheck("Number", time)) {time = (this.options.timing || 200);}
            if(time > 0) {
                if(isShown) {this.contentElm.slideDown(time);} else {this.contentElm.slideUp(time);}
            } else {
                if(isShown) {this.contentElm.show();} else {this.contentElm.hide();}
            }
        }
        this.state = isShown;
    }
}

module.exports = Caret;