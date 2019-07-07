exports.install = function() {

	// Routes
    ROUTE('/consult-db/{akun_type}/{akun_id}', view_consult);
    ROUTE('/consult-db/{akun_type}/{akun_id}/{transaksi_konsul_id}', view_consultroom);

};

function view_consult(akun_type,akun_id) {
    var self = this;
	self.view('consult-db',{usertype:akun_type,userid:akun_id});
}

function view_consultroom(akun_type,akun_id,transaksi_konsul_id) {
    var self = this;
	self.view('consult-db',{ consultroom: transaksi_konsul_id,usertype:akun_type,userid: akun_id });

}