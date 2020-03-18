let sql_express = require("./web/express");
let sql_cors = require("./web/cors");
let sql_res = require("./web/res");

let sql_app = sql_express();
sql_app.use(sql_cors({
	"allowedHeaders":'Content-Type, Authorization, Content-Length, X-Requested-With',
	"optionsSuccessStatus": 200
}));
sql_app.use(sql_res);
sql_app.listen(6004);