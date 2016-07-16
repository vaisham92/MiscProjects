var mysql = require('mysql');

exports.getConnection = function() {
	var connection = mysql.createConnection({
		  host     : 'localhost',
		  user     : 'twitteradmin',
		  password : 'marias@1234',
		  database : 'twitterdb'
	});
	return connection;
};