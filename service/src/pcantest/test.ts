import * as fs from 'fs-extra';
import * as util from 'util';
import { Pcan } from '@passoa/pcan';
let dbcInfo = JSON.parse(new util.TextDecoder().decode(fs.readFileSync('D:/data_store/projects/KU/dbc.json')));
let msg_id = [ 52, 54, 56 ];
let binding: any = {
	HU_DATC_AcSet: { message: 'DATC_PE_03', signal: 'DATC_AcDisp' }, //AC
	HU_DATC_FrontDefog: { message: 'DATC_PE_03', signal: 'DATC_FrDefLed' }, //前除霜
	C_RrDefoggerCmdAVN: { message: 'GW_HU_PE_01', signal: 'C_DefoggerRly' }, //后除霜
	HU_DATC_AutoSet: { message: 'DATC_PE_03', signal: 'DATC_AutoDisp' }, //AUTO
	HU_DATC_DrTempSetC: { message: 'DATC_PE_02', signal: 'DATC_DrTempDispC' } //温度
};
let messagesList: any = {};
let inst = new Pcan({
	baudrate: 0x432f,
	hardware_type: 0x01,
	io_port: 0x0100,
	interrupt: 3
});
inst.on('data', (msg) => {
	for (let idx = 0; idx < msg_id.length; idx++) {
		if (msg.id == msg_id[idx]) {
			console.log('Rx:', msg.data);
			for (let prop in dbcInfo.Messages_Info) {
				if (dbcInfo.Messages_Info[prop].id == msg.id) {
					let signals = dbcInfo.Messages_Info[prop].signals;
					for (let i = 0; i < signals.length; i++) {
						let signal_info = dbcInfo.Signals_Info[signals[i]];
						if (signal_info.endianess == 'motorola') revForMotorola(msg.data, signal_info, signals[i]);
						else revForIntel(msg.data, signal_info, signals[i]);
					}
				}
			}
			break;
		}
	}
});

function revForMotorola(data: any, signal_info: any, signal_name: string) {
	let revData: any = [];
	for (let i = 0; i < data.length; i++) {
		for (let j = 0; j < 8; j++) {
			revData.push((data[i] >> (7 - j)) & 0x01);
		}
	}
	let start_bit = signal_info.startbit,
		len = signal_info.bitlength;
	let start_idx = 8 * Math.floor(start_bit / 8) + (7 - start_bit % 8);
	let value: any = 0;
	for (let i = start_idx; i < start_idx + len; i++) {
		let cop = revData[i] << (start_idx + len - 1 - i);
		value = value | cop;
	}
	if (!signal_info.physics) {
		for (let i = 0; i < signal_info.value.length; i++) {
			if (signal_info.value[i].val == value) {
				let title = signal_info.value[i].title.toLowerCase();
				if (title != 'reserved' && title != 'invalid') {
					// console.log(title);
					if (binding[signal_name] != undefined) initSendData(binding[signal_name], value);
				}
				break;
			}
		}
	}
}

function revForIntel(data: any, signal_info: any, signal_name: string) {
	let revData: any = [];
	for (let i = 0; i < data.length; i++) {
		for (let j = 0; j < 8; j++) {
			revData.push((data[i] >> j) & 0x01);
		}
	}
	let value: any = 0;
	let start_bit = signal_info.startbit,
		len = signal_info.bitlength;
	for (let i = start_bit; i < start_bit + len; i++) {
		let cop = revData[i] << (i - start_bit);
		value = value | cop;
	}
	if (!signal_info.physics) {
		for (let i = 0; i < signal_info.value.length; i++) {
			let title = signal_info.value[i].title.toLowerCase();
			if (title != 'reserved' && title != 'invalid') {
				console.log(title);
				if (binding[signal_name] != undefined) initSendData(binding[signal_name], value);
			}
			break;
		}
	}
}

function initSendData(info: any, value: any) {
	if (messagesList[info.message] == undefined) {
		messagesList[info.message] = {
			data: new Uint8Array(dbcInfo.Messages_Info[info.message].dlc),
			id: dbcInfo.Messages_Info[info.message].id
		};
	}
	let signal_info = dbcInfo.Signals_Info[info.signal];
	if (signal_info.endianess == 'motorola') {
		messagesList[info.message].data = sendForMotorola(messagesList[info.message].data, signal_info, value);
	} else {
		messagesList[info.message].data = sendForIntel(messagesList[info.message].data, signal_info, value);
	}
	console.log('Tx', messagesList[info.message].data);

	inst.write({ id: messagesList[info.message].id, data: messagesList[info.message].data });
}

function sendForMotorola(data: any, sgn: any, value: any) {
	let buffer = data;
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

function sendForIntel(data: any, sgn: any, value: any) {
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
