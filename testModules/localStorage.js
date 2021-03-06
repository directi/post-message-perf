define(["doh/runner"], function(doh) {
    var testSize = 10000;
    var key = [];
    for(var i=0;i<testSize;i++)
        key[i] = "key"+i;
    var jsonString = JSON.stringify({
        scalar: "scalar",
        array: ["item1", "item2"],
        nested: {
            password: "***",
            random_crap: "random_crap"
        }
    });
    var sampleObj = {
        scalar: "scalar",
        array: ["item1", "item2"],
        nested: {
            password: "***",
            random_crap: "random_crap"
        }
    };

    doh.register("localStorage", [
        {
            name: "Writing "+testSize+" JSON to localStorage on same key",
            setUp: function() {
                localStorage.clear();
            },
            runTest: function() {
                for(var i=0;i<testSize;i++)
                    localStorage.setItem("key", jsonString);
            },
            tearDown: function() {
                localStorage.removeItem("key");
            }
        },
        {
            name: "Writing "+testSize+" JSON to different keys",
            setUp: function() {
                localStorage.clear();
            },
            runTest: function() {
                for(var i=0;i<testSize;i++)
                    localStorage.setItem(key[i], jsonString);
            },
            tearDown: function() {
                for(var i=0;i<testSize;i++)
                    localStorage.removeItem(key[i]);
            }
        },
        {
            name: "Reading "+testSize+" JSON from localStorage",
            setUp: function() {
                localStorage.clear();
                localStorage.setItem("key","value");
            },
            runTest: function() {
                for(var i=0;i<testSize;i++)
                    localStorage.getItem("key");
            },
            tearDown: function() {
                localStorage.removeItem("key");
            }
        }
    ]);
});
