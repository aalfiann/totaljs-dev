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

var socketio = require('socket.io');

F.on("load", function() {
    this.io = socketio.listen(this.server);

    this.io.on('connection',function(socket){
        
        console.log('New connection id: '+socket.id);

        socket.on('message',function(data){
            console.log(data);
            socket.broadcast.emit('receive',data.message);
        });

        socket.on('disconnect', function (data) {
            console.log('Client '+ socket.id +' disconnected')
        });

    });
});

F.http('debug');