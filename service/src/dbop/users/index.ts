import { getModel } from "./model";

function finduser(data:any, pis:any,Users:any){
    Users.findOne({name:data.info.name,psw:data.info.psw},{__v:0},function(err:any,info:any){
        if(info){
            data.info = objectIDtoString(info._id.id);
            pis.write(data);
        }else{
            let model=new Users({
                name: "admin",
                psw: "123"
            });
            model.save(function (err:any,mg:any){
                if(!err){
                    data.info = objectIDtoString(mg._id.id);
                    pis.write(data);
                }
            });
        }
	});
}

function objectIDtoString(buffer:any){
    let str:string = "";
    for(let buf of buffer){
        if(buf<16)str+="0";
        str+=buf.toString(16);
    }
    return str;
}

function disposeData(data:any, pis:any){
    let Users = getModel("users");
    switch(data.job){
        case "find":
            finduser(data,pis,Users);
            break;
        default:
            break;
    }
}

export default {disposeData};

