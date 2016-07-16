twitter.controller('loginController', function($scope, $http) {
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

	$scope.doLogin = function() {
		$("div#divLoading").addClass('show');
		
		$http({
			method : 'POST',
			url : '/login',
			data : {
				"email" : $scope.email,
				"password" : $scope.password
			},
			headers : {
				'Content-Type' : 'application/json'
			}
		}).success(function(data) {
			if (data.status === 200) {
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
	};
});