<template>
  <div>
    <el-link v-model="enterTestView" v-show="false"></el-link>
    <el-link v-model="testStatus" v-show="false"></el-link>
    <el-link v-model="ConnectStatus" v-show="false"></el-link>
    <el-container>
      <el-header v-show="false"></el-header>
      <el-menu :default-active="select_mode" class="el-menu-demo" mode="horizontal" @select="selectMode" background-color="#545c64" text-color="#fff" active-text-color="#fff">
        <el-menu-item index="1"><i class="el-icon-folder-opened"></i>打开项目</el-menu-item>
        <el-menu-item index="2"><i class="el-icon-folder-add"></i>新建项目</el-menu-item>
        <el-menu-item index="3"><i class="el-icon-edit-outline"></i>编辑用例</el-menu-item>
        <el-menu-item index="4"><i class="el-icon-monitor"></i>进入测试</el-menu-item>
        <el-menu-item index="5"><i class="el-icon-document"></i>查看报告</el-menu-item>
        <el-submenu index="6">
            <template slot="title">多项管理</template>
            <el-menu-item index="6_1">模块管理</el-menu-item>
            <el-menu-item index="6_2">步骤管理</el-menu-item>
            <el-menu-item index="6_3">选项绑定</el-menu-item>
            <el-menu-item index="6_4">摄像功能</el-menu-item>
        </el-submenu>
        <el-menu-item index="7"><i class="el-icon-setting"></i>系统配置</el-menu-item>
        <el-menu-item index="8"><i class="el-icon-s-unfold"></i>软件推送</el-menu-item>
        <el-menu-item index="9"><i class="el-icon-service"></i>关于我们</el-menu-item>
      </el-menu>
      <div style="background-color: #545c64bb;height:31px;">
        <span style="margin:0px 0px 0px 10px"><font size="2" color="#ffd04b"><i class="el-icon-folder-opened"></i> 当前选择项目 : {{ currentProject }}</font></span>
        <span style="margin:0px 0px 0px 30px"><font size="2" color="#ffd04b"><i class="el-icon-connection"></i> 连接状态 : </font></span>
        <span style="margin:0px 0px 0px 10px"><font size="2" color="#ffd04b	"><i class="el-icon-monitor"></i> 服务器</font></span>
        <span style="margin:0px 0px 0px 0px"><font size="2" :color="showConnectStatus(0,connectStatus.server)">(<i class="el-icon-loading" v-show="!connectStatus.server"></i>{{showConnectStatus(1,connectStatus.server)}})</font></span>
        <span style="margin:0px 0px 0px 10px"><font size="2" color="#ffd04b"><i class="el-icon-coin"></i> 数据库</font></span>
        <span style="margin:0px 0px 0px 0px"><font size="2" :color="showConnectStatus(0,connectStatus.db)">(<i class="el-icon-loading" v-show="!connectStatus.db"></i>{{showConnectStatus(1,connectStatus.db)}})</font></span>
        <span style="margin:0px 0px 0px 10px"><font size="2" color="#ffd04b"><i class="el-icon-link"></i> LINK</font></span>
        <span style="margin:0px 0px 0px 0px"><font size="2" :color="showConnectStatus(0,connectStatus.link)">(<i class="el-icon-loading" v-show="!connectStatus.link"></i>{{showConnectStatus(1,connectStatus.link)}})</font></span>
        <span><font size="4"><strong></strong></font></span>
        <button class="button_rt" style="margin:0px 0px 0px 10px" v-show="connectStatus.server==2||connectStatus.db==2||connectStatus.link==2" @click="reconnect">点击重新连接失败项</button>
      </div>
      <div>
        <ul v-show="select_mode=='3'"><EditCasesView/></ul>
        <ul v-show="select_mode=='4'"><TestView/></ul>
        <ul v-show="select_mode=='5'"><ReportView/></ul>
        <ul v-show="select_mode=='6_1'"><ModuleView/></ul>
        <ul v-show="select_mode=='6_2'"><StepsMgrView/></ul>
        <ul v-show="select_mode=='6_3'"><ScreenView/></ul>
        <ul v-show="select_mode=='6_4'"><CameraView/></ul>
        <ul v-show="select_mode=='7'"><SettingView/></ul>
        <ul v-show="select_mode=='8'"><PushView/></ul>
        <ul v-show="select_mode=='9'"><AboutView/></ul>
      </div>
      <div>
        <OpenPrj/>
      </div>
      <div>
        <NewPrj/>
      </div>
      <div>
        <AuthView/>
      </div>
    </el-container>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import OpenPrj from "./OpenPrj.vue";
