import { Pcan } from '@passoa/pcan';
class PCAN {
	private inst: Pcan;
	private baudrate: any = {
		baud_1m: 0x0014,
		baud_800k: 0x0016,
		baud_500k: 0x001c,
		baud_250k: 0x011c,
		baud_125k: 0x031c,
		baud_100k: 0x432f,
		baud_50k: 0x472f,
		baud_20k: 0x532f,
		baud_10k: 0x672f,
		baud_5k: 0x7f7f,
		baud_33333k: 0x8b2f,
		baud_47619k: 0x1414,
		baud_95238k: 0xc34e,
		baud_83333k: 0x852b
	};
	private hardware_type: any = {
		ISA_82C200: 0x01,
		ISA_SJA1000: 0x09,
		ISA_PHYTEC: 0x04,
		DNG_82C200: 0x02,
		DNG_82C200_EPP: 0x03,
		DNG_SJA1000: 0x05,
		DNG_SJA1000_EPP: 0x06
	};
	open(info: any, fn: any) {
		let config = {
			baudrate: this.baudrate[info.baudrate],
			hardware_type: this.hardware_type[info.hardware_type],
			io_port: parseInt(info.io_port, 16),
			interrupt: parseInt(info.interrupt, 10)
		};
		this.inst = new Pcan(config);
		this.inst.on('data', fn);
		return this.inst.isOpened();
	}
	send(data: Buffer, id: number) {
		return this.inst.write({ id: id, data: data });
	}
	close() {
		if (this.inst) this.inst.destroy();
	}
}
export default new PCAN();
