import * as pack from '@passoa/pack';
import * as net from 'net';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

let pis = new pack.packStream();
let pos = new pack.unpackStream();
let sv: any;
let imgCfg = path.dirname(path.dirname(process.execPath)) + '/data_store/projects/ku/imgCfg.json';
let img_path = path.dirname(path.dirname(process.execPath)) + '/data_store/projects/ku/img';

pis.on('data', (data: any) => {
    sv.write(data);
});
pos.on('data', (data: any) => {
    console.log(data);
    switch (data.route) {
        case "image":
            if(data.job=='list'){
                fs.writeFileSync(imgCfg,JSON.stringify(data.info.imgCfg));
                if(data.info.downList.length){
                    if(!fs.existsSync(img_path)){
                        fs.mkdirSync(img_path);
                    }
                    pis.write({route:'image',job:'downImg',info:data.info.downList});
                }
            }
            else if(data.job=='downImg'){
                fs.writeFileSync(img_path+'/'+data.info.imgId+'.png',data.info.buffer);
            }
            break;
        default:
            break;
    }
});

sv = net.connect(6004,"127.0.0.1",() => {
    console.info("sqlserver connect!!!");
    // let file_path = 'C:/Users/Administrator/Desktop/screen.png';
    // let bytefile = fs.readFileSync(file_path);
    // pis.write({route:'image',job:'add',info:{imgId:'1',pid:1,path:'C:/Users/Administrator/Desktop/image/',buffer:bytefile}});
    // let imgObj = {
    //     'click_1': 1
    // };
    // pis.write({route:'image',job:'list',info:{pid:1,imgCfg:imgObj}});

    //---- push image
    // let imageList_path = 'C:/Users/Administrator/Desktop/img';
    // let list = fs.readdirSync(imageList_path);
    // for(let i=0;i<list.length;i++){
    //     let bytefile = fs.readFileSync(imageList_path+'/'+list[i]);
    //     let id = list[i].replace(".png","");
    //     pis.write({route:'image',job:'add',info:{imgId:id,pid:1,buffer:bytefile}});
    //     console.log(id);
    // }

    //-- update image
    // pis.write({route:'image',job:'update',info:{pid:1,id:1,uid:1}});

    //-- imgCfg
    if(fs.existsSync(imgCfg)){
        let imgCfgData = JSON.parse(new util.TextDecoder().decode((fs.readFileSync(imgCfg))));
        pis.write({route:'image',job:'list',info:{pid:1,imgCfg:imgCfgData}});
    }else{
        pis.write({route:'image',job:'list',info:{pid:1}});
        console.log(234);
    }
});
sv.on("data",(data:any) => {
    pos.write(data);
});
sv.on("close",() => {
    console.info("close device-link socket!!!");
});
sv.on("error",() => {
    console.error("error");
});
