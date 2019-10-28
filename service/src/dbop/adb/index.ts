import { getModel } from "./model";

function getList(data:any,pis:any,AdbModel:any){
    AdbModel.aggregate([
        {$project:{
            "_id":0,"__v":0
        }}
    ],function(err:any,docs:any){
        if(!err){
            data.route = "adb";
            data.info.data = JSON.stringify(docs);
            pis.write(data);
        }
    });
}

function add(data:any,pis:any,AdbModel:any){
    let info:any = data.info.msg;
    let model=new AdbModel({
		id: info.id,
        pid: info.pid,
        send_data: info.sd,
        type: info.tp,
        timeout: info.tt,
        rev_data: info.rd
	});
	model.save(function (err:any,msg:any){
		if(!err){
            data.info = true;
            pis.write(data);
		}
	});
}

function modify(data:any,pis:any,AdbModel:any){
    let info:any = data.info.msg;
    AdbModel.updateOne({id:info.id},{$set: {
            send_data: info.sd,
            type: info.tp,
            timeout: info.tt,
            rev_data: info.rd
		}},function(err:any){
			if(!err){
                data.info=true;
                pis.write(data);
			}
        }
    );
}

function copyPrj(data:any,pis:any,AdbModel:any){
    AdbModel.aggregate([
        { $out:data.info.msg.name+"_adb" }
    ],function(err:any){
        if(!err){
            data.info = true;
            pis.write(data);
        }
    });
}

function removeID(data:any,pis:any,AdbModel:any){
    let info:any = data.info.msg;
    switch(info.type){
        case 0:
            AdbModel.deleteOne({ id: info.id},function(err:any){
                if(!err){
                    data.info.status = true;
                    pis.write(data);
                }
            });
            break;
        case 1:
            AdbModel.deleteMany({ pid: info.id },(err:any,msg:any)=>{
                if(!err){
                    data.info.status = true;
                    pis.write(data);
                }
            });
            break;
    }
}

function getDoc(data:any,pis:any,AdbModel:any) {
    AdbModel.findOne({id:data.info.id},{_id:0,__v:0},(err:any,msg:any) => {
        if(!err){
            data.data = JSON.parse(JSON.stringify(msg));
            pis.write(data);
        }
    });
}

function disposeData(data:any,pis:any){
    let AdbModel = getModel(data.info.prjname+"_adb");
    switch(data.job){
        case "list":
            getList(data,pis,AdbModel);
            break;
        case "add":
            add(data,pis,AdbModel);
            break;
        case "modify":
            modify(data,pis,AdbModel);
            break;
        case "copy":
            copyPrj(data,pis,AdbModel);
            break;
        case "remove_id":
            removeID(data,pis,AdbModel);
            break;
        case "getDoc":
            getDoc(data,pis,AdbModel);
            break;
        default:
            break;
    }
}

export default {disposeData};