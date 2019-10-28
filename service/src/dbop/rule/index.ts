import { getModel } from "./model";

let latestVersion = ["click","assert_pic","assert_pto","click_poi","slide","wait","operate_tool","button","qg_box","group","adb_cmd","pcan"];

function getList(data:any,pis:any,RuleModel:any){
    RuleModel.aggregate([
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

function add(data:any,pis:any,RuleModel:any){
    let id:any = data.info.msg.id;
    RuleModel.findOne({id:id},{__v:0,_id:0},function(err:any,msg:any){
        if(msg){
            let newId = msg.content.length>0?disposeIdInfo(msg.content[msg.content.length-1]):id+"-1";
            RuleModel.updateOne({id:id},{$addToSet:{content:newId}},function(err:any,mg:any){
                if(!err){
                    data.info.msg.id = newId;
                    pis.write(data);
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
                    data.info.msg.id = newId;
                    pis.write(data);
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
            content: latestVersion
        },
        {
            id: "operate_tool",
            content: ["operate_tool-1","operate_tool-2"]
        },
        {
            id: "button",
            content: ["button-1", "button-2"]
        },
        {
            id: "button-1",
            content: ["button-1-1"]
        },
        {
            id: "module",
            content: ["module-1","module-2","module-3"]
        },
        {
            id: "qg_box",
            content: ["freq"]
        }
    ];
    // 工具板
    for(let i=1;i<3;i++){
        let opt:any = {
            id : "operate_tool-"+i,
            content : []
        };
        for(let j=1;j<17;j++){
            opt.content.push(opt.id+"-"+j);
        }
        new_arr.push(opt);
    }

    RuleModel.insertMany(new_arr, function(err:any, msg:any) {
        if(!err){
            data.info = true;
            pis.write(data);
        }
    });
}

function removeID(data:any,pis:any,RuleModel:any){
    let info = data.info.msg;
    RuleModel.updateOne({id:info.pid},{$pull:{content:info.id}},(err:any,msg:any) => {
        if(!err){
            RuleModel.deleteOne({id:info.id},(error:any) => {
                if(!error){
                    data.info = true;
                    pis.write(data);
                }
            });
        }
    });
}

function checkVersion(data:any,pis:any,RuleModel:any){
    RuleModel.findOne({id:"action"},(err:any,list:any)=>{
        if(!err){
            let u_data:any=[];
            for(let act of latestVersion){
                if(list.content.indexOf(act)<0){
                    u_data.push(act);
                }
            }
            if(u_data.length){
                RuleModel.updateOne({id:"action"},{$push:{content:{$each:u_data}}},function(err:any,mg:any){
                    if(!err){
                        data.info.upflag = true;
                        if(u_data.indexOf("qg_box")>-1){
                            RuleModel.insertOne({id: "qg_box",content: ["freq"]},(error:any)=>{
                                if(!error){
                                    data.info.udata = u_data;
                                    pis.write(data);
                                }
                            });
                        }else{
                            data.info.udata = u_data;
                            pis.write(data);
                        }
                    }
                });
            }else{
                data.info.upflag = false;
                pis.write(data);
            }
        }
    });
}

function copyPrj(data:any,pis:any,RuleModel:any){
    RuleModel.aggregate([
        { $out:data.info.msg.name+"_rule" }
    ],function(err:any){
        if(!err){
            data.info = true;
            pis.write(data);
        }
    });
}

function disposeData(data:any,pis:any){
    let RuleModel = getModel(data.info.prjname+"_rule");
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
        case "remove_id":
            removeID(data,pis,RuleModel);
            break;
        case "check_version":
            checkVersion(data,pis,RuleModel);
            break;
        case "copy":
            copyPrj(data,pis,RuleModel);
            break;
        default:
            break;
    }
}

export default {disposeData};