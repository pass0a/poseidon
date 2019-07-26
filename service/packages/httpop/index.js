function WebApp(){
	var express = require('./web/express');
	var res=require('./res');
	var cors=require('./web/cors');
	this.app = express();
	this.app.use(cors({
		"allowedHeaders":'Content-Type, Authorization, Content-Length, X-Requested-With',
		"optionsSuccessStatus": 200
	}));
	this.app.use(res);
}
WebApp.prototype.start=function(){
	this.app.listen(6003);
};

module.exports=new WebApp();