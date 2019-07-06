// ===================================================
// FOR DEVELOPMENT
// Total.js - framework for Node.js platform
// https://www.totaljs.com
// ===================================================

const options = {};

// options.ip = '127.0.0.1';
// options.port = parseInt(process.argv[2]);
// options.config = { name: 'Total.js' };
// options.sleep = 3000;
// options.inspector = 9229;
// options.watch = ['private'];

//require('total.js/debug')(options);

require('total.js')

// Below here is required to run socket client in UI only
var socketio = require('socket.io');

F.on("load", function() {
    this.io = socketio.listen(this.server);
});

F.http('debug');