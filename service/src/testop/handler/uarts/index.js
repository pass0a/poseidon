function Uarts_Mgr(){
	var uartsList=[];
	var parseList=[];
	var config={};
	this.openNeedUarts=async function(list,cfg){
		var result=1;
		config=cfg;
		for(var i=0;i<list.length;i++){
			var name=list[i];
			uartsList[name]=require("./com.js").create();
			var info=disposeInfo(config[name]);
			var ret=await uartsList[name].openUart(info);
			if(!ret){
				i-=1;
				while(i>-1){
					var name=list[i];
					uartsList[name].closeUart(info);
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
	this.closeNeedUarts=async function(){
		for(var name in uartsList){
			uartsList[name].closeUart();
		}
	}
	this.sendDataForUarts=async function(uart_name,send_id,send_type,info){
		if(parseList[uart_name]==undefined){
			var parse_file="./parse/"+uart_name+".js";
			parseList[uart_name]=require(parse_file);
		}
		var send_data=parseList[uart_name].disposeSendData(send_id,info);
		var rev_data=await uartsList[uart_name].sendData(send_data,parseList[uart_name],send_type);
		return new Promise(resolve => {
			resolve({ret:1,data:rev_data.data});
		});
	}

	function disposeInfo(cfg){
		var obj={},info={};
		for(var prop in cfg){
			if(prop=="port")obj[prop]="COM"+cfg[prop];
			else info[prop]=cfg[prop];
		}
		obj["info"]=info;
		return obj;
	}
}

module.exports = new Uarts_Mgr();