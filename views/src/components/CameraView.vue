<template>
  <div>
    <el-link v-model="ResList" v-show="false"></el-link>
    <el-link v-model="RuleList" v-show="false"></el-link>
    <el-link v-model="updateSaveStatus" v-show="false"></el-link>
    <el-link v-model="takePhotoForTest" v-show="false"></el-link>
    <el-link v-model="inScreenView" v-show="false"></el-link>
    <el-card :body-style="{ padding: '8px' }" style="margin:5px 10px 0px 10px;" shadow="never">
      <el-button
        :type="openBtnStatus.type"
        plain
        style="width:180px"
        :icon="openBtnStatus.icon"
        :disabled="openBtnStatus.disabled"
        @click="openCamera"
      >{{openBtnStatus.title}}</el-button>
      <el-button
        :type="takeBtnStatus.type"
        plain
        style="width:180px"
        :icon="takeBtnStatus.icon"
        :disabled="takeBtnStatus.disabled"
        @click="takePhoto"
      >{{takeBtnStatus.title}}</el-button>
      <el-button
        type="info"
        plain
        style="width:180px"
        icon="el-icon-download"
        @click="saveImg"
        v-show="img_status"
      >保存并绑定</el-button>
      <span style="margin:0px 0px 0px 10px;" v-show="img_status">
        <font size="3">绑定类型 :</font>
      </span>
      <RadioGroup
        v-model="saveInfo.type"
        style="margin:0px 0px 5px 10px;"
        v-show="img_status"
        @on-change="selectType"
      >
        <Radio :label="0">
          <font size="2">整图</font>
        </Radio>
        <Radio :label="1">
          <font size="2">区域</font>
        </Radio>
      </RadioGroup>
    </el-card>
    <el-card style="margin:5px 10px 0px 10px;" shadow="never">
      <video id="video" width="600px" height="400px" autoplay="autoplay" v-show="!img_status"></video>
      <canvas id="canvas" width="600px" height="400px" v-show="img_status"></canvas>
    </el-card>
    <Modal v-model="saveInfo.flag" width="450px" :mask-closable="false" :closable="false">
      <p slot="header">保存信息</p>
      <h3>保存类型 : {{ saveInfo.type==0?"整图":"区域" }}</h3>
      <h3>绑定步骤</h3>
      <div>
        <el-select
          placeholder="请选择"
          filterable
          size="small"
          style="width:100px"
          v-model="s_action"
          @change="changeSel(0)"
        >
          <el-option v-for="val in Action" :key="val" :label="getResName(val)" :value="val"></el-option>
        </el-select>
        <el-select
          placeholder="请选择"
          filterable
          size="small"
          style="width:140px"
          v-model="s_module"
          @change="changeSel(1)"
        >
          <el-option v-for="val in Module" :key="val" :label="getResName(val)" :value="val"></el-option>
        </el-select>
        <el-select
          placeholder="请选择"
          filterable
          clearable
          size="small"
          style="width:155px"
          v-model="s_clid"
          @change="changeSel(2)"
        >
          <el-option v-for="val in Clid" :key="val" :label="getResName(val)" :value="val">
            <span style="float: left">{{ getResName(val) }}</span>
            <span style="float: right">
              <font :color="checkBinding(0,val)">{{ checkBinding(1,val) }}</font>
            </span>
          </el-option>
        </el-select>
      </div>
      <span slot="footer">
        <el-button type="info" @click="saveCancel">取消</el-button>
        <el-button type="primary" @click="saveOK" v-show="!saveing">保存</el-button>
        <el-button type="primary" :disabled="true" icon="el-icon-loading" v-show="saveing">保存中</el-button>
      </span>
    </Modal>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
