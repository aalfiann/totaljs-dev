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
const uuidv4 = require('uuid/v4');
var socketio = require('socket.io');
var revalidator = require('revalidator');

F.on("load", function() {
    this.io = socketio.listen(this.server);

    this.io.on('connection',function(socket){

        function BalikanHeader (stsres, stsdes, stsfal, datanya) {
            var teksnya;
            if (datanya == '') {
                teksnya = '{"sts_res":"' + stsres + '","sts_des":"' + stsdes + '","sts_fal":"' + stsfal + '"}';
            } else {
                teksnya = '{"sts_res":"' + stsres + '","sts_des":"' + stsdes + '","sts_fal":"' + stsfal + '", "data":[' + datanya + ']}';
            }
            return teksnya;
        }

        function validateConsult(transaksi_konsul_id){
            try {
                var sql = NOSQL('tr_transaksi_konsul');
                var tanggal = new Date().toISOString().replace("T", " ").replace("Z", "").substr(0,19);
                sql.find().make(function(builder) {
                    builder.where('transaksi_konsul_id', transaksi_konsul_id);
                    builder.where('tanggal_awal_chat','<=',tanggal);
                    builder.where('tanggal_akhir_chat','>=',tanggal);
                    builder.where('status_active_id',1);
                    builder.callback(function(err, response,count) {
                        if(count){
                            socket.emit('validateConsult',JSON.parse(BalikanHeader('true','Consult masih aktif','',JSON.stringify(response))));
                        } else {
                            socket.emit('validateConsult',JSON.parse(BalikanHeader('true','Consult telah expired','expired',JSON.stringify(response))));
                            socket.disconnect();
                        }
                    });
                });
            } catch (err) {
                socket.emit('validateConsult',JSON.parse(BalikanHeader("false","Ada kesalahan... " + err,"error","")));
                socket.disconnect();
            }
        }

        function loadMessages(transaksi_konsul_id){
            try {
                var sql = NOSQL('tr_chat_messages');
                sql.find().make(function(builder) {
                    builder.where('transaksi_konsul_id', transaksi_konsul_id);
                    builder.callback(function(err, response, count) {
                        if(count>0){
                            socket.emit('loadHistory',JSON.parse(BalikanHeader('true','History chat ditemukan','',JSON.stringify(response))));
                        } else {
                            socket.emit('loadHistory',JSON.parse(BalikanHeader('true','History chat tidak ditemukan','',JSON.stringify(response))));
                        }
                    });
                });
            } catch (err) {
                socket.emit('loadHistory',JSON.parse(BalikanHeader("false","Ada kesalahan... " + err,"error","")));
            }
        }

        function insertMessages(data){
            try {
                var sql = NOSQL('tr_chat_messages');
                sql.insert(data);
                return BalikanHeader('true','Pesan masuk','',JSON.stringify(data));
            } catch (err) {
                return BalikanHeader("false","Ada kesalahan... " + err,"error","");
            }
        }

        function messageIsRead(data){
            try {
                var sql = NOSQL('tr_chat_messages');
                sql.update({ messages_status_id: 3}).make(function(builder) {
                    builder.first();
                    builder.where('messages_id', data.messages_id);
                    builder.where('messages_status_id', '!=',3);
                    builder.callback(function(err,response,count) {
                        socket.broadcast.to(data.transaksi_konsul_id).emit('read', JSON.parse(BalikanHeader('true','Status pesan telah read','',JSON.stringify(data))));
                    });
                });
            } catch (err) {
                socket.broadcast.to(data.transaksi_konsul_id).emit('read', JSON.parse(BalikanHeader("false","Ada kesalahan... " + err,"error","")));
            }
        }

        function messageIsTyping(data){
            socket.broadcast.to(data.transaksi_konsul_id).emit('typed', JSON.parse(BalikanHeader('true','Sedang mengetik...','',JSON.stringify(data))));
        }

        console.log('Client id: '+socket.id+' is connected');

        socket.on('join', function(data) {
            console.log(data.akun_id+' is joining chat room: ', data.transaksi_konsul_id);
            socket.join(data.transaksi_konsul_id);
            socket.broadcast.to(data.transaksi_konsul_id).emit('joined', {
                date:new Date().toISOString().replace("T", " ").replace("Z", "").substr(0,19),
                akun_id:data.akun_id,
                isi_messages:'is join to this chat.'
            });
            // send emit to load event with json data message
            loadMessages(data.transaksi_konsul_id);
            // validate consult if expired then disconnect
            validateConsult(data.transaksi_konsul_id);
        });

        socket.on('message', function(data) {

            var message_schema = {
                type: 'object',
                required: true,
                properties: {
                    transaksi_konsul_id: {
                        type: 'string',
                        required: true
                    },
                    akun_id: {
                        type: 'string',
                        required: true
                    },
                    akun_type: {
                        type: 'number',
                        required: true
                    },
                    message_type_id: {
                        type: 'number',
                        required: true
                    },
                    isi_messages: {
                        type: 'string',
                        required: true
                    }
                }
            };

            var sendData = {
                transaksi_konsul_id:data.transaksi_konsul_id,
                akun_id:data.akun_id,
                akun_type:data.akun_type,
                message_type_id:data.message_type_id,
                isi_messages:data.isi_messages
            };

            var validator = revalidator.validate(sendData,message_schema);
            if(validator.valid){
                sendData.messages_id = uuidv4();
                sendData.messages_date = new Date().toISOString().replace("T", " ").replace("Z", "").substr(0,19);
                sendData.messages_status_id=1;
                // write logic to saving message to database with message status received in database
                var resData = insertMessages(sendData);
                console.log('sending ', sendData);
                socket.broadcast.to(data.transaksi_konsul_id).emit('received', JSON.parse(resData));
            } else {
                socket.emit('received',JSON.parse(BalikanHeader("false","Ada kesalahan... "+ JSON.stringify(JSON.stringify(validator.errors)).substr(1).slice(0, -1),"error","")));
            }
        });

        socket.on('reading', function(data) {
            // write logic to set message status to read in database
            messageIsRead(data);
        });

        socket.on('typing', function(data) {
            // write logic to send message status is typing
            messageIsTyping(data);
        });

        socket.on('disconnect', function (data) {
            console.log('Client '+ socket.id +' is disconnected');
        });

    });
});

F.http('debug');