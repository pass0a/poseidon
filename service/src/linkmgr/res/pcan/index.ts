import * as Pcan from '@passoa/pcan';

class PCAN{
	private	baudrate:any = {
        baud_1m:     0x0014,
        baud_800k:   0x0016,
        baud_500k:   0x001C,
        baud_250k:   0x011C,
        baud_125k:   0x031C,
        baud_100k:   0x432F,
        baud_50k:    0x472F,
        baud_20k:    0x532F,
        baud_10k:    0x672F,
        baud_5k:     0x7F7F,
        baud_33333k: 0x8B2F,
        baud_47619k: 0x1414,
        baud_95238k: 0xC34E,
        baud_83333k: 0x852B,
    };
    private hardware_type:any = {
        ISA_82C200:      0x01,
        ISA_SJA1000:     0x09,
        ISA_PHYTEC:      0x04,
        DNG_82C200:      0x02,
        DNG_82C200_EPP:  0x03,
        DNG_SJA1000:     0x05,
        DNG_SJA1000_EPP: 0x06
    };
	open(info:any,fn:any){
		let config = {
			baudrate : this.baudrate[info.baudrate],
			hardware_type : this.hardware_type[info.hardware_type],
			io_port : parseInt(info.io_port,16),
			interrupt : parseInt(info.interrupt,10)
		}
		return Pcan.initPcan(config,fn);
    }
    send(data:Buffer,id:number){
        return Pcan.send(data,id);
    }
    close(){
        return Pcan.uninitPcan();
    }
}
export default new PCAN();