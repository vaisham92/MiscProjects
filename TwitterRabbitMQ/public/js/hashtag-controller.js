twitter.controller('hashtagController', function($scope, $http, $routeParams) {
	
	$scope.search = function() {
		if($scope.searchText) {
			if($scope.searchText.indexOf('#') > 0) {
				var hashTag = getHashTag($scope.searchText, $scope.searchText.indexOf('#'));
				var getHashTagMessageResponse = $http.get('/getHashTagId/' + hashTag);
				getHashTagMessageResponse.success(function(data){
					if(data) {
						window.location = "/hashtag/" + data[0].hashid;
					}
				});
			}
			else {
				var getProfileIdResponse = $http.get('/getprofilebyname/' + $scope.searchText);
				getProfileIdResponse.success(function(data){
					if(data) {
						window.location = "/profile/" + data[0].puid;
					}
				});
			}
		}
	};
	
	var loadHashTagsInfo = function() {
		var getHashtagsInfoResponse = $http.get("/hashtags");
		getHashtagsInfoResponse.success(function(data){
			if(data.status == 200) {
				for(var index = 0; index < data.hashtagsInfo.length; index++) {
					data.hashtagsInfo[index].self_url = "/hashtag/" + data.hashtagsInfo[index].hashid;
				}
				$scope.HashTags = data.hashtagsInfo;
			}
		});
	};
	loadHashTagsInfo();
	
	var getHashTag = function(myString, indexOne) {
		for(var indexTwo = indexOne; indexTwo < myString.length; indexTwo++) {
			if(myString.charAt(indexTwo) === ' '){
				break;
			}
		}
		return myString.substring(indexOne, indexTwo);
	};
	
	var getHashTagTweetsResponse = $http.get('/getHashTags/' + $routeParams.hashid);
	getHashTagTweetsResponse.success(function(data) {
		if(data) {
			$scope.hashtagtweets = data;
		}
	});
	
	$scope.logout = function() {
		$http({
			method: 'POST',
			url: '/logout',
			data: {},
			headers : {
				'Content-Type' : 'application/json'
			}
		}).success(function(data){
			if(data.status == 200) {
				window.location = "/login";
			}
		});
	};
	
	$scope.goToHomePage = function() {
		window.location = '/home';
	};
	
	var getHashTagMessageResponse = $http.get('/getHashTagMsg/' + $routeParams.hashid);
	getHashTagMessageResponse.success(function(data){
		if(data.status = 200) {
			$scope.hashtagMessage = data.hashTag[0];
		}
	});
});