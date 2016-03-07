
// This function makes a fake DOM that's good enough for running tests headless
module.exports = function() {
  (function (global){
    var jsdom = require("jsdom").jsdom;

    global.document = jsdom("<html><head><script></script></head><body></body></html>");
    global.window = document.defaultView;
    global.navigator = window.navigator;
    global.XMLHttpRequest = function(){};
    var React = require("react") // To repopulate cache
  }(typeof global === "object" ? global : this));
}
