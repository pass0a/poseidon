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

// let dbc_file:any = JSON.parse(new util.TextDecoder().decode(fs.readFileSync("D:/projectList/poseidon/binary/service/dist/123.json")));
// for(let i=0;i<dbc_file.messages.length;i++){
//     if(dbc_file.messages[i].name == "DATC_PE_03"){
//         console.log(dbc_file.messages[i].id);
//         console.log(dbc_file.messages[i].dlc);
//         let buffer = new Uint8Array(dbc_file.messages[i].dlc);
//         for(let j=0;j<dbc_file.messages[i].signals.length;j++){
//             if(dbc_file.messages[i].signals[j].name=="DATC_AutoDisp"){
//                 console.log(dbc_file.messages[i].signals[j]);
//             }
//         }
//     }
// }

let buffer = new Uint8Array([0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00]);
let inf:any = 0;
let jl:any = [];
for(let i=0;i<buffer.length;i++){
    inf = buffer[i] << 8*i | inf
    for(let j=0;j<8;j++){
        jl.push((buffer[i]>>(7-j)) & 0x01);
    }
}
let start_bit = 7,len = 12;
let start_idx = 8*Math.floor(start_bit/8) + (7-(start_bit%8));
console.log(Math.floor(start_bit/8));
console.log(start_bit%8);
console.log(start_idx);
let akt = 998;
for(let i=start_idx;i<start_idx+len;i++){
    jl[i] = (akt >> (start_idx+len-1-i)) & 0x01;
}
let op:any = [];
let dl = 0;
for(let i = 0;i<jl.length;i++){
    
}

console.log(jl);