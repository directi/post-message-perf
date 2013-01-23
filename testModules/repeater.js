//parent.postMessage("something","*")
self.addEventListener('message', function(e) {
    parent.postMessage(e.data, "*");
}, false);