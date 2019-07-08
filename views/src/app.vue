<template>
  <div id="app">
    <el-link v-model="sendRequest" v-show="false"></el-link>
    <router-view></router-view>
  </div>
</template>
<script lang="ts">
import * as pack from "./ext/pack/index";
let pis = new pack.inputStream();
let pos = new pack.outputStream();

import { Component, Prop, Vue } from "vue-property-decorator";
import { defaultCoreCipherList, defaultCipherList } from 'constants';
import { resolve } from 'dns';
@Component
export default class App extends Vue {
    private ws: any = null;
    private count:any=0;
    private req_info:any={
        new_prj:0
    };
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
        switch(data.type){
            case "readConfig":
                this.$store.state.setting_info.info=data.info;
                break;
            case "saveConfig":
                this.$store.state.alert_info.showflag=false;
                this.$notify({title: '系统配置信息保存成功',message: '', type: 'success',duration:1500});
                break;
            case "readReport":
                this.$store.state.report_info.data = data.info;
                break;
            case "readStopinfo":
                this.$store.state.test_info.stopflag = 0;
                this.$store.state.test_info.stopflag = data.info;
                pis.push({type:"toDB",route:"res",job:"list",info:{prjname:this.$store.state.project_info.current_prj}});
                break;
            case "downCases":
                this.$store.state.alert_info.showflag=false;
                this.$store.state.home_info.count++;
                this.$notify({title: '用例下载成功,请进行测试',message: '', type: 'success',duration:1500});
                break;
            case "syncRemote":
                this.$store.state.screen_info.status = data.status;
                this.$store.state.screen_info.path = data.path;
                this.$store.state.screen_info.count++;
                this.$notify({title: data.status?'同步成功':'同步失败',message: '', type: data.status?'success':'error',duration:1500});
                break;
            case "saveCutImage":
                this.$store.state.screen_info.save_count++;
                this.$notify({title: '保存成功!',message: '', type: 'success',duration:1500});
                break;
            case "tolink":
                console.log("revLink:",data);
                this.$store.state.test_info.info=data;
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
            case "res":
                this.revToDB_res(data);
                break;
            case "rule":
                this.revToDB_rule(data);
                break;
        }
    }
    private revToDB_users(data:any){
        switch(data.job){
            case "find":
                var _id = "";
                for(var i=0;i<data.info.id.length;i++){
                    if(data.info.id[i]<16)_id+="0";
                    _id+=data.info.id[i].toString(16);
                }
                this.$store.state.login_info._id=_id;
                break;
        }
    }
    private revToDB_projects(data:any){
        switch(data.job){
            case "add":
                this.$store.state.alert_info.showflag=false;
                if(data.info.state){
                    this.req_info.new_prj=0;
                    this.$store.state.project_info.current_prj=data.info.name;
                    pis.push({type:"toDB",route:"res",job:"new",info:{prjname:data.info.name}});
                    pis.push({type:"toDB",route:"rule",job:"new",info:{prjname:data.info.name}});
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
                    this.$store.state.editcase_info.update_op=true;
                    this.$notify({title: '用例创建成功!',message: '', type: 'success',duration:1500});
                }else{
                    this.$notify({title: '用例ID已存在',message: '', type: 'error',duration:1500});
                }
                break;
            case "modify":
                if(data.info){
                    this.$store.state.case_info.showflag=false;
                    this.$store.state.editcase_info.update_op=true;
                    this.$notify({title: '用例修改成功!',message: '', type: 'success',duration:1500});
                }
                break;
            case "delete":
                if(data.info){
                    this.$store.state.alert_info.showflag=false;
                    this.$store.state.editcase_info.update_op=true;
                    this.$notify({title: '用例删除成功!',message: '', type: 'success',duration:1500});
                }
                break;
        }
    }
    private revToDB_res(data:any){
        switch(data.job){
            case "list":
                let list=JSON.parse(data.info);
                let reslist:any={};
                for(let i=0;i<list.length;i++){
                    let id=list[i].id;
                    let name=list[i].name;
                    reslist[id]=name;
                }
                this.$store.state.steps_info.reslist=reslist;
                pis.push({type:"toDB",route:"rule",job:"list",info:{prjname:this.$store.state.project_info.current_prj}});
                break;
            case "add":
                if(data.info){
                    this.$notify({title: '添加成功!',message: '', type: 'success',duration:1500});
                    pis.push({type:"toDB",route:"res",job:"list",info:{prjname:this.$store.state.project_info.current_prj}});
                }
                break;
            case "new":
                this.req_info.new_prj++;
                if(this.req_info.new_prj==2){
                    pis.push({type:"toDB",route:"res",job:"list",info:{prjname:this.$store.state.project_info.current_prj}});
                    this.$store.state.project_info.newflag=false;
                    this.$store.state.editcase_info.refresh_data=true;
                    this.$notify({title: '项目创建成功!',message: '', type: 'success',duration:1500});
                }
                break;
        }
    }
    private revToDB_rule(data:any){
        switch(data.job){
            case "list":
                let list=JSON.parse(data.info);
                let rulelist:any={};
                for(let i=0;i<list.length;i++){
                    let id=list[i].id;
                    let content=list[i].content;
                    if(content!=null)rulelist[id]=content;
                }
                this.$store.state.steps_info.rulelist=rulelist;
                this.$store.state.id_info.count++;
                break;
            case "add":
                pis.push({type:"toDB",route:"res",job:"add",info:{prjname:this.$store.state.project_info.current_prj,id:data.info,name:this.$store.state.id_info.info.name}});
                break;
            case "new":
                this.req_info.new_prj++;
                if(this.req_info.new_prj==2){
                    pis.push({type:"toDB",route:"res",job:"list",info:{prjname:this.$store.state.project_info.current_prj}});
                    this.$store.state.project_info.newflag=false;
                    this.$store.state.editcase_info.refresh_data=true;
                    this.$notify({title: '项目创建成功!',message: '', type: 'success',duration:1500});
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
                case "downCases":
                    pis.push({type:reqType,prjname:this.$store.state.project_info.current_prj,info:this.$store.state.editcase_info.downCases});
                    break;
                case "startTest":
                    pis.push({type:reqType,prjname:this.$store.state.project_info.current_prj});
                    break;
                case "stopTest":
                    pis.push({type:reqType});
                    break;
                case "replayTest":
                    pis.push({type:reqType,prjname:this.$store.state.project_info.current_prj});
                    break;
                case "readStopinfo":
                    pis.push({type:reqType,prjname:this.$store.state.project_info.current_prj});
                    break;
                case "syncRemote":
                    pis.push({type:reqType,prjname:this.$store.state.project_info.current_prj});
                    break;
                case "saveCutImage":
                    pis.push({type:reqType,prjname:this.$store.state.project_info.current_prj,info:this.$store.state.screen_info.cut_info});
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
            case "res":
                info=this.sendToDB_res(job,info);
                break;
            case "rule":
                info=this.sendToDB_rule(job,info);
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
            case "delete":
                info={prjname:this.$store.state.project_info.current_prj,case_id:this.$store.state.alert_info.info};
                break;
        }
        return info;
    }
    private sendToDB_res(job:any,info:any){
        switch(job){
            case "list":
                info={prjname:this.$store.state.project_info.current_prj};
                break;
        }
        return info;
    }
    private sendToDB_rule(job:any,info:any){
        switch(job){
            case "list":
                info={prjname:this.$store.state.project_info.current_prj};
                break;
            case "add":
                info={prjname:this.$store.state.project_info.current_prj,id:this.$store.state.id_info.info.id};
        }
        return info;
    }
}
</script>