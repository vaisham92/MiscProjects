twitter.controller('myProfileController', function($scope, $http) {
	document.body.style.zoom="90%";
	
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
	
	$scope.goToHomePage = function() {
		window.location = '/home';
	};
	
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
	
	var isLoggedInResponse = $http.get('/isloggedin');
	isLoggedInResponse.success(function(data) {
		if (data.status == 401) {
			window.location = '/login';
		} else {
			loadMyProfile();
		}
	});
	
	var loadMyProfile = function() {
		var profileResponse = $http.get('/myprofile');
		profileResponse.success(function(data) {
			if (data.status == 200) {
				$scope.profile = data.profile;
				console.log(data);
				loadTweets();
			} else {
				alert("Empty Profile Data");
			}
		});
	}
	
	var loadTweets = function() {
		var getTweetsResponse = $http.get("/tweets/" + $scope.profile.puid);
		getTweetsResponse.success(function(data) {
			$scope.Tweets = data;
			var date = new Date("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
			console.log(date);
			console.log($scope.Tweets[0].created_at);
			console.log(date - $scope.Tweets[0].created_at);
		});
	};
	
	var getNewProfiles = function() {
		var newProfilesResponse = $http.get('/newProfiles');
		newProfilesResponse.success(function(data) {
			console.log(data);
			$scope.newguys = data;
		});
	};
	getNewProfiles();
	
	var getNewProfile = function() {
		var newProfileResponse = $http.get('/newProfile');
		newProfileResponse.success(function(data) {
			console.log(data);
			$scope.newguys.concat(data);
		});
	};
	
	$scope.like = function(tweetid) {
		$("div#divLoading").addClass('show');
		setTimeout(function(){
			$("div#divLoading").removeClass('show');
		},
				505);
	};
	
	var loadHashTagsInfo = function() {
		var getHashtagsInfoResponse = $http.get("/hashtags");
		getHashtagsInfoResponse.success(function(data){
			if(data.status == 200) {
				for(var index = 0; index < data.hashtagsInfo.length; index++) {
					data.hashtagsInfo[index].self_url = "/hashtag/" + data.hashtagsInfo[index].hashid;
				}
				$scope.HashTags = data.hashtagsInfo;
				console.log($scope.HashTags);
			}
		});
	};
	loadHashTagsInfo();
	
	$scope.follow = function(puid) {
		var postData = {};
		postData.followerid = puid;
		$http({
			method : 'POST',
			url : '/follow',
			data : postData,
			headers : {
				'Content-Type' : 'application/json'
			}
		}).success(function(data) {
			$scope.newguys.removeValue('puid', puid);
			getNewProfile();
			loadMyProfile();
		});
	};
});