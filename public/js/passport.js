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

/*if ("serviceWorker" in navigator) {
    window.addEventListener("load", function() {
        navigator.serviceWorker.register("/sw.js").then(function(registration) {
            // Registration was successful
            console.log("ServiceWorker registration successful with scope: ", registration.scope);
        }).catch(function(err) {
            // registration failed :(
            console.log("ServiceWorker registration failed: ", err);
        });
    });
}*/

//Ask user to refresh page if there is a new version avalable
function showRefreshUI(registration) {
    var $toastContent = $("<div/>").append($("<span>There is an update avalable</span>").add($("<button/>").html("Update!").addClass("btn pulse grey darken-4 yellow-text waves-effect waves-light").on("click", (e) => {
        //console.log(e)
        if (!registration.waiting) {
            // Just to ensure registration.waiting is available before
            // calling postMessage()
            return;
        }
        e.target.disabled = true;
        $(e.target).removeClass("pulse");

        registration.waiting.postMessage("skipWaiting");
    })));
    Materialize.toast($toastContent, Infinity); //I cant believe Infinity actually works
}

function onNewServiceWorker(registration, callback) {
    if (registration.waiting) {
    // SW is waiting to activate. Can occur if multiple clients open and
    // one of the clients is refreshed.
        return callback();
    }

    function listenInstalledStateChange() {
        //console.log("Update Found!");
        registration.installing.addEventListener("statechange", function(event) {
            if (event.target.state === "installed") {
                // A new service worker is available, inform the user
                callback();
            }
        });
    }

    if (registration.installing) {
        return listenInstalledStateChange();
    }

    // We are currently controlled so a new SW may be found...
    // Add a listener in case a new SW is found,
    registration.addEventListener("updatefound", listenInstalledStateChange);
}

window.addEventListener("load", function() {
    navigator.serviceWorker.register("/sw.js")
        .then(function (registration) {
            // Track updates to the Service Worker.
            if (!navigator.serviceWorker.controller) {
                // The window client isn't currently controlled so it's a new service
                // worker that will activate immediately
                return;
            }
            console.log("ServiceWorker registration successful with scope: ", registration.scope);

            // When the user asks to refresh the UI, we'll need to reload the window
            var preventDevToolsReloadLoop;
            navigator.serviceWorker.addEventListener("controllerchange", function(event) {
                //console.log("Service worker changed ")
                // Ensure refresh is only called once.
                // This works around a bug in "force update on reload".
                if (preventDevToolsReloadLoop) return;
                preventDevToolsReloadLoop = true;
                console.log("Controller loaded");
                window.location.reload();
            });

            onNewServiceWorker(registration, function() {
                showRefreshUI(registration);
            });
        }).catch(function(err) {
            // registration failed :(
            console.log("ServiceWorker registration failed: ", err);
        });
});




$.fn.formClear = function() {
    return this.each(function() {
        var formtype = this.type, formtag = this.tagName.toLowerCase();
        if (formtag == "form") {
            return $(":input",this).formClear();
        }
        if (formtype == "text" || formtag == "textarea") {
            this.value = "";
        }
        else if (formtype == "checkbox" || formtype == "radio") {
            this.checked = false;
        }
        else if (formtag == "select") {
            this.selectedIndex = -1;
        }
    });
};


$.fn.extend({
    animateCss: function (animationName) {
        var animationEnd = "webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend";

        this.addClass("animated " + animationName).one(animationEnd, function() {
            $(this).removeClass("animated " + animationName);
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
    var ca = document.cookie.split(";");
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}


function carsonRau(onOff){
    $(document.body).css("background-image", "url(images/cork-board.jpg)");
    if (onOff) {
        setCookie("cRausStrangeDesignChoice", 1, 30);
    } else {
        setCookie("cRausStrangeDesignChoice", 1, 0);
    }
    console.log("There You Go Carson");
}
function checkForWeirdKid() {
    if(getCookie("cRausStrangeDesignChoice") == 1) {
        $(document.body).css("background-image", "url(images/cork-board.jpg)");
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
    console.log(ACTIVE_NAV);
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

function materialResponse(icon, colorClass, done) {
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
}

function errorHand(err) {
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
}


function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => 
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split("&"),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split("=");

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
}

function startTimeoutClock(ms, interval, action) {
    var msCurrent = 0;
    (function tick() {
        if(msCurrent >= ms) {
            return action(0);
        }
        setTimeout(tick, interval);
        msCurrent+=interval;
        action(((ms-msCurrent)/ms)*100);
    })();
}

function fetchStatus(response) {
    console.log(response);
    if (response.status >= 200 && response.status < 300) {
        return response;
    } else {
        var error = new Error(response.statusText);
        error.isFetch = true;
        error.response = response;
        errorHand(error);
        throw error;
    }
}

function fetchJSON(response) {
    return response.json();
}

