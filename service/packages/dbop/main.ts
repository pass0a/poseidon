import * as mongoose from 'mongoose';
import * as pack from '@passoa/pack';
import * as net from 'net';
import users from './users/index';
import cases from './cases/index';
import projects from './projects/index';
import res from './res/index';
import rule from './rule/index';
import buttons from './buttons/index';
import status from './status/index';

//config.logmode('rotating', 'passoa', __dirname + '/passoa.log', 1024 * 1024 * 5, 1);

let pis = new pack.inputStream();
let pos = new pack.outputStream();
let DB_URL = 'mongodb://127.0.0.1/poseidon_data';
let options = { useNewUrlParser: true, ssl: false };
let db_status : boolean = false;
createServer();

function createServer() {
	let sv: any;
	pis.on('data', (data: any) => {
		sv.write(data);
	});
	pos.on('data', (data: any) => {
		if(db_status){
			switch(data.type){
				case 'toDB':
					handle(data);
					break;
				case 'toSer':
					buttons.disposeData(data, pis);
					status.disposeData(data, pis);
					break;
			}
		}
	});
	net.createServer(function(c) {
		sv = c;
		sv.on('data', function(data: any) {
			pos.push(data);
		});
		sv.on('end', function(data: any) {
			console.log('server end');
		});
		sv.on('error', function(data: any) {
			console.log('server error');
		});
		// pis.push({});
	}).listen(6002);

	mongoose.connect(DB_URL, options, function(error) {
		if (error) console.error(error);
		else {
			// pis.push({});
			db_status = true;
		}
	});
}

function handle(data: any) {
	switch (data.route) {
		case 'projects':
			projects.disposeData(data, pis);
			break;
		case 'users':
			users.disposeData(data, pis);
			break;
		case 'cases':
			cases.disposeData(data, pis);
			break;
		case 'res':
			res.disposeData(data, pis);
			break;
		case 'rule':
			rule.disposeData(data, pis);
			break;
		case 'buttons':
			buttons.disposeData(data, pis);
			break;
		case 'status':
			status.disposeData(data, pis);
			break;
		default:
			break;
	}
}
