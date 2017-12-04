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
/******/ 	return __webpack_require__(__webpack_require__.s = 17);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
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
* An wrapper for the fetch api to make code clean   
* @link module:webpack/utils
* @param (String) method - GET, POST, PATCH, PUT, DELETE, ect.
* @param (String) url - Url to send request to.
* @param ({Object|undefined}) data
* @param ({Object|undefined}) data.query - JSON key pair to add to the URL as a query
* @param ({Object|undefined}) data.body - Data to send in the body of the request.  May not work with GET and DELETE
* @param ({Boolean|undefined}) data.head - Data to be sent as the header. Json object
* @param ({Boolean|undefined}) data.auth - If true, it will send the XSRF-TOKEN to the server
* @returns (Promise)
*/
exports.fetch = (method, url, data) => {
  return new Promise((resolve, reject) => {
    if(!data) {data = {}}
    if(data.query) {data.query = "?" + exports.urlQuery(data.query)} else {data.query = ""}
    if(!data.head) {data.head = {}}
    if(data.auth) {data.head["x-xsrf-token"] = getCookie("XSRF-TOKEN")}
    fetch(url + data.query, {
          method: method,
          headers: new Headers({
            //"Content-Type": "application/json",
            "x-xsrf-token": getCookie("XSRF-TOKEN")
          }),
          credentials: 'same-origin'
      }).then(exports.fetchStatus).then(exports.fetchJSON).then((json) => {
        return resolve(json)
      }).catch((err) => {
        return reject(err);
      })
  })
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
    //exports.throwError(error)
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

/**
* Returns the current user's ID 
* @link module:webpack/utils
* @returns (String)
*/
exports.thisUser = () => {
  return exports.getCookie("ACCOUNT-ID");
}

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

// Generated by LiveScript 1.4.0
(function(){
  var VERSION, parseType, parsedTypeCheck, typeCheck;
  VERSION = '0.3.2';
  parseType = __webpack_require__(2);
  parsedTypeCheck = __webpack_require__(3);
  typeCheck = function(type, input, options){
    return parsedTypeCheck(parseType(type), input, options);
  };
  module.exports = {
    VERSION: VERSION,
    typeCheck: typeCheck,
    parsedTypeCheck: parsedTypeCheck,
    parseType: parseType
  };
}).call(this);


/***/ }),
/* 2 */
/***/ (function(module, exports) {

// Generated by LiveScript 1.4.0
(function(){
  var identifierRegex, tokenRegex;
  identifierRegex = /[\$\w]+/;
  function peek(tokens){
    var token;
    token = tokens[0];
    if (token == null) {
      throw new Error('Unexpected end of input.');
    }
    return token;
  }
  function consumeIdent(tokens){
    var token;
    token = peek(tokens);
    if (!identifierRegex.test(token)) {
      throw new Error("Expected text, got '" + token + "' instead.");
    }
    return tokens.shift();
  }
  function consumeOp(tokens, op){
    var token;
    token = peek(tokens);
    if (token !== op) {
      throw new Error("Expected '" + op + "', got '" + token + "' instead.");
    }
    return tokens.shift();
  }
  function maybeConsumeOp(tokens, op){
    var token;
    token = tokens[0];
    if (token === op) {
      return tokens.shift();
    } else {
      return null;
    }
  }
  function consumeArray(tokens){
    var types;
    consumeOp(tokens, '[');
    if (peek(tokens) === ']') {
      throw new Error("Must specify type of Array - eg. [Type], got [] instead.");
    }
    types = consumeTypes(tokens);
    consumeOp(tokens, ']');
    return {
      structure: 'array',
      of: types
    };
  }
  function consumeTuple(tokens){
    var components;
    components = [];
    consumeOp(tokens, '(');
    if (peek(tokens) === ')') {
      throw new Error("Tuple must be of at least length 1 - eg. (Type), got () instead.");
    }
    for (;;) {
      components.push(consumeTypes(tokens));
      maybeConsumeOp(tokens, ',');
      if (')' === peek(tokens)) {
        break;
      }
    }
    consumeOp(tokens, ')');
    return {
      structure: 'tuple',
      of: components
    };
  }
  function consumeFields(tokens){
    var fields, subset, ref$, key, types;
    fields = {};
    consumeOp(tokens, '{');
    subset = false;
    for (;;) {
      if (maybeConsumeOp(tokens, '...')) {
        subset = true;
        break;
      }
      ref$ = consumeField(tokens), key = ref$[0], types = ref$[1];
      fields[key] = types;
      maybeConsumeOp(tokens, ',');
      if ('}' === peek(tokens)) {
        break;
      }
    }
    consumeOp(tokens, '}');
    return {
      structure: 'fields',
      of: fields,
      subset: subset
    };
  }
  function consumeField(tokens){
    var key, types;
    key = consumeIdent(tokens);
    consumeOp(tokens, ':');
    types = consumeTypes(tokens);
    return [key, types];
  }
  function maybeConsumeStructure(tokens){
    switch (tokens[0]) {
    case '[':
      return consumeArray(tokens);
    case '(':
      return consumeTuple(tokens);
    case '{':
      return consumeFields(tokens);
    }
  }
  function consumeType(tokens){
    var token, wildcard, type, structure;
    token = peek(tokens);
    wildcard = token === '*';
    if (wildcard || identifierRegex.test(token)) {
      type = wildcard
        ? consumeOp(tokens, '*')
        : consumeIdent(tokens);
      structure = maybeConsumeStructure(tokens);
      if (structure) {
        return structure.type = type, structure;
      } else {
        return {
          type: type
        };
      }
    } else {
      structure = maybeConsumeStructure(tokens);
      if (!structure) {
        throw new Error("Unexpected character: " + token);
      }
      return structure;
    }
  }
  function consumeTypes(tokens){
    var lookahead, types, typesSoFar, typeObj, type;
    if ('::' === peek(tokens)) {
      throw new Error("No comment before comment separator '::' found.");
    }
    lookahead = tokens[1];
    if (lookahead != null && lookahead === '::') {
      tokens.shift();
      tokens.shift();
    }
    types = [];
    typesSoFar = {};
    if ('Maybe' === peek(tokens)) {
      tokens.shift();
      types = [
        {
          type: 'Undefined'
        }, {
          type: 'Null'
        }
      ];
      typesSoFar = {
        Undefined: true,
        Null: true
      };
    }
    for (;;) {
      typeObj = consumeType(tokens), type = typeObj.type;
      if (!typesSoFar[type]) {
        types.push(typeObj);
      }
      typesSoFar[type] = true;
      if (!maybeConsumeOp(tokens, '|')) {
        break;
      }
    }
    return types;
  }
  tokenRegex = RegExp('\\.\\.\\.|::|->|' + identifierRegex.source + '|\\S', 'g');
  module.exports = function(input){
    var tokens, e;
    if (!input.length) {
      throw new Error('No type specified.');
    }
    tokens = input.match(tokenRegex) || [];
    if (in$('->', tokens)) {
      throw new Error("Function types are not supported.\ To validate that something is a function, you may use 'Function'.");
    }
    try {
      return consumeTypes(tokens);
    } catch (e$) {
      e = e$;
      throw new Error(e.message + " - Remaining tokens: " + JSON.stringify(tokens) + " - Initial input: '" + input + "'");
    }
  };
  function in$(x, xs){
    var i = -1, l = xs.length >>> 0;
    while (++i < l) if (x === xs[i]) return true;
    return false;
  }
}).call(this);


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

// Generated by LiveScript 1.4.0
(function(){
  var ref$, any, all, isItNaN, types, defaultType, customTypes, toString$ = {}.toString;
  ref$ = __webpack_require__(4), any = ref$.any, all = ref$.all, isItNaN = ref$.isItNaN;
  types = {
    Number: {
      typeOf: 'Number',
      validate: function(it){
        return !isItNaN(it);
      }
    },
    NaN: {
      typeOf: 'Number',
      validate: isItNaN
    },
    Int: {
      typeOf: 'Number',
      validate: function(it){
        return !isItNaN(it) && it % 1 === 0;
      }
    },
    Float: {
      typeOf: 'Number',
      validate: function(it){
        return !isItNaN(it);
      }
    },
    Date: {
      typeOf: 'Date',
      validate: function(it){
        return !isItNaN(it.getTime());
      }
    }
  };
  defaultType = {
    array: 'Array',
    tuple: 'Array'
  };
  function checkArray(input, type){
    return all(function(it){
      return checkMultiple(it, type.of);
    }, input);
  }
  function checkTuple(input, type){
    var i, i$, ref$, len$, types;
    i = 0;
    for (i$ = 0, len$ = (ref$ = type.of).length; i$ < len$; ++i$) {
      types = ref$[i$];
      if (!checkMultiple(input[i], types)) {
        return false;
      }
      i++;
    }
    return input.length <= i;
  }
  function checkFields(input, type){
    var inputKeys, numInputKeys, k, numOfKeys, key, ref$, types;
    inputKeys = {};
    numInputKeys = 0;
    for (k in input) {
      inputKeys[k] = true;
      numInputKeys++;
    }
    numOfKeys = 0;
    for (key in ref$ = type.of) {
      types = ref$[key];
      if (!checkMultiple(input[key], types)) {
        return false;
      }
      if (inputKeys[key]) {
        numOfKeys++;
      }
    }
    return type.subset || numInputKeys === numOfKeys;
  }
  function checkStructure(input, type){
    if (!(input instanceof Object)) {
      return false;
    }
    switch (type.structure) {
    case 'fields':
      return checkFields(input, type);
    case 'array':
      return checkArray(input, type);
    case 'tuple':
      return checkTuple(input, type);
    }
  }
  function check(input, typeObj){
    var type, structure, setting, that;
    type = typeObj.type, structure = typeObj.structure;
    if (type) {
      if (type === '*') {
        return true;
      }
      setting = customTypes[type] || types[type];
      if (setting) {
        return setting.typeOf === toString$.call(input).slice(8, -1) && setting.validate(input);
      } else {
        return type === toString$.call(input).slice(8, -1) && (!structure || checkStructure(input, typeObj));
      }
    } else if (structure) {
      if (that = defaultType[structure]) {
        if (that !== toString$.call(input).slice(8, -1)) {
          return false;
        }
      }
      return checkStructure(input, typeObj);
    } else {
      throw new Error("No type defined. Input: " + input + ".");
    }
  }
  function checkMultiple(input, types){
    if (toString$.call(types).slice(8, -1) !== 'Array') {
      throw new Error("Types must be in an array. Input: " + input + ".");
    }
    return any(function(it){
      return check(input, it);
    }, types);
  }
  module.exports = function(parsedType, input, options){
    options == null && (options = {});
    customTypes = options.customTypes || {};
    return checkMultiple(input, parsedType);
  };
}).call(this);


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

// Generated by LiveScript 1.4.0
var Func, List, Obj, Str, Num, id, isType, replicate, prelude, toString$ = {}.toString;
Func = __webpack_require__(5);
List = __webpack_require__(6);
Obj = __webpack_require__(7);
Str = __webpack_require__(8);
Num = __webpack_require__(9);
id = function(x){
  return x;
};
isType = curry$(function(type, x){
  return toString$.call(x).slice(8, -1) === type;
});
replicate = curry$(function(n, x){
  var i$, results$ = [];
  for (i$ = 0; i$ < n; ++i$) {
    results$.push(x);
  }
  return results$;
});
Str.empty = List.empty;
Str.slice = List.slice;
Str.take = List.take;
Str.drop = List.drop;
Str.splitAt = List.splitAt;
Str.takeWhile = List.takeWhile;
Str.dropWhile = List.dropWhile;
Str.span = List.span;
Str.breakStr = List.breakList;
prelude = {
  Func: Func,
  List: List,
  Obj: Obj,
  Str: Str,
  Num: Num,
  id: id,
  isType: isType,
  replicate: replicate
};
prelude.each = List.each;
prelude.map = List.map;
prelude.filter = List.filter;
prelude.compact = List.compact;
prelude.reject = List.reject;
prelude.partition = List.partition;
prelude.find = List.find;
prelude.head = List.head;
prelude.first = List.first;
prelude.tail = List.tail;
prelude.last = List.last;
prelude.initial = List.initial;
prelude.empty = List.empty;
prelude.reverse = List.reverse;
prelude.difference = List.difference;
prelude.intersection = List.intersection;
prelude.union = List.union;
prelude.countBy = List.countBy;
prelude.groupBy = List.groupBy;
prelude.fold = List.fold;
prelude.foldl = List.foldl;
prelude.fold1 = List.fold1;
prelude.foldl1 = List.foldl1;
prelude.foldr = List.foldr;
prelude.foldr1 = List.foldr1;
prelude.unfoldr = List.unfoldr;
prelude.andList = List.andList;
prelude.orList = List.orList;
prelude.any = List.any;
prelude.all = List.all;
prelude.unique = List.unique;
prelude.uniqueBy = List.uniqueBy;
prelude.sort = List.sort;
prelude.sortWith = List.sortWith;
prelude.sortBy = List.sortBy;
prelude.sum = List.sum;
prelude.product = List.product;
prelude.mean = List.mean;
prelude.average = List.average;
prelude.concat = List.concat;
prelude.concatMap = List.concatMap;
prelude.flatten = List.flatten;
prelude.maximum = List.maximum;
prelude.minimum = List.minimum;
prelude.maximumBy = List.maximumBy;
prelude.minimumBy = List.minimumBy;
prelude.scan = List.scan;
prelude.scanl = List.scanl;
prelude.scan1 = List.scan1;
prelude.scanl1 = List.scanl1;
prelude.scanr = List.scanr;
prelude.scanr1 = List.scanr1;
prelude.slice = List.slice;
prelude.take = List.take;
prelude.drop = List.drop;
prelude.splitAt = List.splitAt;
prelude.takeWhile = List.takeWhile;
prelude.dropWhile = List.dropWhile;
prelude.span = List.span;
prelude.breakList = List.breakList;
prelude.zip = List.zip;
prelude.zipWith = List.zipWith;
prelude.zipAll = List.zipAll;
prelude.zipAllWith = List.zipAllWith;
prelude.at = List.at;
prelude.elemIndex = List.elemIndex;
prelude.elemIndices = List.elemIndices;
prelude.findIndex = List.findIndex;
prelude.findIndices = List.findIndices;
prelude.apply = Func.apply;
prelude.curry = Func.curry;
prelude.flip = Func.flip;
prelude.fix = Func.fix;
prelude.over = Func.over;
prelude.split = Str.split;
prelude.join = Str.join;
prelude.lines = Str.lines;
prelude.unlines = Str.unlines;
prelude.words = Str.words;
prelude.unwords = Str.unwords;
prelude.chars = Str.chars;
prelude.unchars = Str.unchars;
prelude.repeat = Str.repeat;
prelude.capitalize = Str.capitalize;
prelude.camelize = Str.camelize;
prelude.dasherize = Str.dasherize;
prelude.values = Obj.values;
prelude.keys = Obj.keys;
prelude.pairsToObj = Obj.pairsToObj;
prelude.objToPairs = Obj.objToPairs;
prelude.listsToObj = Obj.listsToObj;
prelude.objToLists = Obj.objToLists;
prelude.max = Num.max;
prelude.min = Num.min;
prelude.negate = Num.negate;
prelude.abs = Num.abs;
prelude.signum = Num.signum;
prelude.quot = Num.quot;
prelude.rem = Num.rem;
prelude.div = Num.div;
prelude.mod = Num.mod;
prelude.recip = Num.recip;
prelude.pi = Num.pi;
prelude.tau = Num.tau;
prelude.exp = Num.exp;
prelude.sqrt = Num.sqrt;
prelude.ln = Num.ln;
prelude.pow = Num.pow;
prelude.sin = Num.sin;
prelude.tan = Num.tan;
prelude.cos = Num.cos;
prelude.acos = Num.acos;
prelude.asin = Num.asin;
prelude.atan = Num.atan;
prelude.atan2 = Num.atan2;
prelude.truncate = Num.truncate;
prelude.round = Num.round;
prelude.ceiling = Num.ceiling;
prelude.floor = Num.floor;
prelude.isItNaN = Num.isItNaN;
prelude.even = Num.even;
prelude.odd = Num.odd;
prelude.gcd = Num.gcd;
prelude.lcm = Num.lcm;
prelude.VERSION = '1.1.2';
module.exports = prelude;
function curry$(f, bound){
  var context,
  _curry = function(args) {
    return f.length > 1 ? function(){
      var params = args ? args.concat() : [];
      context = bound ? context || this : this;
      return params.push.apply(params, arguments) <
          f.length && arguments.length ?
        _curry.call(context, params) : f.apply(context, params);
    } : f;
  };
  return _curry();
}

/***/ }),
/* 5 */
/***/ (function(module, exports) {

// Generated by LiveScript 1.4.0
var apply, curry, flip, fix, over, memoize, slice$ = [].slice, toString$ = {}.toString;
apply = curry$(function(f, list){
  return f.apply(null, list);
});
curry = function(f){
  return curry$(f);
};
flip = curry$(function(f, x, y){
  return f(y, x);
});
fix = function(f){
  return function(g){
    return function(){
      return f(g(g)).apply(null, arguments);
    };
  }(function(g){
    return function(){
      return f(g(g)).apply(null, arguments);
    };
  });
};
over = curry$(function(f, g, x, y){
  return f(g(x), g(y));
});
memoize = function(f){
  var memo;
  memo = {};
  return function(){
    var args, key, arg;
    args = slice$.call(arguments);
    key = (function(){
      var i$, ref$, len$, results$ = [];
      for (i$ = 0, len$ = (ref$ = args).length; i$ < len$; ++i$) {
        arg = ref$[i$];
        results$.push(arg + toString$.call(arg).slice(8, -1));
      }
      return results$;
    }()).join('');
    return memo[key] = key in memo
      ? memo[key]
      : f.apply(null, args);
  };
};
module.exports = {
  curry: curry,
  flip: flip,
  fix: fix,
  apply: apply,
  over: over,
  memoize: memoize
};
function curry$(f, bound){
  var context,
  _curry = function(args) {
    return f.length > 1 ? function(){
      var params = args ? args.concat() : [];
      context = bound ? context || this : this;
      return params.push.apply(params, arguments) <
          f.length && arguments.length ?
        _curry.call(context, params) : f.apply(context, params);
    } : f;
  };
  return _curry();
}

/***/ }),
/* 6 */
/***/ (function(module, exports) {

// Generated by LiveScript 1.4.0
var each, map, compact, filter, reject, partition, find, head, first, tail, last, initial, empty, reverse, unique, uniqueBy, fold, foldl, fold1, foldl1, foldr, foldr1, unfoldr, concat, concatMap, flatten, difference, intersection, union, countBy, groupBy, andList, orList, any, all, sort, sortWith, sortBy, sum, product, mean, average, maximum, minimum, maximumBy, minimumBy, scan, scanl, scan1, scanl1, scanr, scanr1, slice, take, drop, splitAt, takeWhile, dropWhile, span, breakList, zip, zipWith, zipAll, zipAllWith, at, elemIndex, elemIndices, findIndex, findIndices, toString$ = {}.toString, slice$ = [].slice;
each = curry$(function(f, xs){
  var i$, len$, x;
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    f(x);
  }
  return xs;
});
map = curry$(function(f, xs){
  var i$, len$, x, results$ = [];
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    results$.push(f(x));
  }
  return results$;
});
compact = function(xs){
  var i$, len$, x, results$ = [];
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    if (x) {
      results$.push(x);
    }
  }
  return results$;
};
filter = curry$(function(f, xs){
  var i$, len$, x, results$ = [];
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    if (f(x)) {
      results$.push(x);
    }
  }
  return results$;
});
reject = curry$(function(f, xs){
  var i$, len$, x, results$ = [];
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    if (!f(x)) {
      results$.push(x);
    }
  }
  return results$;
});
partition = curry$(function(f, xs){
  var passed, failed, i$, len$, x;
  passed = [];
  failed = [];
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    (f(x) ? passed : failed).push(x);
  }
  return [passed, failed];
});
find = curry$(function(f, xs){
  var i$, len$, x;
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    if (f(x)) {
      return x;
    }
  }
});
head = first = function(xs){
  return xs[0];
};
tail = function(xs){
  if (!xs.length) {
    return;
  }
  return xs.slice(1);
};
last = function(xs){
  return xs[xs.length - 1];
};
initial = function(xs){
  if (!xs.length) {
    return;
  }
  return xs.slice(0, -1);
};
empty = function(xs){
  return !xs.length;
};
reverse = function(xs){
  return xs.concat().reverse();
};
unique = function(xs){
  var result, i$, len$, x;
  result = [];
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    if (!in$(x, result)) {
      result.push(x);
    }
  }
  return result;
};
uniqueBy = curry$(function(f, xs){
  var seen, i$, len$, x, val, results$ = [];
  seen = [];
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    val = f(x);
    if (in$(val, seen)) {
      continue;
    }
    seen.push(val);
    results$.push(x);
  }
  return results$;
});
fold = foldl = curry$(function(f, memo, xs){
  var i$, len$, x;
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    memo = f(memo, x);
  }
  return memo;
});
fold1 = foldl1 = curry$(function(f, xs){
  return fold(f, xs[0], xs.slice(1));
});
foldr = curry$(function(f, memo, xs){
  var i$, x;
  for (i$ = xs.length - 1; i$ >= 0; --i$) {
    x = xs[i$];
    memo = f(x, memo);
  }
  return memo;
});
foldr1 = curry$(function(f, xs){
  return foldr(f, xs[xs.length - 1], xs.slice(0, -1));
});
unfoldr = curry$(function(f, b){
  var result, x, that;
  result = [];
  x = b;
  while ((that = f(x)) != null) {
    result.push(that[0]);
    x = that[1];
  }
  return result;
});
concat = function(xss){
  return [].concat.apply([], xss);
};
concatMap = curry$(function(f, xs){
  var x;
  return [].concat.apply([], (function(){
    var i$, ref$, len$, results$ = [];
    for (i$ = 0, len$ = (ref$ = xs).length; i$ < len$; ++i$) {
      x = ref$[i$];
      results$.push(f(x));
    }
    return results$;
  }()));
});
flatten = function(xs){
  var x;
  return [].concat.apply([], (function(){
    var i$, ref$, len$, results$ = [];
    for (i$ = 0, len$ = (ref$ = xs).length; i$ < len$; ++i$) {
      x = ref$[i$];
      if (toString$.call(x).slice(8, -1) === 'Array') {
        results$.push(flatten(x));
      } else {
        results$.push(x);
      }
    }
    return results$;
  }()));
};
difference = function(xs){
  var yss, results, i$, len$, x, j$, len1$, ys;
  yss = slice$.call(arguments, 1);
  results = [];
  outer: for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    for (j$ = 0, len1$ = yss.length; j$ < len1$; ++j$) {
      ys = yss[j$];
      if (in$(x, ys)) {
        continue outer;
      }
    }
    results.push(x);
  }
  return results;
};
intersection = function(xs){
  var yss, results, i$, len$, x, j$, len1$, ys;
  yss = slice$.call(arguments, 1);
  results = [];
  outer: for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    for (j$ = 0, len1$ = yss.length; j$ < len1$; ++j$) {
      ys = yss[j$];
      if (!in$(x, ys)) {
        continue outer;
      }
    }
    results.push(x);
  }
  return results;
};
union = function(){
  var xss, results, i$, len$, xs, j$, len1$, x;
  xss = slice$.call(arguments);
  results = [];
  for (i$ = 0, len$ = xss.length; i$ < len$; ++i$) {
    xs = xss[i$];
    for (j$ = 0, len1$ = xs.length; j$ < len1$; ++j$) {
      x = xs[j$];
      if (!in$(x, results)) {
        results.push(x);
      }
    }
  }
  return results;
};
countBy = curry$(function(f, xs){
  var results, i$, len$, x, key;
  results = {};
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    key = f(x);
    if (key in results) {
      results[key] += 1;
    } else {
      results[key] = 1;
    }
  }
  return results;
});
groupBy = curry$(function(f, xs){
  var results, i$, len$, x, key;
  results = {};
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    key = f(x);
    if (key in results) {
      results[key].push(x);
    } else {
      results[key] = [x];
    }
  }
  return results;
});
andList = function(xs){
  var i$, len$, x;
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    if (!x) {
      return false;
    }
  }
  return true;
};
orList = function(xs){
  var i$, len$, x;
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    if (x) {
      return true;
    }
  }
  return false;
};
any = curry$(function(f, xs){
  var i$, len$, x;
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    if (f(x)) {
      return true;
    }
  }
  return false;
});
all = curry$(function(f, xs){
  var i$, len$, x;
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    if (!f(x)) {
      return false;
    }
  }
  return true;
});
sort = function(xs){
  return xs.concat().sort(function(x, y){
    if (x > y) {
      return 1;
    } else if (x < y) {
      return -1;
    } else {
      return 0;
    }
  });
};
sortWith = curry$(function(f, xs){
  return xs.concat().sort(f);
});
sortBy = curry$(function(f, xs){
  return xs.concat().sort(function(x, y){
    if (f(x) > f(y)) {
      return 1;
    } else if (f(x) < f(y)) {
      return -1;
    } else {
      return 0;
    }
  });
});
sum = function(xs){
  var result, i$, len$, x;
  result = 0;
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    result += x;
  }
  return result;
};
product = function(xs){
  var result, i$, len$, x;
  result = 1;
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    result *= x;
  }
  return result;
};
mean = average = function(xs){
  var sum, i$, len$, x;
  sum = 0;
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    sum += x;
  }
  return sum / xs.length;
};
maximum = function(xs){
  var max, i$, ref$, len$, x;
  max = xs[0];
  for (i$ = 0, len$ = (ref$ = xs.slice(1)).length; i$ < len$; ++i$) {
    x = ref$[i$];
    if (x > max) {
      max = x;
    }
  }
  return max;
};
minimum = function(xs){
  var min, i$, ref$, len$, x;
  min = xs[0];
  for (i$ = 0, len$ = (ref$ = xs.slice(1)).length; i$ < len$; ++i$) {
    x = ref$[i$];
    if (x < min) {
      min = x;
    }
  }
  return min;
};
maximumBy = curry$(function(f, xs){
  var max, i$, ref$, len$, x;
  max = xs[0];
  for (i$ = 0, len$ = (ref$ = xs.slice(1)).length; i$ < len$; ++i$) {
    x = ref$[i$];
    if (f(x) > f(max)) {
      max = x;
    }
  }
  return max;
});
minimumBy = curry$(function(f, xs){
  var min, i$, ref$, len$, x;
  min = xs[0];
  for (i$ = 0, len$ = (ref$ = xs.slice(1)).length; i$ < len$; ++i$) {
    x = ref$[i$];
    if (f(x) < f(min)) {
      min = x;
    }
  }
  return min;
});
scan = scanl = curry$(function(f, memo, xs){
  var last, x;
  last = memo;
  return [memo].concat((function(){
    var i$, ref$, len$, results$ = [];
    for (i$ = 0, len$ = (ref$ = xs).length; i$ < len$; ++i$) {
      x = ref$[i$];
      results$.push(last = f(last, x));
    }
    return results$;
  }()));
});
scan1 = scanl1 = curry$(function(f, xs){
  if (!xs.length) {
    return;
  }
  return scan(f, xs[0], xs.slice(1));
});
scanr = curry$(function(f, memo, xs){
  xs = xs.concat().reverse();
  return scan(f, memo, xs).reverse();
});
scanr1 = curry$(function(f, xs){
  if (!xs.length) {
    return;
  }
  xs = xs.concat().reverse();
  return scan(f, xs[0], xs.slice(1)).reverse();
});
slice = curry$(function(x, y, xs){
  return xs.slice(x, y);
});
take = curry$(function(n, xs){
  if (n <= 0) {
    return xs.slice(0, 0);
  } else {
    return xs.slice(0, n);
  }
});
drop = curry$(function(n, xs){
  if (n <= 0) {
    return xs;
  } else {
    return xs.slice(n);
  }
});
splitAt = curry$(function(n, xs){
  return [take(n, xs), drop(n, xs)];
});
takeWhile = curry$(function(p, xs){
  var len, i;
  len = xs.length;
  if (!len) {
    return xs;
  }
  i = 0;
  while (i < len && p(xs[i])) {
    i += 1;
  }
  return xs.slice(0, i);
});
dropWhile = curry$(function(p, xs){
  var len, i;
  len = xs.length;
  if (!len) {
    return xs;
  }
  i = 0;
  while (i < len && p(xs[i])) {
    i += 1;
  }
  return xs.slice(i);
});
span = curry$(function(p, xs){
  return [takeWhile(p, xs), dropWhile(p, xs)];
});
breakList = curry$(function(p, xs){
  return span(compose$(p, not$), xs);
});
zip = curry$(function(xs, ys){
  var result, len, i$, len$, i, x;
  result = [];
  len = ys.length;
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    i = i$;
    x = xs[i$];
    if (i === len) {
      break;
    }
    result.push([x, ys[i]]);
  }
  return result;
});
zipWith = curry$(function(f, xs, ys){
  var result, len, i$, len$, i, x;
  result = [];
  len = ys.length;
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    i = i$;
    x = xs[i$];
    if (i === len) {
      break;
    }
    result.push(f(x, ys[i]));
  }
  return result;
});
zipAll = function(){
  var xss, minLength, i$, len$, xs, ref$, i, lresult$, j$, results$ = [];
  xss = slice$.call(arguments);
  minLength = undefined;
  for (i$ = 0, len$ = xss.length; i$ < len$; ++i$) {
    xs = xss[i$];
    minLength <= (ref$ = xs.length) || (minLength = ref$);
  }
  for (i$ = 0; i$ < minLength; ++i$) {
    i = i$;
    lresult$ = [];
    for (j$ = 0, len$ = xss.length; j$ < len$; ++j$) {
      xs = xss[j$];
      lresult$.push(xs[i]);
    }
    results$.push(lresult$);
  }
  return results$;
};
zipAllWith = function(f){
  var xss, minLength, i$, len$, xs, ref$, i, results$ = [];
  xss = slice$.call(arguments, 1);
  minLength = undefined;
  for (i$ = 0, len$ = xss.length; i$ < len$; ++i$) {
    xs = xss[i$];
    minLength <= (ref$ = xs.length) || (minLength = ref$);
  }
  for (i$ = 0; i$ < minLength; ++i$) {
    i = i$;
    results$.push(f.apply(null, (fn$())));
  }
  return results$;
  function fn$(){
    var i$, ref$, len$, results$ = [];
    for (i$ = 0, len$ = (ref$ = xss).length; i$ < len$; ++i$) {
      xs = ref$[i$];
      results$.push(xs[i]);
    }
    return results$;
  }
};
at = curry$(function(n, xs){
  if (n < 0) {
    return xs[xs.length + n];
  } else {
    return xs[n];
  }
});
elemIndex = curry$(function(el, xs){
  var i$, len$, i, x;
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    i = i$;
    x = xs[i$];
    if (x === el) {
      return i;
    }
  }
});
elemIndices = curry$(function(el, xs){
  var i$, len$, i, x, results$ = [];
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    i = i$;
    x = xs[i$];
    if (x === el) {
      results$.push(i);
    }
  }
  return results$;
});
findIndex = curry$(function(f, xs){
  var i$, len$, i, x;
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    i = i$;
    x = xs[i$];
    if (f(x)) {
      return i;
    }
  }
});
findIndices = curry$(function(f, xs){
  var i$, len$, i, x, results$ = [];
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    i = i$;
    x = xs[i$];
    if (f(x)) {
      results$.push(i);
    }
  }
  return results$;
});
module.exports = {
  each: each,
  map: map,
  filter: filter,
  compact: compact,
  reject: reject,
  partition: partition,
  find: find,
  head: head,
  first: first,
  tail: tail,
  last: last,
  initial: initial,
  empty: empty,
  reverse: reverse,
  difference: difference,
  intersection: intersection,
  union: union,
  countBy: countBy,
  groupBy: groupBy,
  fold: fold,
  fold1: fold1,
  foldl: foldl,
  foldl1: foldl1,
  foldr: foldr,
  foldr1: foldr1,
  unfoldr: unfoldr,
  andList: andList,
  orList: orList,
  any: any,
  all: all,
  unique: unique,
  uniqueBy: uniqueBy,
  sort: sort,
  sortWith: sortWith,
  sortBy: sortBy,
  sum: sum,
  product: product,
  mean: mean,
  average: average,
  concat: concat,
  concatMap: concatMap,
  flatten: flatten,
  maximum: maximum,
  minimum: minimum,
  maximumBy: maximumBy,
  minimumBy: minimumBy,
  scan: scan,
  scan1: scan1,
  scanl: scanl,
  scanl1: scanl1,
  scanr: scanr,
  scanr1: scanr1,
  slice: slice,
  take: take,
  drop: drop,
  splitAt: splitAt,
  takeWhile: takeWhile,
  dropWhile: dropWhile,
  span: span,
  breakList: breakList,
  zip: zip,
  zipWith: zipWith,
  zipAll: zipAll,
  zipAllWith: zipAllWith,
  at: at,
  elemIndex: elemIndex,
  elemIndices: elemIndices,
  findIndex: findIndex,
  findIndices: findIndices
};
function curry$(f, bound){
  var context,
  _curry = function(args) {
    return f.length > 1 ? function(){
      var params = args ? args.concat() : [];
      context = bound ? context || this : this;
      return params.push.apply(params, arguments) <
          f.length && arguments.length ?
        _curry.call(context, params) : f.apply(context, params);
    } : f;
  };
  return _curry();
}
function in$(x, xs){
  var i = -1, l = xs.length >>> 0;
  while (++i < l) if (x === xs[i]) return true;
  return false;
}
function compose$() {
  var functions = arguments;
  return function() {
    var i, result;
    result = functions[0].apply(this, arguments);
    for (i = 1; i < functions.length; ++i) {
      result = functions[i](result);
    }
    return result;
  };
}
function not$(x){ return !x; }

