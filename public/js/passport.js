/*

The MIT License (MIT)

Copyright (c) Tue Nov 1 2016 Joseph Hassell joseph@thehassellfamily.net

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORTOR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
/*VARS*/

//PROGRESSIVE WEB APP STUFFS
//SERVICE WORKER

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').then(function(registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }).catch(function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}



$.fn.formClear = function() {
  return this.each(function() {
    var formtype = this.type, formtag = this.tagName.toLowerCase();
    if (formtag == 'form') {
      return $(':input',this).formClear();
    }
    if (formtype == 'text' || formtag == 'textarea') {
      this.value = '';
    }
    else if (formtype == 'checkbox' || formtype == 'radio') {
      this.checked = false;
    }
    else if (formtag == 'select') {
      this.selectedIndex = -1;
    }
  });
};


$.fn.extend({
    animateCss: function (animationName) {
        var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';

        this.addClass('animated ' + animationName).one(animationEnd, function() {
            $(this).removeClass('animated ' + animationName);
        });
    }
});



/*Overlay function*/
/*open*/
function openFullOverlay(id) {
    document.getElementById(id).style.width = "100%";
}

/* Close when someone clicks on the "x" symbol inside the overlay */
function closeFullOverlay(id, delay) {
  setTimeout(function(){
    document.getElementById(id).style.width = "0%";
  }, delay);
}







function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
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


function carsonRau(onOff){
  $(document.body).css('background-image', 'url(images/cork-board.jpg)');
  if (onOff) {
    setCookie("cRausStrangeDesignChoice", 1, 30);
  } else {
    setCookie("cRausStrangeDesignChoice", 1, 0);
  }
  console.log("There You Go Carson");
}
function checkForWeirdKid() {
  if(getCookie("cRausStrangeDesignChoice") == 1) {
    $(document.body).css('background-image', 'url(images/cork-board.jpg)');
    console.log("There You Go Carson");
  }
}
