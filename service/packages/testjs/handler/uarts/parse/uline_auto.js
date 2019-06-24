function Parse_Data(){
	this.header_data=function(data){
		if(data.length>2){
			if(data[0] == 0xAA){
				return 1;
			}else{
				return 2;
			}
		}	
		return 0;
	}
	
	this.length_data=function(data){
		return data[2] + 3;
	}
	
	this.parse_fn=function(rdata,sdata){
		return verifyInfo(rdata,sdata);
	}
	
	this.disposeSendData=function(obj){
		
	}
	
	function verifyInfo(data_buf, send_buf){
		if(verifyChecksum(data_buf.ubuf)){
			if(verifyMsgIDandSubID(data_buf,send_buf)){
				return true;
			}
		}
		return false;
	}
	
	function verifyChecksum(data){
		var checksum=0;
		for(var i=0;i<data.length-1;i++){
			checksum=checksum^data[i];
		}
		return checksum==data[data.length-1];
	}
	
	function verifyMsgIDandSubID(data_buf, send_buf){
		if(data_buf.ubuf[3]==send_buf[3]){
			if(data_buf.ubuf[4]==send_buf[4]){
				return analyseData(data_buf);
			}
		}
		return false;
	}
	
	function analyseData(data_buf){
		// if(data_buf.ubuf[5]==0x00){
			switch(data_buf.ubuf[3]){
				case 0x07:
					querySystemInfo(data_buf);
					break;
				default:
					data_buf.revResult=true;
					break;
			}
			return true;
		// }
		// return false;
	}
	
	function querySystemInfo(data_buf){
		switch(data_buf.ubuf[4]){
			case 0x04:
				data_buf.revResult=data_buf.ubuf[6];
				break;
		}
	}
	
	function consoleData_16(data) {
		var val = Duktape.enc('hex', data);
		console.info("[uart]rev buf:" + val);
	}
}
module.exports = new Parse_Data();