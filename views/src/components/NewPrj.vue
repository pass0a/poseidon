<template>
    <Modal
        v-model="showflag"
        width="420"
        :closable="false"
		:mask-closable="false">
        <p slot="header">
            <i class="el-icon-folder-opened"></i>
            <span>新建项目...</span>
        </p>
        <el-input placeholder="请输入项目名称..."></el-input>
        <span slot="footer">
            <el-button type="info" @click="cancel">取消</el-button>
            <el-button type="primary" @click="cancel">创建</el-button>
        </span>
    </Modal>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
@Component
export default class OpenPrj extends Vue {
    private newprj_name:any="";
    get showflag(){
        return this.$store.state.project_info.newflag;
    }
    private cancel(){
        this.$store.state.project_info.newflag=false;
    }
    private ok(){
        this.$store.state.project_info.current_prj=this.newprj_name;
        this.$store.state.project_info.newflag=false;
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
		font-size: 12px;
		margin: 4px 2px;
		cursor: pointer;
	}
</style>