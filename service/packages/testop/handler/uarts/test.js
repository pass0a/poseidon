// var test=require("./index.js");
var list=["da_mcu"];
var data2=[0xAA, 0x00, 0x05, 0x0E, 0x01, 0x01, 0x00, 0xA1];
var data=[0xAA, 0x00, 0x05, 0x0E, 0x01, 0x01, 0x02, 0xA3];
ttt();
async function ttt(){
	// var ret=await test.openNeedUarts(list);
	// console.log("------",ret.ret);
	// for(var i=0;i<3;i++){
	// 	var ret=await test.sendDataForUarts("da_mcu",data);
	// console.info(ret.data);
	// var ret2=await test.sendDataForUarts("da_mcu",data2);
	// console.info(ret2.data);
	// }
	
	
	var uarts=require("./com.js").create();
	uarts.openUart({"port":"COM1","info":{"baud_rate":9600,"flow_control":0,"stop_bits":0}});
}