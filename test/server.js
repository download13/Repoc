var expect = require('./files/expect');
var ws = require('ws');
// TODO Need a WebSocket client module

var Repoc = require('../').Repoc;

var api = {
	timesTen: function(n, cb) {
		cb(n * 10);
	},
	returnE: function(cb) {
		cb(Math.E);
	}
};

var wss = ws.createServer(function(req, connection) {
	var repoc = new Repoc(connection, api);
}).listen(80);