exports.install = function() {

	// Routes
    ROUTE('/chat/', view_chat);
	ROUTE('/chat/{chat_id}/{user_id}', view_chatroom);

};

function view_chat() {
    var self = this;
	self.view('index',{chatroom: 'lobby',userid:UID()});
}

function view_chatroom(chat_id,user_id) {
    var self = this;
    var options = {};

    options.chat_id = chat_id;
    options.user_id = user_id;
	self.view('index',{ chatroom: chat_id,userid: user_id });

}