NEWSCHEMA('Profile').make(function(schema) {

	schema.define('id', 'string', true);
	schema.define('about', 'string');
	schema.define('address', 'string');

	schema.setSave(function($) {

		var profile = NOSQL('profile');

		// Removes hidden properties of the SchemaBuilder
		var data = $.model.$clean();

		// Checks if the profile exists
		if ($.model.id) {

			// Validate profile 
			profile.find().make(function(builder) {
				builder.where('id', $.model.id);
				builder.callback(function(err, count) {
					if(count > 0){

						data.dateupdated = F.datetime;

						// We don't need to modify id
						data.id = undefined;

						profile.modify(data).backup().make(function(builder) {
							builder.where('id', $.model.id);
							builder.callback(SUCCESS($.callback));
						});

					} else {
						data.datecreated = F.datetime;
						profile.insert(data).callback(SUCCESS($.callback));
					}
				});
			});

		} else {
			//data.id = $.model.id;
			data.datecreated = F.datetime;
			profile.insert(data).callback(SUCCESS($.callback));

		}

	});

	schema.setGet(function($) {

		var profile = NOSQL('profile');

		// Reads the user profile
		profile.one().make(function(builder) {
			builder.where('id', $.options.id);
			builder.callback($.callback, 'error-users-404');
		});

	});

	schema.setQuery(function($) {

		var profile = NOSQL('profile');
		var options = $.options;

		// Reads the profile
		profile.find()
			.join('id', NOSQL('users'))
			.on('id', 'id')
			.first()
			.make(function(builder) {

			if (options.search) {
				builder.or();
				builder.search('firstname', options.search);
				builder.search('lastname', options.search);
				builder.end();
			}
			
			builder.fields('id', 'firstname', 'lastname', 'about', 'address', 'datecreated');
			builder.callback($.callback);
		});

	});

	schema.setRemove(function($) {

		var profile = NOSQL('profile');

		// Removes the profile
		profile.remove().backup().make(function(builder) {
			builder.where('id', $.options.id);
			builder.callback(SUCCESS($.callback));
		});

	});
});