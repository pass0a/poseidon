<template>
  <div>
    <el-link v-model="enterTestView" v-show="false"></el-link>
    <el-link v-model="testStatus" v-show="false"></el-link>
    <el-container>
      <el-header v-show="false">
        <!-- <img style="margin:0;padding:0;" src="/src/assets/pd_name.png" width="200" height="80"> -->
      </el-header>
      <el-menu :default-active="select_mode" class="el-menu-demo" mode="horizontal" @select="selectMode" background-color="#545c64" text-color="#fff" active-text-color="#fff">
        <el-menu-item index="1"><i class="el-icon-folder-opened"></i>打开项目</el-menu-item>
        <el-menu-item index="2"><i class="el-icon-folder-add"></i>新建项目</el-menu-item>
        <el-menu-item index="3"><i class="el-icon-edit-outline"></i>编辑用例</el-menu-item>
        <el-menu-item index="4"><i class="el-icon-monitor"></i>进入测试</el-menu-item>
        <el-menu-item index="5"><i class="el-icon-document"></i>查看报告</el-menu-item>
        <el-submenu index="6">
            <template slot="title">多项管理</template>
            <el-menu-item index="6_1">步骤管理</el-menu-item>
            <el-menu-item index="6_2">截图管理</el-menu-item>
            <el-menu-item index="6_3">模块管理</el-menu-item>
        </el-submenu>
        <el-menu-item index="7"><i class="el-icon-setting"></i>系统配置</el-menu-item>
        <el-menu-item index="8"><i class="el-icon-service"></i>关于我们</el-menu-item>
      </el-menu>
      <div style="background-color: #545c64bb;height:30px">
        <p style="margin:6px 0px 0px 20px;color:#ffd04b">当前选择项目 : {{ currentProject }}</p>
      </div>
      <div>
        <ul v-show="select_mode=='3'"><EditCasesView/></ul>
        <ul v-show="select_mode=='4'"><TestView/></ul>
        <ul v-show="select_mode=='5'"><ReportView/></ul>
        <ul v-show="select_mode=='6_1'"><StepsMgrView/></ul>
        <ul v-show="select_mode=='6_2'"><ScreenView/></ul>
        <ul v-show="select_mode=='6_3'"><ModuleView/></ul>
        <ul v-show="select_mode=='7'"><SettingView/></ul>
        <ul v-show="select_mode=='8'"><About/></ul>
      </div>
      <div>
        <OpenPrj/>
      </div>
      <div>
        <NewPrj/>
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
import About from "./About.vue";
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
    About
  }
})
export default class Home extends Vue {
    private select_mode:any="4";
    private test_status:any=false;
    private needOpenPrj:any=["3","5","6_1","6_2","6_3"];
    private needStopTest:any=["1","2"];
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
    private selectMode(key:any){
        this.$store.state.home_info.mode = key;
        if(this.select_mode!=key){
          if(this.warningForAction(key))return;
          switch(key){
            case "1":
              let p_req = {
                  type : "toDB",
                  route : "projects",
                  job : "list"
              }
              this.$store.state.app_info.pis.push(p_req);
              break;
            case "2":
              this.$store.state.project_info.newflag=true;
              break;
            case "3":
              if(this.$store.state.editcase_info.refresh_data){
                let l_req = {
                    type : "toDB",
                    route : "cases",
                    job : "list",
                    info : {prjname:this.$store.state.project_info.current_prj}
                }
                this.$store.state.app_info.pis.push(l_req);
              }
              this.select_mode=key;
              break;
            case "6_3":
              this.$store.state.module_info.enter++;
              this.select_mode=key;
              break;
            case "5":
              this.$store.state.app_info.pis.push({type:"toSer",job:"readReport",prjname:this.$store.state.project_info.current_prj});
              this.select_mode=key;
              break;
            case "7":
              this.$store.state.app_info.pis.push({type:"toSer",job:"readConfig"});
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
        return false;
      }
      else if(this.needStopTest.indexOf(key)!=-1){
        if(this.test_status){
          this.$notify({title: '测试进行中!!!无法进行操作',message: '', type: 'warning',duration:1500});
          return true;
        }
        return false;
      }
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
</style>