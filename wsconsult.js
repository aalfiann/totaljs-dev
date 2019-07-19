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
var wsconsult = require(F.path.definitions('websocket/consult'));

// Set true to print the console.log
const wsdebug = true;

F.on("load", function() {
    this.io = socketio.listen(this.server);

    this.io.on('connection',function(socket){
        
        if(wsdebug) console.log('Client id: '+socket.id+' is connected');

        socket.on('join', function(data) {
            var validator = revalidator.validate(data,wsconsult.join_schema);
            if(validator.valid){
                if(wsdebug) console.log(data.akun_id+': is joining chat room: ', data.transaksi_konsul_id);
                socket.join(data.transaksi_konsul_id);
                // send emit to joined event
                wsconsult.joinRoom(data,socket);
                wsconsult.validateConsult(data.transaksi_konsul_id,data.akun_id,data.akun_type,socket);
            } else {
                if(wsdebug) console.log(JSON.stringify(validator.errors));
                socket.emit('join',JSON.parse(wsconsult.BalikanHeader("false","Ada kesalahan... "+ JSON.stringify(JSON.stringify(validator.errors)).substr(1).slice(0, -1),"error","")));
            }
        });

        socket.on('loadHistory', function(data){
            var validator = revalidator.validate(data,wsconsult.loadhistory_schema);
            if(validator.valid){
                wsconsult.loadMessages(data.transaksi_konsul_id,socket);
            } else {
                if(wsdebug) console.log(JSON.stringify(validator.errors));
                socket.emit('loadHistory',JSON.parse(wsconsult.BalikanHeader("false","Ada kesalahan... "+ JSON.stringify(JSON.stringify(validator.errors)).substr(1).slice(0, -1),"error","")));
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

            var validator = revalidator.validate(sendData,wsconsult.message_schema);
            if(validator.valid){
                sendData.messages_id = uuidv4();
                sendData.messages_date = new Date().toISOString().replace("T", " ").replace("Z", "").substr(0,19);
                sendData.messages_status_id=1;
                sendData.status_active_id=1;
                sendData.messages_date_modified='';
                // write logic to saving message to database with message status received in database
                if(wsconsult.hasKey(socket.rooms,[data.transaksi_konsul_id])){
                    var resData = wsconsult.insertMessages(sendData); 
                    if(wsconsult.hasKey(data,['nickname'])){
                        resData.nickname = data.nickname;
                        sendData.nickname = data.nickname;
                    }
                    if(wsdebug) console.log('Sending ', sendData);
                    socket.broadcast.to(data.transaksi_konsul_id).emit('message', JSON.parse(resData));
                    socket.broadcast.emit('newmessage', JSON.parse(wsconsult.BalikanHeader('true','Ada pesan baru','',JSON.stringify(sendData))));
                    if(wsconsult.hasKey(data,['element_id'])){
                        sendData.element_id = data.element_id;
                    }
                    socket.emit('delivered', JSON.parse(wsconsult.BalikanHeader('true','Pesan Anda berhasil terkirim','',JSON.stringify(sendData))));
                } else {
                    if(wsdebug) console.log(data.akun_id+': tidak dapat mengirim chat karena room telah nonaktif');
                }
            } else {
                if(wsdebug) console.log(JSON.stringify(validator.errors));
                socket.emit('message',JSON.parse(wsconsult.BalikanHeader("false","Ada kesalahan... "+ JSON.stringify(JSON.stringify(validator.errors)).substr(1).slice(0, -1),"error","")));
            }
        });

        socket.on('broadcast', function(data) {
            wsconsult.broadcastMessage(data,socket);
        });

        socket.on('read', function(data) {
            var validator = revalidator.validate(data,wsconsult.read_schema);
            if(validator.valid){
                wsconsult.messageIsRead(data,socket);
            } else {
                if(wsdebug) console.log(JSON.stringify(validator.errors));
                socket.emit('read',JSON.parse(wsconsult.BalikanHeader("false","Ada kesalahan... "+ JSON.stringify(JSON.stringify(validator.errors)).substr(1).slice(0, -1),"error","")));
            }
        });

        socket.on('delete', function(data) {
            var validator = revalidator.validate(data,wsconsult.delete_schema);
            if(validator.valid){
                wsconsult.messageIsDeleted(data,socket);
            } else {
                if(wsdebug) console.log(JSON.stringify(validator.errors));
                socket.emit('delete',JSON.parse(wsconsult.BalikanHeader("false","Ada kesalahan... "+ JSON.stringify(JSON.stringify(validator.errors)).substr(1).slice(0, -1),"error","")));
            }
        });
        
        socket.on('typing', function(data) {
            var validator = revalidator.validate(data,wsconsult.typing_schema);
            if(validator.valid){
                wsconsult.messageIsTyping(data,socket);
            } else {
                if(wsdebug) console.log(JSON.stringify(validator.errors));
                socket.emit('typing',JSON.parse(wsconsult.BalikanHeader("false","Ada kesalahan... "+ JSON.stringify(JSON.stringify(validator.errors)).substr(1).slice(0, -1),"error","")));
            }
        });

        socket.on('disconnect', function (data) {
            if(wsdebug) console.log('Client '+ socket.id +' is disconnected');
        });

    });
});

F.http('debug',options);
//F.cluster.http(5, 'release', options);