define(["doh/runner"], function(doh) {
    var workerPath = "../../testModules/worker.js";
    var sampleObj = {
        scalar: "scalar",
        array: ["item1", "item2"],
        nested: {
            password: "***",
            random_crap: "random_crap"
        }
    };
    var testSize = 10000;

    doh.register("worker post message", [
        {
            name: "Order of multiple worker calls",
            setUp: function() {
                this.worker = new Worker(workerPath);
                this.dohDef = new doh.Deferred();
                this.numCalls = 100
                this.expected = 0;
                var self = this;
                this.worker.onmessage = function(event) {
                    if(self.expected === event.data)
                        self.expected++;
                    if(self.expected === self.numCalls)
                        self.dohDef.callback(true);
                };
            },
            runTest: function() {
                for(var i=0;i<this.numCalls;i++)
                    this.worker.postMessage(i);
                return this.dohDef;
            }
        },
        {
            name: "Checking equality of javascript object",
            setUp: function() {
                this.worker = new Worker(workerPath);
                this.dohDef = new doh.Deferred();
                var self = this;
                this.worker.onmessage = function(event) {
                    try {
                        doh.assertEqual(sampleObj, event.data);
                        self.dohDef.callback(true);
                    } catch(e) {
                        self.dohDef.errback(new Error("Failed test"));
                    }
                }
            },
            runTest: function() {
                this.worker.postMessage(sampleObj);
                return this.dohDef;
            }
        },
        {
            name: "Passing "+testSize+" javascript objects to worker",
            setUp: function() {
                this.worker = new Worker(workerPath);
                this.dohDef = new doh.Deferred();
                this.received = 0;
                var self = this;
                this.worker.onmessage = function(event) {
                    self.received++;
                    if(self.received === testSize)
                        self.dohDef.callback(true);
                }
            },
            runTest: function() {
                for(var i=0;i<testSize;i++)
                    this.worker.postMessage(sampleObj);
                return this.dohDef;
            }
        },
        {
            name: "Checking equality of JSON",
            setUp: function() {
                this.worker = new Worker(workerPath);
                this.dohDef = new doh.Deferred();
                this.original = JSON.stringify(sampleObj);
                var self = this;
                self.worker.onmessage = function(event) {
                    try {
                        doh.assertEqual(self.original, event.data);
                        self.dohDef.callback(true);
                    } catch(e) {
                        self.dohDef.errback(new Error("Failed test"));
                    }
                };
            },
            runTest: function() {
                this.worker.postMessage(this.original);
                return this.dohDef;
            }
        },
        {
            name: "Passing "+testSize+" JSON to worker",
            setUp: function() {
                this.worker = new Worker(workerPath);
                this.dohDef = new doh.Deferred();
                this.received = 0;
                this.original = JSON.stringify(sampleObj);
                var self = this;
                self.worker.onmessage = function(event) {
                    self.received++;
                    if(self.received === testSize)
                        self.dohDef.callback(true);
                }
            },
            runTest: function() {
                for(var i=0;i<testSize;i++)
                    this.worker.postMessage(this.original);
                return this.dohDef;
            }
        }
    ]);
});