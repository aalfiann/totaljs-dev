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

        console.log('Client id: '+socket.id+' is connected');

        socket.emit('onConsultActive',function(data) {
            // check is chat_id active or not (if not then info client with expired information)
        });

        socket.on('subscribe', function(data) {
            console.log(data.user_id+' is joining chat room: ', data.chat_id);
            socket.join(data.chat_id);
            socket.broadcast.to(data.chat_id).emit('receive', {date:data.date,user_id:data.user_id,message:'is join to this chat.'});
            // write logic to load history chat and make them status in read (check who is the owner of the message)
            // send emit to load event with json data message
        });

        socket.on('message', function(data) {
            console.log('sending ', {
                socket_id:socket.id,
                chat_id:data.chat_id,
                user_id:data.user_id,
                date:data.date,
                message:data.message
            });
            socket.broadcast.to(data.chat_id).emit('receive', {date:data.date,user_id:data.user_id,message:data.message});
            // write logic to saving message to database with message status received in database
        });

        socket.on('isRead', function(data) {
            // write logic to set message status to read in database
        });

        socket.on('isTyping', function(data) {
            // write logic to send message status is typing
        });

        socket.on('disconnect', function (data) {
            console.log('Client '+ socket.id +' is disconnected');
        });

    });
});

F.http('debug');