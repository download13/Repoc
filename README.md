Repoc
=====

Repoc is a simple RPC library that is used for calling functions on another machine over a WebSocket connection.

### Server Example:
```javascript
var api = {
	aFunctionDefinedOnTheServer: function(arg, cb) {
		var arg1 = arg.substr(arg.length / 2); // Pointless stuff
		var arg2 = arg + arg;
		
		cb(arg1, arg2); // Return results to client via callback
	}
};

ws.createServer(function(req, connection) {
	var repoc = new Repoc(connection, api);
	connection.data.repoc = repoc; // Might want to store a reference in case we need the same one later
});
```

You may pass a third argument to `new Repoc()` which is a session ID. If included, it will be prepended to the arguments sent to the API function so that it can be used to identify a session to associate messages with.

### Client Example:
```javascript
var ws = new WebSocket('ws://localhost'); // Get a WebSocket connection
ws.onopen = function() {
	Repoc.create(ws, function(repoc) { // Create a new repoc object
		repoc.aFunctionDefinedOnTheServer('an argument', function(arg1results, arg2results) {
			alert(arg1results + arg2results);
		});
	});
}
```