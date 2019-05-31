<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>
<script lang="ts">
import * as pack from "./ext/pack/index";
let pis = new pack.inputStream();
let pos = new pack.outputStream();

import { Component, Prop, Vue } from "vue-property-decorator";
@Component
export default class App extends Vue {
  private ws: any = null;
  private count: any = 0;
  private created() {
    pis.on("data", (data: any) => {
      this.ws.send(data);
    });
    pos.on("data", (data: any) => {
      console.log(data.type);
    });
    this.ws = new WebSocket("ws://127.0.0.1:6001");
    this.ws.onopen = () => {
      this.ws.binaryType = "arraybuffer";
    };
    this.ws.onmessage = (frm: any) => {
      pos.push(frm.data);
    };
    this.ws.onclose = () => {
      console.log("close websocket!!!");
    };
  }
}
</script>