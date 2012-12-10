// util.js
// javascript containing miscellaneous utility functions

// function for extracting parameters from the URL
function getUrlParam(key){
	var result = new RegExp(key + "=([^&]*)", "i").exec(window.location.search); 
	return result && decodeURIComponent(result[1]) || ""; 
}

// returns true if web storage exists
function checkhtml5storage() {

    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch(e) {
        return false;
    }

}

// functions for manipulating cookies
function createcookie(name, value, exdays) {

    var expires;

    if (exdays) {

        var date = new Date();
        date.setTime(date.getTime()+(exdays*24*60*60*1000));
        expires = "; expires=" + date.toGMTString();

    }
    else expires = "";
    document.cookie = name + "=" + value + expires + "; path=/";

}

function readcookie(name) {

    var name = name + "=";
    var ca = document.cookie.split(';');

    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }

    return null;

}

function deletecookie(name) {

    createcookie(name, "", -1);

}