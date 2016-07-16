/**
 * @author Vaishampayan Reddy
 */

function calculate(request, response) {
	var operandOne = Number(request.body.operandOne);
	var operandTwo = Number(request.body.operandTwo);
	var operation = request.body.operation;
	var responseData = "";
	switch(operation) {
		case "Addition":
			response.send(responseData + (operandOne + operandTwo));
			break;
		case "Subtraction":
			response.send(responseData + (operandOne - operandTwo));
			break;
		case "Multiplication":
			response.send(responseData + (operandOne * operandTwo));
			break;
		case "Division":
			response.send(responseData + (operandOne / operandTwo));
			break;
		default:
			response.send("Error: Illegal operator received - " + operation);
	}
};

exports.calculate = calculate;