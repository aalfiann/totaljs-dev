NEWSCHEMA('Product').make(function(schema) {

	schema.define('ID', 'UID');
	schema.define('Name', 'Capitalize(30)', true);
	schema.define('Categories', 'Capitalize(30)', true);
	schema.define('Price', 'string');
	schema.define('Stock', 'string');
	schema.define('Date', 'date');

	schema.setSave(function($) {

		var products = NOSQL('products');

		// Removes hidden properties of the SchemaBuilder
		var data = $.model.$clean();

		// Checks if the product exists
		if ($.model.ID) {

			data.Date_updated = F.datetime;

			// We don't need to modify
			data.ID = undefined;
			data.Date = undefined;

			products.modify(data).backup().make(function(builder) {
				builder.where('ID', $.model.ID);
				builder.callback(SUCCESS($.callback));
			});

		} else {

			data.ID = UID();
			data.Date = F.datetime;
			products.insert(data).callback(SUCCESS($.callback));

		}

	});

	schema.setGet(function($) {

		var products = NOSQL('products');

		// Reads the product
		products.one().make(function(builder) {
			builder.where('ID', $.options.ID);
			builder.callback($.callback, 'error-products-404');
		});

	});

	schema.setQuery(function($) {

		var products = NOSQL('products');
		var options = $.options;

		// Reads the product
		products.find().make(function(builder) {

			if (options.search) {
				builder.or();
				builder.search('Name', options.search);
				builder.search('Categories', options.search);
				builder.end();
			}

			builder.fields('ID', 'Name', 'Categories', 'Price', 'Stock', 'Date', 'Date_updated');
			builder.callback($.callback);
		});

	});

	schema.setRemove(function($) {

		var products = NOSQL('products');

		// Removes the product
		products.remove().backup().make(function(builder) {
			builder.where('ID', $.options.ID);
			builder.callback(SUCCESS($.callback));
		});

	});
});