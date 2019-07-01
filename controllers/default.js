exports.install = function() {
	// Sets cors for this all API
	CORS('/api/*', ['get', 'post', 'put', 'delete'], true);
	
	ROUTE('/', plain_version);
	F.route('/socket', view_socket);
};

function plain_version() {
	var self = this;
	self.plain('REST Service {0}\nVersion: {1}'.format(F.config.name, F.config.version));
}

function view_socket() {
	var self = this;
	self.view('index');
}