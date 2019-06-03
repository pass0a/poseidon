<template>
    <Modal
        v-model="showflag"
        width="420"
        :closable="false"
		:mask-closable="false"
        :loading="true"
        :ok-text="alertInfo.btn"
        @on-ok="ok"
        @on-cancel="cancel"
        >
        <p slot="header">
            <i class="el-icon-warning-outline"></i>
            <span>{{ alertInfo.title }}</span>
        </p>
        <span style="margin:0px 0px 0px 5px"><font size="3"><strong>{{ alertInfo.content }}</strong></font></span>
        <el-link v-model="updateShowflag"></el-link>
    </Modal>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
@Component({
  components: {
  }
})
export default class AlertView extends Vue {
    private alertInfo:any={title:"",content:"",btn:""};
    private isLoading:any=false;
    private loadingView:any=null;
    private showflag:any=false;
    get updateShowflag(){
        if(this.$store.state.alert_info.showflag)this.getAlertInfo();
        this.showflag=this.$store.state.alert_info.showflag;
        return this.showflag;
    }
    private getAlertInfo(){
        switch(this.$store.state.alert_info.type){
            case 0:
                this.alertInfo.title="保存配置";
                this.alertInfo.content="是否保存当前配置?";
                this.alertInfo.btn="保存";
                break;
            default:
                break;
        }
    }
    private cancel(){
        this.$store.state.alert_info.showflag=false;
    }
    private ok(){
        switch(this.$store.state.alert_info.type){
            case 0:
                this.$store.state.app_info.type="saveConfig";
                this.$store.state.app_info.reqCount++;
                break;
        }
    }
}
</script>