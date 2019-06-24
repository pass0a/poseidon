var Model = require("./model");
var mongodb = require('mongodb');

function addproject(data:any,pis:any){
    var model=new Model({
		name:data.info.name,
        uid: createObjectID(data.info.uid)
	});
	model.save(function (err:any,info:any){
		if(!err){
            data.info.state=true;
            data.info.name=info.name;
            pis.push(data);
		}
    });
}

function existInList(data:any,pis:any){
    Model.findOne({name:data.info.name},{__v:0,_id:0},function(err:any,info:any){
        if(info){
            data.info.state=false;
            pis.push(data);
        }else{
            addproject(data,pis);
        }
	});
}

function getList(data:any,pis:any){
    Model.find({},{__v:0},function(err:any, info:any){
        var list=[];
        for(var i=0;i<info.length;i++){
            var obj:any={};
            obj["name"]=info[i].name;
            list.push(obj);
        }
        data.info=list;
        pis.push(data);
	});
}

function createObjectID(id:string){
    return mongodb.ObjectId.createFromHexString(id);
}

function disposeData(data:any,pis:any){
    switch(data.job){
        case "list":
            getList(data,pis);
            break;
        case "add":
            existInList(data,pis);
            break;
        default:
            break;
    }
}

export default {disposeData};