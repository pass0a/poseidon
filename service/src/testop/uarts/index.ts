import { Uart } from "./com";
import arm from "./parse/da_arm";
import rel from "./parse/relay";

class Uarts_Mgr{
	private uartsList:any = [];
	private parseList:any = [];
	private config:any;
	async openNeedUarts(list:any,cfg:any){
		let result = 1;
		this.config = cfg;
		for(let i=0;i<list.length;i++){
			let name=list[i];
			this.uartsList[name]=new Uart();
			let info=this.disposeInfo(this.config[name]);
			let ret=await this.uartsList[name].openUart(info);
			if(!ret){
				i-=1;
				while(i>-1){
					let name=list[i];
					this.uartsList[name].closeUart(info);
					i--;
				}
				result=0;
				break;
			}
		}
		return new Promise(resolve => {
			resolve(result);
		});
    }
	closeNeedUarts(){
		for(let name in this.uartsList){
			this.uartsList[name].closeUart();
		}
	}
	async sendDataForUarts(uart_name:any,send_id:any,send_type:any,info:any){
		if(this.parseList[uart_name]==undefined){
			if(uart_name=="da_arm")this.parseList[uart_name]=arm;
			else if(uart_name=="relay")this.parseList[uart_name]=rel;
		}
		let send_data=this.parseList[uart_name].disposeSendData(send_id,info);
		let rev_data=await this.uartsList[uart_name].sendData(send_data,this.parseList[uart_name],send_type);
		return new Promise(resolve => {
			resolve({ret:1,data:rev_data.data});
		});
	}
	disposeInfo(cfg:any){
		let obj:any={};
		let info:any={};
		for(let prop in cfg){
			if(prop=="port")obj[prop]="COM"+cfg[prop];
			else info[prop]=cfg[prop];
		}
		obj["info"]=info;
		return obj;
	}
}
export default new Uarts_Mgr();