import { getModel } from "./model";

function getList(data:any,pis:any,ImgModel:any){
    ImgModel.aggregate([
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

function add(data:any,pis:any,ImgModel:any){
    let info:any = data.info.msg;
    ImgModel.findOne({id:info.id},(err:any,msg:any) => {
        if(!err){
            if(msg){
                ImgModel.updateOne({id:info.id},{$set: {
                        date:Date.now()
                    }},function(err:any){
                        if(!err){
                            data.info=true;
                            pis.write(data);
                        }
                    }
                );
            }else{
                let model=new ImgModel({
                    id: info.id,
                    pid: info.pid
                });
                model.save(function (err:any,msg:any){
                    if(!err){
                        data.info = true;
                        pis.write(data);
                    }
                });
            }
        }
    });
}

function modify(data:any,pis:any,ImgModel:any){
    let info:any = data.info.msg;
    ImgModel.updateOne({id:info.id},{$set: {
		}},function(err:any){
			if(!err){
                data.info=true;
                pis.write(data);
			}
        }
    );
}

function removeID(data:any,pis:any,ImgModel:any){
    let info:any = data.info.msg;
    switch(info.type){
        case 0:
            ImgModel.deleteOne({ id: info.id},function(err:any){
                if(!err){
                    data.info.status = true;
                    pis.write(data);
                }
            });
            break;
        case 1:
            ImgModel.deleteMany({ pid: info.id },(err:any,msg:any)=>{
                if(!err){
                    data.info.status = true;
                    pis.write(data);
                }
            });
            break;
    }
}

function disposeData(data:any,pis:any){
    let ImgModel = getModel(data.info.prjname+"_imgs");
    switch(data.job){
        case "list":
            getList(data,pis,ImgModel);
            break;
        case "add":
            add(data,pis,ImgModel);
            break;
        case "modify":
            modify(data,pis,ImgModel);
            break;
        case "remove_id":
            removeID(data,pis,ImgModel);
            break;
        default:
            break;
    }
}

export default {disposeData};