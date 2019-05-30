<template>
    <div>
        <el-card class="box-card" shadow="never" style="margin:5px 10px 5px 10px">
            
            <el-tabs type="border-card" tab-position="left" style="height:300px" height="300">
                <el-tab-pane label="串口配置">
                    <el-radio-group>
                        <el-radio :label="1">继电器</el-radio>
                        <el-radio :label="2">车机ARM</el-radio>
                        <el-radio :label="3">车机MCU</el-radio>
                        <el-radio :label="4">程控电源</el-radio>
                    </el-radio-group>
                    <el-divider></el-divider>
                    <SetPort/>
                </el-tab-pane>
                <el-tab-pane label="服务器配置">
                    <el-form ref="serverform" label-width="80px">
                        <el-form-item label="IP地址:">
                            <el-input size="small" style="width:220px"></el-input>
                        </el-form-item>
                        <el-form-item label="端口号:">
                            <el-input size="small" style="width:220px"></el-input>
                        </el-form-item>
                    </el-form>
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
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import SetPort from "./SetPort.vue";
@Component({
  components: {
      SetPort
  }
})
export default class SettingView extends Vue {

}
</script>