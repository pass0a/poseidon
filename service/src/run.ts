import * as cp from 'child_process';
import * as fs from 'fs-extra';
import { join, dirname } from 'path';

cp.exec('"adb/adb" devices');
let db_path = join(dirname(__dirname), '/data_store/DB');
fs.ensureDirSync(db_path);
let db_cmd = `"${join(__dirname, '/db/mongod')}" --dbpath "${db_path}" --storageEngine=mmapv1`;
console.log(db_cmd);
cp.exec(db_cmd);
require('./main.js');
cp.exec('"browser/browser" --url=http://127.0.0.1:6003 --enable-media-stream=1');
