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
        <el-form :model="newPrj" ref="testform" label-width="100px">
            <el-form-item label="项目名称 :">
                <el-input v-model="newPrj.name" size="small" style="width:235px" id="prjname" placeholder="请输入项目名称..." onkeyup="value=this.value.replace(/[^\d|a-zA-Z]/g,'')"></el-input>
            </el-form-item>
            <el-form-item label="创建方式 :">
                <el-radio-group v-model="newPrj.type">
                    <el-radio :label="0">空项目</el-radio>
                    <el-radio :label="1">复制其他项目</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="复制内容 :" v-if="newPrj.type==1">
                <el-radio-group v-model="newPrj.content">
                    <el-radio :label="0">用例和步骤</el-radio>
                    <el-radio :label="1">仅步骤内容</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="复制项目 :" v-if="newPrj.type==1">
                <el-select v-model="newPrj.copyprj" size="small" style="width:235px">
                    <el-option v-for="val in prjlist" :label="val.name" :value="val.name" :key="val.name"></el-option>
                </el-select>
            </el-form-item>
        </el-form>
        <div style="margin:10px 0px 0px 0px">
            <span><strong>注:项目名称仅可输入数据和字母</strong></span>
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
    private newPrj:any={name:"",type:0,content:0,copyprj:""};
    get showflag(){
        if(this.$store.state.project_info.newflag)this.newPrj={name:"",type:0,content:0,copyprj:""};
        return this.$store.state.project_info.newflag;
    }
    get prjlist(){
        return this.$store.state.project_info.prjlist;
    }
    private cancel(){
        this.$store.state.project_info.newflag=false;
    }
    private ok(){
        let prjname_input:any = document.getElementById("prjname");
        this.newPrj.name = prjname_input.value;
        if(this.newPrj.name.length){
            if(this.newPrj.type&&this.newPrj.copyprj.length==0)this.$notify({title: '请选择复制的项目!',message: '', type: 'error',duration:1500});
            else{
                this.$store.state.alert_info.showflag = true;
                this.$store.state.alert_info.type = 1;
                this.$store.state.alert_info.info = this.newPrj;
            }
        }else{
            this.$notify({title: '项目名称不能为空!',message: '', type: 'error',duration:1500});
        }
    }
}
</script>