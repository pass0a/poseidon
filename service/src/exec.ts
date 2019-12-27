import * as cp from 'child_process';

export * from 'child_process';

interface AnyOptions {
	[index: string]: any;
}

export function defaultExeOpt(opt?: cp.ExecOptions) {
	if (!opt) {
		opt = {};
	}
	if (process.env.NODE_DEBUG) {
		if (typeof opt.windowsHide == 'boolean') opt.windowsHide = true;
	} else {
		if (typeof opt.windowsHide == 'boolean') opt.windowsHide = false;
	}
	return opt;
}
export function defaultSpawnOpt(opt?: cp.SpawnOptions) {
	if (!opt) {
		opt = {};
	}
	if (process.env.NODE_DEBUG) {
		if (typeof opt.windowsHide == 'boolean') opt.windowsHide = true;
	} else {
		if (typeof opt.windowsHide == 'boolean') opt.windowsHide = false;
	}
	return opt;
}
