import { getModel } from "./model";
import * as mongodb from "mongodb";

function addproject(data:any,pis:any,Projects:any){
    let model=new Projects({
		name:data.info.name,
        uid: createObjectID(data.info.uid)
	});
	model.save(function (err:any,info:any){
		if(!err){
            data.info.state=true;
            data.info.name=info.name;
            pis.write(data);
		}
    });
}

function existInList(data:any,pis:any,Projects:any){
    Projects.findOne({name:data.info.name},{__v:0,_id:0},function(err:any,info:any){
        if(info){
            data.info.state=false;
            pis.write(data);
        }else{
            addproject(data,pis,Projects);
        }
	});
}

function getList(data:any,pis:any,Projects:any){
    Projects.find({},{__v:0},function(err:any, info:any){
        let list=[];
        for(let i=0;i<info.length;i++){
            let obj:any={};
            obj["name"]=info[i].name;
            list.push(obj);
        }
        data.info=list;
        pis.write(data);
	});
}

function createObjectID(id:string){
    return mongodb.ObjectId.createFromHexString(id);
}

function disposeData(data:any,pis:any){
    let Projects = getModel("projects");
    switch(data.job){
        case "list":
            getList(data,pis,Projects);
            break;
        case "add":
            existInList(data,pis,Projects);
            break;
        default:
            break;
    }
}

export default {disposeData};