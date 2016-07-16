
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var mongo = require("./routes/mongo");
var twittercore = require('./routes/twitter-core');
//URL for the sessions collections in mongoDB
var mongoSessionConnectURL = "mongodb://localhost:27017/twitterdb";
var expressSession = require("express-session");
var mongoStore = require("connect-mongo")(expressSession);

var app = express();

var twittercore = require('./routes/twitter-core');


//sessions code
app.use(
	expressSession({
		secret: 'cmpe_twitter_website_marias',
		resave: false,  //don't save session if unmodified
		saveUninitialized: false,	// don't create session until something stored
		duration: 30 * 60 * 1000,    
		activeDuration: 5 * 60 * 1000,
		store: new mongoStore({
			url: mongoSessionConnectURL
		})
	})
);

// all environments
app.set('port', process.env.PORT || 80);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname + '/public'));
app.use(app.router);
app.use('/',function(req, res) {
  // Use res.sendfile, as it streams instead of reading the file into memory.
  res.sendfile(__dirname + '/public/index.html');
});
// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//app.get('/', routes.index);
app.get('/users', user.list);
//twitter route details
//app.post("/login", twittercore.logIn);

//twitter-routes
app.post('/signup', twittercore.signUp);
app.post('/login', twittercore.logIn);
app.get('/myprofile', twittercore.getMyProfile);
app.post('/newTweet', twittercore.postNewTweet);
app.get('/newProfiles', twittercore.getProfilesToFollow);
app.post('/follow', twittercore.follow);
app.get('/newProfile', twittercore.getProfileToFollow);
app.get('/tweets', twittercore.getTweets);
app.get('/tweets/:puid', twittercore.getTweetsForPuid);
app.get('/getprofile/:puid', twittercore.getProfileForPuid);
app.get('/getHashTags/:hashid', twittercore.getHashTagTweets);
app.get('/getHashTagMsg/:hashid', twittercore.getHashTagMsg);
app.get('/getHashTagId/:hashtag', twittercore.getHashTagId);
app.get('/hashtags', twittercore.getHashTags);
app.get('/getprofilebyname/:name', twittercore.getProfileByName);
/*
app.post('/logout', twittercore.logOut);
app.get('/isloggedin', twittercore.isLoggedIn);
*/

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: err
    });
});