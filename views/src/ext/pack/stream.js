var Stream=function(){
    this.init=function(){
		var listeners={};
		this.on=function(type,listener){
			// if(!listeners[type]){
			// 	listeners[type]=[];
			// }
			// listeners[type]=listeners[type].concat(listener);
			listeners[type]=listener;
		}
		this.off=function(type,listener){
			// var index;
			// if(!listener[type]){
			// 	return false;
			// }
			// index=listeners[type].indexOf(listener);
			// listeners[type]=listeners[type].slice();
			// listeners[type].splice(index,1);
			// return index > -1;
			listeners[type]=undefined;
		}
		this.trigger=function(type){
			var callbacks,i,length,args;
			callbacks=listeners[type];
			if(!callbacks){
				return ;
			}
			return callbacks.apply(this,Array.prototype.slice.call(arguments, 1));
			// if(arguments.length===2){
			// 	length=callbacks.length;
			// 	for(i=0;i<length;++i){
			// 	    callbacks[i].call(this,arguments[1]);
			// 	}
			// }else{
			// 	args=[];
			// 	i=arguments.length;
			// 	for(i=1;i<arguments.length;++i){
			// 	    args.push(arguments[i]);
			// 	}
			// 	length=callbacks.length;
			// 	for(i=0;i<length;++i){
			// 	    callbacks[i].call(this,arguments[1]);
			// 	}
			// }
		}
		this.dispose=function(){
			listeners={};
		}

    }   
}
Stream.prototype.pipe=function(destination){
    this.on("data",function(data){
		return destination.push(data);
    });
    this.on("done",function(flushSource){
		return destination.flush(flushSource);
    });
	return destination;
}
Stream.prototype.push=function(data){
    return this.trigger("data",data)
}
Stream.prototype.flush=function(flushSource){
    return this.trigger("done",flushSource);
}
module.exports=Stream
