<template>
  <Modal v-model="showflag" width="650" :closable="false" :mask-closable="false">
    <p slot="header">
      <i class="el-icon-warning"></i>
      <span>自动化测试结果</span>
      <a style="float:right" @click="ok">
        <i class="el-icon-close"></i>
      </a>
    </p>
    <el-table :data="caseData" style="width: 100%" size="mini" stripe border ref="caseResultTable">
      <el-table-column label="用例ID" prop="case_id" resizable></el-table-column>
      <el-table-column label="测试次数" prop="case_mode" resizable></el-table-column>
      <el-table-column label="测试结果" prop="result" resizable>
        <template>
          <span>
            <strong>
              <font
                size="2"
                :color="caseData.length&&!caseData[0].result?'#67C23A':'#F56C6C'"
              >{{ caseData.length&&!caseData[0].result?"OK":"NG" }}</font>
            </strong>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" v-if="caseData.length&&caseData[0].result">
        <template slot-scope="scope">
          <!-- <el-button type="primary" size="mini" @click="replayCase(scope.$index)" disabled>重新执行</el-button> -->
          <el-button
            type="primary"
            size="mini"
            @click="retakeImg(scope.$index)"
            :disabled="checkAct()"
          >重新截图</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div style="margin:10px 0px 0px 10px;" v-if="caseData.length">
      <span>
        <font size="2">
          <strong>自动化测试步骤</strong>
        </font>
      </span>
      <Steps direction="vertical">
        <Step
          v-for="(it,idx) in caseData[0].case_steps"
          :key="idx"
          :title="getStepTitle(idx,caseData[0].case_mode)"
          :content="showStep(it,idx)"
          :status="getStepStatus(idx,caseData[0].case_mode)"
        ></Step>
      </Steps>
      <div v-if="showFailImg()">
        <div>
          <span>
            <font size="3">
              <strong>当前匹配度 : {{info.match}}</strong>
            </font>
          </span>
          <br />
          <span>
            <font size="3">
              <strong>截图对比 (若为循环则只保留首次失败图片)</strong>
            </font>
          </span>
          <br />
          <img
            :src="'http://127.0.0.1:6003/getImage?image='+info.image+'&id='+imgreq"
            style="max-width:100%;max-height:100%;"
          />
          <img
            :src="'http://127.0.0.1:6003/getImage?image='+info.screen+'&id='+scrreq"
            style="max-width:100%;max-height:100%;"
          />
        </div>
      </div>
      <div v-show="caseData[0].case_mode>1">
        <span>
          <font size="3">
            <strong>测试结果</strong>
          </font>
        </span>
        <br />
        <span style="margin:10px 10px 10px 10px">
          <font size="2">
            <strong>{{ showLoopResult() }}</strong>
          </font>
        </span>
        <el-table :data="retData" style="width: 100%" height="200" size="mini" border>
          <el-table-column label="循环次数序号" prop="loop_id" resizable></el-table-column>
          <el-table-column label="失败步骤序号" prop="fail_id" resizable></el-table-column>
          <el-table-column label="失败原因" prop="fail_status" resizable>
            <template slot-scope="scope">
              <span>{{showFailStatus(scope.row.fail_status)}}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <div slot="footer">
      <Button type="info" size="large" long @click="ok">返回</Button>
    </div>
  </Modal>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
