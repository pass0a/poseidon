<template>
  <Modal v-model="showflag" width="420" :closable="false" :mask-closable="false">
    <p slot="header">
      <i class="el-icon-user-solid"></i>
      <span>登录-远程服务器</span>
    </p>
    <el-form ref="loginform" :model="loginInfo" label-width="80px">
      <el-form-item label="用户名:">
        <el-input size="small" style="width:220px" v-model="loginInfo.username"></el-input>
      </el-form-item>
      <el-form-item label="密码:">
        <el-input size="small" style="width:220px" v-model="loginInfo.password" show-password></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button type="info" @click="cancel">取消</el-button>
      <el-button type="primary" @click="ok" v-if="!logining">登录</el-button>
      <el-button type="primary" v-else>
        <i class="el-icon-loading"></i>登录中...
      </el-button>
    </span>
  </Modal>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import axios from "axios";
@Component
export default class LoginView extends Vue {
  private loginInfo: any = {
    username: "",
    password: ""
  };
  private logining: boolean = false;
  get showflag() {
    if (this.logining) this.logining = false;
    return this.$store.state.login_info.showflag;
  }
  private cancel() {
    this.$store.state.login_info.showflag = false;
  }
  private ok() {
    let that = this;
    that.logining = true;
    let ip = that.$store.state.login_info.ip;
    let port = that.$store.state.login_info.port;
    axios
      .post(ip + ":" + port + "/login", {
        type: "checkUser",
        data: {
          username: that.loginInfo.username,
          password: that.loginInfo.password
        }
      })
      .then(function(response) {
        if (response.data) {
          that.$store.state.login_info.uid = response.data.uid;
          //   that.logining = false;
          //   that.$notify({
          //     title: "连接远程服务器成功!",
          //     message: "",
          //     type: "success",
          //     duration: 1500
          //   });
          that.$store.state.app_info.pis.write({
            type: "toDB",
            route: "connect_server",
            info: { ip: ip, uid: that.$store.state.login_info.uid }
          });
        } else {
          that.$notify({
            title: "用户名或密码不正确!",
            message: "",
            type: "warning",
            duration: 1500
          });
        }
      })
      .catch(function(err) {
        that.logining = false;
        that.$notify({
          title: "网络异常,无法连接到服务器!",
          message: "",
          type: "error",
          duration: 1500
        });
        console.log(err);
      });
    // this.$store.state.login_info.showflag=false;
  }
}
</script>