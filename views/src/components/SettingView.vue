<template>
  <div>
    <el-link v-model="testStatus" v-show="false"></el-link>
    <el-card class="box-card" shadow="never" style="margin:5px 10px 5px 10px">
      <el-tabs
        type="border-card"
        tab-position="left"
        style="height:450px"
        @tab-click="clickTab"
        v-model="tabName"
      >
        <el-tab-pane label="硬件配置" name="0">
          <el-collapse v-model="activeName" accordion @change="changeCollapse">
            <el-collapse-item title="工具板" name="1">
              <SetPort style="margin:0px 0px 0px 80px;" />
            </el-collapse-item>
            <el-collapse-item title="程控电源" name="2">
              <SetPort style="margin:0px 0px 0px 80px;" />
            </el-collapse-item>
            <el-collapse-item title="QG BOX" name="3">
              <el-form :model="boxInfo" ref="boxform" label-width="150px">
                <el-form-item label="IP地址:">
                  <el-input size="small" style="width:220px" v-model="box_info.ip"></el-input>
                </el-form-item>
                <el-form-item label="端口号:">
                  <el-input size="small" style="width:220px" v-model="box_info.port"></el-input>
                </el-form-item>
              </el-form>
            </el-collapse-item>
            <el-collapse-item title="PCAN" name="4">
              <el-form :model="pcanInfo" ref="boxform" label-width="120px" :inline="true">
                <el-form-item label="Baudrate:">
                  <el-select v-model="pcanInfo.baudrate" size="small" style="width:130px">
                    <el-option
                      v-for="val in pcan_option.baudrate"
                      :label="val"
                      :value="val"
                      :key="val"
                    ></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="Hardware Type:">
                  <el-select v-model="pcanInfo.hardware_type" size="small" style="width:130px">
                    <el-option
                      v-for="val in pcan_option.hardware_type"
                      :label="val"
                      :value="val"
                      :key="val"
                    ></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="I/O Port:">
                  <el-select v-model="pcanInfo.io_port" size="small" style="width:100px">
                    <el-option
                      v-for="val in pcan_option.io_port"
                      :label="val"
                      :value="val"
                      :key="val"
                    ></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="Interrupt:">
                  <el-select v-model="pcanInfo.interrupt" size="small" style="width:100px">
                    <el-option
                      v-for="val in pcan_option.interrupt"
                      :label="val"
                      :value="val"
                      :key="val"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </el-form>
            </el-collapse-item>
          </el-collapse>
        </el-tab-pane>
        <el-tab-pane label="软件配置" name="1">
          <el-form :model="testInfo" ref="testform" label-width="200px">
            <el-form-item label="循环测试失败时是否退出测试:">
              <el-radio-group v-model="testInfo.error_exit">
                <el-radio :label="1">否</el-radio>
                <el-radio :label="0">是</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="用例失败时是否播放提示音:">
              <el-radio-group v-model="testInfo.error_music">
                <el-radio :label="1">否</el-radio>
                <el-radio :label="0">是</el-radio>
              </el-radio-group>
              <span v-if="!testInfo.error_music" style="margin:0px 0px 0px 40px;">
                <el-button
                  plain
                  icon="el-icon-folder-opened"
                  size="small"
                  @click="openMusic()"
                >选择音乐文件</el-button>
                <span style="margin:0px 0px 0px 10px;">
                  <font size="2">当前打开音乐文件 : {{ music_path }}</font>
                </span>
              </span>
            </el-form-item>
            <el-form-item label="图片匹配度(0 ~ 100):">
              <el-input-number
                style="width:130px"
                v-model="testInfo.match"
                controls-position="right"
                :min="0"
                :max="100"
                size="small"
              ></el-input-number>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="测试设备配置" name="2">
          <el-form :model="daserverInfo" ref="daserform" label-width="200px" :inline="true">
            <el-form-item label="启动路径:">
              <el-input size="small" style="width:235px" v-model="da_server_info.path"></el-input>
            </el-form-item>
            <br />
            <el-form-item label="启动方式:">
              <el-radio-group v-model="da_server_info.type" size="small" @change="selectStartMd">
                <el-radio :label="0" border style="width:120px">COM + Wi-Fi</el-radio>
                <el-radio :label="1" border style="width:120px">ADB + Wi-Fi</el-radio>
                <el-radio :label="2" border style="width:120px" disabled>仅 ADB</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item
              label="启动前是否需要输入其他命令:"
              v-show="!da_server_info.type"
              style="margin:0px 0px 0px 50px"
            >
              <el-radio-group v-model="da_server_info.others_flag">
                <el-radio :label="0">否</el-radio>
                <el-radio :label="1">是</el-radio>
              </el-radio-group>
              <el-input
                size="small"
                style="margin:0px 0px 0px 10px;width:180px"
                v-model="da_server_info.others_cmd"
                placeholder="请输入所需命令"
                v-show="da_server_info.others_flag"
              ></el-input>
            </el-form-item>
            <el-collapse v-model="activeName" accordion v-show="da_server_info.type<2">
              <el-collapse-item title="Wi-Fi配置" name="1">
                <el-form-item label="设备IP地址:">
                  <el-input size="small" style="width:235px" v-model="da_server_info.ip"></el-input>
                </el-form-item>
                <el-form-item label="连接端口号:">
                  <el-input size="small" style="width:235px" v-model="da_server_info.port"></el-input>
                </el-form-item>
              </el-collapse-item>
              <el-collapse-item title="COM配置" name="2" v-show="da_server_info.type==0">
                <SetPort style="margin:0px 0px 0px 80px;" />
              </el-collapse-item>
              <el-collapse-item title="蓝牙配置" name="3">
                <el-form-item label="设备MAC地址:">
                  <el-input
                    size="small"
                    style="width:235px"
                    v-model="set_bt.mac"
                    @change="changeBtMac"
                  ></el-input>
                </el-form-item>
                <el-form-item label="设备PING码:">
                  <el-input
                    size="small"
                    style="width:235px"
                    v-model="set_bt.ping"
                    @change="changeBtPing"
                  ></el-input>
                </el-form-item>
              </el-collapse-item>
            </el-collapse>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="日志功能配置" name="4">
          <el-form :model="logInfo" ref="logform" label-width="120px">
            <el-form-item label="启动状态:">
              <el-switch
                active-color="#13ce66"
                inactive-color="#F56C6C"
                v-model="log_info.open"
                @change="openLog"
              ></el-switch>
            </el-form-item>
            <el-form-item label="抓取方式:" v-show="log_info.open">
              <el-radio-group v-model="log_info.type" size="small">
                <el-radio :label="0" border style="width:90px">COM</el-radio>
                <el-radio :label="1" border style="width:90px">ADB</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="信息配置:" v-show="log_info.open">
              <el-input
                style="width:250px"
                size="small"
                placeholder="请输入ADB指令"
                v-model="log_info.adb_cmd"
                v-if="log_info.type==1"
              ></el-input>
              <SetPort v-if="log_info.type==0" />
            </el-form-item>
            <!-- <el-form-item label="是否需输入指令:" v-show="log_info.open&&log_info.type==0">
                            <el-radio-group v-model="log_info.others_flag">
                                <el-radio :label="0">否</el-radio>
                                <el-radio :label="1">是</el-radio>
                            </el-radio-group>
                            <el-input size="small" style="margin:0px 0px 0px 10px;width:220px" v-model="log_info.others_cmd" placeholder="请输入所需命令" v-show="log_info.others_flag"></el-input>
            </el-form-item>-->
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="服务器配置" name="3">
          <div>
            <el-form :model="dbserverInfo" ref="serverform" label-width="100px">
              <el-form-item label="服务器配置:">
                <el-radio-group v-model="server_type" size="small">
                  <el-radio :label="0" border>本地服务器</el-radio>
                  <el-radio :label="1" border disabled>远程服务器</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="IP地址:" v-if="server_type">
                <el-input size="small" style="width:220px" v-model="db_server_info.ip"></el-input>
              </el-form-item>
              <el-form-item label="端口号:" v-if="server_type">
                <el-input size="small" style="width:220px" v-model="db_server_info.port"></el-input>
              </el-form-item>
            </el-form>
            <el-button
              type="info"
              plain
              size="small"
              style="margin:0px 0px 0px 100px;width:126px;"
              @click="connectServer()"
              v-if="server_type"
            >连接服务器</el-button>
          </div>
        </el-tab-pane>
      </el-tabs>
      <el-button type="warning" style="margin:5px 0px 0px 0px;width:100%;" @click="save()">保存配置</el-button>
    </el-card>
    <div>
      <LoginView />
    </div>
    <div>
      <AlertView />
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import SetPort from "./SetPort.vue";
import LoginView from "./LoginView.vue";
import AlertView from "./AlertView.vue";
@Component({
  components: {
    SetPort,
    LoginView,
    AlertView
  }
})
export default class SettingView extends Vue {
  private tabName: any = "0";
  private select_server: any = 0;
  private db_server_info: any = {};
  private da_server_info: any = {};
  private test_info: any = {
    error_exit: 0,
    error_music: 1,
    match: 90,
    music_path: ""
  };
  private music_path: string = "";
  private box_info: any = {};
  private log_info: any = {};
  private pcan_info: any = {};
  private server_type: any = "";
  private test_status: any = false;
  private uarts: any = ["relay", "da_arm", "log", "power"];
  private activeName: any = "1";
  private set_bt: any = {
    mac: "D4:4D:A4:5C:AA:2A",
    ping: "1234"
  };
  private pcan_option = {
    baudrate: [
      "baud_1m",
      "baud_800k",
      "baud_500k",
      "baud_250k",
      "baud_125k",
      "baud_100k",
      "baud_50k",
      "baud_20k",
      "baud_10k",
      "baud_5k",
      "baud_33333k",
      "baud_47619k",
      "baud_95238k",
      "baud_83333k"
    ],
    hardware_type: [
      "ISA_82C200",
      "ISA_SJA1000",
      "ISA_PHYTEC",
      "DNG_82C200",
      "DNG_82C200_EPP",
      "DNG_SJA1000",
      "DNG_SJA1000_EPP"
    ],
    io_port: [
      "0100",
      "0120",
      "0140",
      "0200",
      "0220",
      "0240",
      "0260",
      "0278",
      "0280",
      "02A0",
      "02C0",
      "02E0",
      "02E8",
      "02F8",
      "0300",
      "0320",
      "0340",
      "0360",
      "0378",
      "0380",
      "03BC",
      "03E0",
      "03E8",
      "03F8"
    ],
    interrupt: ["3", "4", "5", "7", "9", "10", "11", "12", "15"]
  };
  private created() {
    this.$store.state.setting_info.select_serial = this.uarts[0];
  }
  get dbserverInfo() {
    if (this.$store.state.setting_info.info.db_server != undefined)
      this.db_server_info = this.$store.state.setting_info.info.db_server;
    this.server_type = this.db_server_info.type;
    return this.db_server_info;
  }
  get daserverInfo() {
    if (this.$store.state.setting_info.info.da_server != undefined) {
      this.da_server_info = this.$store.state.setting_info.info.da_server;
      if (this.da_server_info.mac != undefined) {
        this.set_bt.mac = this.da_server_info.mac;
        this.set_bt.ping = this.da_server_info.ping;
      }
    }
    return this.da_server_info;
  }
  get testInfo() {
    if (this.$store.state.setting_info.info.test_info != undefined) {
      this.test_info = this.$store.state.setting_info.info.test_info;
      if (this.test_info.music_path != undefined) {
        this.music_path = this.test_info.music_path;
      }
    }
    return this.test_info;
  }
  get boxInfo() {
    if (this.$store.state.setting_info.info.qg_box != undefined)
      this.box_info = this.$store.state.setting_info.info.qg_box;
    return this.box_info;
  }
  get testStatus() {
    this.test_status = this.$store.state.test_info.testing;
    return;
  }
  get logInfo() {
    if (this.$store.state.setting_info.info.log_info != undefined)
      this.log_info = this.$store.state.setting_info.info.log_info;
    else
      this.log_info = {
        open: false,
        type: 0,
        adb_cmd: "",
        others_flag: 0,
        others_cmd: ""
      };
    return;
  }
  get pcanInfo() {
    if (this.$store.state.setting_info.info.pcan_info != undefined)
      this.pcan_info = this.$store.state.setting_info.info.pcan_info;
    else
      this.pcan_info = {
        baudrate: "baud_100k",
        hardware_type: "ISA_82C200",
        io_port: "0100",
        interrupt: "3"
      };
    return this.pcan_info;
  }
  private changeBtMac() {
    this.da_server_info.mac = this.set_bt.mac;
  }
  private changeBtPing() {
    this.da_server_info.ping = this.set_bt.ping;
  }
  private selectStartMd(name: any) {
    if (name == 0) this.$store.state.setting_info.select_serial = this.uarts[1];
  }
  private changeCollapse() {
    switch (this.activeName) {
      case "1":
        this.$store.state.setting_info.select_serial = this.uarts[0];
        break;
      case "2":
        this.$store.state.setting_info.select_serial = this.uarts[3];
        break;
      default:
        break;
    }
  }
  private clickTab() {
    switch (this.tabName) {
      case "0":
        if (this.activeName == "1") {
          this.$store.state.setting_info.select_serial = this.uarts[0];
        } else if (this.activeName == "2") {
          this.$store.state.setting_info.select_serial = this.uarts[3];
        }
        break;
      case "2":
        if (this.da_server_info.type == 0) {
          this.$store.state.setting_info.select_serial = this.uarts[1];
        }
        break;
      case "4":
        if (this.log_info.open && this.log_info.type == 0) {
          this.$store.state.setting_info.select_serial = this.uarts[2];
        }
        break;
    }
  }
  private openLog() {
    if (this.log_info.open)
      this.$store.state.setting_info.select_serial = this.uarts[2];
  }
  private selectServer() {
    this.$store.state.setting_info.info.db_server.type = this.select_server;
  }
  private connectServer() {
    this.$store.state.login_info.ip = "http://" + this.db_server_info.ip;
    this.$store.state.login_info.port = this.db_server_info.port;
    this.$store.state.login_info.showflag = true;
  }
  private save() {
    if (this.test_status) {
      this.$notify({
        title: "测试进行中!!!无法进行操作",
        message: "",
        type: "warning",
        duration: 1500
      });
    } else {
      if (this.$store.state.setting_info.info.log_info == undefined)
        this.$store.state.setting_info.info.log_info = this.log_info;
      if (this.$store.state.setting_info.info.pcan_info == undefined)
        this.$store.state.setting_info.info.pcan_info = this.pcan_info;
      this.$store.state.alert_info.showflag = true;
      this.$store.state.alert_info.type = 0;
    }
  }
  private openMusic() {
    let usl: any = window;
    let filepath = usl.pathByUserSelect();
    if (filepath.length == 0 || filepath == undefined) return;
    else {
      this.music_path = filepath;
      this.test_info.music_path = filepath;
    }
  }
}
</script>