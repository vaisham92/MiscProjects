/**
 * @author Vaishampayan Reddy
 */

var soap = require('soap');
var baseURL = "http://localhost:8080/MyCalculatorJava/services";

function calculate(request, response) {
	var option = {
		ignoredNamespaces : true
	};
	var url = baseURL + "/Calculator?wsdl";
	var args = {
		username : request.body.operandOne,
		password : request.body.operandTwo,
		operation : request.body.operation
	};
	soap.createClient(url, option, function(err, client) {
		client.calculate(args, function(err, result) {
			console.log(result);
			response.send(result.calculateReturn);
		});
	});
}

exports.calculate = calculate;