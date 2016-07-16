twitter.controller('homeController', function($scope, $http) {
	document.body.style.zoom="90%";
	// create a message to display in our view
	$scope.message = 'Marias';
	$scope.tweetbox_limit = 140;

	$scope.search = function() {
		if($scope.searchText) {
			if($scope.searchText.indexOf('#') >= 0) {
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
	
	var isLoggedInResponse = $http.get('/isloggedin');
	isLoggedInResponse.success(function(data) {
		if (data.status == 401) {
			window.location = '/login';
		} else {
			
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

	var getNewProfiles = function() {
		var newProfilesResponse = $http.get('/newProfiles');
		newProfilesResponse.success(function(data) {
			if(data.status === 200) {
				$scope.newguys = data.profiles;
			}
		});
	};
	getNewProfiles();

	var loadMyProfile = function() {
		var profileResponse = $http.get('/myprofile');
		profileResponse.success(function(data) {
			if (data.status == 200) {
				$scope.profile = data.profile;
				console.log(data);
			} else {
				alert("Empty Profile Data");
			}
		});
	}
	loadMyProfile();

	var loadTweets = function() {
		var getTweetsResponse = $http.get("/tweets");
		getTweetsResponse.success(function(data) {
			if(data.status === 200) {
				$scope.Tweets = data.tweets;
			}
			else {
				alert("Error: No Tweets Found: " + data);
			}
		});
	};
	loadTweets();

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

	$scope.newTweet = function() {
		if($scope.newTweetData != undefined && $scope.newTweetData.length > 0) {
			var twitterdata = {};
			twitterdata.tweet = $scope.newTweetData;
	
			$http({
				method : 'POST',
				url : '/newTweet',
				data : twitterdata,
				headers : {
					'Content-Type' : 'application/json'
				}
			}).success(function(data) {
				if (data.status === 201) {
					loadTweets();
					loadMyProfile();
					document.getElementById("newTweetButton").className = "waves-effect waves-light blue lighten-1 btn disabled";
					$scope.newTweetData = "";
					$scope.tweetbox_limit = 140;
					setTimeout(function(){
						loadHashTagsInfo();
					}, 3006);
				} else {
					alert("Tweet not created due to: " + data);
				}
			});
		}
	};

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
			if(data.status === 200) {
				$scope.newguys.removeValue('puid', puid);
				getNewProfile();
				loadMyProfile();
			}
		});
	};
	
	$scope.onTweetMessageChange = function(length) {
		if(140 - Number(length) === 140) {
			document.getElementById("newTweetButton").className = "waves-effect waves-light blue lighten-1 btn disabled";
		}
		else{
			document.getElementById("newTweetButton").className = "waves-effect waves-light blue lighten-1 btn";
		}
		console.log("changed" + length);
		$scope.tweetbox_limit = 140 - Number(length);
	};

	var getNewProfile = function() {
		var newProfileResponse = $http.get('/newProfile');
		newProfileResponse.success(function(data) {
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

	Array.prototype.removeValue = function(name, value) {
		var array = $.map(this, function(v, i) {
			return v[name] === value ? null : v;
		});
		//Clearing the original array
		this.length = 0;
		// we push all the elements except the ones to be deleted
		this.push.apply(this, array); 
	}
});