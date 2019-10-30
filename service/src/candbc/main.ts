// import * as Pcan from '@passoa/pcan';

// let config = {
//     baudrate : 0x432F,
//     hardware_type : 0x01,
//     io_port : 0x0100,
//     interrupt : 3
// };

// console.log(parseInt("0100",16));

// console.log(Pcan.initPcan(config,(ev,data)=>{
//     console.log(ev,data);
// }));

import * as util from "util";
import * as fs from "fs";

let dbc_file:any = JSON.parse(new util.TextDecoder().decode(fs.readFileSync("D:/projectList/poseidon/binary/service/dist/123.json")));

for(let i=0;i<dbc_file.messages.length;i++){
    if(dbc_file.messages[i].name == "DATC_PE_03"){
        console.log(dbc_file.messages[i].id);
        console.log(dbc_file.messages[i].dlc);
        let buffer = new Uint8Array(dbc_file.messages[i].dlc);
        for(let j=0;j<dbc_file.messages[i].signals.length;j++){
            if(dbc_file.messages[i].signals[j].name=="DATC_AutoDisp"){
                console.log(dbc_file.messages[i].signals[j]);
            }
        }
    }
}