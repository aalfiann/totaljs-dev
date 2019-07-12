var helper = require(F.path.definitions('helper'));
var DataTransform = require("node-json-transform").DataTransform;

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

		var users = NOSQL('users');
		var options = $.options;

		// Reads the profile
		users.find()
			.make(function(builder) {
				var profile = builder.join('id', NOSQL('profile')).on('id', 'id');
				profile.first();
				if (options.search) {
					builder.or();
					builder.search('firstname', options.search);
					builder.search('lastname', options.search);
					builder.end();
				}
			
				builder.callback(function (err,response,count){
					if(count>0){
						var data = {
							json:response
						};

						var map = {
							list : 'json',
							item: {
								id: "id.id",
								datecreated: "datecreated",
								firstname: "firstname",
								lastname: "lastname",
								about: "id.about",
								address: "id.address"
							},
							operate: [
								{
									run: function(val) { 
										return new Date(val).toISOString().replace("T", " ").replace("Z", "").substr(0,19)
									},
									on: "datecreated"
								}
							]
						};
						var dataTransform = DataTransform(data, map);
						var result = dataTransform.transform();
						$.callback(JSON.parse(helper.BalikanHeaderSudahArray('true','Data found','',JSON.stringify(result))));
					} else {
						$.callback(JSON.parse(helper.BalikanHeader('true','Data not found','','')));
					}
				});
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