import * as util from "util";
class Parse_Data{
	private ret_type:number = -1;
	private ret_data:string = "";
	disposeSendData(send_id:any,msg:any){
		let send_data:any;
		switch(send_id){
			case "start_arm_server":
				this.ret_type = 0;
				send_data = msg.path+"/passoa "+msg.path+"/app.js& \n";
				break;
			case "button":
				let arr = msg.ct.split(" ");
				let str_10 = parseInt(arr[1],16).toString();
				let len = arr[1].length - str_10.length;
				for(let k=0;k<len;k++)str_10="0"+str_10;
				arr[1]=str_10;
				send_data = "sendevent "+msg.event+" "+arr.join(" ")+" \n";
				break;
			case "others":
				send_data = msg.others_cmd + " \n";
				break;
			default:
				break;
		}
		return send_data;
	}
	disposeRevData(data:any){
		switch(this.ret_type){
			case 0:
				this.ret_data += new util.TextDecoder().decode(data);
				if(this.ret_data.indexOf("passoa success") > -1){
					this.ret_data = "";
					return 1;				
				}
				break;
		}
		return 0;
	}
}
export default new Parse_Data();