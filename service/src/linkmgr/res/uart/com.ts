// import * as util from "util";
import { serialport } from '@passoa/serialport';

export class Uart{
	private uart:any;
	private name:any;
	private id:any;
	private backCall:any;
	private data_buf:any;
	private startAnalyze:boolean = false;
	private timer:any;
	private analyzeDataObj:any;
	private fileStream:any;
	openUart(data:any,fn:any) {
		return new Promise((resolve) => {
			this.id = data.id;
			this.name = data.port;
			this.backCall = resolve;
			this.uart = new serialport(data.port, data.info);
			this.uart.on("data", (data:any) => {
				// console.info(new util.TextDecoder().decode(data));
				if(this.startAnalyze){
					if(this.analyzeDataObj.disposeRevData(data)){
						this.clearTimer();
						this.backCall({ret:1});
					}
				}
			});
			this.uart.on("end", () => {
				console.info("serialport: " + this.name + " close!!!");
				if(this.fileStream){
					this.fileStream.end();
					this.fileStream = null;
				}
				fn(this.id);
				this.backCall({ret:0});
			});
			this.uart.on("error", (error:any, msg:any) => {
				console.error(this.name+" Error!!!");
				if(this.fileStream){
					this.fileStream.end();
					this.fileStream = null;
				}
				fn(this.id);
				this.backCall({ret:0});
			});
			this.timeout(500,1);
		});
	}
	sendData(buf:any,send_type:any,parse_obj?:any,timeout?:any) {
		return new Promise((resolve) => {
			this.backCall = resolve;
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
				this.startAnalyze = true;
				switch(buf.constructor.name){
					case "String":
						this.analyzeDataObj = parse_obj;
						this.uart.write(buf);
						break;
					default:
						this.data_buf = {
							sendbuf:buf,
							uartbuf:new Uint8Array(0),
							ubuf:new Uint8Array(0),
							udatalen:0,
							uflag:0,
							revResult:{},
							revDone:0
						}
						this.uart.write(new Uint8Array(buf));
						break;
				}
				if (timeout == undefined)timeout = 2000;
				this.timeout(timeout,0);
			}
		});
	}
	openLog(loger:any,file:any){
		return new Promise((resolve) => {
			if(this.uart){
				this.fileStream = file;
				this.uart.pipe(loger).pipe(file);
				resolve({ret:1});
			}else{
				resolve({ret:0});
			}
		});
	}
	closeUart(){
		return new Promise((resolve) => {
			this.uart.end();
			resolve({ret:1});
		});
	}
	private timeout(ts:number,ret:number){
        this.timer = setTimeout(() => {
			this.startAnalyze = false;
            this.backCall({ ret: ret });
		},ts);
    }
    private clearTimer(){
        if(this.timer){
            clearTimeout(this.timer);
            this.timer = null;
        }
    }
	private analyzeData(data:any){
		if (this.data_buf.uflag == 1) {
			this.data_buf.uartbuf = data;
		} else {
			let tmp = new Uint8Array(data.length + this.data_buf.uartbuf.length);
			tmp.set(this.data_buf.uartbuf);
			tmp.set(data, this.data_buf.uartbuf.length);
			this.data_buf.uartbuf = tmp;
		}
		while (this.dealReceivedData(this.data_buf,this.data_buf.sendbuf,this.data_buf.parsedata)); // 接收超出部分需保留
		if (this.data_buf.revDone) {
			this.clearTimer();
			this.data_buf.revDone = 0;
			this.startAnalyze = false;
			this.backCall({ ret: 1, data: this.data_buf.revResult });
		}
	}
	private dealReceivedData(data_buf:any,send_buf:any,parse_data:any){
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