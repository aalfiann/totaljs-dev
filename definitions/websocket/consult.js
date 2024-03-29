/**
 * Module for WS Consult Chat
 */

 // Require helper module
const helper = require(F.path.definitions('helper'));
const schema = require(F.path.definitions('websocket/consult.schema'));

/**
 * Determine in object has key
 * @param {*} data 
 * @param {string|array} name 
 * @return {bool}
 */
function hasKey(data,name){
    name = name instanceof Array ? name : [name];
	return name.every(key => Object.keys(data).includes(key));
}

/**
 * Validate the consult id
 * @param {string} transaksi_konsul_id 
 * @param {*} socket 
 * @return {callback} emit to validateConsult event or socket disconnect
 */
function validateConsult(transaksi_konsul_id,akun_id,akun_type,socket){
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
            builder.where('status_active_id',1);
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
    var tanggal = new Date().toISOString().replace("T", " ").replace("Z", "").substr(0,19)
    try {
        var sql = NOSQL('tr_chat_messages');
        sql.insert(data);
        var nosql = NOSQL('tr_transaksi_konsul');
        nosql.modify({date_latest_chat:tanggal}).make(function(builder){
            builder.where('transaksi_konsul_id',data.transaksi_konsul_id);
            builder.callback(function(err){
                if(err) console.log(err);
            });
        });
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
        var date_modified = new Date().toISOString().replace("T", " ").replace("Z", "").substr(0,19);
        sql.modify({ messages_status_id: 3, messages_date_modified:date_modified }).make(function(builder) {
            builder.take(1);
            builder.where('messages_id', data.messages_id);
            builder.where('messages_status_id', '!=',3);
            builder.callback(function(err,response,count) {
                if(count){
                    socket.broadcast.to(data.transaksi_konsul_id).emit('read', JSON.parse(helper.BalikanHeader('true','Status pesan telah read','',JSON.stringify(data))));
                }
            });
        });
    } catch (err) {
        socket.emit('read', JSON.parse(helper.BalikanHeader("false","Ada kesalahan... " + err,"error","")));
    }
}

/**
 * Broadcast event message is deleted to all client in same room
 * @param {*} data 
 * @param {*} socket 
 * @return {callback} emit to delete event
 */
function messageIsDeleted(data,socket){
    try {
        var sql = NOSQL('tr_chat_messages');
        var date_modified = new Date().toISOString().replace("T", " ").replace("Z", "").substr(0,19);
        sql.modify({ status_active_id: 2, messages_date_modified:date_modified }).make(function(builder) {
            builder.take(1);
            builder.where('akun_id', data.akun_id);
            builder.where('messages_id', data.messages_id);
            builder.where('status_active_id', '!=',2);
            builder.callback(function(err,response,count) {
                if(count){
                    socket.broadcast.to(data.transaksi_konsul_id).emit('delete', JSON.parse(helper.BalikanHeader('true','Pesan ini telah dihapus','',JSON.stringify(data))));
                } else {
                    socket.emit('delete', JSON.parse(helper.BalikanHeader('false','Anda hanya dapat menghapus pesan anda sendiri.','error','')));
                }
            });
        });
    } catch (err) {
        socket.emit('delete', JSON.parse(helper.BalikanHeader("false","Ada kesalahan... " + err,"error","")));
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
    messageIsDeleted,
    message_schema:schema.message_schema,
    join_schema:schema.join_schema,
    read_schema:schema.read_schema,
    delete_schema:schema.delete_schema,
    typing_schema:schema.typing_schema,
    loadhistory_schema:schema.loadhistory_schema,
    broadcastMessage,
    hasKey
}