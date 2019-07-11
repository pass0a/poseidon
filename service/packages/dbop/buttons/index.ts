var Model = require("./model");

function getList(data:any,pis:any,BtnModel:any){
    BtnModel.find({},{__v:0,_id:0},function(err:any,msg:any){
        if(!err){
            data.info=JSON.stringify(msg);
            data.rount="buttons";
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

function newPrj(data:any,pis:any,BtnModel:any){
    let new_arr = [
        {id:"button-1-1",event:"/dev/input/event1",content:[["0001 0066 00000001","0000 0000 00000000"],["0001 0066 00000000","0000 0000 00000000"]]},
        {id:"button-1-2",event:"/dev/input/event1",content:[["0001 0073 00000001","0000 0000 00000000"],["0001 0073 00000000","0000 0000 00000000"]]},
        {id:"button-1-3",event:"/dev/input/event1",content:[["0001 0072 00000001","0000 0000 00000000"],["0001 0072 00000000","0000 0000 00000000"]]},
        {id:"button-1-4",event:"/dev/input/event1",content:[["0001 003f 00000001","0000 0000 00000000"],["0001 003f 00000000","0000 0000 00000000"]]},
        {id:"button-1-5",event:"/dev/input/event1",content:[["0001 003b 00000001","0000 0000 00000000"],["0001 003b 00000000","0000 0000 00000000"]]},
        {id:"button-1-6",event:"/dev/input/event1",content:[["0001 003c 00000001","0000 0000 00000000"],["0001 003c 00000000","0000 0000 00000000"]]},
        {id:"button-1-7",event:"/dev/input/event1",content:[["0001 003d 00000001","0000 0000 00000000"],["0001 003d 00000000","0000 0000 00000000"]]},
        {id:"button-1-8",event:"/dev/input/event1",content:[["0001 003e 00000001","0000 0000 00000000"],["0001 003e 00000000","0000 0000 00000000"]]}
    ];
    BtnModel.insertMany(new_arr, function(err:any, msg:any) {
        if(!err){
            data.info = true;
            pis.push(data);
        }
    });
}

function disposeData(data:any,pis:any){
    let BtnModel;
    if(data.type=="toDB"){
        BtnModel = Model.getModel(data.info.prjname+"_btn");
        switch(data.job){
            case "list":
                getList(data,pis,BtnModel);
                break;
            case "add":
                add(data,pis,BtnModel);
                break;
            case "new":
                newPrj(data,pis,BtnModel);
                break;
            default:
                break;
        }
    }else{
        BtnModel = Model.getModel(data.prjname+"_btn");
        getList(data,pis,BtnModel);
    }
}

export default {disposeData};