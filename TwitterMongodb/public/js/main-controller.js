twitter.controller('mainController', function($scope, $http) {

	$("div#divLoading").addClass('show');
	
	var isLoggedInResponse = $http.get('/isloggedin');
	isLoggedInResponse.success(function(data) {
		if (data.status == 200) {
			setTimeout(function() {
				$("div#divLoading").removeClass('show');
				window.location = '/home';
			}, 504);
		} else {
			$("div#divLoading").removeClass('show');
		}
	});
	
	// create a message to display in our view
	$scope.message = 'Marias';
	$scope.goToLoginPage = function() {
		setTimeout(function() {
			$("div#divLoading").removeClass('show');
			window.location = '/login';
		}, 504);
	};

	$scope.goToSignupPage = function() {
		setTimeout(function() {
			$("div#divLoading").removeClass('show');
			window.location = '/signup';
		}, 504);
	};
});