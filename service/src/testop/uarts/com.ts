export class Uart{
	private serialport = require("./serialport");
	private uart:any;
	private name:any;
	openUart(data:any) {
		return new Promise((resolve) => {
			this.uart = this.serialport.connect(data.port, data.info, () => {
				this.name = data.port;
				console.info("serialport: " + data.port + " open!!!");
				resolve(1);
			});
			this.uart.on("data", (data:any) => {
				console.info(data);
			});
			this.uart.on("end", () => {
				console.info("serialport: " + data.port + " close!!!");
				resolve(0);
			});
			this.uart.on("error", (error:any, msg:any) => {
				console.error(data.port+" Error!!!");
				resolve(0);
			});
		});
	}
	sendData(buf:any,parse_data:any,send_type:any,timeout?:any) {
		let data_buf={
			uartbuf:new Uint8Array(0),
			ubuf:new Uint8Array(0),
			udatalen:0,
			uflag:0,
			revResult:{},
			revDone:0
		}
		if (timeout == undefined) timeout = 2000;
		return new Promise((resolve) => {
			if(send_type){
				switch(buf.constructor.name){
					case "String":
						this.uart.write(buf);
						break;
					default:
						this.uart.write(new Uint8Array(buf));
						break;
				}
				resolve({ ret: 1, data: 1 });
			}else{
				let tm :any = null;
				this.uart.on("data", (data:any) => {
					if (data_buf.uflag == 1) {
						data_buf.uartbuf = data;
					} else {
						let tmp = new Uint8Array(data.length + data_buf.uartbuf.length);
						tmp.set(data_buf.uartbuf);
						tmp.set(data, data_buf.uartbuf.length);
						data_buf.uartbuf = tmp;
					}
					while (this.dealReceivedData(data_buf,buf,parse_data)); // 接收超出部分需保留
					if (data_buf.revDone) {
						if (tm) {
							clearTimeout(tm);
							tm = null;
						}
						data_buf.revDone = 0;
						resolve({ ret: 1, data: data_buf.revResult });
					}
				});
				this.uart.on("error", (error:any, msg:any) => {
					console.error(name+" Error!!!");
					if (tm) {
						clearTimeout(tm);
						tm = null;
					}
					resolve({ ret: 0 });
				});
				this.uart.write(new Uint8Array(buf));
				tm = setTimeout(() => {
					resolve({ ret: 0 });
				}, timeout);
			}
		});
	}
	closeUart = () => {
		this.uart.end();
	}
	dealReceivedData(data_buf:any,send_buf:any,parse_data:any){
		switch (data_buf.uflag) {
			case 0:
				let hty=parse_data.header_data(data_buf.uartbuf);
				if(hty==1){
					let len = parse_data.length_data(data_buf.uartbuf);
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
}