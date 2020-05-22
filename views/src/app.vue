<template>
  <div id="app">
    <el-link v-model="notifyToConnect" v-show="false"></el-link>
    <router-view></router-view>
  </div>
</template>
<script lang="ts">
import * as pack from "@passoa/pack";
let pis = new pack.packStream();
let pos = new pack.unpackStream();

import { Component, Prop, Vue } from "vue-property-decorator";
import { truncate } from "fs";
import { constants } from "crypto";
@Component
export default class App extends Vue {
  private ws: any = null;
  private idn: number = 0;
  private callBackInfo: any = {
    current_act: "",
    openPrj: 0
  };
  created() {
    pis.on("data", (data: any) => {
      this.ws.send(data);
    });
    pos.on("data", (data: any) => {
      this.revHandle(data);
    });
    this.$store.state.app_info.cflag++;
  }
  get notifyToConnect() {
    if (this.$store.state.app_info.cflag > this.idn) {
      this.idn = this.$store.state.app_info.cflag;
      this.connectServer();
    }
    return;
  }
  private async connectServer() {
    let num: any = 5;
    while (num) {
      if (await this.createWebSocket()) break;
      else await this.wait(1000);
      num--;
      if (num == 0) {
        this.$store.state.app_info.connect_info.server = 2;
        this.$store.state.app_info.connect_info.db = 2;
        this.$store.state.app_info.connect_info.link = 2;
      }
    }
  }
  private createWebSocket() {
    return new Promise(resolve => {
      let flag = false;
      this.ws = new WebSocket("ws://127.0.0.1:6001");
      this.ws.onopen = () => {
        this.ws.binaryType = "arraybuffer";
        this.$store.state.app_info.connect_info.server = 1;
        this.$store.state.app_info.pis = pis;
        pis.write({ type: "toSer", job: "getAuth" });
        pis.write({ type: "toSer", job: "connectStatus" });
        pis.write({ type: "toSer", job: "readConfig" });
        flag = true;
        resolve(true);
      };
      this.ws.onmessage = (frm: any) => {
        pos.write(frm.data);
      };
      this.ws.onclose = () => {
        console.log("close websocket!!!");
        if (flag) {
          this.$store.state.app_info.connect_info.server = 2;
          this.$store.state.app_info.connect_info.db = 2;
          this.$store.state.app_info.connect_info.link = 2;
          flag = false;
        }
        resolve(false);
      };
    });
  }
  private wait(time: any) {
    return new Promise(resolve => {
      setTimeout(function() {
        resolve(0);
      }, time);
    });
  }
  private revHandle(data: any) {
    switch (data.type) {
      case "toSer":
        if (data.job != "pushLog") console.log("revSer:", data);
        this.revToSer(data);
        break;
      case "tolink":
        console.log("revLink:", data);
        if (data.mode == 8) break;
        this.$store.state.test_info.info = data;
        break;
      case "toDB":
        console.log("revDB:", data);
        this.revToDB(data);
        break;
      case "toWeb":
        this.revToWeb(data);
        break;
      default:
        break;
    }
  }
  private revToWeb(data: any) {
    switch (data.job) {
      case "takePhoto":
        this.$store.state.camera_info.rev_count++;
        break;
    }
  }
  private revToSer(data: any) {
    switch (data.job) {
      case "getAuth":
        this.$store.state.auth_info.showflag = !data.info.status;
        if (!data.info.status) this.$store.state.auth_info.data = data.info;
        break;
      case "setAuth":
        if (data.info == 0) {
          this.$store.state.auth_info.showflag = false;
          this.$notify({
            title: "授权成功!",
            message: "",
            type: "success",
            duration: 1500
          });
        } else
          this.$notify({
            title: "授权码不正确!",
            message: "",
            type: "error",
            duration: 1500
          });
        break;
      case "connectStatus":
        this.$store.state.app_info.connect_info.link = data.info.link;
        this.$store.state.app_info.connect_info.db = data.info.db;
        if (data.info.db == 1)
          pis.write({
            type: "toDB",
            route: "users",
            job: "find",
            info: { name: "admin", psw: "123" }
          });
        break;
      case "dbStatus":
        this.$store.state.app_info.connect_info.db = data.info;
        if (data.info == 1)
          pis.write({
            type: "toDB",
            route: "users",
            job: "find",
            info: { name: "admin", psw: "123" }
          });
        break;
      case "linkStatus":
        this.$store.state.app_info.connect_info.link = data.info;
        break;
      case "readConfig":
        if (data.info.da_server.others_flag == undefined)
          data.info.da_server.others_flag = 0;
        this.$store.state.setting_info.info = data.info;
        break;
      case "saveConfig":
        this.$store.state.alert_info.showflag = false;
        this.$notify({
          title: "系统配置信息保存成功",
          message: "",
          type: "success",
          duration: 1500
        });
        break;
      case "readReport":
        this.$store.state.report_info.data = data.info;
        break;
      case "readStopinfo":
        this.$store.state.test_info.stopflag = 0;
        this.$store.state.test_info.stopflag = data.info;
        this.$store.state.test_info.stopStatus = data.info;
        this.$store.state.req_info.refresh_rl = 0;
        this.revDataEnd();
        break;
      case "clearStopInfo":
        this.$store.state.test_info.stopflag = false;
        break;
      case "syncRemote":
        this.$store.state.screen_info.status = data.info.msg.ret;
        if (data.info.msg.ret) {
          this.$store.state.screen_info.path = data.info.screen;
          this.$notify({
            title: "同步成功",
            message: "",
            type: "success",
            duration: 1500
          });
        } else {
          let msg: string = "错误信息 : ";
          switch (data.info.msg.code) {
            case 0:
              msg += "请求超时!!!!";
              break;
            case 1:
              msg += "网络异常!!!!";
              break;
            case 2:
              msg += "ADB异常!!!!";
              break;
            case 3:
              msg += "串口异常!!!!";
              break;
          }
          this.$notify({
            title: "同步失败",
            message: msg,
            type: "error",
            duration: 2500
          });
        }
        this.$store.state.screen_info.count++;
        break;
      case "saveCutImage":
        // this.$store.state.screen_info.save_count++;
        // this.$notify({title: '保存成功!',message: '', type: 'success',duration:1500});
        break;
      case "pushPassoa":
        this.$store.state.push_info.count++;
        this.$store.state.push_info.revdata = data.info;
        this.$notify({
          title: data.info ? "推送成功!" : "推送失败!",
          message: data.info ? "" : "ADB异常!",
          type: data.info ? "success" : "error",
          duration: 1500
        });
        break;
      case "pushLog":
        this.$store.state.push_info.log = data.info;
        break;
      case "savePhoto":
        this.$store.state.camera_info.save_count++;
        break;
      case "reTakeImg":
        this.$store.state.alert_info.showflag = false;
        if (data.info) {
          this.$notify({
            title: "重新截图成功",
            message: "",
            type: "success",
            duration: 1500
          });
        } else {
          this.$notify({
            title: "重新截图失败",
            message: "",
            type: "error",
            duration: 1500
          });
        }
        break;
      case "readDbc":
        if (data.data) {
          this.$store.state.dbc_info.data = JSON.parse(data.data);
        } else {
          this.$store.state.dbc_info.data = {};
        }
        if (this.$store.state.dbc_info.loading) {
          this.$store.state.dbc_info.loading.close();
          this.$store.state.dbc_info.loading = null;
        }
        break;
    }
  }
  private revToDB(data: any) {
    switch (data.route) {
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
      case "group":
        this.revToDB_group(data);
        break;
      case "binding":
        this.revToDB_binding(data);
        break;
      case "adb":
        this.revToDB_adb(data);
        break;
      case "status":
        this.revToDB_status(data);
        break;
      case "removeAll":
        if (this.$store.state.project_info.current_prj == data.info.prjname) {
          this.$store.state.project_info.current_prj = "";
        }
        this.$store.state.alert_info.showflag = false;
        this.$store.state.project_info.openflag = false;
        this.$store.state.home_info.count++;
        this.$notify({
          title: "删除成功",
          message: "",
          type: "success",
          duration: 1500
        });
        break;
      case "copyPrj":
        this.$store.state.req_info.new_prj--;
        if (this.$store.state.req_info.new_prj == 0) {
          this.$store.state.req_info.refresh_rl = 0;
          pis.write({
            type: "toDB",
            route: "res",
            job: "list",
            info: { prjname: this.$store.state.project_info.current_prj }
          });
          pis.write({
            type: "toDB",
            route: "rule",
            job: "list",
            info: { prjname: this.$store.state.project_info.current_prj }
          });
          pis.write({
            type: "toDB",
            route: "buttons",
            job: "list",
            info: { prjname: this.$store.state.project_info.current_prj }
          });
          pis.write({
            type: "toDB",
            route: "binding",
            job: "list",
            info: { prjname: this.$store.state.project_info.current_prj }
          });
          this.$store.state.alert_info.showflag = false;
          this.$store.state.project_info.newflag = false;
          this.$store.state.editcase_info.refresh_data = true;
          this.$notify({
            title: "项目创建成功!",
            message: "",
            type: "success",
            duration: 1500
          });
        }
        break;
      case "newPrj":
        this.$store.state.req_info.new_prj--;
        if (this.$store.state.req_info.new_prj == 0) {
          this.$store.state.req_info.refresh_rl = 0;
          pis.write({
            type: "toDB",
            route: "res",
            job: "list",
            info: { prjname: this.$store.state.project_info.current_prj }
          });
          pis.write({
            type: "toDB",
            route: "rule",
            job: "list",
            info: { prjname: this.$store.state.project_info.current_prj }
          });
          pis.write({
            type: "toDB",
            route: "buttons",
            job: "list",
            info: { prjname: this.$store.state.project_info.current_prj }
          });
          pis.write({
            type: "toDB",
            route: "binding",
            job: "list",
            info: { prjname: this.$store.state.project_info.current_prj }
          });
          this.$store.state.alert_info.showflag = false;
          this.$store.state.project_info.newflag = false;
          this.$store.state.editcase_info.refresh_data = true;
          this.$notify({
            title: "项目创建成功!",
            message: "",
            type: "success",
            duration: 1500
          });
        }
        break;
      case "results":
        this.revToDB_results(data);
        break;
      case "pcan":
        this.revToDB_pcan(data);
        break;
      case "dbc":
        this.revToDB_dbc(data);
        break;
      case "versions":
        this.revToDB_versions(data);
        break;
    }
  }
  private revToDB_status(data: any) {
    switch (data.job) {
      case "add":
        this.$store.state.editcase_info.casestatus_idx = -1;
        this.$store.state.editcase_info.casestatus_idx = data.idx;
        break;
      case "delete":
        this.$store.state.editcase_info.casestatus_idx = -1;
        this.$store.state.editcase_info.casestatus_idx = data.idx;
        break;
      case "module_add":
        let a_req = {
          type: "toDB",
          route: "cases",
          job: "list",
          info: {
            prjname: this.$store.state.project_info.current_prj,
            module: this.$store.state.editcase_info.firstModule,
            skip: 0,
            limit: this.$store.state.editcase_info.limit
          }
        };
        this.$store.state.app_info.pis.write(a_req);
        this.$notify({
          title: "当前模块全部用例已开启!",
          message: "",
          type: "success",
          duration: 1500
        });
        break;
      case "module_delete":
        let d_req = {
          type: "toDB",
          route: "cases",
          job: "list",
          info: {
            prjname: this.$store.state.project_info.current_prj,
            module: this.$store.state.editcase_info.firstModule,
            skip: 0,
            limit: this.$store.state.editcase_info.limit
          }
        };
        this.$store.state.app_info.pis.write(d_req);
        this.$notify({
          title: "当前模块全部用例已关闭!",
          message: "",
          type: "success",
          duration: 1500
        });
        break;
      case "openNgCases":
        this.$store.state.editcase_info.refresh_data = true;
        this.$store.state.app_info.pis.write({
          type: "toDB",
          route: "cases",
          job: "total",
          info: { prjname: data.info.prjname, module: data.info.module }
        });
        this.$notify({
          title: "上次NG用例共 " + data.info.count + " 条, 正在在开启",
          message: "",
          type: "success",
          duration: 1500
        });
        break;
    }
  }
  private revToDB_users(data: any) {
    switch (data.job) {
      case "find":
        this.$store.state.login_info._id = data.info;
        break;
    }
  }
  private revToDB_projects(data: any) {
    switch (data.job) {
      case "add":
        if (data.info.state) {
          let prj_name = data.info.msg.name;
          this.$store.state.project_info.current_prj = prj_name;
          if (!data.info.msg.type) {
            this.$store.state.req_info.new_prj = 3;
            pis.write({
              type: "toDB",
              route: "newPrj",
              job: "new",
              info: { prjname: prj_name }
            });
          } else {
            this.$store.state.req_info.new_prj = data.info.msg.content ? 5 : 6;
            pis.write({
              type: "toDB",
              route: "copyPrj",
              job: "copy",
              info: {
                prjname: data.info.msg.copyprj,
                msg: data.info.msg,
                end: data.info.msg.content ? 5 : 6
              }
            });
          }
        } else {
          this.$store.state.alert_info.showflag = false;
          this.$notify({
            title: "项目已存在",
            message: "",
            type: "error",
            duration: 1500
          });
        }
        break;
      case "list":
        this.$store.state.project_info.prjlist = JSON.parse(data.info);
        if (this.$store.state.home_info.mode == "1")
          this.$store.state.project_info.openflag = true;
        break;
    }
  }
  private revToDB_cases(data: any) {
    switch (data.job) {
      case "list":
        this.$store.state.editcase_info.data = JSON.parse(data.info);
        this.$store.state.editcase_info.refresh_data = false;
        break;
      case "add":
        if (data.info) {
          this.$store.state.case_info.showflag = false;
          this.$store.state.editcase_info.firstModule = data.info.module;
          this.$store.state.editcase_info.refresh_data = true;
          this.$store.state.app_info.pis.write({
            type: "toDB",
            route: "cases",
            job: "total",
            info: {
              prjname: this.$store.state.project_info.current_prj,
              module: data.info.module
            }
          });
          this.$notify({
            title: "用例创建成功!",
            message: "",
            type: "success",
            duration: 1500
          });
        } else {
          this.$notify({
            title: "用例ID已存在",
            message: "",
            type: "error",
            duration: 1500
          });
        }
        break;
      case "modify":
        this.$store.state.case_info.showflag = false;
        let page_limit = this.$store.state.editcase_info.limit;
        let cur_page = this.$store.state.editcase_info.current_page;
        let l_req = {
          type: "toDB",
          route: "cases",
          job: "list",
          info: {
            prjname: this.$store.state.project_info.current_prj,
            module: data.info,
            skip: page_limit * (cur_page - 1),
            limit: page_limit
          }
        };
        this.$store.state.app_info.pis.write(l_req);
        this.$notify({
          title: "用例修改成功!",
          message: "",
          type: "success",
          duration: 1500
        });
        break;
      case "delete":
        if (data.info) {
          this.$store.state.alert_info.showflag = false;
          this.$store.state.editcase_info.refresh_data = true;
          this.$store.state.app_info.pis.write({
            type: "toDB",
            route: "cases",
            job: "total",
            info: {
              prjname: this.$store.state.project_info.current_prj,
              module: this.$store.state.editcase_info.firstModule
            }
          });
          this.$notify({
            title: "用例删除成功!",
            message: "",
            type: "success",
            duration: 1500
          });
        }
        break;
      case "remove_id":
        this.$store.state.editcase_info.refresh_data = true;
        this.$notify({
          title: "选项删除成功!",
          message: "",
          type: "success",
          duration: 1500
        });
        break;
      case "remove_module":
        this.$store.state.editcase_info.refresh_data = true;
        this.$notify({
          title: "模块删除成功!",
          message: "",
          type: "success",
          duration: 1500
        });
        break;
      case "copy_steps":
        this.$store.state.editcase_info.copy++;
        if (data.info) {
          let c_limit = this.$store.state.editcase_info.limit;
          let c_page = this.$store.state.editcase_info.current_page;
          let c_module = this.$store.state.editcase_info.firstModule;
          let c_req = {
            type: "toDB",
            route: "cases",
            job: "list",
            info: {
              prjname: this.$store.state.project_info.current_prj,
              module: c_module,
              skip: c_limit * (c_page - 1),
              limit: c_limit
            }
          };
          this.$store.state.app_info.pis.write(c_req);
          this.$store.state.editcase_info.ret = true;
          this.$notify({
            title: "复制成功!",
            message: "",
            type: "success",
            duration: 1500
          });
        } else
          this.$notify({
            title: "用例ID不存在!",
            message: "",
            type: "error",
            duration: 1500
          });
        break;
      case "total":
        this.$store.state.editcase_info.refresh_data = true;
        this.$store.state.editcase_info.module_total = data.info.count;
        if (data.info.count > 0) {
          let skip: Number;
          if (
            this.$store.state.editcase_info.current_page != 0 &&
            this.$store.state.editcase_info.current_page <=
              Math.ceil(data.info.count / this.$store.state.editcase_info.limit)
          ) {
            skip =
              this.$store.state.editcase_info.limit *
              (this.$store.state.editcase_info.current_page - 1);
          } else {
            this.$store.state.editcase_info.current_page = 0;
            skip = 0;
          }
          let l_req = {
            type: "toDB",
            route: "cases",
            job: "list",
            info: {
              prjname: this.$store.state.project_info.current_prj,
              module: data.info.module,
              skip: skip,
              limit: this.$store.state.editcase_info.limit
            }
          };
          console.log(l_req);
          this.$store.state.app_info.pis.write(l_req);
        } else {
          this.$store.state.editcase_info.refresh_data = false;
        }
        break;
      case "editInReport":
        if (data.info.ret) {
          this.$store.state.case_info.type = 1;
          this.$store.state.case_info.data = JSON.parse(data.info.data);
          this.$store.state.case_info.showflag = true;
        } else {
          this.$notify({
            title: "用例已被删除无法进行修改!",
            message: "",
            type: "error",
            duration: 1500
          });
        }
        break;
    }
  }
  private revToDB_res(data: any) {
    switch (data.job) {
      case "list":
        let list = JSON.parse(data.info);
        let reslist: any = {};
        for (let i = 0; i < list.length; i++) {
          let id = list[i].id;
          let name = list[i].name;
          reslist[id] = name;
        }
        this.$store.state.steps_info.reslist = reslist;
        this.$store.state.req_info.refresh_rl++;
        if (this.$store.state.req_info.refresh_rl == 2)
          this.$store.state.id_info.count++;
        this.revDataEnd();
        break;
      case "add":
        if (data.info) {
          this.$notify({
            title: "添加成功!",
            message: "",
            type: "success",
            duration: 1500
          });
          this.$store.state.req_info.refresh_rl = 0;
          pis.write({
            type: "toDB",
            route: "res",
            job: "list",
            info: { prjname: this.$store.state.project_info.current_prj }
          });
          pis.write({
            type: "toDB",
            route: "rule",
            job: "list",
            info: { prjname: this.$store.state.project_info.current_prj }
          });
        }
        break;
      case "modify":
        if (data.info) {
          this.$store.state.req_info.refresh_rl = 0;
          pis.write({
            type: "toDB",
            route: "res",
            job: "list",
            info: { prjname: this.$store.state.project_info.current_prj }
          });
          pis.write({
            type: "toDB",
            route: "rule",
            job: "list",
            info: { prjname: this.$store.state.project_info.current_prj }
          });
          this.$notify({
            title: "修改成功!",
            message: "",
            type: "success",
            duration: 1500
          });
        }
        break;
      case "remove_id":
        this.$store.state.req_info.remove_id--;
        if (this.$store.state.req_info.remove_id == 0) {
          pis.write({
            type: "toDB",
            route: "rule",
            job: "remove_id",
            info: data.info
          });
        }
        break;
      case "update_version":
        this.callBackInfo.current_act = "openPrj";
        this.callBackInfo.openPrj = 0;
        this.$store.state.project_info.current_prj = data.info.prjname;
        this.$store.state.editcase_info.refresh_data = true;
        pis.write({
          type: "toDB",
          route: "res",
          job: "list",
          info: { prjname: data.info.prjname }
        });
        pis.write({
          type: "toDB",
          route: "rule",
          job: "list",
          info: { prjname: data.info.prjname }
        });
        pis.write({
          type: "toDB",
          route: "binding",
          job: "list",
          info: { prjname: data.info.prjname }
        });
        pis.write({
          type: "toDB",
          route: "dbc",
          job: "getDoc",
          info: { prjname: data.info.prjname }
        });
        pis.write({
          type: "toSer",
          job: "readStopinfo",
          prjname: data.info.prjname
        });
        break;
    }
  }
  private revToDB_rule(data: any) {
    switch (data.job) {
      case "list":
        let list = JSON.parse(data.info);
        let rulelist: any = {};
        for (let i = 0; i < list.length; i++) {
          let id = list[i].id;
          let content = list[i].content;
          if (content != null) rulelist[id] = content;
        }
        this.$store.state.steps_info.rulelist = rulelist;
        this.$store.state.req_info.refresh_rl++;
        if (this.$store.state.req_info.refresh_rl == 2)
          this.$store.state.id_info.count++;
        this.revDataEnd();
        break;
      case "add":
        let a_req = {
          type: "toDB",
          route: "res",
          job: "add",
          info: {
            prjname: this.$store.state.project_info.current_prj,
            id: data.info.id,
            name: data.info.name
          }
        };
        pis.write({ type: "toDB", route: "res", job: "add", info: data.info });
        if (data.info.msg.id.indexOf("button") > -1) {
          pis.write({
            type: "toDB",
            route: "buttons",
            job: "add",
            info: data.info
          });
        } else if (
          data.info.msg.grouplist &&
          data.info.msg.id.indexOf("group") > -1
        ) {
          pis.write({
            type: "toDB",
            route: "group",
            job: "add",
            info: data.info
          });
        } else if (
          data.info.msg.id.indexOf("adb_cmd") > -1 &&
          data.info.msg.sd != undefined
        ) {
          pis.write({
            type: "toDB",
            route: "adb",
            job: "add",
            info: data.info
          });
        } else if (
          data.info.msg.id.indexOf("pcan") > -1 &&
          data.info.msg.data != undefined
        ) {
          pis.write({
            type: "toDB",
            route: "pcan",
            job: "add",
            info: data.info
          });
        } else if (data.info.msg.id.indexOf("click_random") > -1) {
          pis.write({
            type: "toDB",
            route: "binding",
            job: "add",
            info: data.info
          });
        }
        break;
      case "remove_id":
        pis.write({
          type: "toDB",
          route: "res",
          job: "list",
          info: { prjname: this.$store.state.project_info.current_prj }
        });
        pis.write({
          type: "toDB",
          route: "rule",
          job: "list",
          info: { prjname: this.$store.state.project_info.current_prj }
        });
        this.$store.state.alert_info.showflag = false;
        break;
      case "check_version":
        if (data.info.upflag) {
          pis.write({
            type: "toDB",
            route: "res",
            job: "update_version",
            info: data.info
          });
        } else {
          this.callBackInfo.current_act = "openPrj";
          this.callBackInfo.openPrj = 0;
          this.$store.state.project_info.current_prj = data.info.prjname;
          this.$store.state.editcase_info.refresh_data = true;
          pis.write({
            type: "toDB",
            route: "res",
            job: "list",
            info: { prjname: data.info.prjname }
          });
          pis.write({
            type: "toDB",
            route: "rule",
            job: "list",
            info: { prjname: data.info.prjname }
          });
          pis.write({
            type: "toDB",
            route: "binding",
            job: "list",
            info: { prjname: data.info.prjname }
          });
          pis.write({
            type: "toDB",
            route: "dbc",
            job: "getDoc",
            info: { prjname: data.info.prjname }
          });
          pis.write({
            type: "toSer",
            job: "readStopinfo",
            prjname: data.info.prjname
          });
        }
        break;
    }
  }
  private revToDB_buttons(data: any) {
    switch (data.job) {
      case "list":
        let list = JSON.parse(data.info.data);
        let buttonlist: any = {};
        for (let i = 0; i < list.length; i++) {
          let id = list[i].id;
          buttonlist[id] = {
            event: list[i].event,
            event_down_1: list[i].content[0][0],
            event_down_2: list[i].content[0][1],
            event_up_1: list[i].content[1][0],
            event_up_2: list[i].content[1][1]
          };
        }
        this.$store.state.steps_info.buttonlist = buttonlist;
        break;
      case "add":
        pis.write({
          type: "toDB",
          route: "buttons",
          job: "list",
          info: { prjname: this.$store.state.project_info.current_prj }
        });
        break;
      case "modify":
        pis.write({
          type: "toDB",
          route: "buttons",
          job: "list",
          info: { prjname: this.$store.state.project_info.current_prj }
        });
        break;
      case "remove_id":
        pis.write({
          type: "toDB",
          route: "buttons",
          job: "list",
          info: { prjname: this.$store.state.project_info.current_prj }
        });
        break;
    }
  }
  private revToDB_group(data: any) {
    switch (data.job) {
      case "list":
        let list = JSON.parse(data.info.data);
        let grouplist: any = {};
        for (let i = 0; i < list.length; i++) {
          let id = list[i].id;
          grouplist[id] = list[i].content;
        }
        this.$store.state.steps_info.grouplist = grouplist;
        break;
      case "add":
        if (data.info) {
          pis.write({
            type: "toDB",
            route: "group",
            job: "list",
            info: { prjname: this.$store.state.project_info.current_prj }
          });
        }
        break;
      case "remove_id":
        this.$store.state.req_info.remove_id--;
        if (this.$store.state.req_info.remove_id == 0) {
          pis.write({
            type: "toDB",
            route: "rule",
            job: "remove_id",
            info: data.info
          });
          pis.write({
            type: "toDB",
            route: "group",
            job: "list",
            info: { prjname: this.$store.state.project_info.current_prj }
          });
        }
        break;
      case "modify":
        pis.write({
          type: "toDB",
          route: "group",
          job: "list",
          info: { prjname: this.$store.state.project_info.current_prj }
        });
        break;
    }
  }
  private revToDB_binding(data: any) {
    switch (data.job) {
      case "list":
        let list = JSON.parse(data.info.data);
        let bindlist: any = {};
        for (let i = 0; i < list.length; i++) {
          let id = list[i].id;
          bindlist[id] = {
            date: list[i].date,
            content: list[i].content
          };
        }
        this.$store.state.steps_info.bindlist = bindlist;
        this.revDataEnd();
        break;
      case "add":
        pis.write({
          type: "toDB",
          route: "binding",
          job: "list",
          info: { prjname: this.$store.state.project_info.current_prj }
        });
        this.$store.state.screen_info.save_count++;
        this.$notify({
          title: "绑定成功!",
          message: "",
          type: "success",
          duration: 1500
        });
        break;
      case "remove_id":
        this.$store.state.req_info.remove_id--;
        if (this.$store.state.req_info.remove_id == 0) {
          pis.write({
            type: "toDB",
            route: "rule",
            job: "remove_id",
            info: data.info
          });
          pis.write({
            type: "toDB",
            route: "binding",
            job: "list",
            info: { prjname: this.$store.state.project_info.current_prj }
          });
        }
        break;
    }
  }
  private revToDB_adb(data: any) {
    switch (data.job) {
      case "list":
        let list = JSON.parse(data.info.data);
        let adblist: any = {};
        for (let i = 0; i < list.length; i++) {
          let id = list[i].id;
          adblist[id] = {};
          adblist[id].sd = list[i].send_data;
          adblist[id].tp = list[i].type;
          adblist[id].tt = list[i].timeout;
          adblist[id].rd = list[i].rev_data;
        }
        this.$store.state.steps_info.adblist = adblist;
        break;
      case "add":
        if (data.info) {
          pis.write({
            type: "toDB",
            route: "adb",
            job: "list",
            info: { prjname: this.$store.state.project_info.current_prj }
          });
        }
        break;
      case "remove_id":
        pis.write({
          type: "toDB",
          route: "adb",
          job: "list",
          info: { prjname: this.$store.state.project_info.current_prj }
        });
        break;
      case "modify":
        pis.write({
          type: "toDB",
          route: "adb",
          job: "list",
          info: { prjname: this.$store.state.project_info.current_prj }
        });
        break;
    }
  }
  private revToDB_results(data: any) {
    switch (data.job) {
      case "total":
        this.$store.state.report_info.refresh_data = true;
        this.$store.state.report_info.module_total = data.info.count;
        if (data.info.count > 0) {
          let l_req = {
            type: "toDB",
            route: "results",
            job: "list",
            info: {
              prjname: this.$store.state.project_info.current_prj,
              module: data.info.module,
              skip: 0,
              limit: this.$store.state.editcase_info.limit
            }
          };
          this.$store.state.app_info.pis.write(l_req);
        } else {
          this.$store.state.report_info.data = [];
          this.$store.state.report_info.refresh_data = false;
        }
        break;
      case "list":
        this.$store.state.report_info.refresh_data = false;
        this.$store.state.report_info.data = JSON.parse(data.info);
        break;
      case "info":
        this.$store.state.report_info.info = data.info;
        break;
      case "changeRet":
        let l_req = {
          type: "toDB",
          route: "results",
          job: "list",
          info: {
            prjname: this.$store.state.project_info.current_prj,
            module: data.info.module,
            skip: 0,
            limit: this.$store.state.editcase_info.limit
          }
        };
        this.$store.state.app_info.pis.write(l_req);
        break;
      case "upload":
        this.$store.state.report_info.uploadCount++;
        this.$notify({
          title: "结果上传成功!",
          message: "",
          type: "success",
          duration: 1500
        });
        break;
    }
  }
  private revToDB_pcan(data: any) {
    switch (data.job) {
      case "list":
        let list = JSON.parse(data.info.data);
        let pcanlist: any = {};
        for (let i = 0; i < list.length; i++) {
          let id = list[i].id;
          pcanlist[id] = list[i].content;
        }
        this.$store.state.steps_info.pcanlist = pcanlist;
        break;
      case "add":
        if (data.info) {
          pis.write({
            type: "toDB",
            route: "pcan",
            job: "list",
            info: { prjname: this.$store.state.project_info.current_prj }
          });
        }
        break;
      case "remove_id":
        pis.write({
          type: "toDB",
          route: "pcan",
          job: "list",
          info: { prjname: this.$store.state.project_info.current_prj }
        });
        break;
      case "modify":
        pis.write({
          type: "toDB",
          route: "pcan",
          job: "list",
          info: { prjname: this.$store.state.project_info.current_prj }
        });
        break;
      default:
        break;
    }
  }
  private revToDB_dbc(data: any) {
    switch (data.job) {
      case "add":
        pis.write({
          type: "toSer",
          job: "readDbc",
          prjname: data.info.prjname
        });
        this.$notify({
          title: "打开成功!",
          message: "",
          type: "success",
          duration: 1500
        });
        break;
      case "modify":
        pis.write({
          type: "toSer",
          job: "readDbc",
          prjname: data.info.prjname
        });
        this.$notify({
          title: "打开成功!",
          message: "",
          type: "success",
          duration: 1500
        });
        break;
      case "getDoc":
        this.$store.state.dbc_info.path = data.info;
        pis.write({
          type: "toSer",
          job: "readDbc",
          prjname: this.$store.state.project_info.current_prj
        });
        this.revDataEnd();
        break;
      default:
        break;
    }
  }
  private revToDB_versions(data: any) {
    switch (data.job) {
      case "list":
        this.$store.state.project_info.verlist = JSON.parse(data.info);
        this.$store.state.project_info.show_versions = true;
        break;
      default:
        break;
    }
  }
  private revDataEnd() {
    switch (this.callBackInfo.current_act) {
      case "openPrj":
        this.callBackInfo.openPrj++;
        if (this.callBackInfo.openPrj == 5)
          this.$store.state.project_info.openflag = false;
        break;
      default:
        break;
    }
  }
}
</script>
