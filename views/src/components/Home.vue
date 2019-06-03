<template>
  <div>
    <el-container>
      <el-header>
        <img style="margin:0;padding:0;" src="/src/assets/pd_name.png" width="200" height="80">
      </el-header>
      <el-menu :default-active="select_mode" class="el-menu-demo" mode="horizontal" @select="selectMode" background-color="#545c64" text-color="#fff" active-text-color="#fff">
        <el-menu-item index="1"><i class="el-icon-folder-opened"></i>打开项目</el-menu-item>
        <el-menu-item index="2"><i class="el-icon-folder-add"></i>新建项目</el-menu-item>
        <el-menu-item index="3"><i class="el-icon-edit-outline"></i>编辑用例</el-menu-item>
        <el-menu-item index="4"><i class="el-icon-monitor"></i>进入测试</el-menu-item>
        <el-menu-item index="5"><i class="el-icon-document"></i>查看报告</el-menu-item>
        <el-menu-item index="6"><i class="el-icon-setting"></i>系统配置</el-menu-item>
        <el-menu-item index="7"><i class="el-icon-service"></i>关于我们</el-menu-item>
      </el-menu>
      <div style="background-color: #545c64bb;height:30px">
        <p style="margin:6px 0px 0px 20px;color:#ffd04b">当前选择项目 : {{ currentProject }}</p>
      </div>
      <div>
        <ul v-if="select_mode=='3'"><EditCasesView/></ul>
        <ul v-if="select_mode=='4'"><TestView/></ul>
        <ul v-if="select_mode=='5'"><ReportView/></ul>
        <ul v-if="select_mode=='6'"><SettingView/></ul>
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
@Component({
  components: {
    OpenPrj,
    NewPrj,
    TestView,
    EditCasesView,
    ReportView,
    SettingView
  }
})
export default class Home extends Vue {
    private select_mode:any="4";
    get currentProject(){
        if(this.$store.state.project_info.current_prj.length){
            return this.$store.state.project_info.current_prj;
        }
        return "无";
    }
    private selectMode(key:any){
        if(this.select_mode!=key){
          switch(key){
            case "1":
                this.$store.state.project_info.openflag=true;
                break;
            case "2":
                this.$store.state.project_info.newflag=true;
                break;
            case "6":
                this.$store.state.app_info.reqCount++;
                this.$store.state.app_info.type="readConfig";
                this.select_mode=key;
                break;
            default:
                this.select_mode=key;
                break;
          }
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