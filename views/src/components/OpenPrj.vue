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
            <el-table-column label="操作" width="200">
                <template slot-scope="scope">
                    <!-- <button class="button" v-show="!openStatus" @click="openPrj(scope.row.name)">打开</button>
                    <button class="button" v-show="openStatus">打开中...</button>
                    <button class="button" style="background-color:#F56C6C" @click="deletePrj(scope.row.name)">删除</button> -->
                    <el-button type="primary" size="mini" v-if="!openStatus || openIdx!=scope.$index" @click="openPrj(scope.row.name,scope.$index)">打开</el-button>
                    <el-button type="primary" size="mini" v-else icon="el-icon-loading" disabled>打开中...</el-button>
                    <el-button type="danger" size="mini" @click="deletePrj(scope.row.name)">删除</el-button>
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
    private openStatus = false;
    private openIdx = -1;
    get showflag(){
        if(!this.$store.state.project_info.openflag)this.openStatus = false;
        return this.$store.state.project_info.openflag;
    }
    get prjlist(){
        return this.$store.state.project_info.prjlist;
    }
    private cancel(){
        this.$store.state.project_info.openflag=false;
    }
    private openPrj(prjname:any,idx:any){
        if(this.$store.state.project_info.current_prj!=prjname){
            this.openIdx = idx;
            this.openStatus = true;
            this.$store.state.app_info.pis.write({type:"toDB",route:"rule",job:"check_version",info:{prjname:prjname}});
        }else this.$store.state.project_info.openflag=false;
    }
    private deletePrj(prjname:any){
        this.$store.state.alert_info.showflag = true;
        this.$store.state.alert_info.type = 6;
        this.$store.state.alert_info.info = prjname;
    }
}
</script>