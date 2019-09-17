import * as childprs from "child_process";
import * as path from "path";

class ADB{
    private adb_cmd:any;
    private log_cmd:any;
    sendData(cmd:string,callback:any){
        if(this.adb_cmd){
            this.addOnEvent(callback);
            this.adb_cmd.stdin.write(cmd+" \r\n");
        }
        else{
            this.adb_cmd = childprs.spawn('"'+path.dirname(process.execPath)+'/adb/adb" ',[cmd], { windowsHide:true,detached:true });
            this.addOnEvent(callback);
        }
    }
    private addOnEvent(callback:any){
        this.adb_cmd.stdout.removeAllListeners("data");
        this.adb_cmd.stderr.removeAllListeners("data");
        this.adb_cmd.removeAllListeners("close");
        this.adb_cmd.stdout.on('data',(data:any) => {
            // console.log('ADB-OUT:', data);
            callback({ret:1,data:data});
        });
        this.adb_cmd.stderr.on('data',(err:any) => {
            console.error('ADB-ERROR', err);
            this.adb_cmd = null;
            callback({ret:0});
        });
        this.adb_cmd.on('close',(code:any) => {
            console.error('ADB-close', code);
            this.adb_cmd = null;
            callback({ret:2,data:code});
        });
    }
    openADBLog(cmd:any,loger:any,file:any,callback:any){
        this.log_cmd = childprs.spawn('"'+path.dirname(process.execPath)+'/adb/adb" ',[cmd], { windowsHide:true,detached:true });
        this.log_cmd.stdout.pipe(loger).pipe(file);
        // this.log_cmd.stdout.removeAllListeners("data");
        // this.log_cmd.stderr.removeAllListeners("data");
        // this.log_cmd.removeAllListeners("close");
        this.log_cmd.stdout.on('data',(data:any) => {
            // console.log('ADB-OUT:', data);
            callback({ret:1,data:data});
        });
        this.log_cmd.stderr.on('data',(err:any) => {
            console.error('ADB-ERROR', err);
            file.end();
            this.log_cmd = null;
            callback({ret:0});
        });
        this.log_cmd.on('close',(code:any) => {
            console.error('ADB-close', code);
            file.end();
            this.log_cmd = null;
            callback({ret:2,data:code});
        });
    }
    endADB(){
        if(this.adb_cmd){
            this.adb_cmd.kill();
            this.adb_cmd = null;
        }
        if(this.log_cmd){
            this.log_cmd.kill();
            this.log_cmd = null;
        }
    }
}
export default new ADB();