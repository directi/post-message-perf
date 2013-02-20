window.performance = window.performance || {};
performance.now = (function() {
    return performance.now       ||
        performance.mozNow    ||
        performance.msNow     ||
        performance.oNow      ||
        performance.webkitNow ||
        function() { return new Date().getTime(); };
})();

define(["doh/runner","dojo/on","dojo/Deferred"], function(doh,on,Def) {

    var child = document.createElement("iframe");
    child.src = "../../testModules/repeater.html";
    document.body.appendChild(child);
    var winDef = new Def();
    on(child,"load",function() {
        winDef.resolve();
    });
    var testSize = 7000;
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
        test.sentTime = [];
        test.latency = [];
        return function(event) {
            if(typeof event.data === "string") {
                var obj = JSON.parse(event.data);
            }
            test.latency.push(performance.now()-test.sentTime[test.count++]);
            if(test.count === testSize) {
                var throughput = testSize/(performance.now() - test.sentTime[0]), sumLatency = 0, minLatency = test.latency[0], maxLatency = test.latency[0];
                for(var i=0;i<testSize;i++) {
                    sumLatency += test.latency[i];
                    if(test.latency[i]<minLatency) minLatency = test.latency[i];
                    if(test.latency[i]>maxLatency) maxLatency = test.latency[i];
                }
                var avgLatency = sumLatency/testSize;
                var report = document.createElement("div");
                report.innerHTML = " throughput: "+throughput.toFixed(2)+" req/ms<br/> minimum latency: " + minLatency.toFixed(2) + "ms<br/> maximum latency: " + maxLatency.toFixed(2) + "ms<br/> average latency: "+avgLatency.toFixed(2) + "ms";
                document.getElementById("logBody").appendChild(report);
                test.dohDef.callback(true);
            }
        }
    }

    function getSerialListener(test) {
        test.count = 0;
        test.sentTime = [];
        test.latency = [];
        return function(event) {
            var isJson = false;
            if(typeof event.data === "string") {
                var obj = JSON.parse(event.data);
                isJson = true;
            }
            test.latency.push(performance.now()-test.sentTime[test.count++]);
            if(test.count === testSize) {
                var throughput = testSize/(performance.now() - test.sentTime[0]), sumLatency = 0, minLatency = test.latency[0], maxLatency = test.latency[0];
                for(var i=0;i<testSize;i++) {
                    sumLatency += test.latency[i];
                    if(test.latency[i]<minLatency) minLatency = test.latency[i];
                    if(test.latency[i]>maxLatency) maxLatency = test.latency[i];
                }
                var avgLatency = sumLatency/testSize;
                var report = document.createElement("div");
                report.innerHTML = " throughput: "+throughput.toFixed(2)+" req/ms<br/> minimum latency: " + minLatency.toFixed(2) + "ms<br/> maximum latency: " + maxLatency.toFixed(2) + "ms<br/> average latency: "+avgLatency.toFixed(2) + "ms";
                document.getElementById("logBody").appendChild(report);
                test.dohDef.callback(true);
            } else {
                test.sentTime.push(performance.now());
                child.contentWindow.postMessage(isJson ? JSON.stringify(sampleObj):sampleObj, "*");
            }
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
                winDef.then(function() {
                    for(var i=0;i<testSize;i++)
                        child.contentWindow.postMessage(i,"*");
                });
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
                var self = this;
                winDef.then(function() {
                    child.contentWindow.postMessage(self.original, "*");
                });
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
                var self = this;
                winDef.then(function() {
                    for(var i=0;i<testSize;i++) {
                        self.sentTime.push(performance.now());
                        child.contentWindow.postMessage(self.original, "*");
                    }
                });
                return this.dohDef;
            },
            tearDown: function() {
                window.removeEventListener("message", this.listener, false);
            }
        },
        {
            name: "Sending "+testSize+" javascript objects to child window serially",
            setUp: function() {
                setUp(this, getSerialListener);
            },
            runTest: function() {
                var self = this;
                winDef.then(function() {
                    self.sentTime.push(performance.now());
                    child.contentWindow.postMessage(sampleObj, "*");
                });
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
                var self = this;
                winDef.then(function() {
                    child.contentWindow.postMessage(self.original, "*");
                });
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
                var self = this;
                winDef.then(function() {
                    for(var i=0;i<testSize;i++) {
                        self.sentTime.push(performance.now());
                        child.contentWindow.postMessage(JSON.stringify(sampleObj), "*");
                    }
                });
                return this.dohDef;
            },
            tearDown: function() {
                window.removeEventListener("message", this.listener, false);
            }
        },
        {
            name: "Sending "+testSize+" JSONs to child window serially",
            setUp: function() {
                setUp(this, getSerialListener);
            },
            runTest: function() {
                var self = this;
                winDef.then(function() {
                    self.sentTime.push(performance.now());
                    child.contentWindow.postMessage(JSON.stringify(sampleObj), "*");
                });
                return this.dohDef;
            },
            tearDown: function() {
                window.removeEventListener("message", this.listener, false);
            }
        }

    ]);
});
