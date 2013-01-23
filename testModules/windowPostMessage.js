define(["doh/runner"], function(doh) {

    var child = document.createElement("iframe");
    child.src = "../../testModules/repeater.html";
    document.body.appendChild(child);
    var testSize = 10000;
    var sampleObj = {
        scalar: "scalar",
        array: ["item1", "item2"],
        nested: {
            password: "***",
            random_crap: "random_crap"
        }
    };

    function getEqualListener(test) {
        return function(event) {
            try {
                doh.assertEqual(test.original, event.data);
                test.dohDef.callback(true);
            } catch(e) {
                test.dohDef.errback(new Error("Unexpected"));
            }
        };
    }

    function getCountListener(test) {
        test.count = 0;
        return function(event) {
            test.count++;
            if(test.count === testSize)
                test.dohDef.callback(true);
        }
    }

    function setUp(test, listener) {
        test.dohDef = new doh.Deferred();
        test.listener = listener(test);
        window.addEventListener("message", test.listener, false);
    }

    doh.register("window postmessage tests", [
        {
            name: "order of multiple window postmessage",
            setUp: function() {
                this.expected = 0;
                var orderListener = function(test) {
                    return function(event) {
                        if(event.data != test.expected)
                            test.dohDef.errback(new Error("Not in order"));
                        test.expected++;
                        if(test.expected === testSize)
                            test.dohDef.callback(true);
                    };
                }
                setUp(this, orderListener);
            },
            runTest: function() {
                for(var i=0;i<testSize;i++)
                    child.contentWindow.postMessage(i,"*");
                return this.dohDef;
            },
            tearDown: function() {
                window.removeEventListener("message", this.listener, false);
            }
        },
        {
            name: "Checking equality of javascript object",
            setUp: function() {
                this.original = sampleObj;
                setUp(this, getEqualListener);
            },
            runTest: function() {
                child.contentWindow.postMessage(this.original, "*");
                return this.dohDef;
            },
            tearDown: function() {
                window.removeEventListener("message", this.listener, false);
            }
        },
        {
            name: "Sending "+testSize+" javascript objects to child window",
            setUp: function() {
                this.original = sampleObj;
                setUp(this, getCountListener);
            },
            runTest: function() {
                for(var i=0;i<testSize;i++)
                    child.contentWindow.postMessage(this.original, "*");
                return this.dohDef;
            },
            tearDown: function() {
                window.removeEventListener("message", this.listener, false);
            }
        },
        {
            name: "Checking equality of JSON",
            setUp: function() {
                this.original = JSON.stringify(sampleObj);
                setUp(this, getEqualListener);
            },
            runTest: function() {
                child.contentWindow.postMessage(this.original, "*");
                return this.dohDef;
            },
            tearDown: function() {
                window.removeEventListener("message", this.listener, false);
            }
        },
        {
            name: "Sending "+testSize+" JSON to child window",
            setUp: function() {
                this.original = JSON.stringify(sampleObj);
                setUp(this, getCountListener);
            },
            runTest: function() {
                for(var i=0;i<testSize;i++)
                    child.contentWindow.postMessage(this.original, "*");
                return this.dohDef;
            },
            tearDown: function() {
                window.removeEventListener("message", this.listener, false);
            }
        }

    ]);
});