function Parse_Data(){
	this.header_data=function(data){
		if(data.length>2){
			var header=(data[0]<<8)+data[1];
			if(header==0x005A){
				return 1;
			}else{
				return 2;
			}
		}	
		return 0;
	}
	
	this.length_data=function(data){
		return 9; 
	}
	
	this.parse_fn=function(rdata,sdata){
		rdata.revResult=updateRelayStatus(rdata.ubuf);
		return true;
	}
	
	function updateRelayStatus(data){
		var relayStatus=[];
		for(var i=0;i<16;i++){
			if(i<8){
				relayStatus[i]=data[6]&(0x01<<i);
			}
			relayStatus[i]=i<8?(data[6]>>i)&0x01:(data[7]>>(i-8))&0x01;
		}
		return relayStatus;
	}

	this.disposeSendData=function(obj){
		var cmdbase=[0x00,0x5A,0x60,0x01,0x00,0x00,0x00,0x00];
		if(obj.act=="tool_status"){
			cmdbase[4]=0x07;
			return cmdbase;
		}
		var cmdstr=obj.id.substring(13);
		var cmdarr=cmdstr.split("_");
		switch(parseInt(cmdarr[0])){
			case 1:
				cmdbase[4]=0x01;
				break;
			case 2:
				cmdbase[4]=0x02;
				break;
			default:    
				break;
		}
		cmdbase[5]=parseInt(cmdarr[1]);
		var checkByte=0;
        for(var i=0;i<8;i++){
            checkByte+=cmdbase[i];
        }
        cmdbase.push(checkByte);
		return cmdbase;
	}
}
module.exports = new Parse_Data();