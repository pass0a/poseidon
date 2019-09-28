<template>
    <Modal
        v-model="showflag"
        width="420"
        :closable="false"
		:mask-closable="false"
        :loading="true"
        :ok-text="alertInfo.btn"
        @on-ok="ok"
        @on-cancel="cancel"
        >
        <p slot="header">
            <i class="el-icon-warning-outline"></i>
            <span>{{ alertInfo.title }}</span>
        </p>
        <span style="margin:0px 0px 0px 5px"><font size="3"><strong>{{ alertInfo.content }}</strong></font></span>
        <el-link v-model="updateShowflag"></el-link>
    </Modal>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
@Component({
  components: {
  }
})
export default class AlertView extends Vue {
    private alertInfo:any={title:"",content:"",btn:""};
    private isLoading:any=false;
    private loadingView:any=null;
    private showflag:any=false;
    get updateShowflag(){
        if(this.$store.state.alert_info.showflag)this.getAlertInfo();
        this.showflag=this.$store.state.alert_info.showflag;
        return this.showflag;
    }
    private getAlertInfo(){
        switch(this.$store.state.alert_info.type){
            case 0:
                this.alertInfo.title="保存配置";
                this.alertInfo.content="是否保存当前配置?";
                this.alertInfo.btn="保存";
                break;
            case 1:
                this.alertInfo.title="新建项目";
                this.alertInfo.content="是否确定新建项目 : " + this.$store.state.alert_info.info.name +" ?";
                this.alertInfo.btn="确定";
                break;
            case 2:
                this.alertInfo.title="删除用例";
                this.alertInfo.content="是否确定删除用例 : " + this.$store.state.alert_info.info +" ?";
                this.alertInfo.btn="确定";
                break;
            case 3:
                this.alertInfo.title="重新测试";
                this.alertInfo.content="是否确定重新开始测试?";
                this.alertInfo.btn="确定";
                break;
            case 4:
                this.alertInfo.title="删除选项";
                this.alertInfo.content="是否确定删除选项 : " + this.getResName(this.$store.state.alert_info.info.id) +" ?注意:确定后将自动在所有用例的自动化步骤中删除此选项!";
                this.alertInfo.btn="确定";
                break;
            case 5:
                this.alertInfo.title="删除模块";
                this.alertInfo.content="是否确定删除整个模块 : " + this.getResName(this.$store.state.alert_info.info.id) +" ?注意:确定后将自动删除该模块的所有用例!请谨慎操作!";
                this.alertInfo.btn="确定";
                break;
            case 6:
                this.alertInfo.title="删除项目";
                this.alertInfo.content="是否删除项目 : " + this.$store.state.alert_info.info + " ?";
                this.alertInfo.btn="删除";
                break;
            default:
                break;
        }
    }
    private getResName(id:string){
        return this.$store.state.steps_info.reslist[id];
    }
    private cancel(){
        this.$store.state.alert_info.showflag=false;
    }
    private ok(){
        switch(this.$store.state.alert_info.type){
            case 0:
                this.$store.state.app_info.pis.write({type:"toSer",job:"saveConfig",info:this.$store.state.setting_info.info});
                break;
            case 1:
                this.alertInfo.btn="创建中...";
                let p_info = {
                    msg : this.$store.state.alert_info.info,
                    uid : this.$store.state.login_info._id
                }
                this.sendReq("toDB","projects","add",p_info);
                break;
            case 2:
                let c_info = {
                    prjname:this.$store.state.project_info.current_prj,
                    _id: this.$store.state.case_info.data._id
                };
                this.sendReq("toDB","cases","delete",c_info);
                let s_info = {
                    type:1,
                    prjname:this.$store.state.project_info.current_prj,
                    cid: this.$store.state.case_info.data._id,
                    uid:this.$store.state.login_info._id
                };
                this.sendReq("toDB","status","delete",s_info);
                break;
            case 3:
                this.$store.state.app_info.pis.write({type:"toSer",job:"replayTest",info:{prjname:this.$store.state.project_info.current_prj,uid:this.$store.state.login_info._id}});
                this.$store.state.test_info.count++;
                this.$store.state.alert_info.showflag = false;
                break;
            case 4:
                let di_info:any = {
                    prjname:this.$store.state.project_info.current_prj,
                    msg:{
                        type: this.$store.state.alert_info.info.type,
                        id: this.$store.state.alert_info.info.id,
                        pid: this.$store.state.alert_info.info.pid
                    }
                };
                this.$store.state.req_info.remove_id = 1;
                if(di_info.msg.id.indexOf("group")>-1){
                    this.$store.state.req_info.remove_id = 2;
                    this.sendReq("toDB","group","remove_id",di_info);
                }
                else if(di_info.msg.id.indexOf("button")>-1)this.sendReq("toDB","buttons","remove_id",di_info);
                else if(di_info.msg.id.indexOf("adb")>-1)this.sendReq("toDB","adb","remove_id",di_info);
                else{
                    this.$store.state.req_info.remove_id = 2;
                    this.sendReq("toDB","binding","remove_id",di_info);
                }
                this.sendReq("toDB","cases","remove_id",di_info);
                this.sendReq("toDB","res","remove_id",di_info);
                break;
            case 5:
                let dmo_info = {
                    prjname:this.$store.state.project_info.current_prj,
                    msg:{
                        type: this.$store.state.alert_info.info.type,
                        id: this.$store.state.alert_info.info.id,
                        pid: this.$store.state.alert_info.info.pid
                    }
                };
                this.$store.state.req_info.remove_id = 0;
                this.sendReq("toDB","cases","remove_module",dmo_info);
                this.sendReq("toDB","status","remove_module",dmo_info);
                this.sendReq("toDB","res","remove_id",dmo_info);
                this.sendReq("toDB","rule","remove_id",dmo_info);
                break;
            case 6:
                this.$store.state.app_info.pis.write({type:"toDB",route:"removeAll",job:"removeAll",info:{prjname:this.$store.state.alert_info.info}});
                break;
        }
    }

    private sendReq(type:string,route:string,job:string,info:any){
        let req = {
            type : type,
            route : route,
            job : job,
            info : info
        }
        this.$store.state.app_info.pis.write(req);
    }
}
</script>