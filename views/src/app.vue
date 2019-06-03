<template>
  <div id="app">
    <el-link v-model="sendRequest"></el-link>
    <router-view></router-view>
  </div>
</template>
<script lang="ts">
let pack = require("./ext/pack/index.js");
let pis = new pack.inputStream();
let pos = new pack.outputStream();

import { Component, Prop, Vue } from "vue-property-decorator";
import { defaultCoreCipherList } from 'constants';
@Component
export default class App extends Vue {
    private ws: any = null;
    private count:any=0;
    private created() {
        pis.on("data", (data: any) => {
            this.ws.send(data);
        });
        pos.on("data", (data: any) => {
            this.handle(data);
        });
        this.ws = new WebSocket("ws://127.0.0.1:6001");
        this.ws.onopen = () => {
            this.ws.binaryType = "arraybuffer";
            pis.push({type:"readConfig"});
        };
        this.ws.onmessage = (frm: any) => {
            pos.push(frm.data);
        };
        this.ws.onclose = () => {
            console.log("close websocket!!!");
        };
    }
    private handle(data:any){
        console.log(data.type);
        switch(data.type){
            case "readConfig":
                this.$store.state.setting_info.info=data.info;
                break;
            case "saveConfig":
                this.$store.state.alert_info.showflag=false;
                this.$notify({title: '系统配置信息保存成功',message: '', type: 'success',duration:1500});
                break;
            default:
                break;
        }
    }
    get sendRequest(){
        if(this.$store.state.app_info.reqCount > this.count){
            let reqType = this.$store.state.app_info.type;
            switch(reqType){
                case "readConfig":
                    pis.push({type:reqType});
                    break;
                case "saveConfig":
                    pis.push({type:reqType,info:this.$store.state.setting_info.info});
                    break;
            }
            this.count++;
        }
        return this.$store.state.app_info.reqCount;
    }
}
</script>