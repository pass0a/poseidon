<template>
  <div style="margin:5px 5px 0px 0px;">
    <el-link v-model="clearInfo" v-show="false"></el-link>
    <el-link v-model="ActList" v-show="false"></el-link>
    <el-link v-model="StepList" v-show="false"></el-link>
    <ul v-for="(it,idx) in steplist" :key="idx">
      <div v-show="idx==s_idx&&(s_op>1&&s_op<4)">
        <el-select
          placeholder="请选择"
          filterable
          size="small"
          style="width:100px"
          v-model="s_action"
          @change="changeSel(0)"
        >
          <el-option v-for="val in Action" :key="val" :label="getResName(val)" :value="val"></el-option>
        </el-select>
        <el-select
          placeholder="请选择"
          filterable
          size="small"
          style="width:120px"
          v-model="s_powertype"
          v-show="s_action=='power'"
        >
          <el-option
            v-for="val in power_type.keys()"
            :label="power_type.get(val)"
            :value="val"
            :key="val"
          ></el-option>
        </el-select>
        <el-select
          placeholder="请选择"
          filterable
          size="small"
          style="width:75px"
          v-model="s_clicktype"
          v-show="showClickType(s_action)"
        >
          <el-option
            v-for="val in clickType.keys()"
            :label="clickType.get(val)"
            :value="val"
            :key="val"
          ></el-option>
        </el-select>
        <el-input-number
          v-model="s_clicktime"
          style="width:100px"
          controls-position="right"
          :min="1500"
          size="small"
          v-show="showClickTime(s_clicktype)"
        ></el-input-number>
        <el-select
          placeholder="请选择"
          filterable
          size="small"
          style="width:75px"
          v-model="s_asserttype"
          v-show="s_action.indexOf('assert')>-1"
        >
          <el-option v-for="(val,index) in assert_type" :label="val" :value="index" :key="index"></el-option>
        </el-select>
        <el-select
          placeholder="请选择"
          filterable
          size="small"
          style="width:140px"
          v-model="s_module"
          v-show="s_action!=waitType&&s_action!='power'"
          @change="changeSel(1)"
        >
          <el-option
            v-for="val in Module"
            :key="val"
            :label="s_action=='dbc'?val:getResName(val)"
            :value="val"
          ></el-option>
        </el-select>
        <el-select
          placeholder="请选择"
          filterable
          size="small"
          style="width:75px"
          v-model="s_freqtype"
          v-show="s_action==boxType.act&&s_module==boxType.freq"
        >
          <el-option
            v-for="val in freqtype.keys()"
            :label="freqtype.get(val)"
            :value="val"
            :key="val"
          ></el-option>
        </el-select>
        <el-input-number
          v-model="s_box"
          style="width:130px"
          controls-position="right"
          :min="0"
          size="small"
          v-show="s_module==boxType.freq"
        ></el-input-number>
        <el-select
          placeholder="请选择"
          filterable
          clearable
          size="small"
          style="width:155px"
          v-model="s_clid"
          v-show="s_action!=waitType&&s_action!=boxType.act&&s_action!='power'"
          @change="changeSel(4)"
        >
          <el-option
            v-for="val in Clid"
            :key="val"
            :label="s_action=='dbc'?val:getResName(val)"
            :value="val"
            :disabled="checkBinding(0,val)"
          >
            <span style="float: left">{{ s_action=='dbc'?val:getResName(val) }}</span>
            <span style="float: right" v-if="s_action!='dbc'">
              <font :color="checkBinding(1,val)">{{ checkBinding(2,val) }}</font>
            </span>
          </el-option>
        </el-select>
        <el-select
          placeholder="请选择"
          filterable
          clearable
          size="small"
          style="width:155px"
          v-model="s_val"
          v-if="s_action=='dbc'&&checkValType()"
        >
          <el-option v-for="val in Values" :key="val.val" :label="val.title" :value="val.val"></el-option>
        </el-select>
        <span v-if="s_action=='dbc'&&!checkValType()&&s_clid!=''">
          <span>
            <font size="2">{{ showSignalRange() }}</font>
          </span>
          <el-input-number
            v-model="s_num"
            controls-position="right"
            size="small"
            style="margin:5px 0px 0px 0px"
          ></el-input-number>
          <el-button-group>
            <el-button type="success" size="small" @click="onSet">设置</el-button>
            <el-button type="info" size="small" @click="initOp">取消</el-button>
          </el-button-group>
        </span>
        <span v-else>
          <Checkbox v-model="s_skip" v-show="s_action=='click'">不判断</Checkbox>
          <el-select
            placeholder="请选择"
            filterable
            size="small"
            style="width:75px"
            v-model="s_waittype"
            v-show="s_action==waitType"
          >
            <el-option
              v-for="(val,index) in wait_type"
              :label="wait_type[index]"
              :value="index"
              :key="index"
            ></el-option>
          </el-select>
          <span v-show="s_action==waitType&&s_waittype">
            <strong>
              <font size="2">范围 :</font>
            </strong>
          </span>
          <el-input-number
            v-model="s_wait"
            controls-position="right"
            :min="0"
            size="small"
            style="margin:3px 0px 0px 0px"
            v-show="s_action==waitType||s_action=='slide'||s_action=='power'"
          ></el-input-number>
          <span v-show="s_action==waitType&&s_waittype">
            <strong>
              <font size="2">---</font>
            </strong>
            <el-input-number v-model="s_wait_r" controls-position="right" :min="0" size="small"></el-input-number>
          </span>
          <el-button-group style="margin:3px 0px 0px 0px">
            <el-button
              type="success"
              size="small"
              @click="onSet"
              v-if="s_action==waitType||s_module==boxType.freq||s_action=='slide'||s_action=='power'"
            >设置</el-button>
            <el-button
              type="success"
              size="small"
              @click="changeSel(s_action=='dbc'?3:2)"
              v-if="s_action!=waitType&&s_module!=boxType.freq&&s_action!='slide'&&s_action!='power'"
            >确定</el-button>
            <el-button type="info" size="small" @click="initOp">取消</el-button>
          </el-button-group>
        </span>
      </div>
      <div v-show="idx!=s_idx||s_op==1||s_op>=3">
        <span>
          <font size="2">{{ showStep(it) }}</font>
        </span>
        <a @click.prevent="showEditBtn(1,idx)">
          <i class="el-icon-edit"></i>
        </a>
        <span v-show="idx==s_idx&&s_op==1">
          <el-button-group>
            <el-button type="primary" size="mini" @click="editStep(0,idx,it)">修改</el-button>
            <el-button type="success" size="mini" @click="editStep(1,idx)">插入</el-button>
            <el-button type="danger" size="mini" @click="editStep(2,idx)">删除</el-button>
            <el-button type="info" size="mini" @click="editStep(3,idx,it)">循环</el-button>
            <el-button type="warning" size="mini" @click="showEditBtn(0)">取消</el-button>
          </el-button-group>
        </span>
        <span v-show="idx==s_idx&&s_op==4">
          <el-input-number
            v-model="s_loop"
            style="width:100px"
            controls-position="right"
            :min="2"
            size="small"
            :precision="0"
          ></el-input-number>
          <el-button-group>
            <el-button type="primary" size="mini" @click="editLoop(0,it)">开启循环</el-button>
            <el-button type="danger" size="mini" @click="editLoop(1,it)">关闭循环</el-button>
            <el-button type="warning" size="mini" @click="showEditBtn(0)">取消</el-button>
          </el-button-group>
        </span>
      </div>
    </ul>
    <div v-show="s_op==0">
      <el-select
        placeholder="请选择"
        filterable
        size="small"
        style="width:100px"
        v-model="s_action"
        @change="changeSel(0)"
      >
        <el-option v-for="val in Action" :key="val" :label="getResName(val)" :value="val"></el-option>
      </el-select>
      <el-select
        placeholder="请选择"
        filterable
        size="small"
        style="width:120px"
        v-model="s_powertype"
        v-show="s_action=='power'"
      >
        <el-option
          v-for="val in power_type.keys()"
          :label="power_type.get(val)"
          :value="val"
          :key="val"
        ></el-option>
      </el-select>
      <el-select
        placeholder="请选择"
        filterable
        size="small"
        style="width:75px"
        v-model="s_clicktype"
        v-show="showClickType(s_action)"
      >
        <el-option
          v-for="val in clickType.keys()"
          :label="clickType.get(val)"
          :value="val"
          :key="val"
        ></el-option>
      </el-select>
      <el-input-number
        v-model="s_clicktime"
        style="width:100px"
        controls-position="right"
        :min="1500"
        size="small"
        v-show="showClickTime(s_clicktype)"
      ></el-input-number>
      <el-select
        placeholder="请选择"
        filterable
        size="small"
        style="width:75px"
        v-model="s_asserttype"
        v-show="s_action.indexOf('assert')>-1"
      >
        <el-option v-for="(val,index) in assert_type" :label="val" :value="index" :key="index"></el-option>
      </el-select>
      <el-select
        placeholder="请选择"
        filterable
        size="small"
        style="width:140px"
        v-model="s_module"
        v-show="s_action!=waitType&&s_action!='power'"
        @change="changeSel(1)"
      >
        <el-option
          v-for="val in Module"
          :key="val"
          :label="s_action=='dbc'?val:getResName(val)"
          :value="val"
        ></el-option>
      </el-select>
      <el-select
        placeholder="请选择"
        filterable
        size="small"
        style="width:75px"
        v-model="s_freqtype"
        v-show="s_action==boxType.act&&s_module==boxType.freq"
      >
        <el-option
          v-for="val in freqtype.keys()"
          :label="freqtype.get(val)"
          :value="val"
          :key="val"
        ></el-option>
      </el-select>
      <el-input-number
        v-model="s_box"
        style="width:130px"
        controls-position="right"
        :min="0"
        size="small"
        v-show="s_module==boxType.freq"
      ></el-input-number>
      <el-select
        placeholder="请选择"
        filterable
        clearable
        size="small"
        style="width:155px"
        v-model="s_clid"
        v-show="s_action!=waitType&&s_action!=boxType.act&&s_action!='power'"
        @change="changeSel(2)"
      >
        <el-option
          v-for="val in Clid"
          :key="val"
          :label="s_action=='dbc'?val:getResName(val)"
          :value="val"
          :disabled="checkBinding(0,val)"
        >
          <span style="float: left">{{ s_action=='dbc'?val:getResName(val) }}</span>
          <span style="float: right" v-if="s_action!='dbc'">
            <font :color="checkBinding(1,val)">{{ checkBinding(2,val) }}</font>
          </span>
        </el-option>
      </el-select>
      <el-select
        placeholder="请选择"
        filterable
        clearable
        size="small"
        style="width:155px"
        v-model="s_val"
        v-if="s_action=='dbc'&&checkValType()"
        @change="changeSel(3)"
      >
        <el-option v-for="val in Values" :key="val.val" :label="val.title" :value="val.val"></el-option>
      </el-select>
      <div v-if="s_action=='dbc'&&!checkValType()&&s_clid!=''">
        <span>
          <font size="2">{{ showSignalRange() }}</font>
        </span>
        <el-input-number
          v-model="s_num"
          controls-position="right"
          size="small"
          style="margin:5px 0px 0px 0px"
        ></el-input-number>
        <el-button type="success" size="small" @click="onSet">设置</el-button>
      </div>
      <Checkbox v-model="s_skip" v-show="s_action=='click'">不判断</Checkbox>
      <el-select
        placeholder="请选择"
        filterable
        size="small"
        style="width:75px"
        v-model="s_waittype"
        v-show="s_action==waitType"
      >
        <el-option
          v-for="(val,index) in wait_type"
          :label="wait_type[index]"
          :value="index"
          :key="index"
        ></el-option>
      </el-select>
      <span v-show="s_action==waitType&&s_waittype">
        <strong>
          <font size="2">范围 :</font>
        </strong>
      </span>
      <el-input-number
        v-model="s_wait"
        controls-position="right"
        :min="0"
        size="small"
        v-show="s_action==waitType||s_action=='slide'||s_action=='power'"
      ></el-input-number>
      <strong v-show="s_action=='power'">(单位: V)</strong>
      <span v-show="s_action==waitType&&s_waittype">
        <strong>
          <font size="2">---</font>
        </strong>
        <el-input-number v-model="s_wait_r" controls-position="right" :min="0" size="small"></el-input-number>
      </span>
      <el-button
        type="success"
        size="small"
        @click="onSet"
        v-show="s_action==waitType||s_module==boxType.freq||s_action=='slide'||s_action=='power'"
      >设置</el-button>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
