import { getModel } from "./model";
import * as mongodb from "mongodb";

function getList(data:any,pis:any,CaseModel:any){
    CaseModel.aggregate([
        {$lookup:{
            from:data.info.prjname+"_status",
            localField:"_id",
            foreignField:"cid",
            as:"c_status"
        }},
        {$match:{
        }},
        {$project:{
            "__v":0,"c_status._id":0,"c_status.__v":0,"c_status.cid":0,"c_status.uid":0
        }},
        {$sort:{
            "case_module":1,"case_id":1
        }}
    ],function(err:any,docs:any){
        if(!err){
            for(let ca of docs){
                ca._id = objectIDtoString(ca._id.id);
            }
            data.info=JSON.stringify(docs);
            pis.write(data);
        }
    });
}

function addCases(data:any, pis:any, CaseModel:any){
    let info = data.info.casedata;
    let model = new CaseModel({
		case_num:info.case_num,
		case_dam:info.case_dam,
		case_module:info.case_module,
		case_id:info.case_id,
		case_name:info.case_name,
		case_level:info.case_level,
		case_pre:info.case_pre,
		case_op:info.case_op,
		case_exp:info.case_exp,
		case_assert:info.case_assert,
		case_note:info.case_note,
		case_mode:info.case_mode,
		case_steps:info.case_steps
	});
	model.save(function (err:any,msg:any){
		if(!err){
            data.info=objectIDtoString(msg._id.id);
            pis.write(data);
		}
	});
}

function checkIDAndAdd(data:any,pis:any,CaseModel:any){
    let info = data.info.casedata;
    CaseModel.findOne({case_id:info.case_id},{__v:0,_id:0},function(err:any,msg:any){
		if(msg){
            data.info=false;
            pis.write(data);
        }else{
            addCases(data,pis,CaseModel);
        }
	});
}

function modifyCase(data:any,pis:any,CaseModel:any){
    let info = data.info.casedata;
    CaseModel.updateOne({_id:createObjectID(info._id)},{$set: {
		case_num:info.case_num,
		case_dam:info.dam_name,
		case_name:info.case_name,
		case_level:info.case_level,
		case_pre:info.case_pre,
		case_op:info.case_op,
		case_exp:info.case_exp,
		case_assert:info.case_assert,
		case_note:info.case_note,
		case_mode:info.case_mode,
		case_steps:info.case_steps
		}},function(err:any){
			if(!err){
                data.info=true;
                pis.write(data);
			}
        }
    );
}

function deleteCase(data:any,pis:any,CaseModel:any){
    CaseModel.deleteOne({_id:createObjectID(data.info._id)},function(err:any){
        if(!err){
            data.info=true;
            pis.write(data);
        }
    });
}

function removeStepID(data:any,pis:any,CaseModel:any){
    let info = data.info.msg;
    CaseModel.updateMany({},{$pull:{case_steps:info.type?{module:info.id}:{id:info.id}}},(err:any) => {
        if(!err){
            data.info = true;
            pis.write(data);
        }
    });
}

function removeModule(data:any,pis:any,CaseModel:any){
    let info = data.info.msg;
    CaseModel.deleteMany({case_module:info.id},(err:any) => {
        if(!err){
            data.info = true;
            pis.write(data);
        }
    });
}

function copySteps(data:any,pis:any,CaseModel:any){
    let info = data.info;
    CaseModel.findOneAndUpdate({case_id:info.case_id},{$set: {case_steps:info.copy_steps}},(err:any,docs:any) => {
        if(!err){
            data.info = docs?true:false;
            pis.write(data);
        }
    });
}

function objectIDtoString(buffer:any){
    let str:string = "";
    for(let buf of buffer){
        if(buf<16)str+="0";
        str+=buf.toString(16);
    }
    return str;
}

function createObjectID(id:string){
    return mongodb.ObjectId.createFromHexString(id);
}

function disposeData(data:any,pis:any){
    let CaseModel = getModel(data.info.prjname+"_cases");
    switch(data.job){
        case "list":
            getList(data,pis,CaseModel);
            break;
        case "add":
            checkIDAndAdd(data,pis,CaseModel);
            break;
        case "modify":
            modifyCase(data,pis,CaseModel);
            break;
        case "delete":
            deleteCase(data,pis,CaseModel);
            break;
        case "remove_id":
            removeStepID(data,pis,CaseModel);
            break;
        case "remove_module":
            removeModule(data,pis,CaseModel);
            break;
        case "copy_steps":
            copySteps(data,pis,CaseModel);
            break;
        default:
            break;
    }
}

export default {disposeData};