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
* @param (Object) params
* @returns (String)
*/
exports.urlQuery = (params) => {
    return query = Object.keys(params)
    .filter(function(e) { return ((params[e] !== undefined) && params[e] !== null) }) //removes 
    .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
    .join('&');
}

/**
* Parses an error, and triggers a toast 
* @link module:webpack/utils
* @param (Error) err
* @returns (undefined)
*/
exports.throwError = (err) => {
  //Do more Later
  if(err.isFetch) {
    var $toastHTML = $("<span> ERROR: " + err.response.status + " " + err.message + "</span>").append($("<br/> <span> <strong>" + decodeURIComponent(err.response.headers.get("errormessage")) + "</strong> </span>"))
  } else if(err.status) {
    //AJAX ERROR
    var $toastHTML = $("<span> ERROR: " + err.status + " " + err.statusText + "</span>").append($("<br/> <span> <strong>" + decodeURIComponent(err.getResponseHeader("errormessage")) + "</strong> </span>"))
  } else if(err.message) {
    var $toastHTML = $("<span> ERROR: " + err.message + "</span>")
  } else {
    var $toastHTML = $("<span> ERROR! Check The Console For More Details.</span>")
  }
  Materialize.toast($toastHTML, 4000)
  console.error(err);
}

/**
* Parses a fetch response and either throws an error, or it returns a promise  
* @link module:webpack/utils
* @param (Response) response
* @returns (Promise)
*/
exports.fetchStatus = (response) => {
  //console.log(response)
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    var error = new Error(response.statusText)
    error.isFetch = true;
    error.response = response;
    errorHand(error)
    throw error
  }
}

/**
* Converts response to json   
* @link module:webpack/utils
* @param (Response) response
* @returns (Promise)
*/
exports.fetchJSON = (response) => {
  return response.json()
}

/**
* Creates a UUID V4 Id    
* @link module:webpack/utils
* @returns (String)
*/
exports.uuidv4 = () => {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => 
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

/**
* Sets a browser cookie   
* @link module:webpack/utils
* @param (String) cname - Value to name the cookie
* @param (String) cvalue - Value of the cookie
* @param (Number) exdays - Days until expired
* @returns (undefined)
*/
exports.setCookie = (cname, cvalue, exdays) => {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

/**
* Gets a browser cookie   
* @link module:webpack/utils
* @param (String) cname - Name of the cookie
* @returns (String)
*/
exports.getCookie = (cname) => {
    var name = cname + "=";
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
    return "";
}

/**
* Returns a list of every distinct key in the object   
* @link module:webpack/utils
* @param (Object[]) arr - Array of the json objects with keys to test
* @returns (String[])
*/
exports.distinctKeys = (arr) => {
    return Object.keys(arr.reduce(function(result, obj) {
      return Object.assign(result, obj);
    }, {}))
}