@Component
export default class CaseResultView extends Vue {
  private caseData: any = [];
  private retData: any = [];
  private freqtype: any = new Map([
    ["0", "大于"],
    ["1", "等于"]
  ]);
  private power_type: any = new Map([
    ["set_power1", "Output I"],
    ["set_power2", "Output II"],
    ["set_both", "Output ALL"]
  ]);
  private stepTitle: any = [
    "未执行",
    "执行成功",
    "执行失败",
    "网络异常",
    "摄像头异常",
    "无图片"
  ];
  private stepStatus: any = ["wait", "finish", "error", "error", "error"];
  private imgreq: any = 0;
  private scrreq: any = 0;
  private info: any = { match: 0, image: "", screen: "" };
  private retakeAction = ["click", "assert_pic", "assert_pto"];
  private retakeIdx: any = { i: -1, j: -1 };
  private tested_mode: number;
  private assert_type: Array<string> = ["是", "不是"];
  private wait_type: Array<string> = ["固定", "随机"];
  get showflag() {
    if (this.$store.state.report_info.showflag) {
      this.caseData = [];
      this.retData = [];
      this.caseData.push(this.$store.state.report_info.case_data);
      this.setRetData(this.$store.state.report_info.case_data);
      this.imgreq++;
      this.scrreq++;
    }
    return this.$store.state.report_info.showflag;
  }
  private setRetData(data: any) {
    if (data.case_mode > 1) {
      this.tested_mode = data.tested_mode;
      for (let i = 0; i < data.fail_info.length; i++) {
        this.retData.push({
          loop_id: data.fail_info[i].case_loop_idx + 1,
          fail_id: data.fail_info[i].case_idx + 1,
          fail_status: data.fail_info[i].case_loop_ret[0].step_loop_ret
        });
      }
    }
  }
  private showFailStatus(status: number) {
    switch (status) {
      case 1:
        return "图片匹配失败";
      case 2:
        return "图片获取失败";
    }
  }
  private showFailImg() {
    if (this.caseData.length && this.caseData[0].result == 1) {
      for (let i = 0; i < this.caseData[0].fail_info.length; i++) {
        for (
          let j = 0;
          j < this.caseData[0].fail_info[i].case_loop_ret.length;
          j++
        ) {
          let info = this.caseData[0].fail_info[i].case_loop_ret[j];
          if (info.step_loop_ret == 1 && info.step_loop_info) {
            if (info.step_loop_info.image) {
              this.info = info.step_loop_info;
              return true;
            } else if (
              info.step_loop_info.length > 0 &&
              info.step_loop_info[0].g_step_loop_ret == 1 &&
              info.step_loop_info[0].g_step_loop_info.image
            ) {
              this.info = info.step_loop_info[0].g_step_loop_info;
              return true;
            }
          }
        }
      }
    }
    return false;
  }
  private cancel() {
    this.$store.state.report_info.showflag = false;
  }
  private ok() {
    this.$store.state.report_info.showflag = false;
  }
  private retakeImg(idx: number) {
    let data = this.caseData[0];
    let fail_idx = data.fail_info[this.retakeIdx.i].case_idx;
    let fail_info: any = data.case_steps[fail_idx];
    fail_info.screen =
      data.fail_info[this.retakeIdx.i].case_loop_ret[
        this.retakeIdx.j
      ].step_loop_info.screen;
    fail_info.image =
      data.fail_info[this.retakeIdx.i].case_loop_ret[
        this.retakeIdx.j
      ].step_loop_info.image;
    if (this.checkID(fail_info.id)) {
      this.$store.state.alert_info.type = 7;
      this.$store.state.alert_info.info = fail_info;
      this.$store.state.alert_info.showflag = true;
    } else {
      this.$notify({
        title: "图片信息获取失败!",
        message: "",
        type: "error",
        duration: 1500
      });
    }
  }
  private checkID(id: string) {
    let binding_flag = this.$store.state.steps_info.bindlist[id] ? true : false;
    let res_flag = this.$store.state.steps_info.reslist[id] ? true : false;
    return binding_flag && res_flag;
  }
  private checkAct() {
    if (this.caseData.length) {
      let data = this.caseData[0];
      for (let i = 0; i < data.fail_info.length; i++) {
        let fail_idx = data.fail_info[i].case_idx;
        let fail_act = data.case_steps[fail_idx].action;
        if (this.retakeAction.indexOf(fail_act) > -1) {
          for (let j = 0; j < data.fail_info[i].case_loop_ret.length; j++) {
            let step_ret = data.fail_info[i].case_loop_ret[j].step_loop_ret;
            if (step_ret == 1) {
              this.retakeIdx.i = i;
              this.retakeIdx.j = j;
              return false;
            }
          }
        }
      }
    }
    return true;
  }
  private getStepTitle(idx: any, count: number) {
    if (this.caseData.length) {
      if (count > 1) return "";
      let data = this.caseData[0];
      if (!data.result) {
        return "执行成功";
      } else {
        let fail_idx = data.fail_info[0].case_idx;
        if (fail_idx > idx) return "执行成功";
        else if (fail_idx == idx) {
          if (data.fail_info[0].case_loop_ret > 1) {
          } else {
            if (
              data.case_steps[fail_idx].loop != undefined &&
              data.case_steps[fail_idx].loop > 1
            ) {
              return (
                "执行失败 ( 失败次数为" +
                data.fail_info[0].case_loop_ret.length +
                " )"
              );
            } else {
              let step_ret = data.fail_info[0].case_loop_ret[0].step_loop_ret;
              switch (step_ret) {
                case 1:
                  return "执行失败";
                case 2:
                  return "网络异常";
                case 4:
                  return "摄像头异常";
                case 5:
                  return "无图片";
              }
            }
          }
        } else return "未执行";
      }
    }
  }
  private getStepStatus(idx: any, count: number) {
    if (this.caseData.length) {
      if (count > 1) return "process";
      let data = this.caseData[0];
      if (!data.result) {
        return "finish";
      } else {
        let fail_idx = data.fail_info[0].case_idx;
        if (fail_idx > idx) return "finish";
        else if (fail_idx == idx) return "error";
        else return "wait";
      }
    }
  }
  private showStep(it: any, idx?: number) {
    let action = this.getResName(it.action);
    if (it.action == "click" && it.click_skip) action += " (不判断) ";
    if ((it.action == "button" || it.action == "click") && it.click_type == "1")
      action += " [长按:" + it.click_time + "ms]";
    let content: string = "";
    switch (it.action) {
      case "wait":
        let wait_t = it.type != undefined ? it.type : 0;
        let time_t = wait_t == 0 ? it.time : it.time + "~" + it.time_r;
        content = "[" + this.wait_type[wait_t] + "]" + time_t + "<毫秒>";
        break;
      case "qg_box":
        content =
          " [" +
          this.getResName(it.module) +
          "] ( " +
          this.freqtype.get(it.b_type) +
          " ) " +
          it.b_volt +
          " V";
        break;
      case "dbc":
        let title = it.title != undefined ? it.title : it.val;
        content = " [" + it.module + "] <" + it.id + "> " + title;
        break;
      case "slide":
        let ts = it.time != undefined ? it.time : 1000;
        content =
          " [" +
          this.getResName(it.module) +
          "] " +
          this.getResName(it.id) +
          " (时间 " +
          ts +
          " ms)";
        break;
      case "group":
        let data = this.caseData[0];
        let g_content = "";
        if (data.fail_info.length && idx == data.fail_info[0].case_idx) {
          let g_idx =
            data.fail_info[0].case_loop_ret[0].step_loop_info[0].g_idx;
          let g_ret =
            data.fail_info[0].case_loop_ret[0].step_loop_info[0]
              .g_step_loop_ret == 2
              ? "超时"
              : "失败";
          let groupList = this.$store.state.steps_info.grouplist;
          let g_info = groupList[it.id][g_idx];
          if (g_info != undefined) {
            g_content =
              " ( 组合中第" +
              (g_idx + 1) +
              "步骤  : " +
              this.showStep(g_info) +
              " " +
              g_ret +
              " )";
          }
        }

        content =
          " [" +
          this.getResName(it.module) +
          "] " +
          this.getResName(it.id) +
          g_content;
        break;
      case "power":
        let p_value = it.value != undefined ? it.value : 0;
        content = " [" + this.power_type.get(it.p_type) + "] " + p_value + " V";
        break;
      default:
        content =
          " [" + this.getResName(it.module) + "] " + this.getResName(it.id);
        if (it.action.indexOf("assert") > -1) {
          let a_t = it.type != undefined ? it.type : 0;
          content = this.assert_type[a_t] + content;
        }
        break;
    }
    if (it.loop != undefined) content += "<循环 " + it.loop + " 次>";
    return action + " ==> " + content;
  }
  private getResName(id: any) {
    let name = this.$store.state.steps_info.reslist[id];
    return name != undefined ? name : id + "(已删除)";
  }
  private showLoopResult() {
    return (
      "共" +
      this.caseData[0].case_mode +
      "次循环, 已执行循环次数为 " +
      this.tested_mode +
      ", 失败次数为 " +
      this.caseData[0].fail_info.length
    );
  }
}
</script>