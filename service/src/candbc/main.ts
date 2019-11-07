import * as Pcan from '@passoa/pcan';
import * as util from "util";
import * as fs from "fs";

let config = {
    baudrate : 0x432F,
    hardware_type : 0x01,
    io_port : 0x0100,
    interrupt : 3
};
let messagesList:any = {};

Pcan.initPcan(config,(ev,data)=>{
    console.log(ev,data);
    main();
    Pcan.send(messagesList["DATC_PE_03"].data,messagesList["DATC_PE_03"].id);
    Pcan.uninitPcan();
});

function main() {
    let dbc_file:any = JSON.parse(new util.TextDecoder().decode(fs.readFileSync("D:/projectList/poseidon/binary/service/dist/dbc.json")));
    for(let i=0;i<dbc_file.Message_List.length;i++){
        messagesList[dbc_file.Message_List[i].name] = {
            data : new Uint8Array(dbc_file.Message_List[i].dlc),
            id : dbc_file.Message_List[i].id
        }
        if(dbc_file.Message_List[i].name == "DATC_PE_03"){
            console.log(dbc_file.Message_List[i].id);
            console.log(dbc_file.Message_List[i].dlc);
            for(let j=0;j<dbc_file.Message_List[i].signals.length;j++){
                if(dbc_file.Message_List[i].signals[j].name=="DATC_AutoDisp"){
                    console.log(dbc_file.Message_List[i].signals[j]);
                    if(dbc_file.Message_List[i].signals[j].endianess=="motorola"){
                        messagesList[dbc_file.Message_List[i].name].data = disposedForMotorola(messagesList[dbc_file.Message_List[i].name],dbc_file.Message_List[i].signals[j],0x01);
                        console.log(messagesList[dbc_file.Message_List[i].name]);
                    }
                }
            }
        }
    }
}

function disposedForMotorola(msg:any, info:any, data:any) {
    let buffer = msg.data;
    // motorola
    let jl:any = [];
    for(let i=0;i<buffer.length;i++){
        for(let j=0;j<8;j++){
            jl.push((buffer[i]>>(7-j)) & 0x01);
        }
    }
    let start_bit = info.startbit,len = info.bitlength;
    let start_idx = 8*Math.floor(start_bit/8) + (7-(start_bit%8));
    // console.log(Math.floor(start_bit/8));
    // console.log(start_bit%8);
    // console.log(start_idx);
    let akt = data;
    for(let i=start_idx;i<start_idx+len;i++){
        jl[i] = (akt >> (start_idx+len-1-i)) & 0x01;
    }
    let op:any = [];
    for(let i = 0;i<jl.length;i+=8){
        op.push((jl[i]<<7 | jl[i+1]<<6 | jl[i+2]<<5 | jl[i+3]<<4 | jl[i+4]<<3 | jl[i+5]<<2 | jl[i+6]<<1 | jl[i+7]));
    }
    console.log(op);
    return new Buffer(op);
}



// // inter
// let jt:any = [];
// for(let i=0;i<buffer.length;i++){
//     for(let j=0;j<8;j++){
//         jt.push((buffer[i]>>j) & 0x01);
//     }
// }
// console.log(jt);
// for(let i=start_bit;i<start_bit+len;i++){
//     jt[i] = (akt >> i-start_bit) & 0x01;
// }
// let tp:any = [];
// for(let i = 0;i<jt.length;i+=8){
//     tp.push((jt[i] | jt[i+1]<<1 | jt[i+2]<<2 | jt[i+3]<<3 | jt[i+4]<<4 | jt[i+5]<<5 | jt[i+6]<<6 | jt[i+7]<<7));
// }
// console.log(tp);