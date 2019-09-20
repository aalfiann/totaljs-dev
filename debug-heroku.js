// ===================================================
// FOR DEVELOPMENT
// Total.js - framework for Node.js platform
// https://www.totaljs.com
// ===================================================
// const fs = require('fs');
const options = {};

// options.https = {
//     key: fs.readFileSync('localhost.key'),
//     cert: fs.readFileSync('localhost.crt')
// }

// options.ip = '127.0.0.1';
options.port = process.env.PORT;
// options.config = { name: 'Total.js' };
// options.sleep = 3000;
// options.inspector = 9229;
// options.watch = ['private'];

require('total.js/debug')(options);

// Below here is for heroku awaker
var unirest = require('unirest');
setInterval(function(){
    var url = 'https://getmedik-wschat.herokuapp.com';
    unirest.get(url)
        .end(function (response) {
            console.log(response.body);
        });
},600000);