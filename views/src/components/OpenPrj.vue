<template>
    <Modal
        v-model="showflag"
        width="420"
        :closable="false"
		:mask-closable="false">
        <p slot="header">
            <i class="el-icon-folder-opened"></i>
            <span>打开项目...</span>
        </p>
        <el-table :data="prjlist" height="200" size="mini" stripe border ref="prjtable">
            <el-table-column prop="name" label="项目名"></el-table-column>
            <el-table-column label="操作" width="150">
                <template slot-scope="scope">
                    <button class="button" @click="openPrj(scope.row.name)">打开</button>
                </template>
            </el-table-column>
        </el-table>
        <span slot="footer">
            <el-button type="info" @click="cancel">取消</el-button>
        </span>
    </Modal>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
@Component
export default class OpenPrj extends Vue {
    get showflag(){
        return this.$store.state.project_info.openflag;
    }
    get prjlist(){
        return this.$store.state.project_info.prjlist;
    }
    private cancel(){
        this.$store.state.project_info.openflag=false;
    }
    private openPrj(prjname:any){
        if(this.$store.state.project_info.current_prj!=prjname){
            this.$store.state.project_info.current_prj=prjname;
            this.$store.state.editcase_info.refresh_data=true;
            this.$store.state.app_info.type="readStopinfo";
            this.$store.state.app_info.reqCount++;
        }
        this.$store.state.project_info.openflag=false;
    }
}
</script>
<style>
.button {
		background-color: #008CBA;
		border: none;
		border-radius: 4px;
		color: white;
		padding: 3px 12px;
		text-align: center;
		text-decoration: none;
		display: inline-block;
		font-size: 8px;
		margin: 4px 2px;
		cursor: pointer;
	}
</style>