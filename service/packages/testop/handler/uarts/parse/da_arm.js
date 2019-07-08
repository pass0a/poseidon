function Parse_Data(){
	// var arm_path=require("../../../../config.json").uarts.da_arm.arm_path;
	this.disposeSendData=function(obj){
		var cmd="";
		switch(obj){
			case 0:
				cmd="export LD_LIBRARY_PATH=/data/app/pack:$LD_LIBRARY_PATH \n";
				break;
			case 1:
				cmd="/data/app/pack/passoa /data/app/pack/robot/index.js& \n";
				break;
			case 2:
				cmd="sendevent /dev/input/event1 0001 0102 00000001 \n";
				break;
			case 3:
				cmd="sendevent /dev/input/event1 0000 0000 00000000 \n";
				break;
			case 4:
				cmd="sendevent /dev/input/event1 0001 0102 00000000 \n";
				break;
			case 5:
				cmd="sendevent /dev/input/event1 0000 0000 00000000 \n";
				break;
		}
		return cmd;
	}
}
module.exports = new Parse_Data();