import NewPrj from "./NewPrj.vue";
import TestView from "./TestView.vue";
import EditCasesView from "./EditCasesView.vue";
import ReportView from "./ReportView.vue";
import SettingView from "./SettingView.vue";
import ScreenView from "./ScreenView.vue";
import StepsMgrView from "./StepsMgrView.vue";
import ModuleView from "./ModuleView.vue";
import AboutView from "./AboutView.vue";
import AuthView from "./AuthView.vue";
import PushView from "./PushView.vue";
import CameraView from "./CameraView.vue";
@Component({
  components: {
    OpenPrj,
    NewPrj,
    TestView,
    EditCasesView,
    ReportView,
    SettingView,
    ScreenView,
    StepsMgrView,
    ModuleView,
    AboutView,
    AuthView,
    PushView,
    CameraView
  }
})
export default class Home extends Vue {
    private select_mode:any="4";
    private test_status:any=false;
    private needOpenPrj:any=["3","5","6_1","6_2","6_3","6_4"];
    private needStopTest:any=["1","2","6_1","6_2","6_3"];
    private connectStatus:any = {server:0,db:0,link:0};
    get currentProject(){
        if(this.$store.state.project_info.current_prj.length){
            this.select_mode="4";
            return this.$store.state.project_info.current_prj;
        }
        return "无";
    }
    get enterTestView(){
        if(this.$store.state.home_info.count){
            this.select_mode="4";
        }
        return;
    }
    get testStatus(){
        this.test_status = this.$store.state.test_info.testing;
        return;
    }
    get ConnectStatus(){
        this.connectStatus = this.$store.state.app_info.connect_info;
        return;
    }
    private showConnectStatus(type:Number,flag:any){
        if(type){
            return flag==0?"连接中":(flag==1?"已连接":"连接失败");
        }else{
            return flag==0?"#ffd04b":(flag==1?"#53FF53":"#FF9797");
        }
    }
    private reconnect(){
      let r_req:any = {type:"toSer",job:"reconnect",info:[]};
      for(let prop in this.connectStatus){
        if(this.connectStatus[prop]==2){
          r_req.info.push(prop);
          this.connectStatus[prop]=0;
        }
      }
      if(r_req.info.indexOf("server")>-1){
        this.$store.state.app_info.cflag++;        
      }else this.$store.state.app_info.pis.write(r_req);
    }
    private selectMode(key:any){
        if(this.connectStatus.server!=1||this.connectStatus.db!=1||this.connectStatus.link!=1){
          this.$notify({title: '请检查连接状态!',message: '', type: 'warning',duration:1500});
          return;
        }
        this.$store.state.home_info.mode = key;
        if(this.select_mode!=key){
          if(this.warningForAction(key))return;
          switch(key){
            case "1":
              this.$store.state.app_info.pis.write({type:"toDB",route:"projects",job : "list"});
              break;
            case "2":
              this.$store.state.app_info.pis.write({type:"toDB",route:"projects",job : "list"});
              this.$store.state.project_info.newflag=true;
              break;
            case "3":
              this.$store.state.editcase_info.refresh_data = true;
              let c_pname = this.$store.state.project_info.current_prj;
              let c_module = this.$store.state.steps_info.rulelist.module;
              if(c_module.length){
                this.$store.state.editcase_info.firstModule = c_module[0];
                this.$store.state.app_info.pis.write({type:"toDB",route:"cases",job:"total",info:{prjname:c_pname,module:c_module[0]}});
              }else{
                this.$store.state.editcase_info.firstModule = "";
                this.$store.state.editcase_info.refresh_data = false;
              }
              this.select_mode=key;
              break;
            case "5":
              this.$store.state.app_info.pis.write({type:"toSer",job:"readReport",prjname:this.$store.state.project_info.current_prj});
              this.select_mode=key;
              break;
            case "6_1":
              this.$store.state.module_info.enter++;
              this.select_mode=key;
              break;
            case "6_2":
              this.$store.state.app_info.pis.write({type:"toDB",route:"buttons",job:"list",info:{prjname:this.$store.state.project_info.current_prj}});
              this.$store.state.app_info.pis.write({type:"toDB",route:"group",job:"list",info:{prjname:this.$store.state.project_info.current_prj}});
              this.$store.state.app_info.pis.write({type:"toDB",route:"binding",job:"list",info:{prjname:this.$store.state.project_info.current_prj}});
              this.$store.state.app_info.pis.write({type:"toDB",route:"adb",job:"list",info:{prjname:this.$store.state.project_info.current_prj}});
              this.select_mode=key;
              break;
            case "6_3":
              this.$store.state.app_info.pis.write({type:"toSer",job:"readConfig"});
              this.select_mode=key;
              break;
            case "7":
              this.$store.state.app_info.pis.write({type:"toSer",job:"readConfig"});
              this.select_mode=key;
              break;
            case "8":
              this.$store.state.app_info.pis.write({type:"toSer",job:"readConfig"});
              this.select_mode=key;
              break;
            default:
              this.select_mode=key;
              break;
          }
        }
    }
    private warningForAction(key:string){
      if(this.needOpenPrj.indexOf(key)!=-1){
        if(this.$store.state.project_info.current_prj.length==0){
          this.$notify({title: '当前无项目,请选择项目',message: '', type: 'warning',duration:1500});
          return true;
        }
      }
      if(this.needStopTest.indexOf(key)!=-1){
        if(this.test_status){
          this.$notify({title: '测试进行中!!!无法进行操作',message: '', type: 'warning',duration:1500});
          return true;
        }
      }
      return false;
    }
}
</script>
<style>
.el-header{
	background-color: #545c64bb;
	color: #333;
	margin:0;
  padding:0;
}
.button_rt {
	background-color:#545c64bb;
	border: none;
    border-radius: 4px;
    color: #ffd04b;
    padding: 3px 12px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 10px;
    margin: 4px 2px;
    cursor: pointer;
}
</style>