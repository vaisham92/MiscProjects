/**
 *	db-helper.js
 *	@author Vaishampayan Reddy
 */

exports.executeQuery = function(connection, queryString, successCallBack, failureCallBack) {
		connection.query(queryString,function(error, rows, fields){
			if(!error) {
				console.log("Response obtained for query: " +queryString + " from db: " + JSON.stringify(rows));
				successCallBack(rows);
			}
			else {
				console.log("error obtained" + error);
				failureCallBack("error obtained" + error);
			}
		});
};

exports.closeConnection = function(connection) {
		connection.release();
		//connection.end();
		console.log("closed connection");
};
