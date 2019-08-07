import { getModel } from "./model";

function getList(data:any,pis:any,ResModel:any){
    ResModel.aggregate([
        {$project:{
            "_id":0,"__v":0
        }}
    ],function(err:any,docs:any){
        if(!err){
            data.info=JSON.stringify(docs);
            pis.push(data);
        }
    });
}

function add(data:any,pis:any,ResModel:any){
    let info:any = data.info;
    let model=new ResModel({
		id: info.id,
		name: info.name
	});
	model.save(function (err:any,msg:any){
		if(!err){
            data.info = true;
            pis.push(data);
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
                pis.push(data);
			}
        }
    );
}

function newPrj(data:any,pis:any,ResModel:any){
    let new_arr = [
        {id:"click",name:"图片点击"},
        {id:"assert_pic",name:"图片判断"},
        {id:"wait",name:"等待"},
        {id:"operate_tool",name:"控制工具板"},
        {id:"button",name:"硬按键"},
        {id:"operate_tool-1",name:"打开"},
        {id:"operate_tool-2",name:"关闭"},
        {id:"operate_tool-1-1",name:"继电器_1"},
        {id:"operate_tool-1-2",name:"继电器_2"},
        {id:"operate_tool-2-1",name:"继电器_1"},
        {id:"operate_tool-2-2",name:"继电器_2"},
        {id:"button-1",name:"面板按键"},
        {id:"button-2",name:"方控按键"},
        {id:"button-1-1",name:"HOME"},
        {id:"button-1-2",name:"VOL+"},
        {id:"button-1-3",name:"VOL-"},
        {id:"button-1-4",name:"POWER"},
        {id:"button-1-5",name:"前除霜"},
        {id:"button-1-6",name:"后除霜"},
        {id:"button-1-7",name:"AUTO"},
        {id:"button-1-8",name:"OFF"},
        {id:"module-1",name:"System"},
        {id:"module-2",name:"AUX"},
        {id:"module-3",name:"USB"},
        {id:"module-4",name:"IPOD"},
        {id:"module-5",name:"Radio"}
    ];
    ResModel.insertMany(new_arr, function(err:any, msg:any) {
        if(!err){
            data.info = true;
            pis.push(data);
        }
    });
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
        default:
            break;
    }
}

export default {disposeData};