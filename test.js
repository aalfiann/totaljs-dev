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

// var helper = require(F.path.definitions('helper'));
// //var to = ["f1AXw48goHw:APA91bEcjBDKFQw6goEkAwGB5DtoMfCAEbIEuRE-wL7Ce6GtqXHuqGqAAaNScVMKkASHvCzdkW5P3ykHcfaDxbsBNH0nL0HHGbTKigi0IoD3X7HOor7CiemsZGi8yXD2vDRiboaQJPpz","abcbc"];
// var to = ["cGA2OmCCsGs:APA91bGN33kohGlb8LalePk3Ruw8gW3hXcoStJvGImXYBrU19kJZ9ZIumBvb_oSp-QIcPe-F7XN5OMUQ6bTUo8HXx5FJO74iXr6yCCWkDlCexN1SSkEN8agBEj6S31wZ_xIwhmsIPnTn"];
// var data = {
//           "body" : "Body of Your Notification in Data",
//           "title": "Title of Your Notification in Title",
//           "key_1" : "Value for key_1",
//           "key_2" : "Value for key_2"
// }

// helper.sendFCM(to,data,'',function(response){
//     console.log(JSON.stringify(response));
// });

// console.log(helper.testFCM(to,data));

F.on("load", function() {
    // var users = NOSQL('users');
    //var search = 'admin';

	// Reads the profile
	// users.find()
	// 	.make(function(builder) {
	// 		var profile = builder.join('id', NOSQL('profile')).on('id', 'id');
    //         builder.contains('id');
    //         profile.first();
    //         profile.search('about', search);
    //         builder.callback(function (err,response,count){
	// 			console.log(JSON.stringify(response));
	// 		});
    // 	});
    
    
    // var users = NOSQL('users');
    // for(var i=0;i<10;i++){
    //     // add count
    //     users.counter.hit('19070212570002dnd0',1);
    // }
    // users.counter.count(function(err,response){
    //     console.log(response);
    // });
});
 F.http('debug');