@Component
export default class StepsView extends Vue {
  private Action: any = [];
  private s_action: string = "";
  private s_module: string = "";
  private s_clicktype: string = "0";
  private s_freqtype: string = "0";
  private s_powertype: string = "set_power1";
  private s_waittype: Number = 0;
  private s_clicktime: Number = 1500;
  private s_clid: string = "";
  private s_box: any = 2.529;
  private s_wait: number = 100;
  private s_wait_r: Number = 200;
  private s_loop: Number = 2;
  private s_skip: Boolean = false;
  private s_asserttype: Number = 0;
  private s_op: Number = 0;
  private s_idx: any = -1;
  private steplist: any = [];
  private waitType: string = "wait";
  private boxType: any = { act: "qg_box", freq: "freq" };
  private clickType: any = new Map([
    ["0", "短按"],
    ["1", "长按"]
  ]);
  private freqtype: any = new Map([
    ["0", "大于"],
    ["1", "等于"]
  ]);
  private power_type: any = new Map([
    ["set_power1", "Output I"],
    ["set_power2", "Output II"],
    ["set_both", "Output ALL"]
  ]);
  private wait_type: Array<string> = ["固定", "随机"];
  private assert_type: Array<string> = ["是", "不是"];
  private op_data: any = {
    type: 0,
    id: ""
  };
  private s_val: any = "";
  private s_num: Number = 0;
  private Values: any;
  get clearInfo() {
    if (this.$store.state.case_info.showflag) {
      this.initOp();
    }
    return;
  }
  get ActList() {
    this.Action = this.$store.state.steps_info.rulelist.action;
    return;
  }
  get StepList() {
    this.op_data = this.$store.state.steps_info.op_data;
    this.steplist = this.$store.state.steps_info.steplist;
    return;
  }
  get Module() {
    if (this.s_action == "dbc") {
      if (this.$store.state.dbc_info.data.Messages_List) {
        return this.$store.state.dbc_info.data.Messages_List;
      } else return [];
    } else {
      return this.$store.state.steps_info.rulelist[this.s_action] != undefined
        ? this.$store.state.steps_info.rulelist[this.s_action]
        : [];
    }
  }
  get Clid() {
    if (this.s_action == "dbc") {
      if (
        this.$store.state.dbc_info.data.Messages_Info &&
        this.s_module != ""
      ) {
        return this.$store.state.dbc_info.data.Messages_Info[this.s_module]
          .signals;
      } else return [];
    } else {
      return this.$store.state.steps_info.rulelist[this.s_module] != undefined
        ? this.$store.state.steps_info.rulelist[this.s_module]
        : [];
    }
  }
  private checkValType() {
    if (this.$store.state.dbc_info.data.Signals_Info && this.s_clid != "") {
      if (!this.$store.state.dbc_info.data.Signals_Info[this.s_clid].physics) {
        this.Values = this.$store.state.dbc_info.data.Signals_Info[
          this.s_clid
        ].value;
        return true;
      } else {
        return false;
      }
    }
    return false;
  }
  private getDdcVal(idx: number) {
    for (let i = 0; i < this.Values.length; i++) {
      if (this.Values[i].val == idx) {
        return this.Values[i].title;
      }
    }
    return "";
  }
  private getResName(id: any) {
    return this.$store.state.steps_info.reslist[id] != undefined
      ? this.$store.state.steps_info.reslist[id]
      : id;
  }
  private showSignalRange() {
    let signal_info = this.$store.state.dbc_info.data.Signals_Info[this.s_clid];
    if (signal_info.physics) {
      return "有效范围 [ " + signal_info.min + " ~ " + signal_info.max + " ]";
    } else {
      return "";
    }
  }
  private checkBinding(type: number, id: string) {
    let needCheckArr = ["click", "assert_pic", "click_poi", "slide"];
    let idx = needCheckArr.indexOf(this.s_action);
    let bind = this.$store.state.steps_info.bindlist[id];
    switch (type) {
      case 0:
        return idx > -1 ? (bind ? false : true) : false;
      case 1:
        return idx > -1 ? (bind ? "" : "#F56C6C") : "";
      case 2:
        return idx > -1 ? (bind ? "" : "未绑定") : "";
    }
  }
  private changeSel(flag: Number) {
    switch (flag) {
      case 0:
        this.s_module = "";
        this.s_clid = "";
        this.s_clicktype = "0";
        this.s_clicktime = 1500;
        this.s_box = 2.529;
        this.s_skip = false;
        this.s_waittype = 0;
        this.s_asserttype = 0;
        if (this.s_action == "slide") this.s_wait = 1000;
        else if (this.s_action == "power") this.s_wait = 0;
        break;
      case 1:
        this.s_clid = "";
        break;
      case 2:
        if (this.s_action == "dbc") {
          this.s_val = "";
          break;
        }
        if (this.s_action == "slide") {
          break;
        }
        if (this.s_clid != undefined && this.s_clid.length > 0) {
          let obj: any = {
            action: this.s_action,
            module: this.s_module,
            id: this.s_clid
          };
          if (
            this.s_action == "button" ||
            this.s_action == "click" ||
            this.s_action == "click_poi"
          ) {
            obj["click_type"] = this.s_clicktype;
            if (this.s_clicktype) obj["click_time"] = this.s_clicktime;
            if (this.s_skip) obj["click_skip"] = this.s_skip;
          } else if (this.s_action == "group") {
            if (this.$store.state.home_info.mode == "6_2") {
              if (this.op_data.type) {
                if (this.op_data.id != "" && this.op_data.id == this.s_clid) {
                  this.$notify({
                    title: "无法选择本身!",
                    message: "",
                    type: "warning",
                    duration: 1500
                  });
                  break;
                }
                for (let step of this.$store.state.steps_info.grouplist[
                  this.s_clid
                ]) {
                  if (step.action == "group") {
                    this.$notify({
                      title: "子选项不能含组合步骤!",
                      message: "",
                      type: "warning",
                      duration: 1500
                    });
                    return;
                  }
                }
              }
            }
          } else if (this.s_action.indexOf("assert") > -1) {
            obj.type = this.s_asserttype;
          }
          if (this.s_op == 0) this.steplist.push(obj);
          else if (this.s_op == 2) this.steplist[this.s_idx] = obj;
          else if (this.s_op == 3) this.steplist.splice(this.s_idx, 0, obj);
          if (this.s_op != 0) this.initOp();
        }
        break;
      case 3:
        if (this.s_clid != undefined && this.s_clid.length > 0) {
          if (this.s_val >= 0 && typeof this.s_val == "number") {
            let vobj: any = {
              action: this.s_action,
              module: this.s_module,
              id: this.s_clid,
              val: this.s_val,
              title: this.getDdcVal(this.s_val)
            };
            if (this.s_op == 0) this.steplist.push(vobj);
            else if (this.s_op == 2) this.steplist[this.s_idx] = vobj;
            else if (this.s_op == 3) this.steplist.splice(this.s_idx, 0, vobj);
            if (this.s_op != 0) this.initOp();
          }
        }
        break;
      case 4:
        if (this.s_action == "dbc") {
          this.s_val = "";
        }
        break;
    }
  }
  private onSet() {
    let obj: any;
    if (this.s_action == this.waitType) {
      if (this.s_waittype == 0) {
        if (this.s_wait == undefined) this.s_wait = 100;
        obj = {
          action: this.s_action,
          time: this.s_wait,
          type: this.s_waittype
        };
      } else {
        obj = {
          action: this.s_action,
          time: this.s_wait,
          time_r: this.s_wait_r,
          type: this.s_waittype
        };
      }
    } else if (this.s_action == "power") {
      obj = {
        action: this.s_action,
        p_type: this.s_powertype,
        value:
          Math.floor((this.s_wait != undefined ? this.s_wait : 0) * 100) / 100
      };
    } else if (this.s_module == this.boxType.freq) {
      if (this.s_box == undefined) this.s_box = 2.529;
      obj = {
        action: this.s_action,
        module: this.s_module,
        b_volt: this.s_box,
        b_type: this.s_freqtype
      };
    } else if (this.s_module.length > 0 && this.s_clid.length > 0) {
      if (this.s_action == "dbc") {
        obj = {
          action: this.s_action,
          module: this.s_module,
          id: this.s_clid,
          val: this.s_num
        };
      } else if (this.s_action == "slide") {
        obj = {
          action: this.s_action,
          module: this.s_module,
          id: this.s_clid,
          time: this.s_wait != undefined ? this.s_wait : 1000
        };
      }
    } else {
      return;
    }
    if (this.s_op == 0) this.steplist.push(obj);
    else if (this.s_op == 2) this.steplist[this.s_idx] = obj;
    else if (this.s_op == 3) this.steplist.splice(this.s_idx, 0, obj);
    this.initOp();
  }
  private initOp() {
    this.s_action = "";
    this.s_module = "";
    this.s_clid = "";
    this.s_clicktype = "0";
    this.s_freqtype = "0";
    this.s_clicktime = 1500;
    this.s_op = 0;
    this.s_idx = -1;
    this.s_wait = 100;
    this.s_wait_r = 200;
    this.s_loop = 2;
    this.s_skip = false;
    this.s_val = "";
    this.s_num = 0;
    this.s_waittype = 0;
    this.s_asserttype = 0;
  }
  private showStep(it: any) {
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
          (it.b_type != undefined ? this.freqtype.get(it.b_type) : "大于") +
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
  private showClickType(act: any) {
    if (act == "button" || act == "click" || act == "click_poi") return true;
    return false;
  }
  private showClickTime(clicktype: any) {
    if (clicktype == "1") return true;
    return false;
  }
  private showEditBtn(flag: number, idx: number) {
    if (flag) {
      this.s_idx = idx;
      this.s_op = 1;
    } else {
      this.s_op = 0;
      this.s_idx = -1;
    }
  }
  private editStep(type: number, idx: number, item?: any) {
    switch (type) {
      case 0:
        this.s_op = 2;
        this.s_idx = idx;
        this.s_action = item.action;
        if (this.s_action == this.waitType) {
          let t_type = item.type != undefined ? item.type : 0;
          this.s_waittype = t_type;
          this.s_wait = item.time;
          if (t_type) this.s_wait_r = item.time_r;
        } else if (item.action == this.boxType.act) {
          this.s_module = item.module;
          this.s_freqtype = item.b_type;
          this.s_box = item.b_volt;
        } else {
          if (item.action == "dbc") {
            if (
              this.$store.state.dbc_info.data.Messages_Info[item.module] !=
              undefined
            ) {
              this.s_module = item.module;
              this.s_clid = item.id;
              if (item.title != undefined) {
                this.s_val = item.val;
              } else {
                this.s_num = item.val;
              }
            } else {
              this.initOp();
              this.$notify({
                title: "DBC文件已变更,无法修改此步骤!",
                message: "",
                type: "warning",
                duration: 1500
              });
            }
          } else {
            this.s_module = item.module;
            this.s_clid = item.id;
            if (
              (item.action == "button" || item.action == "click") &&
              item.click_type == "1"
            ) {
              this.s_clicktype = item.click_type;
              this.s_clicktime = item.click_time;
            } else if (item.action.indexOf("assert") > -1) {
              this.s_asserttype = item.type != undefined ? item.type : 0;
            }
            if (item.action == "click")
              this.s_skip = item.click_skip ? true : false;
            else if (item.action == "slide") {
              this.s_wait = item.time != undefined ? item.time : 1000;
            } else if (item.action == "power") {
              this.s_powertype = item.p_type;
              this.s_wait = item.value != undefined ? item.value : 0;
            }
          }
        }
        break;
      case 1:
        this.s_op = 3;
        this.s_idx = idx;
        this.s_action = "";
        this.s_module = "";
        this.s_clid = "";
        break;
      case 2:
        this.steplist.splice(idx, 1);
        this.s_op = 0;
        this.s_idx = -1;
        break;
      case 3:
        this.s_op = 4;
        this.s_idx = idx;
        if (item.loop != undefined) this.s_loop = item.loop;
        break;
    }
  }
  private editLoop(type: number, item: any) {
    if (type) {
      if (item.loop != undefined) item.loop = undefined;
    } else {
      item.loop = this.s_loop;
    }
    this.initOp();
  }
}
</script>