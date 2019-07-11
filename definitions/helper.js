exports.BalikanHeader = function (stsres, stsdes, stsfal, datanya) {
	var teksnya;
	if (datanya == '') {
		teksnya = '{"sts_res":"' + stsres + '","sts_des":"' + stsdes + '","sts_fal":"' + stsfal + '"}';
	} else {
		teksnya = '{"sts_res":"' + stsres + '","sts_des":"' + stsdes + '","sts_fal":"' + stsfal + '", "data":[' + datanya + ']}';
	}
	return teksnya;
};

exports.BalikanHeaderSudahArray = function (stsres, stsdes, stsfal, datanya) {
	var teksnya;
	if (datanya == '') {
		teksnya = '{"sts_res":"' + stsres + '","sts_des":"' + stsdes + '","sts_fal":"' + stsfal + '"}';
	} else {
		teksnya = '{"sts_res":"' + stsres + '","sts_des":"' + stsdes + '","sts_fal":"' + stsfal + '", "data":' + datanya + '}';
	}
	return teksnya;
};

exports.SentEmail = function(ModeKirim, AddressTo, SubjectTo, Messagesnya) {
	require('total.js');
	var smtp = 'smtp.gmail.com';
	var emailfrom = 'getmedikapplication@gmail.com';
	var accountfrom = 'PT. Layanan Medik Indonesia';
	var pass = '!Sopiga*123#';
	var port = 465;
	var secure = true;

	var tgl = new Date().toISOString().replace("T", " ").replace("Z", "");
	var tglfile = tgl.substr(0,10);
	var buatlog;

	Mail.try(smtp, function(err) {
		if (!err);
			var message = new Mail.Message(SubjectTo, Messagesnya);
			message.to(AddressTo);
			message.from(emailfrom, accountfrom);
			message.send(smtp, { port: port, secure: secure, user: emailfrom, password: pass });
		buatlog = '(' + tgl + ')--' + ModeKirim + '--SMTP: ' + smtp + ':' + port + '#' + secure + '--sent: ' + AddressTo + '--Subject: ' + SubjectTo+ '--Messages: ' + Messagesnya;
		BikinLog('./logs/'+ tglfile + '_email.log', buatlog);
		console.log(buatlog);
	});
	Mail.on('error', function (err) {
		console.log(err);
	});
};

function BikinLog (path, tulislog){
    var fs = require('fs');
    var tgl = new Date().toISOString().replace("T", " ").replace("Z", "");
    var out = fs.createWriteStream(path, { flags : 'a' });

    try {
		out.write(tulislog + '\r\n', 'utf-8');
    } catch(err) {
        console.log(path + ' ' + err + ' (' + tgl + ')');
    }
    out.end();
}

exports.sendFCM = function (to, data, notifications, callback) {
	var self = this;
	var FCM_AUTHORIZATION_KEY = ''; //Change with your FCM Authorization Key if any
	var FCM = require(F.path.definitions('fcm'));
	var fcm = new FCM(FCM_AUTHORIZATION_KEY);
	fcm.registration_ids(to).data(data);
	if(notifications) {
		fcm.notifications(notifications);
	}
	fcm.send(function (response) {
		return callback(JSON.parse(self.BalikanHeader('true','Request terkirim','',JSON.stringify(response))));
	});
}

exports.testFCM = function (to, data, notifications) {
	var FCM = require(F.path.definitions('fcm'));
	var fcm = new FCM('abcdefg');
	if(notifications){
		fcm.notifications(notifications);
	}
	fcm.add('to','aziz');
	//fcm.remove('to');
	//return fcm.getBody();
	return JSON.parse(this.BalikanHeader('true','Request terkirim','',JSON.stringify(fcm.getBody())));
}