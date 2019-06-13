let Model = require("./model");

function finduser(data:any, pis:any){
    Model.findOne({name:data.info.name,psw:data.info.psw},function(err:any,info:any){
        data.info=info?info._id:"";
        // console.log(info._id);
        // console.log(info._id);
        // console.log(info._id.toHexString());
        if(info){
            console.log(typeof info._id);
            console.log(info._id);
            console.log(info._id.toString(16));
            console.log(info._id.toHexString());
            console.log(data);
            console.log(data.info);
        }
        // data.info=info?info._id:"";
        pis.push(data);
	});
}

function disposeData(data:any, pis:any){
    switch(data.job){
        case "find":
            finduser(data,pis);
            break;
        default:
            break;
    }
}

export default {disposeData};

