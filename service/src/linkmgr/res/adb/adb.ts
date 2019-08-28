import * as childprs from "child_process";
import * as path from "path";

class ADB{
    private adb_cmd:any;
    private backcall:any;
    startADB(cmd:string){
        return new Promise((resolve) => {
            this.backcall = resolve;
            if(this.adb_cmd)this.adb_cmd.stdin.write(cmd+" \r\n");
            else{
                this.adb_cmd = childprs.spawn('"'+path.dirname(process.execPath)+'/adb/adb" ',[cmd], { windowsHide:false });
                this.adb_cmd.stdout.on('data',(data:any) => {
                    console.log('ADB-OUT:', data);
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
            },500);
        });
    }
    async sendByADB(cmd:string){
        if(this.adb_cmd){
            return new Promise((resolve) => {
                this.backcall = resolve;
                this.adb_cmd.stdin.write(cmd+" \r\n");
                setTimeout( () => {
                    resolve({ret:1});
                },500);
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