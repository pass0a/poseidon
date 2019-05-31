<template>
    <div>
        <el-card class="box-card" shadow="never" style="margin:5px 10px 5px 10px">
            <el-tabs type="border-card" tab-position="left" style="height:300px" height="300">
                <el-tab-pane label="串口配置">
                    <el-radio-group v-model="select_uart" @change="selectUart()">
                        <el-radio :label="0">继电器</el-radio>
                        <el-radio :label="1">车机ARM</el-radio>
                        <el-radio :label="2">车机MCU</el-radio>
                    </el-radio-group>
                    <el-divider></el-divider>
                    <SetPort/>
                </el-tab-pane>
                <el-tab-pane label="服务器配置">
                    <el-radio-group v-model="select_server" size="small" style="margin:15px 0px 15px 25px" @change="selectServer()">
                        <el-radio :label="0" border>本地服务器</el-radio>
                        <el-radio :label="1" border>远程服务器</el-radio>
                    </el-radio-group>
                    <div v-if="select_server">
                        <el-form :model="dbserverInfo" ref="serverform" label-width="80px">
                            <el-form-item label="IP地址:">
                                <el-input size="small" style="width:220px" v-model="db_server_info.ip"></el-input>
                            </el-form-item>
                            <el-form-item label="端口号:">
                                <el-input size="small" style="width:220px" v-model="db_server_info.port"></el-input>
                            </el-form-item>
                        </el-form>
                        <el-button type="info" plain size="small" style="margin:0px 0px 0px 80px;width:126px;" @click="connectServer()">连接服务器</el-button>
                        
                    </div>
                </el-tab-pane>
                <el-tab-pane label="车机服务配置">
                    <el-form ref="daserform" label-width="80px">
                        <el-form-item label="IP地址:">
                            <el-input size="small" style="width:220px"></el-input>
                        </el-form-item>
                        <el-form-item label="端口号:">
                            <el-input size="small" style="width:220px"></el-input>
                        </el-form-item>
                    </el-form>
                </el-tab-pane>
            </el-tabs>
            <el-button type="info" plain size="small" style="margin:0px 0px 5px 0px;width:126px;float:right">保存配置</el-button>
        </el-card>
        <LoginView/>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import SetPort from "./SetPort.vue";
import LoginView from "./LoginView.vue";
@Component({
  components: {
      SetPort,
      LoginView
  }
})
export default class SettingView extends Vue {
    private select_uart:any=0;
    private select_server:any=0;
    private db_server_info:any={};
    private uarts:any=["relay","da_mcu","da_arm"];
    private created() {
        let uart = this.uarts[this.select_uart];
        this.$store.state.port_info = this.$store.state.setting_info.uarts[uart];
        this.select_server=this.$store.state.setting_info.db_server.type;
    }
    get dbserverInfo(){
        this.db_server_info=this.$store.state.setting_info.db_server;
        return this.db_server_info;
    }
    private selectUart(){
        let uart = this.uarts[this.select_uart];
        this.$store.state.port_info = this.$store.state.setting_info.uarts[uart];
    }
    private selectServer(){
        this.$store.state.setting_info.db_server.type=this.select_server;
    }
    private connectServer(){
        this.$store.state.login_info.showflag=true;
    }
}
</script>