/***/ }),
/* 7 */
/***/ (function(module, exports) {

// Generated by LiveScript 1.4.0
var values, keys, pairsToObj, objToPairs, listsToObj, objToLists, empty, each, map, compact, filter, reject, partition, find;
values = function(object){
  var i$, x, results$ = [];
  for (i$ in object) {
    x = object[i$];
    results$.push(x);
  }
  return results$;
};
keys = function(object){
  var x, results$ = [];
  for (x in object) {
    results$.push(x);
  }
  return results$;
};
pairsToObj = function(object){
  var i$, len$, x, resultObj$ = {};
  for (i$ = 0, len$ = object.length; i$ < len$; ++i$) {
    x = object[i$];
    resultObj$[x[0]] = x[1];
  }
  return resultObj$;
};
objToPairs = function(object){
  var key, value, results$ = [];
  for (key in object) {
    value = object[key];
    results$.push([key, value]);
  }
  return results$;
};
listsToObj = curry$(function(keys, values){
  var i$, len$, i, key, resultObj$ = {};
  for (i$ = 0, len$ = keys.length; i$ < len$; ++i$) {
    i = i$;
    key = keys[i$];
    resultObj$[key] = values[i];
  }
  return resultObj$;
});
objToLists = function(object){
  var keys, values, key, value;
  keys = [];
  values = [];
  for (key in object) {
    value = object[key];
    keys.push(key);
    values.push(value);
  }
  return [keys, values];
};
empty = function(object){
  var x;
  for (x in object) {
    return false;
  }
  return true;
};
each = curry$(function(f, object){
  var i$, x;
  for (i$ in object) {
    x = object[i$];
    f(x);
  }
  return object;
});
map = curry$(function(f, object){
  var k, x, resultObj$ = {};
  for (k in object) {
    x = object[k];
    resultObj$[k] = f(x);
  }
  return resultObj$;
});
compact = function(object){
  var k, x, resultObj$ = {};
  for (k in object) {
    x = object[k];
    if (x) {
      resultObj$[k] = x;
    }
  }
  return resultObj$;
};
filter = curry$(function(f, object){
  var k, x, resultObj$ = {};
  for (k in object) {
    x = object[k];
    if (f(x)) {
      resultObj$[k] = x;
    }
  }
  return resultObj$;
});
reject = curry$(function(f, object){
  var k, x, resultObj$ = {};
  for (k in object) {
    x = object[k];
    if (!f(x)) {
      resultObj$[k] = x;
    }
  }
  return resultObj$;
});
partition = curry$(function(f, object){
  var passed, failed, k, x;
  passed = {};
  failed = {};
  for (k in object) {
    x = object[k];
    (f(x) ? passed : failed)[k] = x;
  }
  return [passed, failed];
});
find = curry$(function(f, object){
  var i$, x;
  for (i$ in object) {
    x = object[i$];
    if (f(x)) {
      return x;
    }
  }
});
module.exports = {
  values: values,
  keys: keys,
  pairsToObj: pairsToObj,
  objToPairs: objToPairs,
  listsToObj: listsToObj,
  objToLists: objToLists,
  empty: empty,
  each: each,
  map: map,
  filter: filter,
  compact: compact,
  reject: reject,
  partition: partition,
  find: find
};
function curry$(f, bound){
  var context,
  _curry = function(args) {
    return f.length > 1 ? function(){
      var params = args ? args.concat() : [];
      context = bound ? context || this : this;
      return params.push.apply(params, arguments) <
          f.length && arguments.length ?
        _curry.call(context, params) : f.apply(context, params);
    } : f;
  };
  return _curry();
}

/***/ }),
/* 8 */
/***/ (function(module, exports) {

// Generated by LiveScript 1.4.0
var split, join, lines, unlines, words, unwords, chars, unchars, reverse, repeat, capitalize, camelize, dasherize;
split = curry$(function(sep, str){
  return str.split(sep);
});
join = curry$(function(sep, xs){
  return xs.join(sep);
});
lines = function(str){
  if (!str.length) {
    return [];
  }
  return str.split('\n');
};
unlines = function(it){
  return it.join('\n');
};
words = function(str){
  if (!str.length) {
    return [];
  }
  return str.split(/[ ]+/);
};
unwords = function(it){
  return it.join(' ');
};
chars = function(it){
  return it.split('');
};
unchars = function(it){
  return it.join('');
};
reverse = function(str){
  return str.split('').reverse().join('');
};
repeat = curry$(function(n, str){
  var result, i$;
  result = '';
  for (i$ = 0; i$ < n; ++i$) {
    result += str;
  }
  return result;
});
capitalize = function(str){
  return str.charAt(0).toUpperCase() + str.slice(1);
};
camelize = function(it){
  return it.replace(/[-_]+(.)?/g, function(arg$, c){
    return (c != null ? c : '').toUpperCase();
  });
};
dasherize = function(str){
  return str.replace(/([^-A-Z])([A-Z]+)/g, function(arg$, lower, upper){
    return lower + "-" + (upper.length > 1
      ? upper
      : upper.toLowerCase());
  }).replace(/^([A-Z]+)/, function(arg$, upper){
    if (upper.length > 1) {
      return upper + "-";
    } else {
      return upper.toLowerCase();
    }
  });
};
module.exports = {
  split: split,
  join: join,
  lines: lines,
  unlines: unlines,
  words: words,
  unwords: unwords,
  chars: chars,
  unchars: unchars,
  reverse: reverse,
  repeat: repeat,
  capitalize: capitalize,
  camelize: camelize,
  dasherize: dasherize
};
function curry$(f, bound){
  var context,
  _curry = function(args) {
    return f.length > 1 ? function(){
      var params = args ? args.concat() : [];
      context = bound ? context || this : this;
      return params.push.apply(params, arguments) <
          f.length && arguments.length ?
        _curry.call(context, params) : f.apply(context, params);
    } : f;
  };
  return _curry();
}

/***/ }),
/* 9 */
/***/ (function(module, exports) {

// Generated by LiveScript 1.4.0
var max, min, negate, abs, signum, quot, rem, div, mod, recip, pi, tau, exp, sqrt, ln, pow, sin, tan, cos, asin, acos, atan, atan2, truncate, round, ceiling, floor, isItNaN, even, odd, gcd, lcm;
max = curry$(function(x$, y$){
  return x$ > y$ ? x$ : y$;
});
min = curry$(function(x$, y$){
  return x$ < y$ ? x$ : y$;
});
negate = function(x){
  return -x;
};
abs = Math.abs;
signum = function(x){
  if (x < 0) {
    return -1;
  } else if (x > 0) {
    return 1;
  } else {
    return 0;
  }
};
quot = curry$(function(x, y){
  return ~~(x / y);
});
rem = curry$(function(x$, y$){
  return x$ % y$;
});
div = curry$(function(x, y){
  return Math.floor(x / y);
});
mod = curry$(function(x$, y$){
  var ref$;
  return (((x$) % (ref$ = y$) + ref$) % ref$);
});
recip = (function(it){
  return 1 / it;
});
pi = Math.PI;
tau = pi * 2;
exp = Math.exp;
sqrt = Math.sqrt;
ln = Math.log;
pow = curry$(function(x$, y$){
  return Math.pow(x$, y$);
});
sin = Math.sin;
tan = Math.tan;
cos = Math.cos;
asin = Math.asin;
acos = Math.acos;
atan = Math.atan;
atan2 = curry$(function(x, y){
  return Math.atan2(x, y);
});
truncate = function(x){
  return ~~x;
};
round = Math.round;
ceiling = Math.ceil;
floor = Math.floor;
isItNaN = function(x){
  return x !== x;
};
even = function(x){
  return x % 2 === 0;
};
odd = function(x){
  return x % 2 !== 0;
};
gcd = curry$(function(x, y){
  var z;
  x = Math.abs(x);
  y = Math.abs(y);
  while (y !== 0) {
    z = x % y;
    x = y;
    y = z;
  }
  return x;
});
lcm = curry$(function(x, y){
  return Math.abs(Math.floor(x / gcd(x, y) * y));
});
module.exports = {
  max: max,
  min: min,
  negate: negate,
  abs: abs,
  signum: signum,
  quot: quot,
  rem: rem,
  div: div,
  mod: mod,
  recip: recip,
  pi: pi,
  tau: tau,
  exp: exp,
  sqrt: sqrt,
  ln: ln,
  pow: pow,
  sin: sin,
  tan: tan,
  cos: cos,
  acos: acos,
  asin: asin,
  atan: atan,
  atan2: atan2,
  truncate: truncate,
  round: round,
  ceiling: ceiling,
  floor: floor,
  isItNaN: isItNaN,
  even: even,
  odd: odd,
  gcd: gcd,
  lcm: lcm
};
function curry$(f, bound){
  var context,
  _curry = function(args) {
    return f.length > 1 ? function(){
      var params = args ? args.concat() : [];
      context = bound ? context || this : this;
      return params.push.apply(params, arguments) <
          f.length && arguments.length ?
        _curry.call(context, params) : f.apply(context, params);
    } : f;
  };
  return _curry();
}

/***/ }),
/* 10 */
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
var flat = __webpack_require__(11);
var utils = __webpack_require__(0);
var typeCheck = __webpack_require__(1).typeCheck;
var DeepKey = __webpack_require__(13);

