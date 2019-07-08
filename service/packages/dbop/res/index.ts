var Model = require("./model");

function getList(data:any,pis:any,ResModel:any){
    ResModel.find({},{__v:0,_id:0}).sort({case_id:1}).exec(function(err:any,msg:any){
        if(!err){
            data.info=JSON.stringify(msg);
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

function newPrj(data:any,pis:any,ResModel:any){
    let new_arr = [
        {id:"home",name:"回到主界面"},
        {id:"click",name:"图片点击"},
        {id:"assert_pic",name:"图片判断"},
        {id:"wait",name:"等待"},
        {id:"operate_tool",name:"控制工具板"},
        {id:"operate_tool-1",name:"打开"},
        {id:"operate_tool-2",name:"关闭"},
        {id:"operate_tool-1-1",name:"继电器_1"},
        {id:"operate_tool-1-2",name:"继电器_2"},
        {id:"operate_tool-2-1",name:"继电器_1"},
        {id:"operate_tool-2-2",name:"继电器_2"}
    ];
    ResModel.insertMany(new_arr, function(err:any, msg:any) {
        if(!err){
            data.info = true;
            pis.push(data);
        }
    });
}

function disposeData(data:any,pis:any){
    var ResModel = Model.getModel(data.info.prjname+"_res");
    switch(data.job){
        case "list":
            getList(data,pis,ResModel);
            break;
        case "add":
            add(data,pis,ResModel);
            break;
        case "new":
            newPrj(data,pis,ResModel);
        default:
            break;
    }
}

export default {disposeData};