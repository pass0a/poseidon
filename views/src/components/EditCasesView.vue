<template>
    <div>
        <el-button-group style="margin:5px 0px 0px 10px;">
            <el-button plain icon="el-icon-download" size="small">保存用例</el-button>
            <el-button plain icon="el-icon-plus" size="small">新建用例</el-button>
            <el-button plain icon="el-icon-s-fold" size="small">管理步骤</el-button>
        </el-button-group>
        <el-tabs type="border-card" tab-position="bottom" style="margin:5px 10px 10px 10px;">
            <el-tab-pane label="System"></el-tab-pane>
            <el-tab-pane label="POP"></el-tab-pane>
            <el-tab-pane label="Radio"></el-tab-pane>
            <el-tab-pane label="AUX"></el-tab-pane>
            <el-checkbox-group style="margin:0px 0px 5px 0px">
                <el-checkbox label="需求编号"></el-checkbox>
                <el-checkbox label="需求名称"></el-checkbox>
                <el-checkbox label="用例ID"></el-checkbox>
                <el-checkbox label="用例名称"></el-checkbox>
                <el-checkbox label="优先级"></el-checkbox>
            </el-checkbox-group>
            <el-table style="width: 100%" height="370" size="mini" stripe border ref="CasesTable">
                <el-table-column type="index" label="No." width="50"></el-table-column>
                <el-table-column label="需求编号" resizable></el-table-column>
                <el-table-column label="需求名称" resizable></el-table-column>
                <el-table-column label="用例ID" resizable></el-table-column>
                <el-table-column label="用例名称" resizable></el-table-column>
                <el-table-column label="优先级" resizable></el-table-column>
            </el-table>
        </el-tabs>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
@Component({
  components: {
  }
})
export default class EditCasesView extends Vue {

}
</script>