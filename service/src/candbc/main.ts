import * as Pcan from '@passoa/pcan';

let config = {
    baudrate : 0x432F,
    hardware_type : 0x01,
    io_port : 0x0100,
    interrupt : 3
};

console.log(parseInt("0100",16));

// console.log(Pcan.initPcan(config,(ev,data)=>{
//     console.log(ev,data);
// }));