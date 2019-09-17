import { getModel } from "./model";
import * as mongoose from 'mongoose';

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
        case "remove_id":
            removeID(data,pis,AdbModel);
            break;
        case "startTest":
            console.log("adb start");
            getList(data,pis,AdbModel);
            break;
        case "replayTest":
            getList(data,pis,AdbModel);
            break;
        default:
            break;
    }
}

export default {disposeData};