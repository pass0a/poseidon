function alltoUint8Array(buf){
    switch(buf.constructor.name){
    case "Object":
    case "Array":
	    return new Buffer(JSON.stringify(buf));
	    break;
    case "String":
	    return new Buffer(buf);	
	    break;
    case "Uint8Array":
    case "Buffer":
	    return buf;
	    break;
    }
    return undefined;
}

function Serialport(name,option,fn) {
    this.uartname;
    this.cli;
    this.ev=[];
    
}
Serialport.prototype.on = function(name,fp){
    this.ev[name]=fp;
}
Serialport.prototype.write = function () {
    return __passoa_net_write_serialport(this.cli,alltoUint8Array(arguments[0])); 
}
Serialport.prototype.end=function(){
    if(arguments.length){
	    __passoa_net_write_serialport(this.cli,alltoUint8Array(arguments[0]));
    }
    return __passoa_net_close_serialport(this.cli);
}
Serialport.prototype.call=function(){
    var name=arguments[0];
    var arr= Array.prototype.slice.call(arguments,1,arguments.length);
    if(this.ev[name]!=undefined){
	    this.ev[name].apply(this,arr);
    }
};
Serialport.prototype.connect = function (name,option,fn) {
    this.uartname=name;
    this.ev["connect"]=fn;
    var opt={
	    flow_control:0,
	    baud_rate:115200,
	    parity:0,
	    stop_bits:0,
	    character_size:8,
	    timeout:500
    };
    for(key in option){
	    if("number"==typeof option[key]){
	        opt[key]=option[key];
	    }
    }
    this.cli=__passoa_net_connect_serialport(name,opt.flow_control,opt.baud_rate,opt.parity,opt.stop_bits,opt.character_size,this.call.bind(this));
}
function connect(name,option,fn) {
    var c=new Serialport(name,option,fn);
    c.connect(name,option,fn);
    return c;
}
module.exports={
    connect:connect,
}
