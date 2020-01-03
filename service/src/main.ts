import * as httpop from './httpop/main';
import * as dbop from './dbop/main';
import * as linkmgr from './linkmgr/main';
import * as devop from './devop/main';
import * as comop from './comop/main';
import * as webop from './webop/main';
export function start() {
	httpop.start();
	dbop.start();
	linkmgr.start();
	devop.start();
	comop.start();
	webop.start();
}
export function stop() {
	console.log('app stop!!!!');
	process.exit(0);
}
