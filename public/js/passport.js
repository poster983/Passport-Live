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
