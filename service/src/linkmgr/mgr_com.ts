import * as pack from "@passoa/pack";
import { Uart } from "./res/uart/com";
import relay from "./res/parse/relay";
import da_arm from "./res/parse/da_arm";

export class Com_mgr{
	private pos:any = new pack.unpackStream();
	private pis:any = new pack.packStream();
	private intc:any;
	private link:any;
	private uartlist:any = [];
	constructor() {
		this.pis.on('data', (data: any) => {
			this.intc.write(data);
		});
		this.pos.on('data', (data: any) => {
		});
	}

	async handleCmd(obj: any) {
		let result:any;
		switch(obj.job){
			case "startPassoa":
				result = await this.openNeedUarts(["da_arm"],obj.cfg);
				if(result){
					this.sendDataByName({name:"da_arm",cmd:"start_arm_server",msg:obj.cfg.da_server.path});
					// this.uartlist["da_arm"].sendData(obj.cfg.da_server.path+"/passoa "+obj.cfg.da_server.path+"/app.js& \n",1);
					await this.wait(8000);
					this.uartlist["da_arm"].closeUart();
					this.uartlist["da_arm"] = null;
				}
				break;
			case "sendData":
				result = this.sendDataByName(obj.info);
				break;
			case "openCom":
				result = await this.openNeedUarts(obj.info,obj.cfg);
				break;
			case "closeCom":
				result = await this.closeAllUarts();
				break;
		}
		return new Promise(resolve => {
			resolve(result);
		});
	};

	private async sendDataByName(info:any){
		let sd:any;
		switch(info.name){
			case "relay":
				sd = relay.disposeSendData(info.cmd);
				break;
			case "da_arm":
				sd = da_arm.disposeSendData(info.cmd,info.msg);
				break;
		}
		if(this.uartlist[info.name])this.uartlist[info.name].sendData(sd,1);
		else return 0;
		return 1;
	}

	private async closeAllUarts(){
		for(let prop in this.uartlist){
			if(this.uartlist[prop]){
				this.uartlist[prop].closeUart();
				this.uartlist[prop] = null;
			}
		}
		return new Promise(resolve => {
			resolve(1);
		});
	}

	private async openNeedUarts(uartArray:Array<any>,cfg:any){
		for(let i=0;i<uartArray.length;i++){
			let uart_name = uartArray[i];
			let uart_info:any = {port:"",info:{}};
            for(let prop in cfg.uarts[uart_name]){
                if(prop == "port")uart_info.port="COM"+cfg.uarts[uart_name][prop];
                else uart_info.info[prop]=cfg.uarts[uart_name][prop];
			}
			uart_info.id = uart_name;
			this.uartlist[uart_name] = new Uart();
			if(!await this.uartlist[uart_name].openUart(uart_info,(name:string)=>{
				if(this.uartlist[name])this.uartlist[name] = null;
			})){
				i-=1;
				while(i>-1){
					this.uartlist[uartArray[i]].closeUart();
					this.uartlist[uartArray[i]] = null;
				}
				return new Promise(resolve => {
					resolve(0);
				});
			}
		}
		return new Promise(resolve => {
			resolve(1);
		});
	}

	private wait(w_time:any){
        return new Promise(resolve => {
            setTimeout( () => {
                resolve(0);
            },w_time);
        });
    }

	create(c:any,obj:any,link:any){
		this.intc = c;
		this.link = link;
		this.intc.on('data', (data:any) => {
			this.pos.write(data);
		});
		this.intc.on('close', () => {
			console.info('[link close]' + obj.class + '-' + obj.name + ':' + 'exit!!!');
			this.link.closeLink(obj.class,obj.name);
		});
		this.pis.write({ type: 'auth', state: 'ok' });
	}
}
