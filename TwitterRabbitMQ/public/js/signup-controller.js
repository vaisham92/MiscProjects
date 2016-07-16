twitter.controller('signupController', function($scope, $http) {
	$("div#divLoading").addClass('show');
	
	var isLoggedInResponse = $http.get('/isloggedin');
	isLoggedInResponse.success(function(data) {
		if (data.status == 200) {
			setTimeout(function() {
				$("div#divLoading").removeClass('show');
				window.location = '/home';
			}, 504);
		} else {
			setTimeout(function() {
				$("div#divLoading").removeClass('show');
			}, 504);
		}
	});

	$('.datepicker').pickadate({
		selectMonths : true, // Creates a dropdown to control month
		selectYears : 100,
		max : new Date(),
		format : 'yyyy/mm/dd'
	});
	$scope.doSignUp = function() {
		$("div#divLoading").addClass('show');
		var signupData = {};
		signupData.first_name = $scope.first_name;
		signupData.last_name = $scope.last_name;
		signupData.city = $scope.city;
		signupData.birthday = document.getElementById('birthdate').value;
		signupData.email = $scope.email;
		signupData.password = $scope.password;
		signupData.phone = $scope.phone;
		signupData.handle = $scope.handle;

		$http({
			method : 'POST',
			url : '/signup',
			data : signupData,
			headers : {
				'Content-Type' : 'application/json'
			}
		}).success(function(data) {
			console.log(data);
			if (data.status === 201) {
				setTimeout(function() {
					$("div#divLoading").removeClass('show');
					window.location = '/login';
				}, 504);
			} else {
				setTimeout(function() {
					$("div#divLoading").removeClass('show');
				}, 504);
				alert("User not created due to: " + data);
			}
		});
	};
});