/**
* Takes structured data and makes a table from it. call this.generate() to create a table
* @link module:webpack/framework
* @class 
* @param {Selector} containerElement - The table container.
* @param {Object} data - The data to be added to the table.
* @param {(Object|undefined)} options - The clickable element.
* @param {(String[]|undefined)} options.ignoredKeys - List of keys to leave out of the row object
* @param {(String|undefine)} options.idKey - Key name in data to act as ID.  Will generate a unique one for every row if not included. 
* @param {(String[]|undefine)} options.hiddenKeys - Removes the keys from the table, but keeps it in row object. 
* @param {(Function|undefine)} options.inject - ires for every row.  Allowes for one to inject columns and data for each row. First param is the row object, second is a callback that takes one array of objects. Example Object to return: {column: String, strictColumn: Maybe Boolean, dom: *}
* @param {(String|undefine)} options.tableClasses - class strings to be added to the top table element 
* @param {(Function|String[]|undefine)} options.sort - Can be an array of the order of column keys, or an array.sort callback. See MDN Web Docs for array.sort
* @param {(Function|String[]|undefine)} options.afterGenerate - Function that runs after any function that adds elements to the dom.
*/
class Table {
    constructor(containerElement, data, options) {
        /*if(!typeCheck("Maybe {ignoredKeys: Maybe [String], idKey: Maybe String, hiddenKeys: Maybe [String], inject: Maybe Function, tableClasses: Maybe String, sort: Maybe [String] | Function, ...}"), options) {
            throw new TypeError("Options expected an object with structure: \"Maybe {ignoredKeys: Maybe [String], idKey: Maybe String, hiddenKeys: Maybe [String], inject: Maybe Function, tableClasses: Maybe String, sort: Maybe [String] | Function}\"");
        }*/
        if(!options){options = {};}
        if(!typeCheck("[Object]", data)) {
            throw new TypeError("data must be an array of objects");
        }
        this.data = data;
        this.container = containerElement;
        this.options = options;
        this.table = {};
    }
    generate() {
        return new Promise((resolve, reject) => {
            this._sortData(this.data).then(({columns, rows}) => {
                /*console.log(columns, "Col")
                console.log(rows, "rows")*/
                var promises = [];
                /**HEAD**/
                let tableHead = $("<thead/>");
                promises.push(new Promise((resolveCol, rejectCol) => {
                    let tr = $("<tr/>");
                    //compile Head
                    for(let x = 0; x < columns.length; x++) {
                        tr.append($("<th/>").html(columns[x]));
                        if(x >= columns.length-1) {
                            //done 
                            tableHead.append(tr);
                            return resolveCol()
                        }
                    }
                }))

                /**BODY**/
                this.table.body = {};
                this.table.body.id = "__TABLE_BODY_ID_" + utils.uuidv4() + "__"
                let tableBody = $("<tbody/>").attr("id", this.table.body.id);
                promises.push(new Promise((resolveRow, rejectRow) => {

                    //compile row
                    /*for(let r = 0; r < rows.length; r++) {
                        let tr = $("<tr/>").attr("id", rows[r].rowID);
                        let bodyData = rows[r].getBody();
                        //console.log(bodyData)
                        //allign rows with correct columns 
                        for (let a = 0 ; a < columns.length; a++) {
                            tr.append($("<td/>").html(bodyData[columns[a]]));

                            if(a >= columns.length-1) {
                                //push to body
                                tableBody.append(tr);
                            }
                            if(a >= columns.length-1 && r >= rows.length-1) {
                                //push to body
                                return resolveRow();

                            }
                        }
                    }*/
                    this._compileRow(columns, rows).then((tBody) => {
                        tableBody.append(tBody);
                        return resolveRow();
                    }).catch(err => reject(err))
                }))

                Promise.all(promises).then(() => {
                    this.container.append($("<table/>").addClass(this.options.tableClasses)
                        .append(tableHead)
                        .append(tableBody)
                    )
                    this.table.data = {
                        head: columns,
                        rows: rows
                    }
                    if(typeCheck("Function", this.options.afterGenerate)) {
                        this.options.afterGenerate();
                    }
                    
                    resolve();
                }).catch((err) => {
                    return reject(err);
                })
            });
        });
    }
    _compileRow(columns, rows) {
        return new Promise((resolve, reject) => {
            let tBody = [];
            for(let r = 0; r < rows.length; r++) {
                let tr = $("<tr/>").attr("id", rows[r].rowID);
                let bodyData = rows[r].getBody();
                //console.log(bodyData)
                //allign rows with correct columns 
                for (let a = 0 ; a < columns.length; a++) {
                    tr.append($("<td/>").html(bodyData[columns[a]]));

                    if(a >= columns.length-1) {
                        //push to body
                        tBody.push(tr);
                    }
                    if(a >= columns.length-1 && r >= rows.length-1) {
                        //push to body
                        //console.log(tBody)
                        return resolve(tBody);

                    }
                }
            }
        })
    }
    addData(newData) {
        if(!typeCheck("[Object]", newData)) {
            throw new TypeError("data must be an array of objects");
        }
        this.data = this.data.concat(newData)
    }
    replaceData(newData) {
        if(!typeCheck("[Object]", newData)) {
            throw new TypeError("data must be an array of objects");
        }
        this.data = newData;
    }
    destroyTable() {
        this.data = [];
        containerElement.empty();
    }
    parseRowID(TABLE_ROW_ID) {
        return TABLE_ROW_ID.substring(12, TABLE_ROW_ID.length-2);
    }
    getDirtyRowID(originalID) {
        return "__TABLE_ROW_" + originalID + "__";
    }
    selectRowElm(TABLE_ROW_ID) {
        return $("#"+TABLE_ROW_ID);
    }
    //no support for new columns yet.
    appendRow(data) {
        return new Promise((resolve, reject) => {
            this.addData(data);
            this._sortData(data).then(({rows}) => {
                this._compileRow(this.table.data.head, rows).then((elements) => {
                    $("#" + this.table.body.id).append(elements)
                    if(typeCheck("Function", this.options.afterGenerate)) {
                        this.options.afterGenerate();
                    }
                    resolve();
                })
            })
        })
    }
    deleteRow(TABLE_ROW_ID) {
        this.selectRowElm(TABLE_ROW_ID).remove();
    }
    _sortData(data) {
        return new Promise((resolve, reject) => {
            var columnNames = [];
            var rows = [];
            for(let x = 0; x < data.length; x++ ) {
                let row = {};
                row.shownData = data[x];
                row.rowID = "__TABLE_ROW_" + utils.uuidv4() + "__";
                //note ID
                if(this.options.idKey && row.shownData[this.options.idKey]) {
                    row.rowID = "__TABLE_ROW_" + DeepKey.get(row.shownData, this.options.idKey.split(".")) + "__"; 
                }
                //Store Untouched ID for dev
                row.getRowID = () => {return this.parseRowID(row.rowID);}

                //Filter out hidden keys for later 
                if(this.options.hiddenKeys) {
                    row.hiddenData = DeepKey.keys(row.shownData, {
                        filter: (deepkey) => {
                            return this.options.hiddenKeys.includes(deepkey.join("."));
                        }
                    }).reduce((obj, key) => {
                        DeepKey.set(obj, key, DeepKey.get(row.shownData, key));
                        return obj;
                    }, {})
                    if(this.options.ignoredKeys) {
                        this.options.ignoredKeys = this.options.ignoredKeys.concat(this.options.hiddenKeys);
                    } else {
                        this.options.ignoredKeys = this.options.hiddenKeys;
                    }
                }

                //filter out unwanted Keys
                //should error in constructor if not array
                if(this.options.ignoredKeys) {
                    row.shownData = DeepKey.keys(row.shownData, {
                        filter: (deepkey) => {
                            return !this.options.ignoredKeys.includes(deepkey.join("."));
                        }
                    }).reduce((obj, key) => {
                        DeepKey.set(obj, key, DeepKey.get(row.shownData, key));
                        return obj;
                    }, {})
                    
                }
                new Promise((resolveIn, rejectIn) => {
                    //Generate Actions 
                    if(typeCheck("Function", this.options.inject)) {
                        //console.log("INJECTING")
                        row.injectedData = {};
                        this.options.inject(row, (injected) => {
                            if(typeCheck("[{column: String, strictColumn: Maybe Boolean, dom: *}]", injected)) {
                                for(let a = 0; a < injected.length; a++) {
                                    //console.log(injected)
                                    if(injected[a].strictColumn) {
                                        row.injectedData[injected[a].column] = injected[a].dom;
                                    } else {
                                        row.injectedData = Object.assign(row.injectedData, flat({[injected[a].column.split(".")]: injected[a].dom}, {safe: true}))
                                    }
                                    if(a >= injected.length-1) {
                                        return resolveIn();
                                    }
                                }
                            } else {
                                return rejectIn(new TypeError("inject callback expected a single paramater with type structure: [{column: String, strictColumn: Maybe Boolean, dom: *}]"));
                            }
                            
                        })
                    } else {
                        return resolveIn()
                    }
                }).then(() => {
                    let flatData = flat(row.shownData, {safe: true});
                    if(row.injectedData) {
                        //console.log(row.injectedData)
                        row.shownKeys = [...new Set([...Object.keys(flatData), ...Object.keys(row.injectedData)])];
                    } else {
                        row.shownKeys = Object.keys(flatData);
                    }
                    columnNames = [...new Set([...columnNames, ...row.shownKeys])];




                    // add helper functions
                    row.getBody = () => {return Object.assign(flatData, row.injectedData)}
                    //Waitfor end of loop
                    rows.push(row);
                    //console.log(rows, "loop Row")
                    if(x >= data.length-1) {
                        //sort 
                        if(typeCheck("[String]", this.options.sort)) {
                            /*let reference_object = {};
                            for (let i = 0; i < this.options.sort.length; i++) {
                                reference_object[this.options.sort[i]] = i;
                            }*/
                            columnNames.sort((a, b) => {
                              return this.options.sort.indexOf(a) - this.options.sort.indexOf(b);
                            });
                        } else if(typeCheck("Function", this.options.sort)) {
                            columnNames.sort(this.options.sort);
                        }
                        return resolve({columns: columnNames, rows: rows});
                    }
                    
                }).catch((err) => {throw err})
            }
        });
    }
}

