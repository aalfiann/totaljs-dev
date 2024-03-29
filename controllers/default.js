exports.install = function() {
	// Sets cors for this all API
	CORS('/api/*', ['get', 'post', 'put', 'delete'], true);
	
	ROUTE('/', plain_version);
	ROUTE('/.well-known/acme-challenge/{id}', acme);
	F.route('/socket', view_socket);
	F.route('/socket2', view_socket);
	ROUTE('/timeout_test', timeout_test, [ timeout= 15000 ]);
};

function acme() {
	var self = this;
	var content = 'this is the content from certbot certonly --manual';
	self.plain(content);
}

function plain_version() {
	var self = this;
	self.plain('REST Service {0}\nVersion: {1}'.format(F.config.name, F.config.version));
}

function view_socket() {
	var self = this;
	self.view('index');
}

function timeout_test() {
    var self = this;
	
    console.log('I am here.');

    setTimeout(function() {
        self.view('index');
	}, 10000);
}