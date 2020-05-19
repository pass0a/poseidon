var url = require('url'),
	fs = require('fs'),
	mime = require('./mime')(),
	path = require('path');

function formatPath(dir, ext) {
	var pathname = dir + ext;
	if (path.extname(pathname) == '') {
		pathname += '/';
	}
	if (pathname.charAt(pathname.length - 1) == '/') {
		pathname += 'index.html';
	}
	return pathname;
}
(function() {
	function res(req, res, next) {
		var info = url.parse(req.url, true);
		var params = info.query;
		var pn = '';
		switch (params.action) {
			case 'image':
				pn = params.image;
				break;
			case 'icon':
				pn = path.dirname(path.dirname(process.execPath)) + '/data_store/projects/' + params.icon;
				break;
			default:
				pn = formatPath(process.cwd() + '/view', info.pathname);
				break;
		}
		var f1 = fs.statSync(pn);
		var f2 = new fs.ReadStream(pn);
		f2.on('open', function() {
			res.writeHead(200, {
				connection: 'close',
				'Cache-Control': 'no-cache',
				'Content-Type': mime(pn),
				'Content-Length': f1.size
			});
		});
		f2.on('data', function(data) {
			res.write(data);
		});
		f2.on('end', function() {
			res.end();
		});
		f2.on('error', function() {
			res.writeHead(404, { connection: 'close', 'Content-Type': 'text/html' });
			res.end('<h1>404 Not Found</h1>');
		});
	}
	module.exports = res;
})();
