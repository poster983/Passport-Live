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
/*
* @module webpack/framework
*/
var typeCheck = require("type-check").typeCheck

/**
* Pairs a caret "^" button with a hidden element.  Shows element when carot is clicked and flips carot.
* @link module:webpack/framework
* @class 
* @param {Selector} caretButton - The clickable element.
* @param {Selector} content - The element to be shown.
* @param {(Object|undefined)} options - The clickable element.
* @param {(Boolean|undefined)} options.isOpen - True if the element should be shown by default.
* @param {(Number|undefine)} options.timing - How fast the element will be shown. In ms.
*/
class Caret {
    constructor(caretButton, content, options) {
        if(!typeCheck("Maybe {isOpen: Maybe Boolean, timing: Maybe Number}"), options) {
            throw new TypeError("Options expected an object with structure: \"Maybe {isOpen: Maybe Boolean, timing: Maybe Number}\"");
        }
        if(!options) {options = {}}
        this.options = options;
        this.caretButton = caretButton;
        this.contentElm = content;
        this.state = (this.options.isOpen || false);
        this.caretButton.css("transition", "transform 0.2s");
        this.showContent(this.state, 0)
    }
    initialize() {
        this.caretButton.on("click", e=> this._onClick(e));
    }
    destroy() {
        this.caretButton.off("click");
    }
    _onClick(event) {
        if(this.state) {this.caretButton.css("transform", "rotate(0deg)")} else {this.caretButton.css("transform", "rotate(180deg)")}
        this.showContent(!this.state);
    }
    showContent(isShown, time) {
        if(!typeCheck("Number", time)) {time = (this.options.timing || 200)}
        if(time > 0) {
            if(isShown) {this.contentElm.slideDown(time)} else {this.contentElm.slideUp(time)}
        } else {
            if(isShown) {this.contentElm.show()} else {this.contentElm.hide()}
        }
        this.state = isShown;
    }
}

module.exports = Caret;