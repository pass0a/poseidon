var Model = require("./model");

function getList(data:any,pis:any,CaseModel:any){
    CaseModel.find({},{__v:0,_id:0}).sort({case_id:1}).exec(function(err:any,msg:any){
        if(!err){
            data.info = JSON.stringify(msg);
            pis.push(data);
        }
    });
}

function add(data:any,pis:any,RuleModel:any){
    let id:any = data.info.id;
    RuleModel.findOne({id:id},{__v:0,_id:0},function(err:any,msg:any){
        if(msg){
            let newId = disposeIdInfo(msg.content[msg.content.length-1]);
            RuleModel.updateOne({id:id},{$addToSet:{content:newId}},function(err:any,mg:any){
                if(!err){
                    data.info = newId;
                    pis.push(data);
                }
            });
        }else{
            let newId = id+"-1";
            let model=new RuleModel({
                id: id,
                content: [newId]
            });
            model.save(function (err:any,mg:any){
                if(!err){
                    data.info = newId;
                    pis.push(data);
                }
            });
        }
	});
}

function disposeIdInfo(id:any){
    let new_id:string="";
    let arr = id.split("-");
    let new_num = parseInt(arr[arr.length-1])+1;
    arr.splice(arr.length-1,1,new_num);
    new_id = arr.join("-");
    return new_id;
}

function newPrj(data:any,pis:any,RuleModel:any){
    let new_arr = [
        {
            id: "action",
            content: ["click","assert_pic","wait","operate_tool","button"]
        },
        {
            id: "operate_tool",
            content: ["operate_tool-1","operate_tool-2"]
        },
        {
            id: "operate_tool-1",
            content: ["operate_tool-1-1","operate_tool-1-2"]
        },
        {
            id: "operate_tool-2",
            content: ["operate_tool-2-1","operate_tool-2-2"]
        },
        {
            id: "button",
            content: ["button-1", "button-2"]
        },
        {
            id: "button-1",
            content: ["button-1-1", "button-1-2","button-1-3","button-1-4","button-1-5","button-1-6","button-1-7","button-1-8"]
        }
    ];
    RuleModel.insertMany(new_arr, function(err:any, msg:any) {
        if(!err){
            data.info = true;
            pis.push(data);
        }
    });
}

function disposeData(data:any,pis:any){
    var RuleModel = Model.getModel(data.info.prjname+"_rule");
    switch(data.job){
        case "list":
            getList(data,pis,RuleModel);
            break;
        case "add":
            add(data,pis,RuleModel);
            break;
        case "new":
            newPrj(data,pis,RuleModel);
            break;
        default:
            break;
    }
}

export default {disposeData};