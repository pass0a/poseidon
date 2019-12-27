import * as httpop from './httpop/main';
import * as dbop from './dbop/main';
export function start() {
	httpop.start();
	dbop.start();
	//require('./linkmgr/main');
	// require('./devop/main');
	// require('./comop/main');
	// require('./webop/main');
}
export function stop() {
	process.kill(0);
	// httpop.stop();
	// dbop.stop();
}
