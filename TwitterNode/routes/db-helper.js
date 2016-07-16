/**
 *	db-helper.js
 *	@author Vaishampayan Reddy
 */

exports.executeQuery = function(connection, queryString, successCallBack, failureCallBack) {
	connection.connect(function(err) {
		if (!err) {
			console.log("Database is connected");
		} else {
			console.log("Error connecting database");
			failureCallBack("Error connecting database");
		}
		connection.query(queryString,function(error, rows, fields){
			connection.end();
			if(!error) {
				console.log("Response obtained for query: " +queryString + " from db: " + JSON.stringify(rows));
				successCallBack(rows);
			}
			else {
				console.log("error obtained" + error);
				failureCallBack("error obtained" + error);
			}
		});
	});
}
