
var webWorkerConfig = function (config) {
    "use strict";

    //	summary:
    //		This module provides bootstrap configuration for running dojo in WebWorker

    // reset the has cache with web-worker-appropriate values;
    var hasCache = {
        "host-node":0,
        "host-browser":0,
        "dom":0,
        "dojo-has-api":1,
        "dojo-xhr-factory":0,
        "dojo-inject-api":1,
        "dojo-timeout-api":1,
        "dojo-trace-api":1,
        "dojo-dom-ready-api":0,
        "dojo-publish-privates":1,
        "dojo-sniff":0,
        "dojo-loader":1,
        "dojo-test-xd":0,
        "dojo-test-sniff":0,
        "native-xhr":1
    };

    for (var p in hasCache) {
        config.hasCache[p] = hasCache[p];
    }

    var importPrefix = "import:";
    // reset some configuration switches with web-worker-appropriate values
    var workerConfig = {
        baseUrl:"##MUST BE SPECIFIED IN dojoConfig",
        commandLineArgs:[],
        timeout:0,
        locale:"en-us",

        loaderPatch:{
            eval: function(__text, __urlHint){
                if(__text.indexOf(importPrefix) !== 0){
                    console.error("eval() not supported", __text, __urlHint);
                    return;
                }
                var url = __text.substr(importPrefix.length);
                importScripts(url);
            },
            injectUrl:function (url, callback) {
                try {
                    importScripts(url);
                    callback();
                } catch (e) {
                    console.error("failed to load resource (" + url + ")");
                    console.error(e);
                }
            },
            getText: function(url, legacyMode, xhrCallback){
                //This url is executed in eval function above
                xhrCallback(importPrefix + url);
            }
        }
    };
    for (p in workerConfig) {
        config[p] = workerConfig[p];
    }
};
