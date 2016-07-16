exports.jsonArrayConcatenate = function(jsonArrayOne, jsonArrayTwo, success) {
	jsonArrayOne.concat(jsonArrayTwo);
	success(jsonArrayOne);
};

exports.getHashTag = function(myString, indexOne) {
	for(var indexTwo = indexOne; indexTwo < myString.length; indexTwo++) {
		if(myString.charAt(indexTwo) === ' '){
			break;
		}
	}
	return myString.substring(indexOne, indexTwo);
};