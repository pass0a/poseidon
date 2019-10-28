import * as util from "util";

class QG_BOX{
	private request = require("./request.js");
	private boxApiList:any = { freq : ["get_init_pow"]};
	chooseBoxApi(name:any,idx:any,cfg:any){
		return "http://" + cfg.ip + ":" + cfg.port + "/?" + this.boxApiList[name][idx];
	}
	sendBoxApi(name:any,idx:any,cfg:any){
		return new Promise((resolve) => {
			let tm : any = null;
			this.request()(this.chooseBoxApi(name,idx,cfg),(status:any,opt:any,body:any) => {
				switch(status){
					case "start":	    
						break;
					case "reading":
						if (tm) {
							clearTimeout(tm);
							tm = null;
						}
						let value = new util.TextDecoder().decode(body);
						let ret = value.indexOf("Fail")>-1?{ret:1}:{ret:0,data:value};
						resolve(ret);
						break;
					case "stop":
						break;
				}
			});
			tm = setTimeout(function () {
				resolve({ ret: 2 });
			}, 3000);
		});
    }
}
export default new QG_BOX();