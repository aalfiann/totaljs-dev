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

//======================================
// BELOW HERE IS TO RUN SOCKET SERVER   
//======================================
options.port = '7780';
const uuidv4 = require('uuid/v4');
var socketio = require('socket.io');
var revalidator = require('revalidator');
var wsconsult = require(F.path.definitions('wsconsult'));

// Set true to print the console.log
const wsdebug = true;

F.on("load", function() {
    this.io = socketio.listen(this.server);

    this.io.on('connection',function(socket){
        
        if(wsdebug) console.log('Client id: '+socket.id+' is connected');

        socket.on('join', function(data) {
            if(wsdebug) console.log(data.akun_id+' is joining chat room: ', data.transaksi_konsul_id);
            socket.join(data.transaksi_konsul_id);
            // send emit to joined event
            wsconsult.joinRoom(data,socket);
            // send emit to load history event
            wsconsult.loadMessages(data.transaksi_konsul_id,socket);
            // validate consult if expired then disconnect
            wsconsult.validateConsult(data.transaksi_konsul_id,socket);
        });

        socket.on('message', function(data) {
            var sendData = {
                transaksi_konsul_id:data.transaksi_konsul_id,
                akun_id:data.akun_id,
                akun_type:data.akun_type,
                message_type_id:data.message_type_id,
                isi_messages:data.isi_messages
            };

            var validator = revalidator.validate(sendData,wsconsult.message_schema);
            if(validator.valid){
                sendData.messages_id = uuidv4();
                sendData.messages_date = new Date().toISOString().replace("T", " ").replace("Z", "").substr(0,19);
                sendData.messages_status_id=1;
                // write logic to saving message to database with message status received in database
                var resData = wsconsult.insertMessages(sendData);
                if(wsdebug) console.log('sending ', sendData);
                socket.broadcast.to(data.transaksi_konsul_id).emit('message', JSON.parse(resData));
            } else {
                if(wsdebug) console.log(JSON.stringify(validator.errors));
                socket.emit('message',JSON.parse(wsconsult.BalikanHeader("false","Ada kesalahan... "+ JSON.stringify(JSON.stringify(validator.errors)).substr(1).slice(0, -1),"error","")));
            }
        });

        socket.on('read', function(data) {
            wsconsult.messageIsRead(data,socket);
        });

        socket.on('typing', function(data) {
            wsconsult.messageIsTyping(data,socket);
        });

        socket.on('disconnect', function (data) {
            if(wsdebug) console.log('Client '+ socket.id +' is disconnected');
        });

    });
});

F.http('consult',options);