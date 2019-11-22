<template>
  <div>
    <el-link v-model="getStopFlag" v-show="false"></el-link>
    <el-link v-model="updateTestStatus" v-show="false"></el-link>
    <el-link v-model="updateStatusTitleAndColor" v-show="false"></el-link>
    <el-link v-model="notifyToReplay" v-show="false"></el-link>
    <el-link v-model="checkCutScreenStatus" v-show="false"></el-link>
    <el-card class="box-card" shadow="never" style="margin:10px 10px 10px 10px;">
      <el-row :gutter="10">
        <el-col :span="6">
          <el-card class="box-card" style="text-align:center;" shadow="never">
            <button class="btn_start" @click="startTest()" v-show="btnMode==0||btnMode>4">
              <i class="el-icon-video-play"></i>开始测试
            </button>
            <button class="btn_ready" v-show="btnMode==1">
              <i class="el-icon-loading"></i>准备中...
            </button>
            <button class="btn_stop" @click="stopTest()" v-show="btnMode==2">
              <i class="el-icon-video-pause"></i>暂停测试
            </button>
            <button class="btn_stop" v-show="btnMode==3">
              <i class="el-icon-loading"></i>暂停中...
            </button>
            <span v-show="btnMode==4">
              <button class="btn_continue" @click="continueTest()">
                <i class="el-icon-video-play"></i>继续测试
              </button>
              <button class="btn_replay" @click="replayTest()">
                <i class="el-icon-refresh-left"></i>重新测试
              </button>
            </span>
          </el-card>
        </el-col>
        <el-col :span="18">
          <el-card class="box-card" shadow="never">
            <div style="width:660px">
              <el-progress
                :text-inside="true"
                :stroke-width="33"
                :percentage="processNum"
                status="success"
              ></el-progress>
            </div>
            <div style="margin:18px 0px 12px 10px">
              <span>
                <font size="4">
                  <strong>测试状态:</strong>
                </font>
              </span>
              <span style="margin:0px 0px 0px 10px">
                <font size="3" :color="statusColor.c_status">{{statusTitle.t_status}}</font>
              </span>
              <span style="font-size: 15px;" v-show="btnMode==2||btnMode==3">
                <i class="el-icon-loading"></i>
              </span>
              <span style="margin:0px 0px 0px 20px">
                <font size="4">
                  <strong>预计时间:</strong>
                </font>
              </span>
              <span style="margin:0px 0px 0px 10px">
                <font size="3" :color="statusColor.c_time">{{statusTitle.t_time}}</font>
              </span>
              <span style="margin:0px 0px 0px 20px">
                <font size="4">
                  <strong>测试进度:</strong>
                </font>
              </span>
              <span style="margin:0px 0px 0px 10px">
                <font size="3" :color="statusColor.c_progress">{{statusTitle.t_progress}}</font>
              </span>
              <span style="margin:0px 0px 0px 20px">
                <font size="4">
                  <strong>测试结果:</strong>
                </font>
              </span>
              <span style="margin:0px 0px 0px 10px">
                <font size="3" :color="statusColor.c_result_ok">{{"OK: " + statusTitle.t_result_ok}}</font>
              </span>
              <span style="margin:0px 0px 0px 10px">
                <font size="3" :color="statusColor.c_result_ng">{{"NG: " + statusTitle.t_result_ng}}</font>
              </span>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
    <el-card class="box-card" shadow="never" style="margin:10px 10px 10px 10px;">
      <el-card class="box-card" shadow="never">
        <span style="margin:0px 0px 0px 5px">
          <font size="3">
            <strong>测试输出</strong>
          </font>
        </span>
        <el-input
          id="imp"
          type="textarea"
          :readonly="true"
          :autosize="{ minRows: 10, maxRows: 10}"
          placeholder
          v-model="logCmd"
        ></el-input>
      </el-card>
    </el-card>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
