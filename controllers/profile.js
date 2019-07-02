exports.install = function() {
	// Routes
	ROUTE('/api/profile/', json_query, ['*Profile']);
	ROUTE('/api/profile/', json_save, ['*Profile', 'post']);
    ROUTE('/api/profile/{id}/', json_read, ['*Profile']);
};

function json_query() {
	var self = this;
	var options = {};

	options.search = self.query.search;

	self.$query(options, self.callback());
}

function json_read(id) {
	var self = this;
	var options = {};

	options.id = id;

	self.$get(options, self.callback());
}

function json_save(id) {
	var self = this;

	if (id)
		self.body.id = id;

	self.$save(self.callback());
}

function json_delete(id) {
	var self = this;
	var options = {};

	options.id = id;

	self.$remove(options, self.callback());
}