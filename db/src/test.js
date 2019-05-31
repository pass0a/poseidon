var Buffer = require('buffer').Buffer;
var buffer = new Buffer(12);
console.log(Buffer.isBuffer(buffer));
console.log(require('buffer').kStringMaxLength);
