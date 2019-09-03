<template>
    <div>
        <el-link v-model="testStatus" v-show="false"></el-link>
        <el-card class="box-card" shadow="never" style="margin:5px 10px 5px 10px">
            <el-tabs type="border-card" tab-position="left" style="height:450px" height="300" @tab-click="clickTab" v-model="tabName">
                <el-tab-pane label="硬件配置" name="0">
                    <div>
                        <el-divider content-position="left">工具板</el-divider>
                        <SetPort style="margin:0px 0px 0px 80px;"/>
                    </div>
                    <div>
                        <el-divider content-position="left">QG BOX</el-divider>
                        <el-form :model="boxInfo" ref="boxform" label-width="150px">
                            <el-form-item label="IP地址:">
                                <el-input size="small" style="width:220px" v-model="box_info.ip"></el-input>
                            </el-form-item>
                            <el-form-item label="端口号:">
                                <el-input size="small" style="width:220px" v-model="box_info.port"></el-input>
                            </el-form-item>
                        </el-form>
                    </div>
                </el-tab-pane>
                <el-tab-pane label="软件配置" name="1" disabled>
                    <el-form :model="testInfo" ref="testform" label-width="190px">
                        <el-form-item label="用例失败时是否退出测试:">
                            <el-radio-group v-model="testInfo.error_exit">
                                <el-radio :label="0">是</el-radio>
                                <el-radio :label="1">否</el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item label="用例失败时是否播放提示音:">
                            <el-radio-group v-model="testInfo.error_music">
                                <el-radio :label="0">是</el-radio>
                                <el-radio :label="1">否</el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item label="图片匹配度(0 ~ 100):">
                            <el-input-number style="width:130px" v-model="testInfo.match" controls-position="right" :min="0" :max="100" size="small"></el-input-number>
                        </el-form-item>
                    </el-form>
                </el-tab-pane>
                <el-tab-pane label="测试设备配置" name="2">
                    <el-form :model="daserverInfo" ref="daserform" label-width="200px" :inline="true">
                        <el-form-item label="启动路径:">
                            <el-input size="small" style="width:235px" v-model="da_server_info.path"></el-input>
                        </el-form-item><br/>
                        <el-form-item label="启动方式:">
                            <el-radio-group v-model="da_server_info.type" size="small" @change="selectStartMd">
                                <el-radio :label="0" border style="width:120px">COM + Wi-Fi</el-radio>
                                <el-radio :label="1" border style="width:120px">ADB + Wi-Fi</el-radio>
                                <el-radio :label="2" border style="width:120px" disabled>仅 ADB</el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item label="启动前是否需要输入其他命令:" v-show="!da_server_info.type" style="margin:0px 0px 0px 50px">
                            <el-radio-group v-model="da_server_info.others_flag">
                                <el-radio :label="0">否</el-radio>
                                <el-radio :label="1">是</el-radio>
                            </el-radio-group>
                            <el-input size="small" style="margin:0px 0px 0px 10px;width:180px" v-model="da_server_info.others_cmd" placeholder="请输入所需命令" v-show="da_server_info.others_flag"></el-input>
                        </el-form-item>
                        <div v-show="da_server_info.type<2">
                            <el-divider content-position="left">Wi-Fi配置</el-divider>
                            <el-form-item label="设备IP地址:">
                                <el-input size="small" style="width:235px" v-model="da_server_info.ip"></el-input>
                            </el-form-item>
                            <el-form-item label="连接端口号:">
                                <el-input size="small" style="width:235px" v-model="da_server_info.port"></el-input>
                            </el-form-item>
                            <div v-show="da_server_info.type==0">
                                <el-divider content-position="left">COM配置</el-divider>
                                <SetPort style="margin:0px 0px 0px 80px;"/>
                            </div>
                        </div>
                    </el-form>
                </el-tab-pane>
                <el-tab-pane label="服务器配置" name="3">
                    <div>
                        <el-form :model="dbserverInfo" ref="serverform" label-width="100px">
                            <el-form-item label="服务器配置:">
                                <el-radio-group v-model="db_server_info.type" size="small">
                                    <el-radio :label="0" border>本地服务器</el-radio>
                                    <el-radio :label="1" border disabled>远程服务器</el-radio>
                                </el-radio-group>
                            </el-form-item>
                            <el-form-item label="IP地址:" v-if="db_server_info.type">
                                <el-input size="small" style="width:220px" v-model="db_server_info.ip"></el-input>
                            </el-form-item>
                            <el-form-item label="端口号:" v-if="db_server_info.type">
                                <el-input size="small" style="width:220px" v-model="db_server_info.port"></el-input>
                            </el-form-item>
                        </el-form>
                        <el-button type="info" plain size="small" style="margin:0px 0px 0px 100px;width:126px;" @click="connectServer()" v-if="db_server_info.type">连接服务器</el-button>
                    </div>
                </el-tab-pane>
            </el-tabs>
            <el-button type="warning" style="margin:5px 0px 0px 0px;width:100%;" @click="save()">保存配置</el-button>
        </el-card>
        <div><LoginView/></div>
        <div><AlertView/></div>
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
    private tabName:any = "0";
    private select_server:any=0;
    private db_server_info:any={};
    private da_server_info:any={};
    private test_info:any={};
    private box_info:any={};
    private test_status:any=false;
    private uarts:any=["relay","da_arm"];
    private created() {
        this.$store.state.setting_info.select_serial = this.uarts[0];
    }
    get dbserverInfo(){
        if(this.$store.state.setting_info.info.db_server!=undefined)this.db_server_info=this.$store.state.setting_info.info.db_server;
        return this.db_server_info;
    }
    get daserverInfo(){
        if(this.$store.state.setting_info.info.da_server!=undefined)this.da_server_info=this.$store.state.setting_info.info.da_server;
        return this.da_server_info;
    }
    get testInfo(){
        if(this.$store.state.setting_info.info.test_info!=undefined)this.test_info=this.$store.state.setting_info.info.test_info;
        return this.test_info;
    }
    get boxInfo(){
        if(this.$store.state.setting_info.info.qg_box!=undefined)this.box_info=this.$store.state.setting_info.info.qg_box;
        return this.box_info;
    }
    get testStatus(){
        this.test_status = this.$store.state.test_info.testing;
        return;
    }
    private selectStartMd(name:any){
        if(name==0)this.$store.state.setting_info.select_serial = this.uarts[1];
    }
    private clickTab(){
        switch(this.tabName){
            case "0":
                this.$store.state.setting_info.select_serial = this.uarts[0];
                break;
            case "2":
                if(this.da_server_info.type==0){
                    this.$store.state.setting_info.select_serial = this.uarts[1];
                }
                break;
        }
    }
    private selectServer(){
        this.$store.state.setting_info.info.db_server.type=this.select_server;
    }
    private connectServer(){
        this.$store.state.login_info.showflag = true;
    }
    private save(){
        if(this.test_status){
            this.$notify({title: '测试进行中!!!无法进行操作',message: '', type: 'warning',duration:1500});
        }else{
            this.$store.state.alert_info.showflag = true;
            this.$store.state.alert_info.type = 0;
        }
    }
}
</script>