module.exports = Table;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

var isBuffer = __webpack_require__(12)

module.exports = flatten
flatten.flatten = flatten
flatten.unflatten = unflatten

function flatten (target, opts) {
  opts = opts || {}

  var delimiter = opts.delimiter || '.'
  var maxDepth = opts.maxDepth
  var output = {}

  function step (object, prev, currentDepth) {
    currentDepth = currentDepth || 1
    Object.keys(object).forEach(function (key) {
      var value = object[key]
      var isarray = opts.safe && Array.isArray(value)
      var type = Object.prototype.toString.call(value)
      var isbuffer = isBuffer(value)
      var isobject = (
        type === '[object Object]' ||
        type === '[object Array]'
      )

      var newKey = prev
        ? prev + delimiter + key
        : key

      if (!isarray && !isbuffer && isobject && Object.keys(value).length &&
        (!opts.maxDepth || currentDepth < maxDepth)) {
        return step(value, newKey, currentDepth + 1)
      }

      output[newKey] = value
    })
  }

  step(target)

  return output
}

function unflatten (target, opts) {
  opts = opts || {}

  var delimiter = opts.delimiter || '.'
  var overwrite = opts.overwrite || false
  var result = {}

  var isbuffer = isBuffer(target)
  if (isbuffer || Object.prototype.toString.call(target) !== '[object Object]') {
    return target
  }

  // safely ensure that the key is
  // an integer.
  function getkey (key) {
    var parsedKey = Number(key)

    return (
      isNaN(parsedKey) ||
      key.indexOf('.') !== -1 ||
      opts.object
    ) ? key
      : parsedKey
  }

  var sortedKeys = Object.keys(target).sort(function (keyA, keyB) {
    return keyA.length - keyB.length
  })

  sortedKeys.forEach(function (key) {
    var split = key.split(delimiter)
    var key1 = getkey(split.shift())
    var key2 = getkey(split[0])
    var recipient = result

    while (key2 !== undefined) {
      var type = Object.prototype.toString.call(recipient[key1])
      var isobject = (
        type === '[object Object]' ||
        type === '[object Array]'
      )

      // do not write over falsey, non-undefined values if overwrite is false
      if (!overwrite && !isobject && typeof recipient[key1] !== 'undefined') {
        return
      }

      if ((overwrite && !isobject) || (!overwrite && recipient[key1] == null)) {
        recipient[key1] = (
          typeof key2 === 'number' &&
          !opts.object ? [] : {}
        )
      }

      recipient = recipient[key1]
      if (split.length > 0) {
        key1 = getkey(split.shift())
        key2 = getkey(split[0])
      }
    }

    // unflatten again for 'messy objects'
    recipient[key1] = unflatten(target[key], opts)
  })

  return result
}


