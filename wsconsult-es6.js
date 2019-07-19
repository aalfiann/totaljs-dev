// ===================================================
// FOR UNIT-TESTING
// Total.js - framework for Node.js platform
// https://www.totaljs.com
// ===================================================

const options = {};

// options.ip = '127.0.0.1';
// options.port = parseInt(process.argv[2]);
// options.config = { name: 'Total.js' };
// options.sleep = 3000;

require('total.js')

//======================================
// BELOW HERE IS TO RUN SOCKET SERVER   
//======================================
options.port = '7780';

const uuidv4 = require('uuid/v4');
const socketio = require('socket.io');
const revalidator = require('revalidator');

var WSConsult = require(F.path.definitions('websocket-es6/consult'));
var ws = new WSConsult();

// Set true to print the console.log
var wsdebug = true;

F.on("load", function() {
    this.io = socketio.listen(this.server);

    this.io.on('connection',function(socket){
        
        if(wsdebug) console.log('Client id: '+socket.id+' is connected');

        socket.on('join', function(data) {
            var validator = revalidator.validate(data,ws.join_schema());
            if(validator.valid){
                if(wsdebug) console.log(data.akun_id+': is joining chat room: ', data.transaksi_konsul_id);
                socket.join(data.transaksi_konsul_id);
                // send emit to joined event
                ws.joinRoom(data,socket);
                ws.validateConsult(data.transaksi_konsul_id,data.akun_id,data.akun_type,socket);
            } else {
                if(wsdebug) console.log(JSON.stringify(validator.errors));
                socket.emit('join',JSON.parse(ws.BalikanHeader("false","Ada kesalahan... "+ JSON.stringify(JSON.stringify(validator.errors)).substr(1).slice(0, -1),"error","")));
            }
        });

        socket.on('loadHistory', function(data){
            var validator = revalidator.validate(data,ws.loadhistory_schema());
            if(validator.valid){
                ws.loadMessages(data.transaksi_konsul_id,socket);
            } else {
                if(wsdebug) console.log(JSON.stringify(validator.errors));
                socket.emit('loadHistory',JSON.parse(ws.BalikanHeader("false","Ada kesalahan... "+ JSON.stringify(JSON.stringify(validator.errors)).substr(1).slice(0, -1),"error","")));
            }
        });

        socket.on('message', function(data) {
            var sendData = {
                transaksi_konsul_id:data.transaksi_konsul_id,
                akun_id:data.akun_id,
                akun_type:data.akun_type,
                message_type_id:data.message_type_id,
                isi_messages:data.isi_messages
            };

            var validator = revalidator.validate(sendData,ws.message_schema());
            if(validator.valid){
                sendData.messages_id = uuidv4();
                sendData.messages_date = new Date().toISOString().replace("T", " ").replace("Z", "").substr(0,19);
                sendData.messages_status_id=1;
                sendData.status_active_id=1;
                sendData.messages_date_modified='';
                // write logic to saving message to database with message status received in database
                if(wsconsult.hasKey(socket.rooms,[data.transaksi_konsul_id])){
                    var resData = ws.insertMessages(sendData); 
                    if(ws.hasKey(data,['nickname'])){
                        resData.nickname = data.nickname;
                        sendData.nickname = data.nickname;
                    }
                    if(wsdebug) console.log('sending ', sendData);
                    socket.broadcast.to(data.transaksi_konsul_id).emit('message', JSON.parse(resData));
                    socket.broadcast.emit('newmessage', JSON.parse(ws.BalikanHeader('true','Ada pesan baru','',JSON.stringify(sendData))));
                } else {
                    if(wsdebug) console.log(data.akun_id+': tidak dapat mengirim chat karena room telah nonaktif');
                }
            } else {
                if(wsdebug) console.log(JSON.stringify(validator.errors));
                socket.emit('message',JSON.parse(ws.BalikanHeader("false","Ada kesalahan... "+ JSON.stringify(JSON.stringify(validator.errors)).substr(1).slice(0, -1),"error","")));
            }
        });

        socket.on('broadcast', function(data) {
            ws.broadcastMessage(data,socket);
        });

        socket.on('read', function(data) {
            var validator = revalidator.validate(data,ws.read_schema());
            if(validator.valid){
                ws.messageIsRead(data,socket);
            } else {
                if(wsdebug) console.log(JSON.stringify(validator.errors));
                socket.emit('read',JSON.parse(ws.BalikanHeader("false","Ada kesalahan... "+ JSON.stringify(JSON.stringify(validator.errors)).substr(1).slice(0, -1),"error","")));
            }
        });

        socket.on('delete', function(data) {
            var validator = revalidator.validate(data,ws.delete_schema());
            if(validator.valid){
                ws.messageIsDeleted(data,socket);
            } else {
                if(wsdebug) console.log(JSON.stringify(validator.errors));
                socket.emit('delete',JSON.parse(ws.BalikanHeader("false","Ada kesalahan... "+ JSON.stringify(JSON.stringify(validator.errors)).substr(1).slice(0, -1),"error","")));
            }
        });

        socket.on('typing', function(data) {
            var validator = revalidator.validate(data,ws.typing_schema());
            if(validator.valid){
                ws.messageIsTyping(data,socket);
            } else {
                if(wsdebug) console.log(JSON.stringify(validator.errors));
                socket.emit('typing',JSON.parse(ws.BalikanHeader("false","Ada kesalahan... "+ JSON.stringify(JSON.stringify(validator.errors)).substr(1).slice(0, -1),"error","")));
            }
        });

        socket.on('disconnect', function (data) {
            if(wsdebug) console.log('Client '+ socket.id +' is disconnected');
        });

    });
});

F.http('debug', options);