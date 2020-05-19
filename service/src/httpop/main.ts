import * as express from 'express';
import * as cors from 'cors';
import { join, dirname } from 'path';
var app = express();

app.use(cors());
app.use(express.static(join(dirname(process.execPath), 'view')));
app.listen(6003, function() {
	console.log('CORS-enabled web server listening on port 6003');
});
