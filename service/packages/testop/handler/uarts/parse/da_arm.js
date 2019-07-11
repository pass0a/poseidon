var os = require("os");

function Parse_Data(){
	this.disposeSendData=function(send_id,msg){
		var send_data;
		switch(send_id){
			case "set_arm_lib_path":
				send_data = "export LD_LIBRARY_PATH="+msg+":$LD_LIBRARY_PATH"+" \n";
				break;
			case "start_arm_server":
				send_data = msg+"/passoa "+msg+"/robot/index.js& \n";
				break;
			case "button":
				var arr = msg.ct.split(" ");
				var str_10 = parseInt(arr[1],16).toString();
				var len = arr[1].length - str_10.length;
				for(var k=0;k<len;k++)str_10="0"+str_10;
				arr[1]=str_10;
				send_data = "sendevent "+msg.event+" "+arr.join(" ")+" \n";
				break;
			default:
				break;
		}
		return send_data;
	}
}

module.exports = new Parse_Data();