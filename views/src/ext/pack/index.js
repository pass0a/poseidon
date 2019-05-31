var Stream = require('./stream.js');
var mp = require('./msgpack.js');
function checkCrc(data) {
	return ((data[3] + data[4] + data[5] + data[6] + data[7]) & 0xff) == data[8];
}
var inputStream = function() {
	inputStream.prototype.init.call(this);
	// this.on("data",function(data){
	// 	console.log(data);
	// });
};
inputStream.prototype = new Stream();
inputStream.prototype.push = function(data) {
	var type;
	var i = 0;
	var tmp = mp.encode(data);
	var buf = new Buffer(9);
	buf[i++] = 0x00;
	buf[i++] = 0x00;
	buf[i++] = 0x01;
	buf[i++] = tmp.length >> 24;
	buf[i++] = tmp.length >> 16;
	buf[i++] = tmp.length >> 8;
	buf[i++] = tmp.length;
	buf[i++] = type;
	buf[i++] = buf[3] + buf[4] + buf[5] + buf[6] + buf[7];
	// swtich(typeof data){
	// 	case "string":
	// 	buf.write(data,6);
	// 	break;
	// }
	this.trigger('data', buf);
	this.trigger('data', tmp);
};
var outputStream = function() {
	outputStream.prototype.init.call(this);
	this.checkData = function(data) {
		var tmp;
		switch (data.constructor.name) {
			case 'Buffer':
				tmp = data;
				break;
			case 'ArrayBuffer':
				tmp = new Buffer(data);
				break;
			case 'String':
				tmp = new Buffer(data);
				break;

			default:
				if (data.byteLength) {
					tmp = new Buffer(data);
				} else {
					tmp = new Buffer(typeof data);
				}
				break;
		}

		if (this.tmp) {
			this.tmp = Buffer.concat([ this.tmp, tmp ]);
		} else {
			this.tmp = tmp;
		}
	};
	this.checkHead = function() {
		var sp = 2;
		if (this.tmp.length < 9) {
			return false;
		}
		while (sp < this.tmp.length) {
			switch (this.tmp[sp]) {
				case 0:
					if (this.tmp[sp - 1] != 0) {
						sp += 2;
						break;
					} else {
						sp += 1;
						break;
					}
					break;
				case 1:
					if (this.tmp[sp - 1] != 0 || this.tmp[sp - 2] != 0) {
						sp += 3;
					} else {
						this.tmp = this.tmp.slice(sp - 2);
						return true;
					}
					break;
				default:
					sp += 3;
					break;
			}
		}
		this.tmp = this.tmp.slice(this.tmp.length - 3);
		return false;
	};
	this.head = function() {
		if (this.tmp.length > 8) {
			this.len = (this.tmp[3] << 24) + (this.tmp[4] << 16) + (this.tmp[5] << 8) + this.tmp[6];
			this.end = this.len + 9;
			this.type = this.tmp[7];
			return true;
		}
		return false;
	};
	this.parse = function() {
		if (this.end > this.tmp.length) {
			return false;
		}
		if (this.end == this.tmp.length) {
			this.buf = this.tmp.slice(9);
			this.tmp = undefined;
		} else {
			this.buf = this.tmp.slice(9, this.end);
			this.tmp = this.tmp.slice(this.end);
		}

		this.len = 0;
		this.end = 0;
		return true;
	};
	this.next = function() {
		while (1) {
			if (!this.tmp) {
				return false;
			}
			if (!this.checkHead()) {
				return false;
			}
			if (!this.head()) {
				console.log('head');
				return false;
			}
			if (!checkCrc(this.tmp)) {
				this.tmp = this.tmp.slice(3);
				continue;
			}
			if (!this.parse()) {
				return false;
			}
			return true;
		}
	};
};
outputStream.prototype = new Stream();
outputStream.prototype.push = function(data) {
	this.checkData(data);
	while (this.next()) {
		this.trigger('data', mp.decode(this.buf));
	}
};

module.exports = {
	packStream: inputStream,
	unpackStream: outputStream,
	inputStream: inputStream,
	outputStream: outputStream
};
