class DBC {
	private messagesList: any = {};
	getDBC_sendData(msg: any, sgn: any, value: any) {
		if (this.messagesList[msg.name] == undefined) {
			this.messagesList[msg.name] = {
				data: new Uint8Array(msg.dlc),
				id: msg.id
			};
		}
		if (sgn.endianess == 'motorola') {
			this.messagesList[msg.name].data = this.disposedForMotorola(this.messagesList[msg.name].data, sgn, value);
		} else {
			this.messagesList[msg.name].data = this.disposedForIntel(this.messagesList[msg.name].data, sgn, value);
		}
		return this.messagesList[msg.name];
	}
	private disposedForMotorola(data: any, sgn: any, value: any) {
		let buffer = data;
		// motorola
		let jl: any = [];
		for (let i = 0; i < buffer.length; i++) {
			for (let j = 0; j < 8; j++) {
				jl.push((buffer[i] >> (7 - j)) & 0x01);
			}
		}
		let start_bit = sgn.startbit,
			len = sgn.bitlength;
		let start_idx = 8 * Math.floor(start_bit / 8) + (7 - start_bit % 8);
		let akt = sgn.physics ? (value - sgn.offset) / sgn.factor : value;
		for (let i = start_idx; i < start_idx + len; i++) {
			jl[i] = (akt >> (start_idx + len - 1 - i)) & 0x01;
		}
		let op: any = [];
		for (let i = 0; i < jl.length; i += 8) {
			op.push(
				(jl[i] << 7) |
					(jl[i + 1] << 6) |
					(jl[i + 2] << 5) |
					(jl[i + 3] << 4) |
					(jl[i + 4] << 3) |
					(jl[i + 5] << 2) |
					(jl[i + 6] << 1) |
					jl[i + 7]
			);
		}
		return Buffer.from(op);
	}
	private disposedForIntel(data: any, sgn: any, value: any) {
		let buffer = data;
		let jt: any = [];
		for (let i = 0; i < buffer.length; i++) {
			for (let j = 0; j < 8; j++) {
				jt.push((buffer[i] >> j) & 0x01);
			}
		}
		let start_bit = sgn.startbit,
			len = sgn.bitlength;
		let akt = sgn.physics ? (value - sgn.offset) / sgn.factor : value;
		for (let i = start_bit; i < start_bit + len; i++) {
			jt[i] = (akt >> (i - start_bit)) & 0x01;
		}
		let tp: any = [];
		for (let i = 0; i < jt.length; i += 8) {
			tp.push(
				jt[i] |
					(jt[i + 1] << 1) |
					(jt[i + 2] << 2) |
					(jt[i + 3] << 3) |
					(jt[i + 4] << 4) |
					(jt[i + 5] << 5) |
					(jt[i + 6] << 6) |
					(jt[i + 7] << 7)
			);
		}
		return Buffer.from(tp);
	}
}
export default new DBC();