/***/ }),
/* 12 */
/***/ (function(module, exports) {

/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function* iterateKeys(obj, opt, parent) {
  if (obj === null || obj === undefined)
    return;
  if (opt.depth > 0 && parent && parent.length >= opt.depth)
    return;
  if (typeof(obj) === 'string')
    return;
  parent = parent || [];
  for (var key of opt.all ? Object.getOwnPropertyNames(obj) : Object.keys(obj)) {
    if (opt.noindex && obj instanceof Array && /^[0-9]+$/.test(key))
      continue;
    var child = parent.slice(0);
    child.push(key);
    if (opt.filter && !opt.filter(child, obj[key], !opt.all || obj.propertyIsEnumerable(key)))
      continue;
    var descend = iterateKeys(obj[key], opt, child);
    var dfirst = descend.next();
    if (opt.leaf) {
      if (!dfirst.done) {
        yield dfirst.value;
        yield* descend;
      }
      else
        yield child;
    }
    else {
      yield child;
      if (!dfirst.done) {
        yield dfirst.value;
        yield* descend;
      }
    }
  }
}
function traverse(obj, deepkey, force) {
  var leaf = obj;
  for (var c = 0; c < deepkey.length; c++)
    if (c == deepkey.length - 1) {
      return [leaf, deepkey[c]];
    }
    else {
      if (!(deepkey[c] in leaf) || leaf[deepkey[c]] === undefined) {
        if (force) {
          // if creating intermediate object, its parent must not be sealed
          if (!Object.isExtensible(leaf))
            throw `Inextensible object: ${ deepkey.slice(0, c).join('.') }`;
          leaf[deepkey[c]] = { };
        }
        else
          return undefined;
      }
      leaf = leaf[deepkey[c]];
      // intermediate object must be non-null object or function
      // note that typeof(null) returns 'object'
      if (leaf === 'null' || (typeof(leaf) !== 'object' && typeof(leaf) !== 'function')) {
        if (force)
          throw `Inextensible object: ${ deepkey.slice(0, c + 1).join('.') }`;
        else
          return undefined;
      }
    }
  return undefined;
}
function accessor(obj, deepkey) {
  var t = traverse(obj, deepkey, true);
  if (!t) return undefined;
  return {
    get: () => { return (t[0])[t[1]]; },
    set: v => { return (t[0])[t[1]] = v;  },
  }
}
function keys(obj, option) {
  var opt;
  if (typeof(option) === 'number')
    opt = { depth: option };
  else if (typeof(option) === 'function')
    opt = { filter: option };
  else if (typeof(option) === 'object' && option !== null)
    opt = option;
  else
    opt = {}
  opt.depth = opt.depth || 0;
  var array = [];
  for (var path of iterateKeys(obj, opt))
    array.push(path);
  return array;
}
function rename(obj, src, dest) {
  return set(obj, dest, del(obj, src));
}
function del(obj, deepkey) {
  var t = traverse(obj, deepkey, false);
  if (!t) return undefined;
  var v = (t[0])[t[1]];
  delete (t[0])[t[1]];
  return v;
}
function set(obj, deepkey, value) {
  var t = traverse(obj, deepkey, true);
  // The following codes is unneeded, traverse will check them
  // if (!(t[1] in t[0]) && !Object.isExtensible(t[0]))
  //   throw `Inextensible object: ${ deepkey.slice(0, deepkey.length - 1).join('.') }`;
  return (t[0])[t[1]] = value;
}
function get(obj, deepkey) {
  var t = traverse(obj, deepkey, false);
  return t ? (t[0])[t[1]] : undefined;
}
function touch(obj, deepkey, value) {
  var t = traverse(obj, deepkey, true);
  if (!(t[1] in t[0])) {
    if (!Object.isExtensible(t[0]))
      throw `Inextensible object: ${ deepkey.slice(0, deepkey.length -1).join('.') }`;
    return (t[0])[t[1]] = value;
  }
  else
    return (t[0])[t[1]];
}
function type(obj, deepkey) {
  return typeof(get(obj, deepkey));
}
function exists(obj, deepkey) {
  var t = traverse(obj, deepkey, false);
  return t ? t[0].propertyIsEnumerable(t[1]) : false;
}
module.exports = {
  keys: keys,
  set: set,
  get: get,
  touch: touch,
  type: type,
  rename: rename,
  delete: del,
  exists: exists,
  accessor: accessor,
};


/***/ }),
/* 14 */,
/* 15 */,
/* 16 */,
/* 17 */
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
var ScheduleEditor = __webpack_require__(18);
var utils = __webpack_require__(0)

