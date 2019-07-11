// ===================================================
// FOR DEVELOPMENT
// Total.js - framework for Node.js platform
// https://www.totaljs.com
// ===================================================

const options = {};

// options.ip = '127.0.0.1';
// options.port = parseInt(process.argv[2]);
// options.config = { name: 'Total.js' };
// options.sleep = 3000;
// options.inspector = 9229;
// options.watch = ['private'];

//require('total.js/debug')(options);

require('total.js')

var helper = require(F.path.definitions('helper'));
//var to = ["f1AXw48goHw:APA91bEcjBDKFQw6goEkAwGB5DtoMfCAEbIEuRE-wL7Ce6GtqXHuqGqAAaNScVMKkASHvCzdkW5P3ykHcfaDxbsBNH0nL0HHGbTKigi0IoD3X7HOor7CiemsZGi8yXD2vDRiboaQJPpz","abcbc"];
var to = ["abcbc"];
var data = {
          "body" : "Body of Your Notification in Data",
          "title": "Title of Your Notification in Title",
          "key_1" : "Value for key_1",
          "key_2" : "Value for key_2"
}

helper.sendFCM(to,data,'',function(response){
    console.log(JSON.stringify(response));
});

// console.log(helper.testFCM(to,data));

F.http('debug');