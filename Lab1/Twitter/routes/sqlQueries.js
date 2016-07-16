/**
 * New node file
 */

exports.getPasswordForEmailQuery = function(email) {
	return "select * from Users where email = '" + email + "'";
};

exports.getQueryForUserProfileByPuid = function(puid) {
	return "select * from User_profiles where puid = '" + puid + "'";
};

exports.getFollowerCountByPuid = function(puid) {
	return "select count(*) as count from Followers where followerid = '"
			+ puid + "'";
};

exports.getFollowingCountByPuid = function(puid) {
	return "select count(*) as count from Followers where puid = '" + puid
			+ "'";
};

exports.getTweetsCountByPuid = function(puid) {
	return "select count(*) as count from Tweets where puid = '" + puid + "'";
};

exports.getUserPuidByEmailQuery = function(email) {
	return "select puid from Users where email = '" + email + "'";
};

exports.getFollowersByPuidQuery = function(puid) {
	return "select followerid from Followers where puid = '" + puid + "'";
};

exports.getQueryForGetMyTweets = function(puid) {
	return "Select * from Tweets where puid = '" + puid + "' order by created_at DESC";
};

exports.getQueryForFollowerTweets = function(puid) {
	return "select a.* from Tweets a where a.puid in (select followerid from Followers where puid = " + puid + ") order by a.created_at DESC";
};

exports.getQueryForNewUsersByPuid = function(puid, limit) {
	return "select a.puid, b.first_name, b.last_name, b.handle from Users a, User_profiles b where a.puid = b.puid and a.puid not in(select followerid from Followers where puid = "
			+ puid + ") and a.puid!= " + puid + " limit " + limit;
};

exports.getQueryForHashTagByHashtag = function(hashtag) {
	return "select hashid from HashTags where hashtag = '" + hashtag + "'"; 
};

exports.getQueryForHashTagsInfo = function() {
	return "select a.hashid, a.hashtag, count(b.tweetid) as count from HashTags a, HashTagTweets b where a.hashid = b.hashid group by a.hashid order by count DESC limit 9";
};

exports.getQueryForHashTagTweets = function(hashid) {
	return "select a.* from Tweets a, HashTagTweets b where a.tweetid = b.tweetid and b.hashid = '" + hashid + "'";
};

exports.getQueryForHashTagMessage = function(hashid) {
	return "select hashtag from HashTags where hashid = '" + hashid + "'";
};

exports.getQueryForHashTagId = function(hashtag) {
	return "select hashid from HashTags where hashtag like '#" + hashtag + "'";
};

exports.getQueryforProfileIdbyName = function(name) {
	return "select puid from User_profiles where first_name like '%" + name + "%' or last_name like '%" + name + "%'";
};

exports.getQueryForUserProfileCreation = function(puid, handle, first_name,
		last_name, phone, city, birthday) {
	return "Insert into User_profiles (puid,handle,first_name,last_name,phone,city,birthday) values "
			+ "('"
			+ puid
			+ "','"
			+ handle
			+ "','"
			+ first_name
			+ "','"
			+ last_name
			+ "','"
			+ phone
			+ "','"
			+ city
			+ "','"
			+ birthday
			+ "')";
};

exports.getQueryForUserCreation = function(email, password) {
	return "Insert into Users (email,password) values ('" + email + "','"
			+ password + "')";
};

exports.getQueryForTweetCreation = function(puid, tweet, handle, first_name,
		last_name) {
	return "Insert into Tweets (puid, tweet, handle, first_name, last_name) values ('"
			+ puid
			+ "','"
			+ tweet
			+ "','"
			+ handle
			+ "','"
			+ first_name
			+ "','" 
			+ last_name + "')";
};

exports.getQueryForUserFollowerCreation = function(puid, followerid) {
	return "Insert into Followers (puid, followerid) values ('" + puid + "','" + followerid + "')";
};

exports.getQueryForHashTagEntryCreation = function(hashtag) {
	return "Insert into HashTags (hashtag) values('" + hashtag + "')";
};

exports.getQueryForHashTagTweetsCreation = function(tweetid, hashid) {
	return "Insert into HashTagTweets (tweetid, hashid) values ('" + tweetid + "','" + hashid + "')";
};