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
const ChunkHandler = require('chunk-handler');
var chunk = new ChunkHandler();

// Set true to print the console.log
const wsdebug = F.config.ws_debug;

function base64FileHandler(dataString,filename) {
    var matches = dataString.split(';base64,');

    if ((matches == null) || (matches instanceof String)) return '';
    var ext = matches[0].split('/');
    var file = filename+'.'+ext[1];
    var date = new Date();
    switch(matches[0].toString().toLowerCase()) {
        case 'image':
            var subdir = 'images/socket/'+date.format('yyyy')+'/'+date.format('MM')+'/'+date.format('dd')+'/';
            break;
        default:
            var subdir = 'files/socket/'+date.format('yyyy')+'/'+date.format('MM')+'/'+date.format('dd')+'/';
    }

    var dir = F.path.public()+subdir;
    F.path.mkdir(dir);

    var hostdir = F.config.ws_upload_base+'/'+subdir+file;
    var input = dir+file;

    require('fs').writeFile(input, new Buffer.from(matches[1], 'base64'), function(err) {
        if (err) console.log(err);
    });
    return hostdir;
}

F.on("load", function() {
    this.io = socketio.listen(this.server).attach(this.server, {pingTimeout: F.config.ws_ping_timeout});

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

                switch(sendData.message_type_id) {
                    case 1: // case text
                        // no parse for text
                        break;
                    default:
                        if(sendData.isi_messages.indexOf(';base64,') > 0 ){
                            var parse = base64FileHandler(sendData.isi_messages,uuidv4());
                            if(parse) {
                                sendData.isi_messages = parse;
                            } else {
                                sendData.isi_messages = '';
                            }
                        } else {
                            // correction type message
                            sendData.message_type_id = 1;
                        }
                }
                // write logic to saving message to database with message status received in database
                if(wsconsult.hasKey(socket.rooms,[data.transaksi_konsul_id])){
                    // make sure text message is exist
                    if(sendData.isi_messages) {
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
                        socket.emit('message', JSON.parse(wsconsult.BalikanHeader('false','Pesan Anda gagal terkirim.','','')));
                        if(wsdebug) console.log(data.akun_id+': tidak dapat mengirim karena file corrupt');
                    }
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

        socket.on('chunkOpen',function(data){
            socket.emit('chunkReady',JSON.parse(wsconsult.BalikanHeader("true","Chunk "+data.name+" is ready to send.","","")));
            setTimeout(function(){
                var string = chunk.get(data.name);
                if(!chunk.isEmptyArray(string)) {
                    chunk.remove(data.name);
                    socket.emit('chunkTimeout',JSON.parse(wsconsult.BalikanHeader("false","Sending chunk "+data.name+" is timeout.","","")));
                    string = null;
                }
            },F.config.ws_chunk_timeout);
        });

        socket.on('chunkSend', function(data){
            chunk.add(data.name,data.chunk,data.part);
            var string = chunk.get(data.name);
            if(!chunk.isEmptyArray(string)) {
                if(data.length == string.length) {
                    var merge = chunk.merge(string);
                    var parse = base64FileHandler(merge,uuidv4());
                    if (parse) {
                        socket.emit('chunkComplete',JSON.parse(wsconsult.BalikanHeader("true","Chunk "+data.name+" is finish received.","",JSON.stringify(parse))));
                        // if there is message object then will send message after chunk is completed
                        if(!chunk.isEmpty(data.message) && !chunk.isEmptyObject(data.message)){
                            // Automatically send message
                            var sendData = {
                                transaksi_konsul_id:data.message.transaksi_konsul_id,
                                akun_id:data.message.akun_id,
                                akun_type:data.message.akun_type,
                                message_type_id:data.message.message_type_id,
                                isi_messages:parse
                            };

                            var validator = revalidator.validate(sendData,wsconsult.message_schema);
                            if(validator.valid){
                                sendData.messages_id = uuidv4();
                                sendData.messages_date = new Date().toISOString().replace("T", " ").replace("Z", "").substr(0,19);
                                sendData.messages_status_id=1;
                                sendData.status_active_id=1;
                                sendData.messages_date_modified='';

                                // write logic to saving message to database with message status received in database
                                if(wsconsult.hasKey(socket.rooms,[data.message.transaksi_konsul_id])){
                                    // make sure text message is exist
                                    if(sendData.isi_messages) {
                                        var resData = wsconsult.insertMessages(sendData); 
                                        if(wsconsult.hasKey(data.message,['nickname'])){
                                            resData.nickname = data.message.nickname;
                                            sendData.nickname = data.message.nickname;
                                        }
                                        if(wsdebug) console.log('Sending ', sendData);
                                        socket.broadcast.to(data.message.transaksi_konsul_id).emit('message', JSON.parse(resData));
                                        socket.broadcast.emit('newmessage', JSON.parse(wsconsult.BalikanHeader('true','Ada pesan baru','',JSON.stringify(sendData))));
                                        if(wsconsult.hasKey(data.message,['element_id'])){
                                            sendData.element_id = data.message.element_id;
                                        }
                                        socket.emit('delivered', JSON.parse(wsconsult.BalikanHeader('true','Pesan Anda berhasil terkirim','',JSON.stringify(sendData))));
                                    } else {
                                        socket.emit('message', JSON.parse(wsconsult.BalikanHeader('false','Pesan Anda gagal terkirim.','','')));
                                    }
                                } else {
                                    if(wsdebug) console.log(data.message.akun_id+': tidak dapat mengirim chat karena room telah nonaktif');
                                }
                            } else {
                                if(wsdebug) console.log(JSON.stringify(validator.errors));
                                socket.emit('message',JSON.parse(wsconsult.BalikanHeader("false","Ada kesalahan... "+ JSON.stringify(JSON.stringify(validator.errors)).substr(1).slice(0, -1),"error","")));
                            }
                        }

                    } else {
                        socket.emit('chunkError',JSON.parse(wsconsult.BalikanHeader("true","Sending chunk "+data.name+" is corrupted.","","")));
                    }
                    chunk.remove(data.name);
                }
            }
            string = null;
        });

    });
});

F.http('debug',options);
//F.cluster.http(5, 'release', options);