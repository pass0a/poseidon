<template>
  <div id="app">
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
                this.$store.state.setting_info=data.info;
                break;
            default:
                break;
        }
    }
}
</script>