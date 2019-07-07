/**
 * Module for WS Consult Chat
 */

 // Require helper module
const helper = require(F.path.definitions('helper'));

/**
 * Schema Message for validate the socket request 
 * @return {object}
 */
function message_schema(){
    return {
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
}

/**
 * Validate the consult id
 * @param {string} transaksi_konsul_id 
 * @param {*} socket 
 * @return {callback} emit to validateConsult event or socket disconnect
 */
function validateConsult(transaksi_konsul_id,socket){
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
                    socket.emit('validateConsult',JSON.parse(helper.BalikanHeader('true','Consult masih aktif','',JSON.stringify(response))));
                } else {
                    socket.emit('validateConsult',JSON.parse(helper.BalikanHeader('true','Consult telah expired','expired',JSON.stringify(response))));
                    socket.leave(transaksi_konsul_id);

                }
            });
        });
    } catch (err) {
        socket.emit('validateConsult',JSON.parse(helper.BalikanHeader("false","Ada kesalahan... " + err,"error","")));
        socket.leave(transaksi_konsul_id);
    }
}

/**
 * Load History Messages
 * @param {string} transaksi_konsul_id 
 * @param {*} socket 
 * @return {callback} emit to loadHistory event
 */
function loadMessages(transaksi_konsul_id,socket){
    try {
        var sql = NOSQL('tr_chat_messages');
        sql.find().make(function(builder) {
            builder.where('transaksi_konsul_id', transaksi_konsul_id);
            builder.callback(function(err, response, count) {
                if(count>0){
                    socket.emit('loadHistory',JSON.parse(helper.BalikanHeader('true','History chat ditemukan','',JSON.stringify(response))));
                } else {
                    socket.emit('loadHistory',JSON.parse(helper.BalikanHeader('true','History chat tidak ditemukan','',JSON.stringify(response))));
                }
            });
        });
    } catch (err) {
        socket.emit('loadHistory',JSON.parse(helper.BalikanHeader("false","Ada kesalahan... " + err,"error","")));
    }
}

/**
 * Insert Messages to database
 * @param {*} data 
 * @return {string} 
 */
function insertMessages(data){
    try {
        var sql = NOSQL('tr_chat_messages');
        sql.insert(data);
        return helper.BalikanHeader('true','Pesan masuk','',JSON.stringify(data));
    } catch (err) {
        return helper.BalikanHeader("false","Ada kesalahan... " + err,"error","");
    }
}

/**
 * Broadcast to all client if new user has joined to the chat room
 * @param {*} data
 * @param {*} socket
 * @return {callback} emit to join event 
 */
function joinRoom(data,socket){
    data.date = new Date().toISOString().replace("T", " ").replace("Z", "").substr(0,19);
    data.isi_messages = 'is join to this chat.';
    socket.broadcast.to(data.transaksi_konsul_id).emit('join', 
    JSON.parse(helper.BalikanHeader('true','Berhasil join to chatroom','',JSON.stringify(data))));
}

/**
 * Broadcast Message to all client except sender
 * @param {*} data 
 * @param {*} socket 
 * @return {callback} emit to broadcast event
 */
function broadcastMessage(data,socket){
    socket.broadcast.emit('broadcast', JSON.parse(helper.BalikanHeader('true','Ada pesan broadcast baru','',JSON.stringify(data))));
}

/**
 * Broadcast event message is typing to all client in same room
 * @param {*} data 
 * @param {*} socket 
 * @return {callback} emit to typing event
 */
function messageIsTyping(data,socket){
    socket.broadcast.to(data.transaksi_konsul_id).emit('typing', JSON.parse(helper.BalikanHeader('true','Sedang mengetik...','',JSON.stringify(data))));
}

/**
 * Broadcast event message is read to all client in same room
 * @param {*} data 
 * @param {*} socket 
 * @return {callback} emit to read event
 */
function messageIsRead(data,socket){
    try {
        var sql = NOSQL('tr_chat_messages');
        sql.update({ messages_status_id: 3}).make(function(builder) {
            builder.take(1);
            builder.where('messages_id', data.messages_id);
            builder.where('messages_status_id', '!=',3);
            builder.callback(function(err,response,count) {
                socket.broadcast.to(data.transaksi_konsul_id).emit('read', JSON.parse(helper.BalikanHeader('true','Status pesan telah read','',JSON.stringify(data))));
            });
        });
    } catch (err) {
        socket.broadcast.to(data.transaksi_konsul_id).emit('read', JSON.parse(helper.BalikanHeader("false","Ada kesalahan... " + err,"error","")));
    }
}

module.exports = {
    BalikanHeader : function(stsres, stsdes, stsfal, datanya){
        return helper.BalikanHeader(stsres, stsdes, stsfal, datanya);
    },
    joinRoom,
    validateConsult,
    loadMessages,
    insertMessages,
    messageIsTyping,
    messageIsRead,
    message_schema,
    broadcastMessage
}