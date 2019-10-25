import { getModel } from "./model";

function getList(data:any,pis:any,PcanModel:any){
    PcanModel.aggregate([
        {$project:{
            "_id":0,"__v":0
        }}
    ],function(err:any,docs:any){
        if(!err){
            data.route="pcan";
            data.info.data=JSON.stringify(docs);
            pis.write(data);
        }
    });
}

function add(data:any,pis:any,PcanModel:any){
    let info:any = data.info.msg;
    let model=new PcanModel({
        id: info.id,
        pid: info.pid,
        content: info.data
	});
	model.save(function (err:any,msg:any){
		if(!err){
            data.info = true;
            pis.write(data);
		}
	});
}

function modify(data:any,pis:any,PcanModel:any){
    let info:any = data.info.msg;
    PcanModel.updateOne({id:info.id},{$set: {
		content: info.data
		}},function(err:any){
			if(!err){
                data.info=true;
                pis.write(data);
			}
        }
    );
}

function removeID(data:any,pis:any,PcanModel:any){
    let info:any = data.info.msg;
    if(info.type){
        PcanModel.deleteMany({ pid: info.id },(err:any,msg:any)=>{
            if(!err){
                data.info.status = true;
                pis.write(data);
            }
        });
    }else{
        PcanModel.deleteOne({id:info.id},function(err:any){
            if(!err){
                data.info.status = true;
                pis.write(data);
            }
        });
    }
}

function copyPrj(data:any,pis:any,PcanModel:any){
    PcanModel.aggregate([
        { $out:data.info.msg.name+"_pcan" }
    ],function(err:any){
        if(!err){
            data.info = true;
            pis.write(data);
        }
    });
}

function getDoc(data:any,pis:any,PcanModel:any) {
    PcanModel.findOne({id:data.info.id},{_id:0,__v:0},(err:any,msg:any) => {
        if(!err){
            data.data = JSON.parse(JSON.stringify(msg)).content;
            pis.write(data);
        }
    });
}

function disposeData(data:any,pis:any){
    let PcanModel = getModel(data.info.prjname+"_pcan");
    switch(data.job){
        case "list":
            getList(data,pis,PcanModel);
            break;
        case "add":
            add(data,pis,PcanModel);
            break;
        case "modify":
            modify(data,pis,PcanModel);
            break;
        case "remove_id":
            removeID(data,pis,PcanModel);
            break;
        case "copy":
            copyPrj(data,pis,PcanModel);
            break;
        case "getDoc":
            getDoc(data,pis,PcanModel);
            break;
        default:
            break;
    }
}

export default {disposeData};