<template>
    <Modal
        v-model="showflag"
        width="420"
        :closable="false"
		:mask-closable="false">
        <p slot="header">
            <i class="el-icon-folder-opened"></i>
            <span>新建项目...</span>
        </p>
        <el-input v-model="newprj_name" placeholder="请输入项目名称..." onkeyup="value=this.value.replace(/[^\d|a-zA-Z]/g,'')"></el-input>
        <div style="margin:10px 0px 0px 0px">
            <span><strong>注:仅可输入数据和字母</strong></span>
        </div>
        <div><AlertView/></div>
        <span slot="footer">
            <el-button type="info" @click="cancel">取消</el-button>
            <el-button type="primary" @click="ok">创建</el-button>
        </span>
    </Modal>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import AlertView from "./AlertView.vue";
@Component({
  components: {
      AlertView
  }
})
export default class OpenPrj extends Vue {
    private newprj_name:any="";
    get showflag(){
        if(this.$store.state.project_info.newflag)this.newprj_name="";
        return this.$store.state.project_info.newflag;
    }
    private cancel(){
        this.$store.state.project_info.newflag=false;
        
    }
    private ok(){
        if(this.newprj_name.length){
            this.$store.state.alert_info.showflag = true;
            this.$store.state.alert_info.type = 1;
            this.$store.state.alert_info.info = this.newprj_name;
        }else{
            this.$notify({title: '项目名称不能为空!',message: '', type: 'error',duration:1500});
        }
    }
}
</script>