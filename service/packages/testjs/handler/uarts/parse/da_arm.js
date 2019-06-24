function Parse_Data(){
	var arm_path=require("../../../../config.json").uarts.da_arm.arm_path;
	this.disposeSendData=function(obj){
		var cmd="";
		switch(obj){
			case 0:
				cmd="export LD_LIBRARY_PATH="+arm_path+":$LD_LIBRARY_PATH \n";
				break;
			case 1:
				cmd=arm_path+"/passoa "+arm_path+"/robot/index.js \n";
				break;
		}
		return cmd;
	}
}
module.exports = new Parse_Data();