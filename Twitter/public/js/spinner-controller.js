twitter.controller('spinnerController', function($scope) {
	setTimeout(function(){
		window.location = localStorage.getItem('uri');
	}, 504);
});