/**
 * db-helper.js
 * 
 * @author Vaishampayan Reddy
 */
var assert = require('assert');

exports.insertIntoCollection = function(collection, data, success) {
	collection.insertOne(data, function(err, result) {
		assert.equal(err, null);
		//console.log("err: " + err);
		//console.log("result: " + result);
		//console.log("Inserted a document into the restaurants collection.");
		success();
	});
};

exports.readOne = function(collection, searchData, projection, success) {
	//console.log("collection: " + collection);
	//console.log("searchData: " + JSON.stringify(searchData));
	//console.log("projection: " + projection);
	if(collection !== null) {
		if(projection !== null) {
			collection.findOne(searchData, projection, function(err, item) {
				assert.equal(err, null);
				success(item);
		});
		}
		else {
			collection.findOne(searchData, function(err, item) {
				//console.log("error: " + err);
				//console.log("item: " + item);
				assert.equal(err, null);
				success(item);
			});
		}
	}
};

exports.doesExistInDb = function(collection, searchData, success, failure) {
	//console.log("In doesExistInDb");
	//console.log("searchData");
	collection.findOne(searchData, function(err, data) {
		if(data === null) {
			//console.log("data not found: " + JSON.stringify(data));
			failure();
		}
		else {
			//console.log("data found: " + JSON.stringify(data));
			success();
		}
	});
};

exports.count = function(collection, searchData, success){
	if(searchData !== null) {
		collection.count(searchData, function(err, count) {
			success(count);
		});
	}
	else {
		collection.count(function(err, count){
			success(count);
		});
	}
};

exports.read = function(collection, searchData, projection, options, success) {
	if(options !== null) {
		if(projection !== null) {
			collection.find(searchData, options).toArray(function(err, data) {
				//console.log(data);
				success(data);
			});
		}
		else {
			collection.find(searchData, projection, options).toArray(function(err, data) {
				//console.log(data);
				success(data);
			});
		}
	}
	else {
		if(projection !== null) {
			collection.find(searchData, projection).toArray(function(err, data) {
				//console.log(data);
				success(data);
			});
		}
		else {
			collection.find(searchData).toArray(function(err, data) {
				console.log(data);
				success(data);
			});
		}
	}
};