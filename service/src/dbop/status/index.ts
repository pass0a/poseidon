import { getModel } from "./model";
import * as mongodb from "mongodb";

function add(data:any,pis:any,StatusModel:any){
    let info:any = data.info;
    let model=new StatusModel({
        module: info.module,
        cid: createObjectID(info.cid),
        uid: createObjectID(info.uid)
	});
	model.save(function (err:any,msg:any){
		if(!err){
            data.info = true;
            pis.write(data);
		}
	});
}

function remove(data:any,pis:any,StatusModel:any){
    let info:any = data.info;
    StatusModel.deleteOne({cid:createObjectID(info.cid),uid:createObjectID(info.uid)},function(err:any){
        if(!err){
            data.info = true;
            pis.write(data);
		}
    });
}

function getTestList(data:any,pis:any,StatusModel:any){
    StatusModel.aggregate([
        {$lookup:{
            from:data.info.prjname+"_cases",
            localField:"cid",
            foreignField:"_id",
            as:"cases"
        }},
        {$match:{
            "uid":createObjectID(data.info.uid)
        }},
        {$project:{
            "_id":0,"__v":0,"cid":0,"uid":0,"cases._id":0,"cases.__v":0
        }},
        {$sort:{
            "cases.case_module":1,"cases.case_id":1
        }}
    ],function(err:any,docs:any){
        if(!err){
            let testlist = [];
            for(let ca of docs){
                testlist.push(ca.cases[0]);
            }
            data.route = "caselist";
            data.info.data = JSON.stringify(testlist);
            pis.write(data);
        }
    });
}

function removeModule(data:any,pis:any,StatusModel:any){
    let info = data.info.msg;
    StatusModel.deleteMany({module:info.id},(err:any)=>{
        if(!err){
            data.info = true;
            pis.write(data);
        }
    });
}

function createObjectID(id:string){
    return mongodb.ObjectId.createFromHexString(id);
}

function disposeData(data:any,pis:any){
    let StatusModel = getModel(data.info.prjname+"_status");
    switch(data.job){
        case "add":
            add(data,pis,StatusModel);
            break;
        case "delete":
            remove(data,pis,StatusModel);
            break;
        case "remove_module":
            removeModule(data,pis,StatusModel);
            break;
        case "module_add":
            break;
        case "module_delete":
            break;
        case "startTest":
            getTestList(data,pis,StatusModel);
            break;
        case "replayTest":
            getTestList(data,pis,StatusModel);
            break;
        default:
            break;
    }
}

export default {disposeData};