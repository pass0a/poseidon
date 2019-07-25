function QG_BOX(){
	var request = require("./request.js");
	var util = require("util");
	var boxApiList={
		freq : ["get_init_pow"]
	};
	var chooseBoxApi = function (name,idx,cfg){
		return "http://" + cfg.ip + ":" + cfg.port + "/?" + boxApiList[name][idx];
	}
	this.sendBoxApi=async function(name,idx,cfg){
		return new Promise(resolve => {
			var tm = null;
			request()(chooseBoxApi(name,idx,cfg),function(status,opt,body){
				switch(status){
					case "start":	    
						break;
					case "reading":
						if (tm) {
							clearTimeout(tm);
							tm = null;
						}
						var value = new util.TextDecoder().decode(body);
						var ret = value.indexOf("Fail")>-1?{ret:1}:{ret:0,data:value};
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

module.exports = new QG_BOX();