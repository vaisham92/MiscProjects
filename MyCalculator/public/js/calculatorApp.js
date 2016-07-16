var calculatorApplication = angular.module('calculatorApp', []);

calculatorApplication.controller('calculatorController', function($scope, $http){

	$scope.performOperation = function(buttonText) {
			$scope.operation = buttonText;
			console.log($scope.operandOne);
			console.log($scope.operandTwo);
			console.log(document.getElementById("operandOne").value);
			getResponseFromServer();
	}

	$scope.appendNumber = function(myDigit) {
		console.log("myDigit: " + myDigit);
		if(document.getElementById("operandOneRadio").checked) {
			console.log("entering: " + $scope.operandOne);
			if($scope.operandOne === undefined) {
				$scope.operandOne = "";
				$scope.operandOne += String(myDigit);
			}
			else {
				$scope.operandOne += String(myDigit);
			}
		}
		else if(document.getElementById("operandTwoRadio").checked) {
			if($scope.operandTwo === undefined) {
				$scope.operandTwo = "";
				$scope.operandTwo += String(myDigit);
			}
			else {
				$scope.operandTwo += String(myDigit);
			}
		}
	}
	
	function getResponseFromServer() {
		$http({
	        url: '/calculator', 
	        method: 'POST', 
	        data: { "operandOne": $scope.operandOne, "operandTwo": $scope.operandTwo, "operation": $scope.operation }
	        }).success(function (data, status, headers, config) {
	        		$scope.answer = data;
	        }).error(function (data, status, headers, config) {
	         		alert(status);
	    });
	}
});


