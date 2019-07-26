function Uart() {
	var ser = require("serialport"),
		uart,
		name;
	this.openUart = function (data) {
		return new Promise(function (resolve) {
			uart = ser.connect(data.port, data.info, function () {
				name=data.port;
				console.info("serialport: " + data.port + " open!!!");
				resolve(1);
			});
			uart.on("data", function (data) {
				console.info(data);
			});
			uart.on("end", function () {
				console.info("serialport: " + data.port + " close!!!");
				resolve(0);
			});
			uart.on("error", function (error, msg) {
				// console.log(error);
				// console.log(msg);
				console.error(data.port+" Error!!!");
				resolve(0);
			});
		});
	};

	this.sendData = function (buf,parse_data,send_type,timeout) {
		var data_buf={
			uartbuf:new Uint8Array(0),
			ubuf:new Uint8Array(0),
			udatalen:0,
			uflag:0,
			revResult:{},
			revDone:0
		}
		if (timeout == undefined) {
			timeout = 2000;
		}
		return new Promise(function (resolve) {
			if(send_type){
				switch(buf.constructor.name){
					case "String":
						uart.write(buf);
						break;
					default:
						uart.write(new Uint8Array(buf));
						break;
				}
				resolve({ ret: 1, data: 1 });
			}else{
				var tm = null;
				uart.on("data", function (data) {
					if (data_buf.uflag == 1) {
						data_buf.uartbuf = data;
					} else {
						var tmp = new Uint8Array(data.length + data_buf.uartbuf.length);
						tmp.set(data_buf.uartbuf);
						tmp.set(data, data_buf.uartbuf.length);
						data_buf.uartbuf = tmp;
					}
					while (dealReceivedData(data_buf,buf,parse_data)); // 接收超出部分需保留
					if (data_buf.revDone) {
						if (tm) {
							clearTimeout(tm);
							tm = null;
						}
						data_buf.revDone = 0;
						resolve({ ret: 1, data: data_buf.revResult });
					}
				});
				uart.on("error", function (error, msg) {
					// console.log(error);
					// console.log(msg);
					console.error(name+" Error!!!");
					if (tm) {
						clearTimeout(tm);
						tm = null;
					}
					resolve({ ret: 0 });
				});
				uart.write(new Uint8Array(buf));
				tm = setTimeout(function () {
					resolve({ ret: 0 });
				}, timeout);
			}
		});
	};

	this.closeUart = function () {
		uart.end();
	};
	
	function dealReceivedData(data_buf,send_buf,parse_data){
		switch (data_buf.uflag) {
			case 0:
				var hty=parse_data.header_data(data_buf.uartbuf);
				if(hty==1){
					var len = parse_data.length_data(data_buf.uartbuf);
					data_buf.ubuf = new Uint8Array(len);
					if (data_buf.uartbuf.length < len) {
						data_buf.ubuf.set(data_buf.uartbuf.subarray(0));
						data_buf.udatalen = len - data_buf.uartbuf.length;
						data_buf.uflag = 1;
					} else {
						data_buf.ubuf.set(data_buf.uartbuf.subarray(0, len));
						data_buf.uartbuf = data_buf.uartbuf.subarray(len);
						if(parse_data.parse_fn(data_buf, send_buf)){
							data_buf.revDone = 1;
							return 0;
						}else{
							data_buf.uartbuf=new Uint8Array(0);
						}
					}
				}else if(hty==2){
					data_buf.uartbuf=new Uint8Array(0);
				}
				break;
			case 1:
				if (data_buf.uartbuf.length < data_buf.udatalen) {
					data_buf.ubuf.set(data_buf.uartbuf.subarray(0), data_buf.ubuf.length - data_buf.udatalen);
					data_buf.udatalen = data_buf.udatalen - data_buf.uartbuf.length;
				} else {
					data_buf.ubuf.set(data_buf.uartbuf.subarray(0, data_buf.udatalen), data_buf.ubuf.length - data_buf.udatalen);
					data_buf.uartbuf = data_buf.uartbuf.subarray(data_buf.udatalen);
					data_buf.uflag = 0;
					if(parse_data.parse_fn(data_buf, send_buf)){
						data_buf.revDone = 1;
						return 0;
					}else{
						data_buf.uartbuf=new Uint8Array(0);
					}
				}
				break;
			default:
				break;
		}
		return 0;
	}

	function consoleData_16(data) {
		var val = Duktape.enc('hex', data);
		console.info("[uart]rev buf:" + val);
	}
}

exports.create = function () {
	return new Uart();
};