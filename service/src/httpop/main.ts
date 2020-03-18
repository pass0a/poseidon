let express = require("./web/express");
let cors = require("./web/cors");
let res = require("./web/res");

let app = express();
app.use(cors({
	"allowedHeaders":'Content-Type, Authorization, Content-Length, X-Requested-With',
	"optionsSuccessStatus": 200
}));
app.use(res);
app.listen(6003);