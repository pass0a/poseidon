var url = require('url');
var os = require('os');
var sql = require('@passoa/sqlite');
var sqlop = require('../sql/index');
var db = sql.open(os.homedir() + '/data_store/poseidon.db',function(code,info){
});
(function() {
	function res(req, res, next) {
		var info = url.parse(req.url, true);
		var route = info.pathname;
		var params = info.query;
		sqlop.start(db,route,params,res);
		// res.writeHead(200, {"Content-Type": 'application/json; charset=utf8'});
        // res.end(JSON.stringify(['123']));
	}
	module.exports = res;
})();
