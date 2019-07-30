import { getModel } from "./model";

function getList(data:any,pis:any,BtnModel:any){
    BtnModel.aggregate([
        {$project:{
            "_id":0,"__v":0
        }}
    ],function(err:any,docs:any){
        if(!err){
            data.route="buttons";
            data.info.data=JSON.stringify(docs);
            pis.push(data);
        }
    });
}

function newPrj(data:any,pis:any,BtnModel:any){
    let new_arr = [
        {id:"button-1-1",event:"/dev/input/event1",content:[["0001 0066 00000001","0000 0000 00000000"],["0001 0066 00000000","0000 0000 00000000"]]}
    ];
    BtnModel.insertMany(new_arr, function(err:any, msg:any) {
        if(!err){
            data.info = true;
            pis.push(data);
        }
    });
}

function add(data:any,pis:any,BtnModel:any){
    let info:any = data.info.msg;
    let model=new BtnModel({
		id: info.id,
        event: info.event,
        content: info.content
	});
	model.save(function (err:any,msg:any){
		if(!err){
            data.info = true;
            pis.push(data);
		}
	});
}

function disposeData(data:any,pis:any){
    let BtnModel = getModel(data.info.prjname+"_btn");
    switch(data.job){
        case "list":
            getList(data,pis,BtnModel);
            break;
        case "new":
            newPrj(data,pis,BtnModel);
            break;
        case "add":
            add(data,pis,BtnModel);
            break;
        case "startTest":
            getList(data,pis,BtnModel);
            break;
        case "replayTest":
            getList(data,pis,BtnModel);
            break;
        default:
            break;
    }
}

export default {disposeData};