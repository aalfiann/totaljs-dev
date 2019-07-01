exports.install = function() {

	// Routes
	ROUTE('/api/products/',      product_query,   ['*Product', 'authorize']);
	ROUTE('/api/products/{id}/', product_read,    ['*Product', 'authorize']);
	ROUTE('/api/products/',      product_save,    ['*Product', 'authorize', 'post']);
	ROUTE('/api/products/{id}/', product_save,    ['*Product', 'authorize', 'put']);
	ROUTE('/api/products/{id}/', product_delete,  ['*Product', 'authorize', 'delete']);

};

function product_query() {
	var self = this;
	var options = {};

	options.search = self.query.search;

	self.$query(options, self.callback());
}

function product_read(id) {
	var self = this;
	var options = {};

	options.ID = id;

	self.$get(options, self.callback());
}

function product_save(id) {
	var self = this;

	if (id)
		self.body.ID = id;

	self.$save(self.callback());
}

function product_delete(id) {
	var self = this;
	var options = {};

	options.ID = id;

	self.$remove(options, self.callback());
}