@Component({
  components: {}
})
export default class TestView extends Vue {
  private btnMode = 0;
  private testInfo: any = {};
  private statusTitle: any = {
    t_status: "未启动",
    t_time: "- - - -",
    t_result_ok: "- - -",
    t_result_ng: "- - -",
    t_progress: "- - - -"
  };
  private statusColor: any = {
    c_status: "#C0C4CC",
    c_time: "#C0C4CC",
    c_result_ok: "#C0C4CC",
    c_result_ng: "#C0C4CC",
    c_progress: "#C0C4CC"
  };
  private logCmd: any = "";
  private processNum: any = 0;
  private screen_status: any = false;
  private freqtype: any = new Map([["0", "大于"], ["1", "等于"]]);
  private wait_type: Array<string> = ["固定", "随机"];
  private assert_type: Array<string> = ["是", "不是"];
  get getStopFlag() {
    this.btnMode = this.$store.state.test_info.stopflag ? 4 : 0;
    return;
  }
  get updateStatusTitleAndColor() {
    if (this.btnMode) {
      switch (this.btnMode) {
        case 1:
          this.$store.state.test_info.testing = true;
          this.statusTitle.t_status = "准备中";
          this.statusTitle.t_time = "计算中";
          this.statusTitle.t_result_ok = "- - -";
          this.statusTitle.t_result_ng = "- - -";
          this.statusTitle.t_progress = "- - -";
          this.statusColor.c_status = "#606266";
          this.statusColor.c_time = "#606266";
          this.statusColor.c_result_ok = "#C0C4CC";
          this.statusColor.c_result_ng = "#C0C4CC";
          this.statusColor.c_progress = "#C0C4CC";
          this.updateLogCmd(1, "测试准备中...");
          break;
        case 2:
          if (this.testInfo.mode != 1) break;
          this.statusTitle.t_status = "测试中";
          this.statusTitle.t_time = this.showRunTime(this.testInfo.info);
          this.statusColor.c_status = "#67C23A";
          this.statusColor.c_progress = "#606266";
          this.updateLogCmd(1, "测试开始 ! ! !");
          break;
        case 3:
          this.statusTitle.t_status = "暂停中";
          this.statusColor.c_status = "red";
          break;
        case 4:
          if (this.testInfo.mode != 6) break;
          this.$store.state.test_info.testing = false;
          this.$store.state.test_info.stopStatus = true;
          this.statusTitle.t_status = "已暂停";
          this.statusColor.c_status = "red";
          this.statusColor.c_result_ok = "#67C23A";
          this.statusColor.c_result_ng = "#F56C6C";
          this.updateLogCmd(1, "测试已暂停 ! ! !");
          break;
        case 5:
          this.$store.state.test_info.testing = false;
          this.statusTitle.t_status = "异常";
          this.statusTitle.t_time = "- - - -";
          this.statusColor.c_status = "red";
          this.showErrorLog();
          break;
        case 6:
          this.$store.state.test_info.testing = false;
          this.$store.state.test_info.stopStatus = false;
          this.statusTitle.t_status = "测试完成";
          this.statusColor.c_status = "#409EFF";
          this.statusColor.c_result_ok = "#67C23A";
          this.statusColor.c_result_ng = "#F56C6C";
          this.updateLogCmd(1, "测试结束! ! ! 请查看报告 ! ! !");
          this.$notify({
            title: "测试已完成",
            message: "",
            type: "success",
            duration: 1500
          });
          break;
      }
    } else {
      //Progress
      this.processNum = 0;
      //Log
      this.logCmd = "";
      //Mode
      this.testInfo.mode = -1;
      //Title
      this.statusTitle.t_status = "未启动";
      this.statusTitle.t_time = "- - - -";
      this.statusTitle.t_result_ok = "- - - -";
      this.statusTitle.t_result_ng = "- - - -";
      this.statusTitle.t_progress = "- - - -";
      //Color
      this.statusColor.c_status = "#C0C4CC";
      this.statusColor.c_time = "#C0C4CC";
      this.statusColor.c_result_ok = "#C0C4CC";
      this.statusColor.c_result_ng = "#C0C4CC";
      this.statusColor.c_progress = "#C0C4CC";
    }
    return;
  }
  get updateTestStatus() {
    this.testInfo = this.$store.state.test_info.info;
    switch (this.testInfo.mode) {
      case 0:
        this.btnMode = 5;
        this.$notify({
          title: "测试异常!请查看测试输出!",
          message: "",
          type: "error",
          duration: 1500
        });
        break;
      case 1:
        this.btnMode = 2;
        break;
      case 2:
        this.processNum =
          Math.floor(
            (this.testInfo.info.current_time / this.testInfo.info.time) * 10000
          ) / 100;
        this.statusTitle.t_progress =
          this.testInfo.info.current_case + " / " + this.testInfo.info.total;
        break;
      case 3:
        this.btnMode = 6;
        this.statusTitle.t_result_ok = this.testInfo.info.ok;
        this.statusTitle.t_result_ng = this.testInfo.info.ng;
        break;
      case 4:
        if (this.btnMode == 3) break;
        this.showStepsLog(this.testInfo.info);
        break;
      case 5:
        if (this.btnMode == 3) break;
        if (this.$store.state.test_info.first_module == "") {
          this.$store.state.test_info.first_module = this.testInfo.module;
        }
        this.updateLogCmd(
          1,
          "用例ID : " +
            this.testInfo.info +
            " - - - >>> 开始执行 <<< - - - 当前用例执行次数 : " +
            this.testInfo.count +
            "/" +
            this.testInfo.total
        );
        break;
      case 6:
        this.btnMode = 4;
        this.statusTitle.t_result_ok = this.testInfo.info.ok;
        this.statusTitle.t_result_ng = this.testInfo.info.ng;
        break;
    }
    return;
  }
  get notifyToReplay() {
    if (this.$store.state.test_info.count) {
      this.btnMode = 1;
      this.processNum = 0;
      this.updateLogCmd(0);
    }
    return;
  }
  get checkCutScreenStatus() {
    this.screen_status = this.$store.state.screen_info.running;
    return;
  }
  private startTest() {
    if (
      this.$store.state.app_info.connect_info.db != 1 ||
      this.$store.state.app_info.connect_info.server != 1 ||
      this.$store.state.app_info.connect_info.link != 1
    ) {
      this.$notify({
        title: "请检查连接状态",
        message: "",
        type: "warning",
        duration: 1500
      });
      return;
    }
    if (this.$store.state.project_info.current_prj.length) {
      if (!this.screen_status) {
        this.btnMode = 1;
        this.processNum = 0;
        this.updateLogCmd(0);
        let req = {
          type: "toSer",
          job: "startTest",
          info: {
            prjname: this.$store.state.project_info.current_prj,
            uid: this.$store.state.login_info._id
          }
        };
        this.$store.state.test_info.first_module = "";
        this.$store.state.app_info.pis.write(req);
      } else {
        this.$notify({
          title: "当前正在同步车机屏幕无法进行测试",
          message: "",
          type: "warning",
          duration: 1500
        });
      }
    } else {
      this.$notify({
        title: "当前无项目,请选择项目",
        message: "",
        type: "warning",
        duration: 1500
      });
    }
  }
  private stopTest() {
    this.$store.state.app_info.pis.write({ type: "toSer", job: "stopTest" });
    this.btnMode = 3;
    this.updateLogCmd(1, "暂停中...等待当前步骤执行完");
  }
  private continueTest() {
    this.btnMode = 1;
    let req = {
      type: "toSer",
      job: "continueTest",
      info: { prjname: this.$store.state.project_info.current_prj }
    };
    this.$store.state.app_info.pis.write(req);
  }
  private replayTest() {
    this.$store.state.alert_info.showflag = true;
    this.$store.state.alert_info.type = 3;
  }
  private showStepsLog(data: any) {
    let step = data.step;
    let ret = data.ret;
    let reslist = this.$store.state.steps_info.reslist;
    let action = reslist[step.action];
    if (step.action == "click" && step.click_skip) action += " (不判断) ";
    if (
      (step.action == "button" || step.action == "click") &&
      step.click_type == "1"
    )
      action += " [长按:" + step.click_time + "ms]";
    let content: string = "";
    switch (step.action) {
      case "wait":
        let wait_t = step.type != undefined ? step.type : 0;
        content = "[" + this.wait_type[wait_t] + "]" + step.wait + "毫秒";
        break;
      case "qg_box":
        content =
          " [" +
          reslist[step.module] +
          "] ( " +
          this.freqtype.get(step.b_type) +
          " ) " +
          step.b_volt +
          " V";
        break;
      case "dbc":
        let title = step.title != undefined ? step.title : step.val;
        content = " [" + step.module + "] <" + step.id + "> " + title;
        break;
      case "click_random":
        content =
          " [" +
          reslist[step.module] +
          "] " +
          reslist[step.id] +
          " 随机坐标为 ( " +
          step.random_w +
          ", " +
          step.random_h +
          " )";
        break;
      default:
        content = " [" + reslist[step.module] + "] " + reslist[step.id];
        if (step.action.indexOf("assert") > -1) {
          let a_t = step.type != undefined ? step.type : 0;
          content = this.assert_type[a_t] + content;
        }
        break;
    }
    let step_log =
      action +
      " ==> " +
      content +
      "- - - 执行" +
      (ret == 0 ? "成功" : "失败") +
      " [当前步骤执行次数 : " +
      data.count +
      "/" +
      data.total +
      "]";
    this.updateLogCmd(1, step_log);
  }
  private showErrorLog() {
    switch (this.testInfo.error_code) {
      case 0:
        this.updateLogCmd(1, "串口异常!请检查串口配置信息!!!");
        break;
      case 1:
        this.updateLogCmd(1, "当前无选择测试用例!!!");
        break;
      case 2:
        this.updateLogCmd(1, "ADB异常!请检查ADB连接状态!!!");
        break;
      case 3:
        this.updateLogCmd(1, "PCAN异常!请检查PCAN连接状态及配置信息!!!");
        break;
      case 4:
        this.updateLogCmd(1, "DBC文件不存在!!!");
        break;
    }
  }
  private updateLogCmd(type: number, info?: any) {
    if (!type) {
      this.logCmd = "";
    } else {
      if (this.logCmd.length > 5000) {
        let idx = this.logCmd.indexOf("\r", 1000);
        this.logCmd = this.logCmd.substring(idx + 1);
      }
      let logTime = "[ " + new Date().toLocaleString() + " ] ";
      this.logCmd += logTime + " " + info + "\r";
    }
    let div: any = document.getElementById("imp");
    div.scrollTop = div.scrollHeight;
  }
  private showRunTime(data: any) {
    let ms = data % 1000;
    let s = Math.floor((data % (1000 * 60)) / 1000);
    let m = Math.floor((data % (1000 * 60 * 60)) / (1000 * 60));
    let h = Math.floor(data / (1000 * 60 * 60));
    return (
      (h < 10 ? "0" + h : h) +
      ":" +
      (m < 10 ? "0" + m : m) +
      ":" +
      (s < 10 ? "0" + s : s) +
      "." +
      (ms < 10 ? "0" + ms : ms)
    );
  }
}
</script>
<style>
.btn_start,
.btn_ready,
.btn_stop,
.btn_continue,
.btn_replay {
  background-color: rgba(45, 130, 241, 0.993);
  border: none;
  border-radius: 4px;
  color: white;
  padding: 7px 42px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 26px;
  margin: 4px 2px;
  cursor: pointer;
  height: 82px;
}
.btn_ready {
  background-color: #909399;
}
.btn_stop {
  background-color: #f56c6c;
}
.btn_continue {
  background-color: #67c23a;
  font-size: 17px;
  height: 37px;
}
.btn_replay {
  background-color: #e6a23c;
  font-size: 17px;
  height: 37px;
}
</style>