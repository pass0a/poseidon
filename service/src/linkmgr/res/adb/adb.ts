import * as childprs from "child_process";
import * as path from "path";

class ADB{
    private adb_cmd:any;
    private backcall:any;
    private startflag:boolean=false;
    private startlog:string="";
    startADB(cmd:string){
        return new Promise((resolve) => {
            this.backcall = resolve;
            if(this.adb_cmd)this.adb_cmd.stdin.write(cmd+" \r\n");
            else{
                this.adb_cmd = childprs.spawn('"'+path.dirname(process.execPath)+'/adb/adb" ',[cmd], { windowsHide:false,detached:true });
                this.adb_cmd.stdout.on('data',(data:any) => {
                    console.log('ADB-OUT:', data);
                    if(this.startflag){
                        this.startlog+=data;
                        if(this.startlog.indexOf("passoa success")>-1){
                            this.startlog = "";
                            this.startflag = false;
                            this.backcall({ret:1});
                        }
                    }
                });
                this.adb_cmd.stderr.on('data',(err:any) => {
                    console.error('ADB-ERROR', err);
                });
                this.adb_cmd.on('close',(code:any) => {
                    console.error('ADB-close', code);
                    if(this.backcall){
                        this.adb_cmd = null;
                        this.backcall({ret:0,code:code});
                    }
                });
            }
            setTimeout( () => {
                resolve({ret:1});
            },1000);
        });
    }
    async sendByADB(cmd:string,startflag:boolean){
        this.startflag = startflag;
        if(this.adb_cmd){
            return new Promise((resolve) => {
                this.backcall = resolve;
                this.adb_cmd.stdin.write(cmd+" \r\n");
                setTimeout( () => {
                    resolve({ret:1});
                },20000);
            });
        }else{
            let ret:any = await  this.startADB(cmd);
            return new Promise((resolve) => {
                resolve({ret:ret.ret});
            });
        }
    }
    endADB(){
        if(this.adb_cmd){
            this.adb_cmd.kill();
            this.adb_cmd = null;
        }
    }
}
export default new ADB();