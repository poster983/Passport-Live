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


//AJAX function for API calls
//callback callback(err, res);
function sendAPI(apiURl, restAction, payload, JWTToken, callback){
  $.ajax({
    type: restAction,
    beforeSend: function(request) {
      request.setRequestHeader("Authorization", JWTToken);
    },
    url: apiURl,
    data: payload,
    success: function(data) {
      callback(null, data);
    },
    error: function(jqXHR) {
      callback(jqXHR);
    }
  });
  
}

function openPage(pageID) {
  $("#" + pageID).addClass("active");
}
function closePage(pageID) {
  $("#" + pageID).removeClass("active");
}

//Morphy sidebar

//ACTIVE PAGE FOR SESSION:
var ACTIVE_NAV = $("ul.side-nav li.selected");
var NAV_MORPH_ID;
function navMorphInit(id) {
  NAV_MORPH_ID = id;
  var mBo = $("#"+NAV_MORPH_ID);
  mBo.html(ACTIVE_NAV.find("a").html());
  console.log(ACTIVE_NAV)
   $("#SBmorphBox").css({
    "transform": "translate(0px, " + ACTIVE_NAV.position()["top"] + "px)"});
}
function navMorph(obj) {
  //var firstLI = $("li").get(0).position();
  var mBo = $("#"+NAV_MORPH_ID).position();
  var pos = $(obj).position();

  console.log(pos["top"]);
  $("#"+NAV_MORPH_ID).css({
    "transform": "translate(0px, " + pos["top"] + "px)",
    "transition": "all 0.5s cubic-bezier(0.29, 1.42, 0.79, 1)",      //"transform-origin": "" + firstLI["left"] +"px " + firstLI["top"] +"px"
    "transform-origin": "0px 0px"
  });
  $("#"+NAV_MORPH_ID).html($(obj).find("a").html()); 

} 

function circleRes(icon, colorClass) {
  switch(colorClass){
    case "success": 
      colorClass = "green accent-3";
      break;
  }
    //setup green grow
    if(icon == "check") {
      $('#checkmarkContainer').addClass('checkmarkContainer checkmarkContainerIn');
        //Check marks 
      $('#Cleft').addClass('Cleft CleftIn');
      $('#Cright').addClass('Cright CrightIn');
    }
    $("#circleThingContainer").addClass("circleThingContainer");
    $("#circleThing").removeClass().addClass("circleThing circleGrow");
    //addcolor
    $("#circleThing").addClass(colorClass);

    //on circle complete 
    $('#circleThing').one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(e) {
      console.log("GO")
      $("#circleThingContainer").addClass(colorClass)
      $('#circleThing').removeClass().addClass('circleThing');
      //wait for 1 second
      setTimeout(function() {
        if(icon == "check") {
          $('#checkmarkContainer').removeClass('checkmarkContainerIn').addClass('checkmarkContainerOut');
          $('#Cleft').removeClass('CleftIn').addClass("CleftOut");
          $('#Cright').removeClass('CrightIn').addClass("CrightOut");
        }
        
        $('#circleThing').removeClass().addClass('circleThing circleGrow');
        $('#circleThing').css("background-color", "rgba(0, 0, 0, 0)")
        //when final one ends
        $('#circleThing').one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(e) {
          $("#circleThingContainer").removeClass(colorClass)
          setTimeout(function() {
          
            $('#Cleft').removeClass();
            $('#Cright').removeClass();
            $('#checkmarkContainer').removeClass();
          }, 500);
        });
      }, 1000);
    });
}

function visResponse(action) {
          $("#responseAni").append("<div class=\"circleThingContainer\"><div id=\"circleThing\" class=\"circleThing\"></div></div><span id=\"Xleft\"></span><span id=\"Xright\"></span><div id=\"checkmarkContainer\"><span id=\"Cleft\"></span><span id=\"Cright\"></span></div>")
          if (action == "success") {

            $('#checkmarkContainer').addClass(' active checkmarkContainer checkmarkContainerIn');
            $('#Cleft').addClass('Cleft CleftIn');
            $('#Cright').addClass('Cright CrightIn');
            $('#circleThing').removeClass().addClass('circleThing circleGrow green accent-3');
            $('#circleThing').one('webkitAnimationEnd oanimationend msAnimationEnd animationend',
              function(e) {
                $('body').addClass('green accent-3');
                $('#circleThing').removeClass().addClass('circleThing');
                setTimeout(function() {
                  $('#Cleft').removeClass('CleftIn');
                  $('#Cright').removeClass('CrightIn');
                  $('#checkmarkContainer').removeClass('checkmarkContainerIn');

                  $('#circleThing').removeClass().addClass('circleThing circleGrow grey darken-4');

                  $('#checkmarkContainer').addClass('checkmarkContainerOut');
                  $('#Cleft').addClass('CleftOut');
                  $('#Cright').addClass('CrightOut');

                  $('#circleThing').one('webkitAnimationEnd oanimationend msAnimationEnd animationend',
                    function(e) {

                      $('body').removeClass('green accent-3');
                      $('#circleThing').removeClass().addClass('circleThing');
                      setTimeout(function() {
                        $('#Cleft').removeClass();
                        $('#Cright').removeClass();
                        $('#checkmarkContainer').removeClass();
                        $("#responseAni").empty()
                      }, 500);
                  });
                }, 1000);
            });

          } else if (action == "error") {
            $('#stuIDForm').css('opacity', '0');
            $('#Xleft').addClass('Xleft XleftIn');
            $('#Xright').addClass('Xright XrightIn');
            $('#circleThing').removeClass().addClass('circleThing circleGrow red accent-4');
            $('#circleThing').one('webkitAnimationEnd oanimationend msAnimationEnd animationend',
              function(e) {
                $('body').addClass('red accent-4');
                $('#circleThing').removeClass().addClass('circleThing');

                setTimeout(function() {
                  $('#Xleft').removeClass('XleftIn');
                  $('#Xright').removeClass('XrightIn');

                  $('#Xleft').addClass('XleftOut');
                  $('#Xright').addClass('XrightOut');

                  $('#circleThing').removeClass().addClass('circleThing circleGrow grey darken-4');

                  $('#circleThing').one('webkitAnimationEnd oanimationend msAnimationEnd animationend',
                    function(e) {
                      $('body').removeClass('red accent-4');
                      $('#circleThing').removeClass().addClass('circleThing');
                        setTimeout(function() {
                          $('#Xleft').removeClass();
                          $('#Xright').removeClass();
                          $("#responseAni").empty();
                        }, 500);
                  });

                  $('#stuIDForm').css('opacity', '1');
                }, 1000);
            });
          } else {

            $('#stuIDForm').css('opacity', '0');

            $('#circleThing').removeClass().addClass('circleThing circleGrow orange accent-4');
            $('#circleThing').one('webkitAnimationEnd oanimationend msAnimationEnd animationend',
              function(e) {
                $('body').addClass('orange accent-4');
                $('#circleThing').removeClass().addClass('circleThing');
                setTimeout(function() {
                  $('#circleThing').removeClass().addClass('circleThing circleGrow grey darken-4');

                  $('#circleThing').one('webkitAnimationEnd oanimationend msAnimationEnd animationend',
                    function(e) {
                      $('body').removeClass('orange accent-4');
                      $('#circleThing').removeClass().addClass('circleThing');
                      $("#responseAni").empty()
                  });
                }, 1000);
            });
          }
        };

function errorHand(err) {
  //Do more Later
  console.error(err);
}