@Component
export default class CameraView extends Vue {
  private img_status: boolean = false;
  private openBtnStatus = {
    type: "info",
    disabled: false,
    icon: "el-icon-video-camera",
    title: "开启摄像头"
  };
  private takeBtnStatus = {
    type: "info",
    disabled: true,
    icon: "el-icon-camera",
    title: "拍摄照片"
  };
  private saveInfo: any = { type: 0, info: {}, flag: false, cut: false };
  private s_action: string = "";
  private s_module: string = "";
  private s_clid: string = "";
  private Action: any = ["assert_pto"];
  private reslist: any = [];
  private rulelist: any = [];
  private stop: boolean = false;
  private saveing: boolean = false;
  private test_count: number = 0;
  private camera_status: boolean = false;
  get inScreenView() {
    if (this.$store.state.home_info.mode != "6_4") {
      let wid_img: any = document.getElementById("cut");
      if (wid_img) document.body.removeChild(wid_img);
      this.saveInfo.type = 0;
    }
    return;
  }
  get updateSaveStatus() {
    if (this.$store.state.camera_info.save_count) this.saveCancel();
    return;
  }
  get takePhotoForTest() {
    if (this.$store.state.camera_info.rev_count > this.test_count) {
      let video: any = document.getElementById("video");
      if (this.camera_status) {
        this.takeTestPhoto(video);
      } else {
        navigator.mediaDevices
          .getUserMedia({ video: { width: 600, height: 400 } })
          .then(MediaStream => {
            video.srcObject = MediaStream;
            video.load();
            setTimeout(function() {
              video.play();
            }, 200);
            this.takeTestPhoto(video);
            this.camera_status = true;
          })
          .catch(err => {
            console.log(err);
            let s_req = {
              type: "toSer",
              job: "testPhoto",
              info: { ret: 0 }
            };
            this.$store.state.app_info.pis.write(s_req);
          });
      }
      this.test_count++;
    }
    return;
  }
  get ResList() {
    this.reslist = this.$store.state.steps_info.reslist;
    return;
  }
  get RuleList() {
    this.rulelist = this.$store.state.steps_info.rulelist;
    return;
  }
  get Module() {
    return this.rulelist[this.s_action] != undefined
      ? this.rulelist[this.s_action]
      : [];
  }
  get Clid() {
    return this.rulelist[this.s_module] != undefined
      ? this.rulelist[this.s_module]
      : [];
  }
  private getResName(id: any) {
    let name = this.reslist[id];
    if (name == undefined) {
      let tmp: any = { assert_pto: "拍摄判断" };
      name = tmp[id];
    }
    return name;
  }
  private changeSel(flag: Number) {
    switch (flag) {
      case 0:
        this.s_module = "";
        this.s_clid = "";
        break;
      case 1:
        this.s_clid = "";
        break;
      case 2:
        break;
    }
  }
  private checkBinding(type: number, id: string) {
    let bind = this.$store.state.steps_info.bindlist[id];
    switch (type) {
      case 0:
        return bind ? "#67C23A" : "#F56C6C";
      case 1:
        return bind ? "已绑定" : "未绑定";
    }
  }
  private openCamera() {
    this.openBtnStatus.type = "primary";
    this.openBtnStatus.disabled = true;
    this.openBtnStatus.icon = "el-icon-loading";
    this.openBtnStatus.title = "开启中...";
    let video: any = document.getElementById("video");
    navigator.mediaDevices
      .getUserMedia({ video: { width: 600, height: 400 } })
      .then(MediaStream => {
        video.srcObject = MediaStream;
        video.load();
        setTimeout(function() {
          video.play();
        }, 200);
        this.openBtnStatus.type = "success";
        this.openBtnStatus.icon = "el-icon-video-camera-solid";
        this.openBtnStatus.title = "已开启摄像头";
        this.openBtnStatus.disabled = false;
        this.takeBtnStatus.disabled = false;
        this.camera_status = true;
        // setTimeout(() => {
        //     const tracks = MediaStream.getTracks();
        //     tracks[1].stop();
        // }, 5000)
      })
      .catch(err => {
        console.log(err);
        this.openBtnStatus.disabled = false;
        this.openBtnStatus.icon = "el-icon-video-camera";
        this.openBtnStatus.title = "开启摄像头";
        this.takeBtnStatus = {
          type: "info",
          disabled: true,
          icon: "el-icon-camera",
          title: "拍摄照片"
        };
        this.$notify({
          title: "摄像头异常!",
          message: "",
          type: "error",
          duration: 1500
        });
      });
  }
  private takePhoto() {
    if (this.img_status) {
      this.takeBtnStatus = {
        type: "info",
        disabled: false,
        icon: "el-icon-camera",
        title: "拍摄照片"
      };
      this.img_status = false;
      let wid_img: any = document.getElementById("cut");
      if (wid_img) document.body.removeChild(wid_img);
    } else {
      let video: any = document.getElementById("video");
      let canvas: any = document.getElementById("canvas");
      let ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, 600, 400);
      this.img_status = true;
      this.takeBtnStatus.title = "重新拍摄";
      this.takeBtnStatus.icon = "el-icon-refresh-left";
      this.onCutImage();
    }
  }
  private saveImg() {
    switch (this.saveInfo.type) {
      case 0:
        this.saveInfo.flag = true;
        break;
      case 1:
        if (this.saveInfo.cut) {
          this.saveInfo.flag = true;
          this.stop = true;
        } else {
          this.$notify({
            title: "请选取区域!",
            message: "",
            type: "warning",
            duration: 1500
          });
        }
        break;
    }
  }
  private selectType() {
    if (this.saveInfo.type == 0) {
      let wid_img: any = document.getElementById("cut");
      if (wid_img) document.body.removeChild(wid_img);
    }
  }
  private saveOK() {
    if (this.s_clid != "") {
      this.saveing = true;
      let content = {
        type: this.saveInfo.type,
        info: this.saveInfo.type ? this.saveInfo.info : {}
      };
      let bind_info: any = {
        type: "toDB",
        route: "binding",
        job: "add",
        info: {
          prjname: this.$store.state.project_info.current_prj,
          msg: { id: this.s_clid, pid: this.s_module, content: content }
        }
      };
      this.$store.state.app_info.pis.write(bind_info);
      this.disposePhotoData();
    } else {
      this.$notify({
        title: "请选择绑定选项!",
        message: "",
        type: "warning",
        duration: 1500
      });
    }
  }
  private disposePhotoData() {
    let canvas: any = document.getElementById("canvas");
    let img = canvas.toDataURL("image/jpeg");
    let arr = img.split(","),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    let s_req = {
      type: "toSer",
      job: "savePhoto",
      info: {
        prjname: this.$store.state.project_info.current_prj,
        type: this.saveInfo.type,
        info: this.saveInfo.info,
        id: this.s_clid,
        img_data: u8arr
      }
    };
    this.$store.state.app_info.pis.write(s_req);
  }
  private saveCancel() {
    this.s_action = "";
    this.s_module = "";
    this.s_clid = "";
    this.saveInfo.flag = false;
    this.stop = false;
    this.saveing = false;
  }
  private onCutImage() {
    let that = this;
    let startX = 0,
      startY = 0;
    let scrollTop: any, scrollLeft: any;
    let minX: any, maxX: any, minY: any, maxY: any;
    let flag = false;
    let retcLeft = 0,
      retcTop = 0,
      retcHeight = 0,
      retcWidth = 0;
    let img: any = document.getElementById("video");
    minX = img.offsetLeft;
    maxX = img.offsetLeft + img.offsetWidth;
    minY = img.offsetTop;
    maxY = img.offsetTop + img.offsetHeight;
    document.onmousedown = function(e) {
      if (that.img_status && that.saveInfo.type && !that.stop) {
        let evt: any = window.event || e;
        scrollTop =
          document.body.scrollTop || document.documentElement.scrollTop;
        scrollLeft =
          document.body.scrollLeft || document.documentElement.scrollLeft;
        startX = evt.clientX + scrollLeft;
        startY = evt.clientY + scrollTop;
        if (startX > minX && maxX > startX) {
          if (startY > minY && maxY > startY) {
            flag = true;
            let wid_img: any = document.getElementById("cut");
            if (wid_img) document.body.removeChild(wid_img);
            let p: any = document.createElement("p");
            p.id = "cut";
            p.className = "p";
            p.style.marginLeft = startX + "px";
            p.style.marginTop = startY + "px";
            document.body.appendChild(p);
          }
        }
      }
    };
    document.onmousemove = function(e) {
      if (that.img_status && that.saveInfo.type && flag) {
        let evt: any = window.event || e;
        let scrollTop =
          document.body.scrollTop || document.documentElement.scrollTop;
        let scrollLeft =
          document.body.scrollLeft || document.documentElement.scrollLeft;
        let moveX = evt.clientX + scrollLeft;
        let moveY = evt.clientY + scrollTop;
        retcLeft =
          startX - moveX > 0
            ? moveX < minX
              ? minX
              : moveX > maxX
              ? maxX
              : moveX
            : startX;
        retcWidth = Math.abs(
          startX - (moveX < minX ? minX : moveX > maxX ? maxX : moveX)
        );
        retcTop =
          startY - moveY > 0
            ? moveY < minY
              ? minY
              : moveY > maxY
              ? maxY
              : moveY
            : startY;
        retcHeight = Math.abs(
          startY - (moveY < minY ? minY : moveY > maxY ? maxY : moveY)
        );
        let wid_img: any = document.getElementById("cut");
        wid_img.style.marginLeft = retcLeft + "px";
        wid_img.style.marginTop = retcTop + "px";
        wid_img.style.width = retcWidth + "px";
        wid_img.style.height = retcHeight + "px";
      }
    };
    document.onmouseup = function(e) {
      let evt: any = window.event || e;
      if (that.img_status && that.saveInfo.type && flag) {
        let endX_s = evt.clientX + scrollLeft;
        let endY_s = evt.clientY + scrollTop;
        if (endX_s == startX && endY_s == startY) {
          let wid_img: any = document.getElementById("cut");
          if (wid_img) document.body.removeChild(wid_img);
          that.saveInfo.cut = false;
        } else if (retcWidth && retcHeight) {
          that.saveInfo.info.x1 = retcLeft - minX;
          that.saveInfo.info.y1 = retcTop - minY;
          that.saveInfo.info.w = retcWidth;
          that.saveInfo.info.h = retcHeight;
          retcLeft = 0;
          retcTop = 0;
          retcHeight = 0;
          retcWidth = 0;
          that.saveInfo.cut = true;
        }
        flag = false;
      }
    };
  }
  private takeTestPhoto(video: any) {
    setTimeout(
      () => {
        let canvas: any = document.getElementById("canvas");
        let ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, 600, 400);
        let img = canvas.toDataURL("image/jpeg");
        let arr = img.split(","),
          mime = arr[0].match(/:(.*?);/)[1],
          bstr = atob(arr[1]),
          n = bstr.length,
          u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        let s_req = {
          type: "toSer",
          job: "testPhoto",
          info: {
            prjname: this.$store.state.project_info.current_prj,
            ret: 1,
            img_data: u8arr
          }
        };
        this.$store.state.app_info.pis.write(s_req);
      },
      this.camera_status ? 0 : 1500
    );
  }
}
</script>