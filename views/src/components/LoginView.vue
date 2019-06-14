<template>
    <Modal
        v-model="showflag"
        width="420"
        :closable="false"
		:mask-closable="false">
        <p slot="header">
            <i class="el-icon-user-solid"></i>
            <span>登录-远程服务器</span>
        </p>
        <el-form ref="loginform" label-width="80px">
            <el-form-item label="用户名:">
                <el-input size="small" style="width:220px"></el-input>
            </el-form-item>
            <el-form-item label="密码:">
                <el-input size="small" style="width:220px"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer">
            <el-button type="info" @click="cancel">取消</el-button>
            <el-button type="primary" @click="cancel">登录</el-button>
        </span>
    </Modal>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
@Component
export default class LoginView extends Vue {
    get showflag(){
        return this.$store.state.login_info.showflag;
    }
    private cancel(){
        this.$store.state.login_info.showflag=false;
    }
    private ok(){
        this.$store.state.login_info.showflag=false;
    }
}
</script>