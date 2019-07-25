<template>
    <div>
        <el-link v-model="testStatus" v-show="false"></el-link>
        <el-card class="box-card" shadow="never" style="margin:5px 10px 5px 10px">
            <el-button type="info" plain size="small" style="margin:0px 0px 5px 0px;width:126px;" @click="save()">保存配置</el-button>
            <el-tabs type="border-card" tab-position="left" style="height:300px" height="300">
                <el-tab-pane label="串口配置">
                    <el-radio-group v-model="select_uart" @change="selectUart()">
                        <el-radio :label="0">继电器</el-radio>
                        <el-radio :label="1">车机MCU</el-radio>
                        <el-radio :label="2">车机ARM</el-radio>
                    </el-radio-group>
                    <el-divider></el-divider>
                    <SetPort/>
                </el-tab-pane>
                <el-tab-pane label="服务器配置">
                    <div>
                        <el-form :model="dbserverInfo" ref="serverform" label-width="100px">
                            <el-form-item label="服务器配置:">
                                <el-radio-group v-model="db_server_info.type" size="small">
                                    <el-radio :label="0" border>本地服务器</el-radio>
                                    <el-radio :label="1" border>远程服务器</el-radio>
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
                <el-tab-pane label="车机服务配置">
                    <el-form :model="daserverInfo" ref="daserform" label-width="180px">
                        <el-form-item label="IP地址:">
                            <el-input size="small" style="width:220px" v-model="da_server_info.ip"></el-input>
                        </el-form-item>
                        <el-form-item label="端口号:">
                            <el-input size="small" style="width:220px" v-model="da_server_info.port"></el-input>
                        </el-form-item>
                        <el-form-item label="服务所在车机路径:">
                            <el-input size="small" style="width:220px" v-model="da_server_info.path"></el-input>
                        </el-form-item>
                    </el-form>
                </el-tab-pane>
                <el-tab-pane label="测试配置">
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
                <el-tab-pane label="QG BOX配置">
                    <el-form :model="boxInfo" ref="boxform" label-width="190px">
                        <el-form-item label="IP地址:">
                            <el-input size="small" style="width:220px" v-model="box_info.ip"></el-input>
                        </el-form-item>
                        <el-form-item label="端口号:">
                            <el-input size="small" style="width:220px" v-model="box_info.port"></el-input>
                        </el-form-item>
                    </el-form>
                </el-tab-pane>
            </el-tabs>
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
    private select_uart:any=0;
    private select_server:any=0;
    private db_server_info:any={};
    private da_server_info:any={};
    private test_info:any={};
    private box_info:any={};
    private test_status:any=false;
    private uarts:any=["relay","da_mcu","da_arm"];
    private created() {
        this.$store.state.setting_info.select_serial = this.uarts[this.select_uart];
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
    private selectUart(){
        this.$store.state.setting_info.select_serial = this.uarts[this.select_uart];
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