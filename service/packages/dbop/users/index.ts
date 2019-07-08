let Model = require("./model");

function finduser(data:any, pis:any){
    Model.findOne({name:data.info.name,psw:data.info.psw},{__v:0},function(err:any,info:any){
        if(info){
            data.info=info._id;
            pis.push(data);
        }else{
            let model=new Model({
                name: "admin",
                psw: "123"
            });
            model.save(function (err:any,mg:any){
                if(!err){
                    data.info =mg._id;
                    pis.push(data);
                }
            });
        }
	});
}

function disposeData(data:any, pis:any){
    switch(data.job){
        case "find":
            finduser(data,pis);
            break;
        default:
            break;
    }
}

export default {disposeData};

