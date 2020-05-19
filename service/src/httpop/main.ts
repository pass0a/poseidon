import * as express from 'express';
import * as cors from 'cors';
import { join, dirname } from 'path';
var app = express();

app.use(cors());
app.use(express.static(join(dirname(process.execPath), 'view')));
app.get('/getImage', (req, res, next) => {
	let img = req.query.image;
	if (typeof img == 'string') {
		res.sendFile(img, (err) => {
			console.log(err);
		});
	}
});
app.get('/getIcon', (req, res, next) => {
	let icon = req.query.icon;
	if (typeof icon == 'string') {
		res.sendFile(icon, (err) => {
			console.log(err);
		});
	}
	next();
});
app.listen(6003, function() {
	console.log('CORS-enabled web server listening on port 6003');
});
