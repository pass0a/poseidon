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
import group from './group/index';
import imgs from './imgs/index';

//config.logmode('rotating', 'passoa', __dirname + '/passoa.log', 1024 * 1024 * 5, 1);

let pis = new pack.packStream();
let pos = new pack.unpackStream();
let sv: any;
let DB_URL = 'mongodb://127.0.0.1/poseidon_data';
let options = { useNewUrlParser: true, ssl: false };
let db_status : number = 0;
let db_ct = mongoose.connection;
let req = {type:"toDB",route:"connect",info:0};

createServer();

function createServer() {
	pis.on('data', (data: any) => {
		sv.write(data);
	});
	pos.on('data', (data: any) => {
		switch(data.type){
			case 'toDB':
				handle(data);
				break;
			case 'toSer':
				buttons.disposeData(data, pis);
				status.disposeData(data, pis);
				group.disposeData(data, pis);
				break;
		}
	});
	db_ct.on('connected', ()=>{
		console.info('db connected');
	});
	db_ct.on('disconnected', ()=>{
		if(sv&&db_status==1){
			db_status = 2;
			req.info = db_status;
			pis.write(req);
		}
		console.error('db disconnected');
	});
	net.createServer(function(c) {
		sv = c;
		sv.on('data', function(data: any) {
			pos.write(data);
		});
		sv.on('end', function(data: any) {
			console.info('db_server end');
		});
		sv.on('error', function(data: any) {
			console.error('db_server error');
		});
	}).listen(6002);
	if(db_status != 1)connectDB();
}

async function connectDB(){
	let num = 10;
	while(num){
		if(await mongooseConnect()){
			db_status = 1;
			break;
		}
		num--;
		if(num==0){
			db_status = 2;
			break;
		}
		await wait(2000);
	}
	req.info = db_status;
	if(sv)pis.write(req);
}

async function wait(time:any){
	return new Promise((resolve) => {
		setTimeout(function(){
			resolve(0);
		},time);
	});
}

async function mongooseConnect(){
	return new Promise((resolve) => {
		mongoose.connect(DB_URL, options, (error:any) => {
			if (error){
				console.error(error);
				resolve(false);
			} 
			else resolve(true);
		});
	});
}

function handle(data: any) {
	switch (data.route) {
		case 'connect':
			data.info = db_status;
			pis.write(data);
			break;
		case 'reconnect':
			connectDB();
			break;
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
		case 'group':
			group.disposeData(data, pis);
			break;
		case 'imgs':
			imgs.disposeData(data, pis);
			break;
		default:
			break;
	}
}
