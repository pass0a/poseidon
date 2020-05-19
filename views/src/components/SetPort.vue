<template>
  <div>
    <el-form
      :inline="true"
      label-position="left"
      ref="portform"
      :model="editInfo"
      label-width="100px"
    >
      <el-form-item label="Prot">
        <span>COM</span>
        <el-input-number
          style="width:90px"
          v-model="initInfo.port"
          controls-position="right"
          :min="0"
          :max="100"
          size="small"
        ></el-input-number>
        <p>
          <font color="red">{{ formTit(0) }}</font>
        </p>
      </el-form-item>
      <el-form-item label="Baud Rate" style="margin:0px 0px 0px 50px">
        <el-input-number
          v-model="initInfo.baud_rate"
          controls-position="right"
          :min="0"
          size="small"
        ></el-input-number>
        <p>
          <font color="red">{{ formTit(1) }}</font>
        </p>
      </el-form-item>
      <el-form-item label="Data Bits" style="margin:0px 0px 0px 50px">
        <el-select v-model="initInfo.data_bits" size="small" style="width:130px">
          <el-option v-for="val in dbits" :label="val" :value="val" :key="val"></el-option>
        </el-select>
      </el-form-item>
      <br />
      <el-form-item label="Stop Bits">
        <el-select v-model="initInfo.stop_bits" size="small" style="width:130px">
          <el-option v-for="val in sbits" :label="val.name" :value="val.num" :key="val.num"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Parity" style="margin:0px 0px 0px 50px">
        <el-select v-model="initInfo.parity" size="small" style="width:130px">
          <el-option v-for="val in parity" :label="val.name" :value="val.num" :key="val.num"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Flow Control" style="margin:0px 0px 0px 50px">
        <el-select v-model="initInfo.flow_control" size="small" style="width:130px">
          <el-option v-for="val in flow" :label="val.name" :value="val.num" :key="val.num"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
@Component
export default class SetPort extends Vue {
  private initInfo = {
    port: 1,
    baud_rate: 115200,
    data_bits: 8,
    stop_bits: 0,
    parity: 0,
    flow_control: 0
  };
  private dbits = [5, 6, 7, 8];
  private sbits = [
    { name: "1", num: 0 },
    { name: "1.5", num: 1 },
    { name: "2", num: 2 }
  ];
  private parity = [
    { name: "None", num: 0 },
    { name: "Odd", num: 1 },
    { name: "Even", num: 2 },
    { name: "Mark", num: 3 },
    { name: "Space", num: 4 }
  ];
  private flow = [
    { name: "None", num: 0 },
    { name: "RTS/CTS", num: 1 },
    { name: "XON/XOFF", num: 2 }
  ];
  get editInfo() {
    if (this.$store.state.setting_info.info.uarts != undefined) {
      let info = this.$store.state.setting_info.info.uarts[
        this.$store.state.setting_info.select_serial
      ];
      if (info) this.initInfo = info;
      else {
        this.$store.state.setting_info.info.uarts[
          this.$store.state.setting_info.select_serial
        ] = {
          port: 1,
          baud_rate: 115200,
          data_bits: 8,
          stop_bits: 0,
          parity: 0,
          flow_control: 0
        };
        this.initInfo = this.$store.state.setting_info.info.uarts[
          this.$store.state.setting_info.select_serial
        ];
      }
    }
    return this.initInfo;
  }
  private formTit(flag: Number) {
    switch (flag) {
      case 0:
        if (this.initInfo.port % 1 != 0) {
          return "请输入正确的端口号";
        }
        break;
      case 1:
        if (this.initInfo.baud_rate % 1 != 0) {
          return "请输入正确的波特率";
        }
        break;
    }
  }
}
</script>