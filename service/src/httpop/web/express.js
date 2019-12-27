var fs = require('fs');
(function() {
	function express() {
		var routes = [];
		var nextflag = 0;
		var pathToRegexp = require('./path-to-regexp');
		var url = require('url');
		var http = require('http').createServer(function(req, res) {
			var list = [];
			// console.log(req.url, req.method, req.protocol);
			req.on('data', function(buf) {
				list.push(new Buffer(buf));
			});
			req.on('end', function() {
				try {
					var info = url.parse(req.url, true);
					req.info = info;
					req.body = Buffer.concat(list);
					list = [];
					for (var idx = 0; idx < routes.length; idx++) {
						var re = pathToRegexp('(' + routes[idx].path + ')');
						var ret = re.exec(info.pathname);
						if (ret) {
							nextflag = 0;
							routes[idx].fn(req, res, next);
							if (!nextflag) {
								return 0;
							}
						}
					}
				} catch (e) {
					console.log(e.stack);
				}
			});
		});
		function next() {
			nextflag = 1;
		}
		this.use = function() {
			var obj = {};
			switch (arguments.length) {
				case 0:
					return;
					break;
				case 1:
					obj.fn = arguments[0];
					obj.path = '.*';
					break;
				default:
					obj.fn = arguments[1];
					obj.path = arguments[0];
					break;
			}
			routes.push(obj);
			// if(arguments.length==1){
			//     if(typeof routes[".*"]!="object"){
			//         routes[".*"]=[];
			//     }
			//     routes[".*"].push(arguments[0]);
			// }
			// if(arguments.length==2){
			//     if(typeof routes[arguments[0]]!="object"){
			//         routes[arguments[0]]=[];
			//     }
			//     routes[arguments[0]].push(arguments[1]);
			// }
		};
		this.listen = function(port) {
			http.listen(port);
		};
		this.close = function() {
			http.close();
		};
	}
	function createServer() {
		return new express();
	}
	module.exports = createServer;
})();
