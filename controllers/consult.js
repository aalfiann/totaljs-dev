exports.install = function() {

	// Routes
    ROUTE('/consult/', view_consult);
    ROUTE('/consult/{chat_id}/{user_id}', view_consultroom);

};

function view_consult() {
    var self = this;
	self.view('consult',{consultroom: 'lobby',userid:UID()});
}

function view_consultroom(chat_id,user_id) {
    var self = this;
    var options = {};

    options.chat_id = chat_id;
    options.user_id = user_id;
	self.view('consult',{ consultroom: chat_id,userid: user_id });

}