var scheduleEditor = null;
window.onload = function() {
    console.log(utils.thisUser())
    scheduleEditor = new ScheduleEditor($("#editScheduleContainer"));
    scheduleEditor.generate().catch(err => utils.throwError(err))
}

/***/ }),
/* 18 */
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

var Table = __webpack_require__(10);
var scheduleAPI = __webpack_require__(19);
var miscAPI = __webpack_require__(20);
var utils = __webpack_require__(0);

class ScheduleEditor {
    constructor(formOutputContainer, isTeacher, options) {
        this.container = formOutputContainer;
        if(!options) {options = {}}
        this.options = options;
        if(isTeacher) {this.type = "teacher"} else {this.type = "student"}
        this.periodSelectClass = "__PERIOD_SELECT_" + utils.uuidv4() + "__";
        this.addRowButtonID = "__ADD_ROW_PERIOD_" + utils.uuidv4() + "__";
    }
    generate() {
        return new Promise((resolve, reject) => {
            let prom = [];
            prom.push(miscAPI.getScheduleConfig());
            prom.push(scheduleAPI.getSchedules(this.options.accountID));
            Promise.all(prom).then(([scheduleConfig, allSchedules]) => {
                //console.log(scheduleConfig, allSchedules);
                if(this.type == "student") {
                    let schedule = allSchedules.studentType;
                    //data mapping 
                    /*let tableArray = scheduleConfig.periods.map((per) => {
                        return {Periods: per.toUpperCase(), Location: ""}
                    })*/
                    //console.log(tableArray)

                    let autocompleteClass = "__SCHEDULE_AUTOCOMPLETE_" + utils.uuidv4() + "__";
                    let studentTable = new Table(this.container, [{Period: " ", Location: "dkslfjafkjsdklafjlkasdjfasjdflk"}], {
                        inject: (row, callback) => {
                            let autoID = "__AUTOCOMPLETE_" + utils.uuidv4()
                            this._periodSelectElm(scheduleConfig.periods).then((sel) => {
                                return callback([
                                    {
                                        column: "Period",
                                        strictColumn: true,
                                        dom: $("<span/>")
                                        .prepend($("<a/>").addClass("left btn-floating waves-effect waves-light delete-row").css("transform", "translateY(50%)").on("click", () => {
                                            $("#" + this.addRowButtonID).attr("disabled", false)
                                            studentTable.deleteRow(row.rowID)
                                        }).append($("<i/>").addClass("material-icons").html("delete")))
                                        .append(sel)
                                    }, {
                                        column: "Location",
                                        strictColumn: true,
                                        dom: $("<span/>")
                                            /*.append($("<a/>").addClass("waves-effect waves-light btn").append($("<i/>").addClass("material-icons left").html("add")).html("Add Teacher").on("click", () => {

                                            }))*/
                                            .prepend($("<a/>").addClass("left btn-floating waves-effect waves-light").attr("data-location", false).css("transform", "translateY(0%)").on("click", (e) => {
                                                if($(e.currentTarget).attr("data-location") == "true") {
                                                    //close
                                                    $("#" + this.addRowButtonID).attr("disabled", false)
                                                    $("#" + autoID + "_DIV__").slideUp(500);
                                                    $(e.currentTarget).siblings("p").slideDown(500)
                                                    $(e.currentTarget).attr("data-location", false).css("transform", "translateY(0%)").find("i").html("add_location")
                                                } else {
                                                    //open 
                                                    $("#" + this.addRowButtonID).attr("disabled", true)
                                                    $("#" + autoID + "_DIV__").slideDown(500);
                                                    $(e.currentTarget).siblings("p").slideUp(500)
                                                    $(e.currentTarget).attr("data-location", true).css("transform", "translateY(50%)").find("i").html("location_off")
                                                }
                                                
                                            }).append($("<i/>").addClass("material-icons").html("add_location")))
                                            .append($("<p/>").html("  No set location").css("transform", "translateY(50%)"))
                                            .append($("<div/>").addClass("input-field col s10").css("display", "none").attr("id", autoID + "_DIV__")
                                                .append($("<input/>").attr("type", "text").attr("id", autoID).addClass(autocompleteClass + " autocomplete").attr("data-autocomplete-period", null))
                                                .append($("<label/>").attr("for", autoID).html("Search Teachers"))
                                            )
                                    }
                                ])
                            })
                        },
                        afterGenerate: () => {
                            //INIT SELECT
                            $('select').material_select();
                        }
                    });
                    studentTable.generate().then(() => {
                        //create new row button
                        this.container.append($("<a/>").attr("id", this.addRowButtonID).addClass("waves-effect waves-light btn").append($("<i/>").addClass("material-icons left").html("add")).html("Add Period").on("click", () => {
                            $("#" + this.addRowButtonID).attr("disabled", true)
                            studentTable.appendRow([{}])
                        }))

                        this._periodSelectElm(scheduleConfig.periods).then((sel) => {
                            //
                        })
                    });
                }
            }).catch(reject);
        })
    }
    _periodSelectElm(periods, selected) {
        return new Promise((resolve, reject) => {
            let sel = $("<select/>").addClass(this.periodSelectClass).on("change", () => {
                this._allSelectPeriodUnlockAdd();
            });
            if(selected) {
                sel.append($("<option/>").attr("value", "").attr("disabled", true).html("Choose a period"));
            } else {
                sel.append($("<option/>").attr("value", "").attr("disabled", true).attr("selected", true).html("Choose a period"));
            }
            
            for(let x = 0; x < periods.length; x++) {
                if(periods[x] == selected) {
                    sel.append($("<option/>").attr("value", periods[x]).attr("selected", true).html(periods[x].toUpperCase()))
                } else {
                    sel.append($("<option/>").attr("value", periods[x]).html(periods[x].toUpperCase()))
                }
                
                if(x >= periods.length-1) {
                    let div = $("<div/>").addClass("input-field col s10").append(sel);
                    resolve(div);
                }
            }
        });
    }

