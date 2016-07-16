/**
 * New node file
 */

exports.getPasswordForUsernameQuery = function(username) {
	return "select * from Users where email = '" + username + "'";
};

exports.doAsignUp = function(firstname, lastname, email, password) {
	return "INSERT INTO Users (first_name,last_name,email,password) VALUES ('" + firstname + "','"
	+ lastname + "','" + email + "','" + password + "')";
};