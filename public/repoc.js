(function(global) {
	var PACK = JSON.stringify;
	var UNPACK = JSON.parse;
	
	var slice = Array.prototype.slice;
	
	function Repoc(ws, cb) {
		ws.onmessage = this._onmessage.bind(this);
		this._ws = ws;
		
		this._counter = 0;
		this._callbacks = {};
		
		var self = this;
		this._send('__list__', [
			function(list) {
				list.forEach(self._makeProperty, self);
				cb(self); // Inform the user we are ready
			}
		]);
		
		// TODO Make the _* methods not enumerable
		
	}
	Repoc.prototype = {
		_onmessage: function(message) {
			if(message.data) {
				message = message.data;
			}
			try {
				message = UNPACK(message);
			} catch(e) {
				return;
			}
			var rid = message.shift();
			
			var cb = this._callbacks[rid]; // Get the callback for this message
			delete this._callbacks[rid]; // Delete the callback from the store
			if(typeof cb == 'function') { // If it's callable
				cb.apply(null, message); // Give it the reply data
			}
		},
		_send: function(call, args) {
			var last = args.pop();
			var rid = -1;
			if(typeof last == 'function') { // Last argument is a callback
				rid = this._counter++; // Get a new reply ID
				this._callbacks[rid] = last; // Store the callback with the reply ID
			} else { // It wasn't a callback
				args.push(last); // So put it back
			}
			
			this._ws.send(PACK([rid, call].concat(args)));
		},
		_makeProperty: function(name) {
			var self = this;
			Object.defineProperty(this, name, {
				value: function() {
					var args = slice.call(arguments, 0);
					self._send(name, args);
				},
				enumerable: true
			});
		}
	};
	
	global.Repoc = { // Just making a more familiar call structure
		create: function(ws, cb) {
			new Repoc(ws, cb);
		}
	};
	// `Repoc.create(ws, init);` is a more familiar pattern than `var repoc = new Repoc(ws, init);`
	
})(this);