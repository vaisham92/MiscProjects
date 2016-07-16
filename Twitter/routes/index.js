
/*
 * GET home page.
 */

exports.index = function(req, res){
	res.render('./public/index', {});
	//res.sendfile('./public/index.html');
};