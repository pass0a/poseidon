<template>
  <Modal v-model="showflag" width="420" :closable="false" :mask-closable="false">
    <el-link v-model="versionStatus" v-show="false"></el-link>
    <p slot="header">
      <i class="el-icon-folder-opened"></i>
      <span>打开项目...</span>
    </p>
    <el-table
      :data="prjlist"
      height="200"
      size="mini"
      stripe
      border
      ref="prjtable"
      v-show="!showVersion"
    >
      <el-table-column prop="name" label="项目名"></el-table-column>
      <el-table-column label="操作" width="200">
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="mini"
            @click="openPrj(scope.row.name,scope.row._id,scope.$index)"
            :loading="openStatus && openIdx==scope.$index"
          >打开</el-button>
          <el-button type="danger" size="mini" @click="deletePrj(scope.row.name)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-button-group style="margin:0px 5px 5px 0px;" v-show="showVersion">
      <!-- <el-button plain icon="el-icon-plus" size="small" @click="addVersion">新建版本</el-button> -->
      <el-button plain icon="el-icon-back" size="small" @click="comeback">返回项目列表</el-button>
    </el-button-group>
    <el-table
      :data="verlist"
      height="200"
      size="mini"
      stripe
      border
      ref="vertable"
      v-show="showVersion"
    >
      <el-table-column prop="version" label="版本号"></el-table-column>
      <el-table-column label="操作" width="200">
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="mini"
            v-if="!openStatus || openIdx!=scope.$index"
            @click="openVer(scope.row.version,scope.row._id,scope.$index)"
          >打开</el-button>
          <el-button type="primary" size="mini" v-else icon="el-icon-loading" disabled>打开中...</el-button>
          <el-button type="danger" size="mini" @click="deleteVer(scope.row._id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <span slot="footer">
      <el-button type="info" @click="cancel">取消</el-button>
    </span>
  </Modal>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
@Component
export default class OpenPrj extends Vue {
  private openStatus = false;
  private openIdx = -1;
  private showVersion = false;
  private openName = "";
  get showflag() {
    if (!this.$store.state.project_info.openflag) {
      this.openStatus = false;
      this.$store.state.project_info.show_versions = false;
    }
    return this.$store.state.project_info.openflag;
  }
  get versionStatus() {
    this.showVersion = this.$store.state.project_info.show_versions;
    return this.$store.state.project_info.show_versions;
  }
  get prjlist() {
    return this.$store.state.project_info.prjlist;
  }
  get verlist() {
    return this.$store.state.project_info.verlist;
  }
  private cancel() {
    this.$store.state.project_info.openflag = false;
  }
  private openPrj(prjname: any, pid: any, idx: any) {
    this.openName = prjname;
    this.$store.state.project_info.current_pid = pid;
    // this.$store.state.app_info.pis.write({
    //   type: "toDB",
    //   route: "versions",
    //   job: "list",
    //   info: { pid: pid, prjname: this.openName }
    // });
    this.openStatus = true;
    this.openIdx = idx;
    this.$store.state.app_info.pis.write({
      type: "toDB",
      route: "rule",
      job: "check_version",
      info: { prjname: this.openName }
    });
  }
  private openVer(version: any, vid: any, idx: any) {
    this.$store.state.project_info.current_ver = version;
    this.$store.state.project_info.current_vid = vid;
    this.openIdx = idx;
    if (this.$store.state.project_info.current_prj != this.openName) {
      this.openStatus = true;
      this.$store.state.app_info.pis.write({
        type: "toDB",
        route: "rule",
        job: "check_version",
        info: { prjname: this.openName }
      });
    } else this.cancel();
  }
  private deletePrj(prjname: any) {
    this.$store.state.alert_info.showflag = true;
    this.$store.state.alert_info.type = 6;
    this.$store.state.alert_info.info = prjname;
  }
  private deleteVer(vid: any) {}
  private addVersion() {}
  private comeback() {
    this.$store.state.project_info.show_versions = false;
  }
}
</script>