const SESSION = {};

F.onAuthorize = function(req, res, flags, callback) {

    // We read the X-Token header from the current request
    var token = req.headers['x-token'];
    if (!token)
        return callback(false);

    // We check whether the token exists in the current session
    if (SESSION[token]) {
        // Extends expiration time
        SESSION[token].ticks = F.datetime;
        return callback(true, SESSION[token]);
    }

    // Try to find the token in NoSQL database
    NOSQL('tokens').find().make(function(builder) {
        builder.where('token', token);
        builder.first();
        builder.callback(function(err, response) {
            if (response) {
                response.ticks = F.datetime;
                SESSION[token] = response; // We create a session
                callback(true, response);
            } else
                callback(false);
        });
    });
};

// Removes older sessions
F.on('service', function(counter) {
    if (counter % 5 !== 0)
        return;
    var ticks = F.datetime.add('-10 minutes');
    Object.keys(SESSION).forEach(function(token) {
        if (SESSION[token].ticks < ticks)
            delete SESSION[token];
    });
});