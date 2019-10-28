import { getModel } from "./model";
import { getCaseModel } from "../cases/model";
import { getResultsModel } from "../results/model";
import * as mongodb from "mongodb";

function openNgCases(data:any,pis:any,StatusModel:any) {
    let ResultsModel = getResultsModel(data.info.prjname+"_results");
    ResultsModel.aggregate([
        {$lookup:{
            from:data.info.prjname+"_cases",
            localField:"cid",
            foreignField:"_id",
            as:"cases"
        }},
        {$match:{
            result : 1
        }},
        {$project:{
            "_id":0,"__v":0,"uid":0,"cases.__v":0,"case_info":0
        }}
    ],function(err:any,docs:any){
        if(!err){
            let testlist = [];
            for(let ca of docs){
                if(ca.cases.length){
                    testlist.push({
                        module : ca.cases[0].case_module,
                        cid : ca.cases[0]._id
                    });
                }
            }
            StatusModel.insertMany(testlist, function(err:any, msg:any) {
                if(!err){
                    data.info.count = testlist.length;
                    pis.write(data);
                }
            });
        }
    });
}

function clear(data:any,pis:any,StatusModel:any){
    StatusModel.deleteMany({},function(err:any){
        if(!err){
            openNgCases(data,pis,StatusModel);
        }
    });
}

function add(data:any,pis:any,StatusModel:any){
    let info:any = data.info;
    let model=new StatusModel({
        module: info.module,
        cid: createObjectID(info.cid)
	});
	model.save(function (err:any,msg:any){
		if(!err){
            data.info = true;
            pis.write(data);
		}
	});
}

function addModule(data:any,pis:any,StatusModel:any){
    let info:any = data.info;
    StatusModel.deleteMany({module:info.module},(err:any)=>{
        if(!err){
            let CaseModel  = getCaseModel(data.info.prjname+"_cases");
            CaseModel.aggregate([
                {$match:{
                    case_module : data.info.module
                }},
                {$sort:{
                    case_module:1,case_id:1
                }},
                {$project: {cid:"$_id", module: "$case_module"}}
            ],function(error:any,docs:any){
                if(!error){
                    StatusModel.insertMany(docs, function(er:any, msg:any) {
                        if(!er){
                            data.info = true;
                            pis.write(data);
                        }
                    });
                }
            });
        }
    });
}

function deleteModule(data:any,pis:any,StatusModel:any){
    let info = data.info;
    StatusModel.deleteMany({module:info.module},(err:any)=>{
        if(!err){
            data.info = true;
            pis.write(data);
        }
    });
}

function remove(data:any,pis:any,StatusModel:any){
    let info:any = data.info;
    StatusModel.deleteOne({cid:createObjectID(info.cid)},function(err:any){
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
        // {$match:{
        //     "uid":createObjectID(data.info.uid)
        // }},
        {$project:{
            "_id":0,"__v":0,"cid":0,"uid":0,"cases.__v":0,"cases.case_num":0,"cases.case_dam":0,"cases.case_name":0,"cases.case_level":0,"cases.case_pre":0,"cases.case_op":0,"cases.case_exp":0,"cases.case_assert":0,"cases.case_note":0
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
            data.data = JSON.stringify(testlist);
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
            addModule(data,pis,StatusModel);
            break;
        case "module_delete":
            deleteModule(data,pis,StatusModel);
            break;
        case "getTestCases":
            getTestList(data,pis,StatusModel);
            break;
        case "openNgCases":
            clear(data,pis,StatusModel);
            break;
        default:
            break;
    }
}

export default {disposeData};