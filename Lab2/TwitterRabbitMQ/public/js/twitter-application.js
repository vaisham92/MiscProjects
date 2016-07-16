var twitter = angular.module('twitter', [ 'ngRoute' ]);

twitter.directive('myEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.myEnter);
                });

                event.preventDefault();
            }
        });
    };
});

twitter.config([ '$routeProvider', '$locationProvider',
		function($routeProvider, $locationProvider, $routeParams) {
			$routeProvider.when('/', {
				templateUrl : 'main.html',
				controller : 'mainController'
			}).when('/signup', {
				templateUrl : 'signup.html',
				controller : 'signupController'
			}).when('/login', {
				templateUrl : 'login.html',
				controller : 'loginController'
			}).when('/home', {
				templateUrl : 'home.html',
				controller : 'homeController'
			}).when('/profile/me', {
				templateUrl : 'myprofile.html',
				controller: 'myProfileController'
			}).when('/profile/:puid', {
				templateUrl : 'profile.html',
				controller: 'profileController'
			}).when('/hashtag/:hashid', {
				templateUrl : 'hashtags.html',
				controller: 'hashtagController'
			});
			$locationProvider.html5Mode(true);
		} ]);

twitter.filter('reverse', function() {
	return function(items) {
		return items.slice().reverse();
	};
});

var getHashTag = function(myString, indexOne) {
	for(var indexTwo = indexOne; indexTwo < myString.length; indexTwo++) {
		if(myString.charAt(indexTwo) === ' '){
			break;
		}
	}
	return myString.substring(indexOne + 1 , indexTwo);
};