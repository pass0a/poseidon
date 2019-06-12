<template>
  <div id="app">
    <el-link v-model="sendRequest" v-show="false"></el-link>
    <router-view></router-view>
  </div>
</template>
<script lang="ts">
let pack = require("./ext/pack/index.js");
let pis = new pack.inputStream();
let pos = new pack.outputStream();

import { Component, Prop, Vue } from "vue-property-decorator";
import { defaultCoreCipherList, defaultCipherList } from 'constants';
@Component
export default class App extends Vue {
    private ws: any = null;
    private count:any=0;
    private created() {
        pis.on("data", (data: any) => {
            this.ws.send(data);
        });
        pos.on("data", (data: any) => {
            this.revHandle(data);
        });
        this.ws = new WebSocket("ws://127.0.0.1:6001");
        this.ws.onopen = () => {
            this.ws.binaryType = "arraybuffer";
            pis.push({type:"readConfig"});
            pis.push({type:"toDB",route:"users",job:"find",info:{name:"admin",psw:"123"}});
        };
        this.ws.onmessage = (frm: any) => {
            pos.push(frm.data);
        };
        this.ws.onclose = () => {
            console.log("close websocket!!!");
        };
    }
    private revHandle(data:any){
        console.log(data.type);
        switch(data.type){
            case "readConfig":
                this.$store.state.setting_info.info=data.info;
                break;
            case "saveConfig":
                this.$store.state.alert_info.showflag=false;
                this.$notify({title: '系统配置信息保存成功',message: '', type: 'success',duration:1500});
                break;
            case "readReport":
                this.$store.state.report_info.data=data.info;
                break;
            case "toDB":
                console.log("revDB:",data);
                this.revToDB(data);
                break;
            default:
                break;
        }
    }
    private revToDB(data:any){
        switch(data.route){
            case "users":
                this.revToDB_users(data);
                break;
            case "projects":
                this.revToDB_projects(data);
                break;
            case "cases":
                this.revToDB_cases(data);
                break;
        }
    }
    private revToDB_users(data:any){
        switch(data.job){
            case "find":
                this.$store.state.login_info._id=data.info;
                break;
        }
    }
    private revToDB_projects(data:any){
        switch(data.job){
            case "add":
                this.$store.state.alert_info.showflag=false;
                if(data.info.state){
                    this.$store.state.project_info.current_prj=data.info.name;
                    this.$store.state.project_info.newflag=false;
                    this.$store.state.editcase_info.refresh_data=true;
                    this.$notify({title: '项目创建成功!',message: '', type: 'success',duration:1500});
                }else{
                    this.$notify({title: '项目已存在',message: '', type: 'error',duration:1500});
                }
                break;
            case "list":
                this.$store.state.project_info.prjlist=data.info;
                this.$store.state.project_info.openflag=true;
                break;
        }
    }
    private revToDB_cases(data:any){
        switch(data.job){
            case "list":
                this.$store.state.editcase_info.data=JSON.parse(data.info);
                this.$store.state.editcase_info.refresh_data=false;
                break;
            case "add":
                if(data.info){
                    this.$store.state.case_info.showflag=false;
                    this.$store.state.editcase_info.update_count++;
                    this.$notify({title: '项目创建成功!',message: '', type: 'success',duration:1500});
                }else{
                    this.$notify({title: '用例ID已存在',message: '', type: 'error',duration:1500});
                }
                break;
            case "modify":
                if(data.info){
                    this.$store.state.case_info.showflag=false;
                    this.$store.state.editcase_info.update_count++;
                    this.$notify({title: '项目修改成功!',message: '', type: 'success',duration:1500});
                }
                break;
        }
    }
    get sendRequest(){
        if(this.$store.state.app_info.reqCount > this.count){
            let reqType = this.$store.state.app_info.type;
            switch(reqType){
                case "readConfig":
                    pis.push({type:reqType});
                    break;
                case "saveConfig":
                    pis.push({type:reqType,info:this.$store.state.setting_info.info});
                    break;
                case "readReport":
                    pis.push({type:reqType,prjname:this.$store.state.project_info.current_prj});
                    break;
                case "toDB":
                    this.sendToDB(reqType);
                    break;
            }
            this.count++;
        }
        return this.$store.state.app_info.reqCount;
    }
    private sendToDB(type:any){
        let route = this.$store.state.app_info.route;
        let job = this.$store.state.app_info.job;
        let info:any;
        switch(route){
            case "users":
                info=this.sendToDB_users(job,info);
                break;
            case "projects":
                info=this.sendToDB_projects(job,info);
                break;
            case "cases":
                info=this.sendToDB_cases(job,info);
                break;
        }
        pis.push({type:type,route:route,job:job,info:info});
    }
    private sendToDB_users(job:any,info:any){
        switch(job){
            case "find":
                info={name:"admin",psw:"123"};
                break;
        }
        return info;
    }
    private sendToDB_projects(job:any,info:any){
        switch(job){
            case "add":
                info={name:this.$store.state.alert_info.info,uid:this.$store.state.login_info._id};
                break;
            case "list":
                break;
        }
        return info;
    }
    private sendToDB_cases(job:any,info:any){
        switch(job){
            case "add":
                info={prjname:this.$store.state.project_info.current_prj,casedata:this.$store.state.case_info.data};
                break;
            case "list":
                info={prjname:this.$store.state.project_info.current_prj}
                break;
            case "modify":
                info={prjname:this.$store.state.project_info.current_prj,casedata:this.$store.state.case_info.data};
                break;
        }
        return info;
    }
}
</script>