var calculatorApplication = angular.module('calculatorApp', []);

calculatorApplication.controller('calculatorController', function($scope, $http){

	$scope.performOperation = function(buttonText) {
			$scope.operation = buttonText;
			console.log($scope.operandOne);
			console.log($scope.operandTwo);
			console.log(document.getElementById("operandOne").value);
			getResponseFromServer();
	};

	$scope.appendNumber = function(myDigit) {
		if(document.getElementById("operandOneRadio").checked) {
			if($scope.operandOne === undefined) {
				$scope.operandOne = Number(myDigit);
			}
			else {
				$scope.operandOne = Number(String($scope.operandOne) + String(myDigit));
			}
		}
		else if(document.getElementById("operandTwoRadio").checked) {
			if($scope.operandTwo === undefined) {
				$scope.operandTwo = Number(myDigit);
			}
			else {
				$scope.operandTwo = Number(String($scope.operandTwo) + String(myDigit));
			}
		}
	}
	
	function getResponseFromServer() {
		if($scope.operandOne!== undefined && $scope.operandTwo!== undefined) {
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
		else {
			alert("Error: all operands are not specified");
		}
	}
});


