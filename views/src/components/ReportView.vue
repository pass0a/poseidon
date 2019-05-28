<template>
    <div>
        <el-card class="box-card" shadow="never" style="margin:5px 10px 5px 10px;height:55px">
            <span><font size="3"><strong>测试开始时间: </strong></font></span>
            <span style="margin:0px 0px 0px 10px"><font size="2" color="#C0C4CC">- - - -</font></span>
            <span style="margin:0px 0px 0px 20px"><font size="3"><strong>测试结束时间: </strong></font></span>
            <span style="margin:0px 0px 0px 10px"><font size="2" color="#C0C4CC">- - - -</font></span>
            <span style="margin:0px 0px 0px 20px"><font size="3"><strong>测试总耗时长: </strong></font></span>
            <span style="margin:0px 0px 0px 10px"><font size="2" color="#C0C4CC">- - - -</font></span>
            <span style="margin:0px 0px 0px 20px"><font size="4" color="#F56C6C"><strong>NG: </strong></font></span>
            <span style="margin:0px 0px 0px 10px"><font size="2" color="#C0C4CC">- - - -</font></span>
            <span style="margin:0px 0px 0px 20px"><font size="4" color="#67C23A"><strong>OK: </strong></font></span>
            <span style="margin:0px 0px 0px 10px"><font size="2" color="#C0C4CC">- - - -</font></span>
            <span style="margin:0px 0px 0px 20px"><font size="3"><strong>通过率: </strong></font></span>
            <span style="margin:0px 0px 0px 10px"><font size="2" color="#C0C4CC">- - - -</font></span>
        </el-card>
        <el-tabs type="border-card" style="margin:5px 10px 5px 10px;">
            <el-tab-pane label="System"></el-tab-pane>
            <el-tab-pane label="POP"></el-tab-pane>
            <el-tab-pane label="Radio"></el-tab-pane>
            <el-tab-pane label="AUX"></el-tab-pane>
            <el-table style="width: 100%" height="365" size="mini" stripe border ref="table">
                <el-table-column type="index" label="No." width="50"></el-table-column>
                <el-table-column label="需求编号" resizable show-overflow-tooltip="ture"></el-table-column>
                <el-table-column label="需求名称" resizable show-overflow-tooltip="ture"></el-table-column>
                <el-table-column label="用例ID" resizable show-overflow-tooltip="ture"></el-table-column>
                <el-table-column label="用例名称" resizable show-overflow-tooltip="ture"></el-table-column>
                <el-table-column label="优先级" resizable show-overflow-tooltip="ture"></el-table-column>
            </el-table>
            <el-checkbox-group style="margin:5px 0px 0px 0px">
                <el-checkbox label="需求编号"></el-checkbox>
                <el-checkbox label="需求名称"></el-checkbox>
                <el-checkbox label="用例ID"></el-checkbox>
                <el-checkbox label="用例名称"></el-checkbox>
                <el-checkbox label="优先级"></el-checkbox>
            </el-checkbox-group>
        </el-tabs>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
@Component({
  components: {
  }
})
export default class ReportView extends Vue {

}
</script>