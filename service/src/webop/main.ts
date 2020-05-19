import { Server } from './server';
import * as fs from 'fs-extra';
import * as os from 'os';
let defaultConfig = {
	uarts: {
		relay: { port: 3, baud_rate: 9600, data_bits: 8, stop_bits: 0, parity: 0, flow_control: 0 },
		da_arm: { port: 1, baud_rate: 115200, data_bits: 8, stop_bits: 0, parity: 0, flow_control: 0 },
		log: { port: 16, baud_rate: 115200, data_bits: 8, stop_bits: 0, parity: 0, flow_control: 0 },
		power: { port: 1, baud_rate: 57600, data_bits: 8, stop_bits: 0, parity: 0, flow_control: 0 }
	},
	db_server: { type: 0, ip: '192.168.19.12', port: '6111' },
	da_server: {
		ip: '192.168.12.99',
		port: '6009',
		path: '/data/app/pack',
		type: 0,
		others_flag: 1,
		others_cmd: 'am start com.android.settings/com.android.settings.Settings',
		mac: 'D4:4D:A4:5C:AA:2A',
		ping: '1234'
	},
	qg_box: { ip: '192.168.0.101', port: '9000' },
	test_info: {
		error_exit: 0,
		error_music: 1,
		match: 90,
		music_path: 'C:\\Users\\huangzepeng\\Desktop\\SU2_power_test\\1.mp3'
	},
	log_info: { open: false, type: 0, adb_cmd: 'logcat', others_flag: 1 },
	pcan_info: { baudrate: 'baud_100k', hardware_type: 'ISA_82C200', io_port: '0100', interrupt: '3' }
};
export class App {
	private server = new Server();

	start() {
		this.findConfig();
		this.server.run(6001);
	}

	private findConfig() {
		let path = os.homedir() + '/data_store';
		fs.ensureDirSync(path);
		if (!fs.existsSync(path + '/config.json'))
			fs.writeFileSync(path + '/config.json', JSON.stringify(defaultConfig));
	}

	static create() {
		new App().start();
	}
}
App.create();
