var net = require('net'),
	pack = require('@passoa/pack');

function Linkmgr() {
	var lk = [],
		lp = [],
		that = this;
	loadModule(lp);
	this.app = net.createServer(function(c) {
		var pos = new pack.outputStream(),
			pis = new pack.inputStream();
		pos.on('data', function(data) {
			handleCmd(data);
		});
		pis.on('data', function(data) {
			c.write(data);
		});
		c.on('data', function(data) {
			pos.push(data);
		});
		c.on('close', function() {});
		pis.push({ type: 'init' });
		var handleCmd = function(obj) {
			if (obj.type != 'info') {
				pis.push({ type: 'auth', state: 'fail', msg: 'it is not info cmd!!!' });
				c.end();
			}
			if (!lk[obj.class]) {
				lk[obj.class] = [];
			}
			var srv = lk[obj.class][obj.name];
			if (srv) {
				pis.push({ type: 'auth', state: 'fail', msg: 'your name is already login!!!' });
				c.end();
			} else {
				var tmp = lp[obj.class];
				if (tmp && tmp.create) {
					lk[obj.class][obj.name] = tmp.create(c, obj, that);
					console.info('[link create]' + obj.class + '-' + obj.name + ':' + 'success!!!');
					c.on('close', function() {
						console.info('[link close]' + obj.class + '-' + obj.name + ':' + 'exit!!!');
						lk[obj.class][obj.name] = undefined;
					});
				} else {
					pis.push({ type: 'auth', state: 'fail', msg: 'Unknow object!!!' });
				}
			}
		};
	});
	this.getLink = function() {
		if (lk[arguments[0]]) {
			return lk[arguments[0]][arguments[1]];
		}
		return undefined;
	};
}

function loadModule(lp) {
	lp['web'] = require('./mgr_web.js');
	lp['test'] = require('./mgr_test.js');
}

Linkmgr.prototype.start = function() {
	this.app.listen(6000);
};

module.exports = new Linkmgr();
