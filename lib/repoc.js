// RMI
// Check status, if closed, buffer the requests, then send when connected

// On connect, send listing of all functions available
var PACK = JSON.stringify;
var UNPACK = JSON.parse;

var slice = Array.prototype.slice;

function Repoc(socket, api, sessionId) {
	socket.on('message', this._onmessage);
	this._socket = socket;
	
	// api must be an object whose only enumerable properties are the callable methods on it
	// Do not put any method on the api object that should not be publicly accesible
	this._api = api;
	this._sessionId = sessionId;
}
Repoc.prototype = {
	_onmessage: function(message) {
		try {
			message = UNPACK(message);
		} catch(e) {
			return;
		}
		if(!Array.isArray(message)) {
			return;
		}
		
		var rid = message.shift();
		var call = message.shift();
		if(call == '__list__') { // The client is asking for listing of all the methods on the API object
			var list = Object.keys(this._api); // Get the method names
			this._sendReply(rid, [list]); // Send it back
		} else {
			this._callapi(call, rid, message);
		}
	},
	_callapi: function(call, rid, args) {
		var self = this;
		var api = this._api;
		call = api[call]; // Get the API method to call
		
		if(this._sessionId != null) { // If there is a session ID to include in the call
			args.unshift(this._sessionId); // Prepend it
		}
		args.push(function() { // Attach the callback to the argument sequence
			var replyArgs = slice.call(arguments, 0); // Get the reply data
			self._sendReply(rid, replyArgs); // And send it to the client
		});
		
		try {
			call.apply(api, args); // Kick off the job
		} catch(e) {
			// TODO Maybe later add some way to tell the client there was an exception
		}
	},
	_sendReply: function(rid, args) {
		var data = PACK([rid].concat(args));
		this._socket.send(data);
	}
};

exports.Repoc = Repoc;