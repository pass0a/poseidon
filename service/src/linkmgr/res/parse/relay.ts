class Parse_Data {
	header_data(data:any){
		if(data.length>2){
			let header=(data[0]<<8)+data[1];
			if(header==0x005A){
				return 1;
			}else{
				return 2;
			}
		}	
		return 0;
	}
	parse_fn(rdata:any,sdata:any){
		rdata.revResult=this.updateRelayStatus(rdata.ubuf);
		return true;
	}
	updateRelayStatus(data:any){
		let relayStatus=[];
		for(let i=0;i<16;i++){
			if(i<8)relayStatus[i]=data[6]&(0x01<<i);
			relayStatus[i]=i<8?(data[6]>>i)&0x01:(data[7]>>(i-8))&0x01;
		}
		return relayStatus;
	}
	disposeSendData(obj:any){
		let cmdbase=[0x00,0x5A,0x60,0x01,0x00,0x00,0x00,0x00];
		if(obj.act=="tool_status"){
			cmdbase[4]=0x07;
			return cmdbase;
		}
		let cmdstr=obj.id.substring(13);
		let cmdarr=cmdstr.split("-");
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
		let checkByte=0;
        for(let i=0;i<8;i++){
            checkByte+=cmdbase[i];
        }
        cmdbase.push(checkByte);
		return cmdbase;
	}
}
export default new Parse_Data();