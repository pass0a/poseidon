const util = require('util');
let debuglog = util.debuglog;
util.debuglog = function(set: string) {
	if (set === 'stream') {
		return function() {
			var msg = util.format.apply(util, arguments);
			console.error(`[${set}]: ${msg}`);
		};
	}
	return debuglog(set);
};

//console.logmode('rotating', 'passoa', 'passoa.log', 1024 * 1024 * 5, 1);
require('./httpop/main');
require('./dbop/main');
require('./linkmgr/main');
require('./devop/main');
require('./comop/main');
require('./webop/main');
