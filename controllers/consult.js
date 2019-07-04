exports.install = function() {

	// Routes
    ROUTE('/consult/{user_id}', view_consult);
    ROUTE('/consult/{user_id}/{chat_id}', view_consultroom);

};

function view_consult(user_id) {
    var self = this;
    var options = {};

    options.user_id = user_id;
	self.view('consult',{consultroom: 'lobby',userid:user_id});
}

function view_consultroom(user_id,chat_id) {
    var self = this;
    var options = {};

    options.chat_id = chat_id;
    options.user_id = user_id;
	self.view('consult',{ consultroom: chat_id,userid: user_id });

}