    //checks every 
    _allSelectPeriodUnlockAdd() {
        let sel = $("select." + this.periodSelectClass);
        let prevVal = []
        for(let x = 0; x < sel.length; x++) {
            /*console.log(sel[x])
            console.log($(sel[x]).parentsUntil("td").find("a.delete-row").find("i"))*/
            if(prevVal.includes(sel[x].value)){
                $("#" + this.addRowButtonID).attr("disabled", true);
                $(sel[x]).parentsUntil("td").find("a.delete-row").addClass("pulse red").fadeIn(1000);
                $(sel[x]).parentsUntil("td").find("a.delete-row").find("i").html("error_outline");
                return false;
            } else {
                $(sel[x]).parentsUntil("td").find("a.delete-row").removeClass("pulse red")
                $(sel[x]).parentsUntil("td").find("a.delete-row").find("i").html("delete");
            }
            prevVal.push(sel[x].value)
            if(sel[x].value.length < 1) {
                $("#" + this.addRowButtonID).attr("disabled", true);
                $(sel[x]).parentsUntil("td").find("a.delete-row").addClass("pulse red").fadeIn(1000);
                $(sel[x]).parentsUntil("td").find("a.delete-row").find("i").html("error_outline")
                return false;
            } else {
                $(sel[x]).parentsUntil("td").find("a.delete-row").removeClass("pulse red")
                $(sel[x]).parentsUntil("td").find("a.delete-row").find("i").html("delete")
            }
            if (x >= sel.length-1) {
                $("#" + this.addRowButtonID).attr("disabled", false);
                return true;
            }
        }
        

    }
}

