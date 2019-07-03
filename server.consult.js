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

        socket.on('subscribe', function(chat_id) {
            console.log('joining chat room: ', chat_id);
            socket.join(chat_id);
        });

        socket.on('message', function(data) {
            console.log('sending ', {
                socket_id:socket.id,
                chat_id:data.chat_id,
                user_id:data.user_id,
                message:data.message
            });
            socket.broadcast.to(data.chat_id).emit('receive', {user_id:data.user_id,message:data.message});
        });

        socket.on('disconnect', function (data) {
            console.log('Client '+ socket.id +' disconnected');
        });

    });
});

F.http('debug');