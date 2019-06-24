function Uarts_Mgr(){
	var uartsList=[];
	var parseList=[];
	var config=require("../../../logic/config.json").uarts;
	this.openNeedUarts=async function(list){
		var result=1;
		for(var i=0;i<list.length;i++){
			var name=list[i];
			uartsList[name]=require("./com.js").create();
			var ret=await uartsList[name].openUart(config[name]);
			if(!ret){
				i-=1;
				while(i>-1){
					var name=list[i];
					uartsList[name].closeUart(config[name]);
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
	this.sendDataForUarts=async function(name,data,send_type){
		if(parseList[name]==undefined){
			var parse_file="./parse/"+config[name]["parse"];
			parseList[name]=require(parse_file);
		}
		var cmd=parseList[name].disposeSendData(data);
		var revdata=await uartsList[name].sendData(cmd,parseList[name],send_type);
		return new Promise(resolve => {
			resolve({ret:revdata.ret,data:revdata.data});
		});
	}
}

module.exports = new Uarts_Mgr();