module.exports = ScheduleEditor;


//STUDENT TEST CODE 
/*//Table Gen
                    let autocompleteClass = "__SCHEDULE_AUTOCOMPLETE_" + utils.uuidv4() + "__";
                    let studentTable = new Table(this.container, tableArray, {
                        inject: (row, callback) => {
                            let autoID = "__AUTOCOMPLETE_" + utils.uuidv4()
                            let enabledID = "__ACTIONS_ENABLED_" + utils.uuidv4()
                            let enabledTeacherID = "__ACTIONS_ENABLED_TEACHER_" + utils.uuidv4()
                            return callback([
                                {
                                    column: "Teacher", 
                                    strictColumn: true, 
                                    dom: $("<span/>").append(
                                        $("<input/>").attr("type", "text").attr("id", autoID).addClass(autocompleteClass + " autocomplete").attr("data-autocomplete-period", row.shownData.Periods.toLowerCase())
                                    ).append(
                                        $("<label/>").attr("for", autoID).html("Search Teachers")
                                    )
                                },
                                {
                                    column: "Actions", 
                                    strictColumn: true,
                                    dom: $("<span/>").append(
                                        $("<input/>").attr("type", "checkbox").addClass("filled-in").attr("data-action-enabled-period", row.shownData.Periods.toLowerCase()).attr("id", enabledID).attr("checked", "checked").attr("onclick", "")
                                    ).append(
                                        $("<label/>").attr("for", enabledID).html("Period Enabled")
                                    ).append($("<br/>")).append(
                                        $("<input/>").attr("type", "checkbox").addClass("filled-in").attr("data-action-enabled-teacher-period", row.shownData.Periods.toLowerCase()).attr("id", enabledTeacherID).attr("checked", "checked")
                                    ).append(
                                        $("<label/>").attr("for", enabledTeacherID).html("Have Teacher")
                                    )
                                }
                            ])
                        }
                    })
                    studentTable.generate().then(() => {
                        console.log("done");

                        $('input.'+autocompleteClass).autocomplete({
                            data: {
                              "Apple": null,
                              "Microsoft": null,
                              "Google": 'https://placehold.it/250x250'
                            },
                            limit: 5, // The max amount of results that can be shown at once. Default: Infinity.
                            onAutocomplete: function(val) {
                              // Callback function when value is autcompleted.
                            },
                            minLength: 1, // The minimum length of the input for the autocomplete to start. Default: 1.
                        });
        
                    }).catch(reject)*/

/***/ }),
/* 19 */
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
* Browser Schedule Functions.
* @module webpack/api/schedule
*/

var utils = __webpack_require__(0);

/** 
* Gets all schedule types for the user
* @link module:webpack/api/schedule
* @param {(String|undefined)} accountID
* @returns {Promise}
*/
exports.getSchedules = (accountID) => {
    if(accountID === undefined) {accountID = ""}
    return utils.fetch("GET", "/api/account/schedule/" + accountID, {auth: true})
}

/***/ }),
/* 20 */
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
* Browser Misc Functions.
* @module webpack/api/misc
*/

var utils = __webpack_require__(0);

/** 
* Gets all schedule configs from server.
* @link module:webpack/api/misc
* @returns {Promise}
*/
exports.getScheduleConfig = () => {
    return utils.fetch("GET", "/api/server/config/schedule/", {auth: false})
}

/***/ })
/******/ ]);