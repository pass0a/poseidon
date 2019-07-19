try {
    (function (){
        var net=require('net');
        function parse(url){
            var re = /(\w+):\/\/([^\:|\/]+)(\:\d*)?(.*\/)?([^#|\?|\n]+)?(#.*)?(\?.*)?/i;   
            var arr = url.match(re); 
            return arr;
        }
        function genHeaders(options){
            var opts={
                method:"GET",
                protocol:"HTTP/1.1",
                url:"/",
            }
            for(var key in options){
                opts[key]=options[key];
            }
            var str=opts.method+" "+opts.url+" "+opts.protocol+"\r\n";
            for(var key in opts){
                switch(key){
                    case "method":
                    case "url":
                    case "protocol":
                    case "port":
                    continue;
                    break;
                }
                str+=key+": "+opts[key]+"\r\n";
            }
            str+="\r\n";
            return str;
        }
        function genOptions(options,arr){
            if(arr[3]){
                options.port=parseInt(arr[3].substring(1));    
            }else{
                switch(arr[1]){
                    case "https":
                    options.port=443;
                    break;
                    case "http":
                    case "rtmp":
                    default:
                    options.port=80;
                    break;
                }
            }
            options.url="";
            for(var idx=4;idx<arr.length;idx++){
                if("string" == typeof arr[idx]){
                    options.url+=arr[idx];
                }
            }
            options.Host=arr[2];
        }
        function request(){
            var url=null,options=null,fn=null,body=null;
            var buff=new Uint8Array;
            var resheaders={};
            var datalen=0;
            var chunkstatus="start";
            var chunksize=0;
            var c;
            switch(arguments.length){
                case 0:
                case 1:
                    return ;
                break;
                case 2:
                    url=arguments[0];
                    fn=arguments[1];
                    options={};
                    if(typeof url!="string" && typeof fn!="funciton"){
                        return ;
                    }
                break;
                case 3:
                    url=arguments[0];
                    options=arguments[1];
                    fn=arguments[2];
                    if(typeof url!="string" && typeof options!="object" && typeof fn!="funciton"){
                        return ;
                    }
                break;
                default: 
                    url=arguments[0];
                    options=arguments[1];
                    body=arguments[2];
                    fn=arguments[3];
                    if(typeof url!="string" && typeof options!="object" && typeof fn!="funciton"){
                        return ;
                    }
                    options.method="POST";
                break;
            }
            var arr=parse(url);
            if(arr){
                genOptions(options,arr);
                c=net.connect(options.port,arr[2],function(){
                    c.on("data",function(data){
                        handleData(data);
                    });
                    var data="";
                    if(body){
                        data=Duktape.enc('jc',body);
                        options["Content-Length"]=data.length;
                    }
                    var head=genHeaders(options);
                    console.log(head+data);
                    c.write(head+data);
                });
                c.on("close",function(){
                    console.log("close !!!!");
                });
            }else{
                console.log(url+"is not corrent uri");
            }
            
            function handleData(buf){
                var len=buff.length;
                buff=new Uint8Array(buf.length+buff.length);
                buff.set(buff,0);
                buff.set(buf,len);
                while(buff.length){
                    if(isEmptyObject(resheaders)){
                        var comp=new TextDecoder().decode(buff);
                        var idx=comp.indexOf("\r\n\r\n");
                        if(idx>0){
                            parseResheaders(comp.substr(0,idx));
                            if(resheaders["Transfer-Encoding"]=="chunked"){
                                buff=buff.subarray(idx+2);
                            }else{
                                buff=buff.subarray(idx+4);
                            }
                        }
                    }else{
                        if(resheaders["Transfer-Encoding"]=="chunked"){
                            while(buff.length){
                                switch(chunkstatus){
                                    case "reading":
                                        if(chunksize<buff.length){
                                            var data=buff.subarray(0,chunksize);
                                            fn(chunkstatus,{},data);
                                            buff=buff.subarray(chunksize);
                                            chunkstatus="sizing";
                                        }else{
                                            fn(chunkstatus,{},buff);
                                            chunksize-=buff.length;
                                            buff=new Uint8Array;
                                            return ;                                            
                                        }
                                    break;
                                    case "start":
                                        fn(chunkstatus,{},"");
                                    case "sizing":
                                        var tmp=new TextDecoder().decode(buff.subarray(2,20));
                                        var idx=tmp.indexOf("\r\n");
                                        chunksize=parseInt(tmp.substr(0,idx),16);
                                        if(chunksize==0 || chunksize==NaN){
                                            chunkstatus="stop";
                                        }else{
                                            buff=buff.subarray(idx+4);
                                            chunkstatus="reading";
                                        }
                                    break;
                                    case "stop":
                                        c.end();
                                        fn(chunkstatus,{},"");
                                        return ;
                                    break;
                                }
                            }
                        }else{
                            if(!datalen){
                                fn("start",{},"");
                            }
                            datalen+=buff.length;
                            fn("reading",{},buff);
                            buff=new Uint8Array();    
                            if(datalen>=resheaders["Content-Length"]){
                                c.end();
                                fn("stop",{},"");
                            }
                        }
                    }
                }
            }
            function isEmptyObject(obj){
                for(var key in obj){
                    return 0;
                }
                return 1;
            }
            function parseResheaders(info){
                // var info=new TextDecoder().decode(buff);
                // var len=info.indexOf("\r\n\r\n");
                // if(len>0){
                // 	info=info.substr(0,len);
                // }
                var line=info.split("\r\n");
                var elem=line[0].split(" ");
                resheaders.code=elem[1];
                resheaders.status=elem[2];
                resheaders.procotol=elem[0];
                for(var i=1;i<line.length;i++){
                    var resheadersz=line[i].split(": ");
                    if(resheadersz.length>1){
                        resheaders[resheadersz[0]]=resheadersz[1];
                    }
                }
                if(resheaders["Content-Length"]){
                    resheaders["Content-Length"]=parseInt(resheaders["Content-Length"],10);
                }
            }
        }
        function createServer(){
            return request;
        }
        module.exports = createServer;
    })();
} catch (e) {
    console.log(e.stack);
}