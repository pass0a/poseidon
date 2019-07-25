<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>
<script lang="ts">
import * as pack from "./ext/pack/index";
let pis = new pack.inputStream();
let pos = new pack.outputStream();

import { Component, Prop, Vue } from "vue-property-decorator";
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
            this.$store.state.app_info.pis = pis;
            pis.push({type:"toSer",job:"readConfig"});
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
            case "toSer":
                console.log("revSer:",data);
                this.revToSer(data);
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
    private revToSer(data:any){
        switch(data.job){
            case "readConfig":
                this.$store.state.setting_info.info = data.info;
                break;
            case "saveConfig":
                this.$store.state.alert_info.showflag = false;
                this.$notify({title: '系统配置信息保存成功',message: '', type: 'success',duration:1500});
                break;
            case "readReport":
                this.$store.state.report_info.data = data.info;
                break;
            case "readStopinfo":
                this.$store.state.test_info.stopflag = 0;
                this.$store.state.test_info.stopflag = data.info;

                this.$store.state.req_info.refresh_rl = 0;
                pis.push({type:"toDB",route:"res",job:"list",info:{prjname:this.$store.state.project_info.current_prj}});
                pis.push({type:"toDB",route:"rule",job:"list",info:{prjname:this.$store.state.project_info.current_prj}});
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
            case "buttons":
                this.revToDB_buttons(data);
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
                    this.$store.state.req_info.new_prj=0;
                    this.$store.state.project_info.current_prj=data.info.name;
                    pis.push({type:"toDB",route:"res",job:"new",info:{prjname:data.info.name}});
                    pis.push({type:"toDB",route:"rule",job:"new",info:{prjname:data.info.name}});
                    pis.push({type:"toDB",route:"buttons",job:"new",info:{prjname:data.info.name}});
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
                    this.$store.state.case_info.showflag = false;
                    this.$store.state.case_info.data._id = data.info;
                    this.$store.state.case_info.data.c_status = [];
                    this.$store.state.editcase_info.update_op = true;
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
                this.$store.state.req_info.refresh_rl++;
                if(this.$store.state.req_info.refresh_rl == 2)this.$store.state.id_info.count++;
                break;
            case "add":
                if(data.info){
                    this.$notify({title: '添加成功!',message: '', type: 'success',duration:1500});
                    this.$store.state.req_info.refresh_rl = 0;
                    pis.push({type:"toDB",route:"res",job:"list",info:{prjname:this.$store.state.project_info.current_prj}});
                    pis.push({type:"toDB",route:"rule",job:"list",info:{prjname:this.$store.state.project_info.current_prj}});
                }
                break;
            case "new":
                this.$store.state.req_info.new_prj++;
                if(this.$store.state.req_info.new_prj==3){
                    
                    this.$store.state.req_info.refresh_rl = 0;
                    pis.push({type:"toDB",route:"res",job:"list",info:{prjname:this.$store.state.project_info.current_prj}});
                    pis.push({type:"toDB",route:"rule",job:"list",info:{prjname:this.$store.state.project_info.current_prj}});
                    this.$store.state.project_info.newflag=false;
                    this.$store.state.editcase_info.refresh_data=true;
                    this.$notify({title: '项目创建成功!',message: '', type: 'success',duration:1500});
                }
                break;
            case "modify":
                if(data.info){
                    pis.push({type:"toDB",route:"res",job:"list",info:{prjname:this.$store.state.project_info.current_prj}});
                    pis.push({type:"toDB",route:"rule",job:"list",info:{prjname:this.$store.state.project_info.current_prj}});
                    this.$notify({title: '修改成功!',message: '', type: 'success',duration:1500});
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
                this.$store.state.req_info.refresh_rl++;
                if(this.$store.state.req_info.refresh_rl == 2)this.$store.state.id_info.count++;
                break;
            case "add":
                let a_req = {
                    type:"toDB",
                    route:"res",
                    job:"add",
                    info:{
                        prjname : this.$store.state.project_info.current_prj,
                        id : data.info.id,
                        name : data.info.name
                    }
                }
                pis.push(a_req);
                break;
            case "new":
                this.$store.state.req_info.new_prj++;
                if(this.$store.state.req_info.new_prj==3){
                    this.$store.state.req_info.refresh_rl = 0;
                    pis.push({type:"toDB",route:"res",job:"list",info:{prjname:this.$store.state.project_info.current_prj}});
                    pis.push({type:"toDB",route:"rule",job:"list",info:{prjname:this.$store.state.project_info.current_prj}});

                    this.$store.state.project_info.newflag=false;
                    this.$store.state.editcase_info.refresh_data=true;
                    this.$notify({title: '项目创建成功!',message: '', type: 'success',duration:1500});
                }
                break;
        }
    }
    private revToDB_buttons(data:any){
        switch(data.job){
            case "new":
                this.$store.state.req_info.new_prj++;
                if(this.$store.state.req_info.new_prj==3){
                    this.$store.state.req_info.refresh_rl = 0;
                    pis.push({type:"toDB",route:"res",job:"list",info:{prjname:this.$store.state.project_info.current_prj}});
                    pis.push({type:"toDB",route:"rule",job:"list",info:{prjname:this.$store.state.project_info.current_prj}});

                    this.$store.state.project_info.newflag=false;
                    this.$store.state.editcase_info.refresh_data=true;
                    this.$notify({title: '项目创建成功!',message: '', type: 'success',duration:1500});
                }
                break;
        }
    }
}
</script>