// import * as cp from 'child_process';
// let c = cp.spawn('ping', [ '127.0.0.1' ], { detached: true });
// c.on('exit', () => {
// 	console.log('!!!!');
// });
// c.stdout.on('data', (data) => {
// 	console.log(data);
// });
// for (var i = 0; i < 100; i++) console.log(i);
// // if (c.stdout)
// 	c.stdout.on('data', (data) => {
// 		console.log(data);
// 	});
// c.on('exit', () => {
// 	console.log('exiting');
// });
//require('./db/index.js');
import * as mongoose from 'mongoose';
let DB_URL = 'mongodb://127.0.0.1/poseidon_data';

let options = {
	useNewUrlParser: true,
	ssl: false,
	useUnifiedTopology: true,
	server: {
		auto_reconnect: true,
		reconnectTries: Number.MAX_VALUE,
		reconnectInterval: 1000,
		socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 }
	}
};
mongoose.set('useFindAndModify', false);
mongoose.connect(DB_URL, options);

setTimeout(() => {
	mongoose.disconnect();
}, 5000);
