/**
 * WS Consult Chat
 */
const ConsultSchema = require(F.path.definitions('websocket-es6/consult.schema.js'));
const helper = require(F.path.definitions('helper'));

"use strict";

    class Consult extends ConsultSchema {

        /**
         * BalikanHeader untuk standarisasi output json response
         * @param {string} stsres
         * @param {string} stsdes
         * @param {string} stsfal
         * @param {jsonstring} datanya 
         * @return {jsonstring}
         */
        BalikanHeader(stsres, stsdes, stsfal, datanya){
        	return helper.BalikanHeader(stsres, stsdes, stsfal, datanya);
        }

        /**
         * Determine in object has key
         * @param {*} data 
         * @param {string|array} name 
         * @return {bool}
         */
        hasKey(data,name){
            name = name instanceof Array ? name : [name];
        	return name.every(key => Object.keys(data).includes(key));
        }

        /**
         * Validate the consult id
         * @param {string} transaksi_konsul_id 
         * @param {*} socket 
         * @return {callback} emit to validateConsult event or socket disconnect
         */
        validateConsult(transaksi_konsul_id,akun_id,akun_type,socket){
            var self = this;
            try {
                var sql = NOSQL('tr_transaksi_konsul');
                var tanggal = new Date().toISOString().replace("T", " ").replace("Z", "").substr(0,19);
                sql.find().make(function(builder) {
                    builder.where('transaksi_konsul_id', transaksi_konsul_id);
                    builder.where('tanggal_awal_chat','<=',tanggal);
                    builder.where('tanggal_akhir_chat','>=',tanggal);
                    builder.where('status_active_id',1);
                    if(akun_type == 1){
                        builder.where('user_id',akun_id);
                    } else if (akun_type == 2) {
                        builder.where('mitra_id',akun_id);
                    }
                    builder.callback(function(err, response,count) {
                        if(count){
                            socket.emit('validateConsult',JSON.parse(self.BalikanHeader('true','Consult masih aktif','',JSON.stringify(response))));
                        } else {
                            socket.emit('validateConsult',JSON.parse(self.BalikanHeader('true','Consult telah expired','expired',JSON.stringify(response))));
                            socket.leave(transaksi_konsul_id);
                        }
                    });
                });
            } catch (err) {
                socket.emit('validateConsult',JSON.parse(self.BalikanHeader("false","Ada kesalahan... " + err,"error","")));
                socket.leave(transaksi_konsul_id);
            }
        }

        /**
         * Load History Messages
         * @param {string} transaksi_konsul_id 
         * @param {*} socket 
         * @return {callback} emit to loadHistory event
         */
        loadMessages(transaksi_konsul_id,socket){
            var self = this;
            try {
                var sql = NOSQL('tr_chat_messages');
                sql.find().make(function(builder) {
                    builder.where('transaksi_konsul_id', transaksi_konsul_id);
                    builder.callback(function(err, response, count) {
                        if(count>0){
                            socket.emit('loadHistory',JSON.parse(self.BalikanHeader('true','History chat ditemukan','',JSON.stringify(response))));
                        } else {
                            socket.emit('loadHistory',JSON.parse(self.BalikanHeader('true','History chat tidak ditemukan','',JSON.stringify(response))));
                        }
                    });
                });
            } catch (err) {
                socket.emit('loadHistory',JSON.parse(self.BalikanHeader("false","Ada kesalahan... " + err,"error","")));
            }
        }

        /**
         * Insert Messages to database
         * @param {*} data 
         * @return {string} 
         */
        insertMessages(data){
            var self = this;
            try {
                var sql = NOSQL('tr_chat_messages');
                sql.insert(data);
                return self.BalikanHeader('true','Pesan masuk','',JSON.stringify(data));
            } catch (err) {
                return self.BalikanHeader("false","Ada kesalahan... " + err,"error","");
            }
        }

        /**
         * Broadcast to all client if new user has joined to the chat room
         * @param {*} data
         * @param {*} socket
         * @return {callback} emit to join event 
         */
        joinRoom(data,socket){
            var self = this;
            data.date = new Date().toISOString().replace("T", " ").replace("Z", "").substr(0,19);
            data.isi_messages = 'is join to this chat.';
            socket.broadcast.to(data.transaksi_konsul_id).emit('join', 
            JSON.parse(self.BalikanHeader('true','Berhasil join to chatroom','',JSON.stringify(data))));
        }

        /**
         * Broadcast Message to all client except sender
         * @param {*} data 
         * @param {*} socket 
         * @return {callback} emit to broadcast event
         */
        broadcastMessage(data,socket){
            var self = this;
            socket.broadcast.emit('broadcast', JSON.parse(self.BalikanHeader('true','Ada pesan broadcast baru','',JSON.stringify(data))));
        }

        /**
         * Broadcast event message is typing to all client in same room
         * @param {*} data 
         * @param {*} socket 
         * @return {callback} emit to typing event
         */
        messageIsTyping(data,socket){
            var self = this;
            socket.broadcast.to(data.transaksi_konsul_id).emit('typing', JSON.parse(self.BalikanHeader('true','Sedang mengetik...','',JSON.stringify(data))));
        }

        /**
         * Broadcast event message is read to all client in same room
         * @param {*} data 
         * @param {*} socket 
         * @return {callback} emit to read event
         */
        messageIsRead(data,socket){
            var self = this;
            try {
                var sql = NOSQL('tr_chat_messages');
                sql.update({ messages_status_id: 3}).make(function(builder) {
                    builder.take(1);
                    builder.where('messages_id', data.messages_id);
                    builder.where('messages_status_id', '!=',3);
                    builder.callback(function(err,response,count) {
                        socket.broadcast.to(data.transaksi_konsul_id).emit('read', JSON.parse(self.BalikanHeader('true','Status pesan telah read','',JSON.stringify(data))));
                    });
                });
            } catch (err) {
                socket.broadcast.to(data.transaksi_konsul_id).emit('read', JSON.parse(self.BalikanHeader("false","Ada kesalahan... " + err,"error","")));
            }
        }

    }

    module.exports = Consult;