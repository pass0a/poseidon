import * as fs from "fs";
import * as util from "util";

class ConvertDBC{
    private convertDBC:any = {
        Messages_List : [],
        Messages_Info : {},
        Signals_Info : {}
    }
    convertFile(dbc_path:any, json_path:any){
        return new Promise((resolve) => {
            this.convertDBC.Messages_List = [];
            this.convertDBC.Messages_Info = {};
            this.convertDBC.Signals_Info = {};
            let buf:any="";
            let f = new fs.ReadStream(dbc_path);
            f.on("open", () => {
            });
            f.on("data", (data:any) => {
                let str = new util.TextDecoder().decode(data);
                buf += str;
            });
            f.on("end", () => {
                console.log("Read END");
                buf = this.findMessage_Head_BO(buf);
                buf = this.findSignal_Head_VAL(buf);
                fs.writeFileSync(json_path, JSON.stringify(this.convertDBC));
                resolve(1);
                console.log("Convert END");
            });
            f.on("error", () => {
                resolve(0);
                console.log("Read Error!");
            });
        });
    }
    private findMessage_Head_BO(data:string) {
        while(data.indexOf("\r\nBO_")>-1){
            let idx = data.indexOf("\r\nBO_");
            data = data.substring(idx+2);
            if(data.indexOf("\r\n\r\n")>-1){
                let rdx = data.indexOf("\r\n\r\n");
                this.findSignal_Head_SG(data.substring(0,rdx+2));
                data = data.substring(rdx+2);
            }else{
                break;
            }
        }
        return data;
    }
    private findSignal_Head_SG(data:string) {
        let message_info:any = {};
        let info_arr = data.split("\r\n");
        for(let i=0;i<info_arr.length;i++){
            if(i==0){ // message 
                let msg_arr = info_arr[i].split(" ");
                message_info.id = Number(msg_arr[1]); // can_id 
                message_info.name = msg_arr[2].split(":").join(""); // message_name
                message_info.dlc = Number(msg_arr[3]); // can_len
                // message_info.signals = []; // signal_list

                this.convertDBC.Messages_List.push(message_info.name); // message_name
                this.convertDBC.Messages_Info[message_info.name] = {
                    id : message_info.id,
                    dlc : message_info.dlc,
                    signals : []
                }
            }else{ // signal
                let sgn_info:any = {};
                let hidx = info_arr[i].indexOf("SG_ ");
                if(hidx>-1){
                    let sgn_arr = info_arr[i].substring(hidx+4).split(" ");
                    sgn_info.name = sgn_arr[0]; // signal_name
                    let slt = sgn_arr[2].split("@");
                    let ld  = slt[0].split("|");
                    sgn_info.startbit = Number(ld[0]);
                    sgn_info.bitlength = Number(ld[1]);
                    sgn_info.endianess = slt[1].indexOf("0")>-1?"motorola":"intel";
                    sgn_info.signed = slt[1].indexOf("-")>-1;
                    let sc = sgn_arr[3].split("(")[1].split(")")[0].split(",");
                    sgn_info.scaling = Number(sc[0]);
                    sgn_info.offset = Number(sc[1]);
                    let mm = sgn_arr[4].split("[")[1].split("]")[0].split("|");
                    sgn_info.minimum = Number(mm[0]);
                    sgn_info.maximum = Number(mm[1]);
                    // let nis = info_arr[i].substring(info_arr[i].indexOf('"')+1);
                    // sgn_info.units = nis.substring(0,nis.indexOf('"'));
                    // message_info.signals.push(sgn_info);

                    this.convertDBC.Messages_Info[message_info.name].signals.push(sgn_info.name);
                    this.convertDBC.Signals_Info[sgn_info.name] = {
                        startbit : sgn_info.startbit,
                        bitlength : sgn_info.bitlength,
                        endianess : sgn_info.endianess,
                        sgn_info : sgn_info.signed,
                        scaling : sgn_info.scaling,
                        offset : sgn_info.offset,
                        minimum : sgn_info.minimum,
                        maximum : sgn_info.maximum,
                        physics : true,
                        value : {}
                    };
                }
            }
        }
        // this.convertDBC.Message_List.push(message_info);
    }
    private findSignal_Head_VAL(data:string){
        while(data.indexOf("\r\nVAL_")>-1){
            let sgn_val:any = {em_str:[],em_num:[]};
            let idx = data.indexOf("\r\nVAL_");
            data = data.substring(idx+2);
            if(data.indexOf(";")>-1){
                let rdx = data.indexOf(";");
                let val_arr = data.substring(0,rdx).split(" ");
                let end = 0;
                let emp = "";
                for(let i=0;i<val_arr.length;i++){
                    if(i==0){}
                    else if(i==1)sgn_val.id = Number(val_arr[i]);
                    else if(i==2)sgn_val.name = val_arr[i];
                    else{
                        if(val_arr[i].indexOf('"')>-1){
                            end++;
                            let fid_arr = val_arr[i].split('"');
                            if(end==1){
                                if(fid_arr.length==3){
                                    end = 0;
                                    emp = "";
                                    sgn_val.em_str.push(fid_arr[1]);
                                }else{
                                    emp+=fid_arr[1];
                                }
                            }
                            else if(end==2){
                                emp+=" "+fid_arr[0];
                                sgn_val.em_str.push(emp);
                                emp = "";
                                end = 0;
                            }
                        }else{
                            if(end){
                                emp+=" "+val_arr[i];
                            }else{
                                if(Number(val_arr[i])!=null&&val_arr[i]!="")sgn_val.em_num.push(Number(val_arr[i]));
                            }
                        }
                    }
                }
            }else{
                break;
            }
            if(sgn_val.name){
                this.convertDBC.Signals_Info[sgn_val.name].physics = false;
                this.convertDBC.Signals_Info[sgn_val.name].value = {em_str:sgn_val.em_str,em_num:sgn_val.em_num};
            }
        }
        return data;
    }
    private validate() {
        let dbcc:any = JSON.parse(new util.TextDecoder().decode(fs.readFileSync("D:/projectList/poseidon/binary/service/dist/123.json")));
        let dbct:any = JSON.parse(new util.TextDecoder().decode(fs.readFileSync("D:/projectList/poseidon/binary/service/dist/dbc.json")));
        let message_c_list = dbcc.messages;
        console.log(message_c_list.length);
        console.log(dbct.length);
        if(message_c_list.length==dbct.length){
            for(let i=0;i<dbct.length;i++){
                let data_t = dbct[i];
                let data_c = message_c_list[i];
                if(data_t.name==data_c.name&&data_t.id==data_c.id&&data_t.dlc==data_c.dlc&&data_t.signals.length==data_c.signals.length){
                    for(let j=0;j<data_t.signals.length;j++){
                        let sgn_t = data_t.signals[j];
                        let sgn_c = data_c.signals[j];
                        if(sgn_t.name==sgn_c.name&&sgn_t.startbit==sgn_c.startbit&&sgn_t.bitlength==sgn_c.bitlength&&sgn_t.endianess==sgn_c.endianess&&sgn_t.scaling==sgn_c.scaling&&sgn_t.offset==sgn_c.offset&&sgn_t.minimum==sgn_c.minimum&&sgn_t.maximum==sgn_c.maximum&&sgn_t.signed==sgn_c.signed){
                            // not unit
                        }else {
                            console.log(j);
                            console.log(sgn_t);
                            console.log(sgn_c);
                            return 3;
                        }
                    }
                }else{
                    return 2;
                }
            }
        }else{
            console.error("Len Error!");
            return 1;
        }
        return 0;
    }
}
export default new ConvertDBC();