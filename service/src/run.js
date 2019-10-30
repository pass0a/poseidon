require('child_process').exec('browser/browser --url=http://127.0.0.1:6003 --enable-media-stream=1', { shell: false });
require('./db/index.js');
require('./adb/index.js');
require('./app.js');
