<template>
    <Modal
        v-model="showflag"
        width="420"
        :closable="false"
		:mask-closable="false">
        <p slot="header">
            <i class="el-icon-user-solid"></i>
            <span>授权</span>
        </p>
        <div>
            <el-form ref="authInfo" label-width="100px">
                <el-form-item label="特征码:">
                    <p>{{ AuthInfo.fn }}</p>
                </el-form-item>
                <el-form-item label="硬件码:">
                    <p>{{ AuthInfo.hwid }}</p>
                </el-form-item>
                <el-form-item label="授权码:">
                    <el-input v-model="authnum" style="width:260px" placeholder="请输入授权码..."></el-input>
                </el-form-item>
            </el-form>
        </div>
        <span slot="footer">
            <el-button type="info" @click="cancel">取消</el-button>
            <el-button type="primary" @click="ok">确定</el-button>
        </span>
    </Modal>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
@Component
export default class AuthView extends Vue {
    private authInfo:any = {fn:"",hwid:""};
    private authnum:string = ""; 
    get showflag(){
        return this.$store.state.auth_info.showflag;
    }
    get AuthInfo(){
        if(!this.$store.state.auth_info.data.status)this.authInfo = this.$store.state.auth_info.data;
        return this.authInfo;
    }
    private cancel(){
        this.$store.state.auth_info.showflag = false;
    }
    private ok(){
        if(this.authnum=="")this.$notify({title: '内容不能为空!',message: '', type: 'error',duration:1500});
        else this.$store.state.app_info.pis.push({type:"toSer",job:"setAuth",info:this.authnum});
    }
}
</script>