import { getModel } from "./model";
import * as mongoose from 'mongoose';

function getList(data:any,pis:any,ResModel:any){
    ResModel.aggregate([
        {$project:{
            "_id":0,"__v":0
        }}
    ],function(err:any,docs:any){
        if(!err){
            data.info=JSON.stringify(docs);
            pis.write(data);
        }
    });
}

function add(data:any,pis:any,ResModel:any){
    let info:any = data.info.msg;
    let model=new ResModel({
		id: info.id,
		name: info.name
	});
	model.save(function (err:any,msg:any){
		if(!err){
            data.info = true;
            pis.write(data);
		}
	});
}

function modify(data:any,pis:any,ResModel:any){
    let info:any = data.info.msg;
    ResModel.updateOne({id:info.id},{$set: {
		name:info.name
		}},function(err:any){
			if(!err){
                data.info=true;
                pis.write(data);
			}
        }
    );
}

function newPrj(data:any,pis:any,ResModel:any){
    let new_arr = [
        {id:"click",name:"图片点击"},
        {id:"assert_pic",name:"图片判断"},
        {id:"click_poi",name:"坐标点击"},
        {id:"slide",name:"轨迹划动"},
        {id:"wait",name:"等待"},
        {id:"operate_tool",name:"控制工具板"},
        {id:"button",name:"硬按键"},
        {id:"qg_box",name:"QG BOX"},
        {id:"group",name:"组合步骤"},
        {id:"adb_cmd",name:"ADB指令"},
        {id:"freq",name:"FREQ"},
        {id:"operate_tool-1",name:"打开"},
        {id:"operate_tool-2",name:"关闭"},
        {id:"button-1",name:"面板按键"},
        {id:"button-2",name:"方控按键"},
        {id:"button-1-1",name:"HOME"},
        {id:"module-1",name:"System"},
        {id:"module-2",name:"Radio"},
        {id:"module-3",name:"USB"}
    ];
    // 工具板
    for(let i=1;i<3;i++){
        for(let j=1;j<17;j++){
            let opt:any = {
                id : "operate_tool-"+i+"-"+j,
                name : "继电器_"+j
            };
            new_arr.push(opt);
        }
    }
    ResModel.insertMany(new_arr, function(err:any, msg:any) {
        if(!err){
            data.info = true;
            pis.write(data);
        }
    });
}

function removeID(data:any,pis:any,ResModel:any){
    let info:any = data.info.msg;
    ResModel.aggregate([
        {$lookup:{
            from:data.info.prjname+"_rule",
            localField:"id",
            foreignField:"id",
            as:"rule"
        }},
        {$match:{
            id:info.id
        }},
        {$project:{
            "__v":0,"_id":0,"rule._id":0,"rule.__v":0
        }}
    ],function(err:any,docs:any){
        if(!err){
            if(docs.length&&docs[0].rule.length){
                let content:any = docs[0].rule[0].content;
                content.push(info.id);
                ResModel.deleteMany({ id: { $in: content } },(err:any,msg:any)=>{
                    if(!err){
                        data.info.status = true;
                        pis.write(data);
                    }
                });
            }else{
                ResModel.deleteOne({id:info.id},function(err:any){
                    if(!err){
                        data.info.status = true;
                        pis.write(data);
                    }
                });
            }
        }
    });
}

function poseidonUpdate(data:any,pis:any,ResModel:any){
    let new_act:any = [];
    switch(data.info.up){
        case 1:
            new_act = [{id:"click_poi",name:"坐标点击"},
                        {id:"slide",name:"轨迹划动"},
                        {id:"qg_box",name:"QG BOX"},
                        {id:"freq",name:"FREQ"},
                        {id:"adb_cmd",name:"ADB指令"}];
            break;
        case 2:
            new_act = [{id:"adb_cmd",name:"ADB指令"}];
            break;
    }
    if(new_act.length)ResModel.insertMany(new_act, function(err:any, msg:any) {
        if(!err){
            data.info = true;
            pis.write(data);
        }
    });
    else{
        data.info = true;
        pis.write(data);
    }
}

function disposeData(data:any,pis:any){
    let ResModel = getModel(data.info.prjname+"_res");
    switch(data.job){
        case "list":
            getList(data,pis,ResModel);
            break;
        case "add":
            add(data,pis,ResModel);
            break;
        case "modify":
            modify(data,pis,ResModel);
            break;
        case "new":
            newPrj(data,pis,ResModel);
            break;
        case "remove_id":
            removeID(data,pis,ResModel);
            break;
        case "poseidon_up":
            poseidonUpdate(data,pis,ResModel);
            break;
        default:
            break;
    }
}

export default {disposeData};