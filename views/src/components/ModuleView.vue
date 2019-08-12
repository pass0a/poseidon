<template>
    <div>
        <el-link v-model="updateModule" v-show="false"></el-link>
        <el-button-group style="margin:10px 0px 5px 10px;">
            <el-button plain icon="el-icon-plus" size="small" @click="addModule">新增模块</el-button>
        </el-button-group>
        <el-card class="box-card" shadow="never" style="margin:5px 10px 10px 10px;">
            <el-table :data="data" style="width: 100%" height="370" size="mini" stripe border ref="ModuleTable" @cell-dblclick="cellDbClick" @cell-click="cellClick">
                <el-table-column prop="id" label="ID [ 不可修改 ]"></el-table-column>
                <el-table-column prop="name" label="名称 [ 双击可修改 ]">
                    <template slot-scope="{row}">
                        <span v-if="row.idx!=idx">{{row.name}}</span>
                        <el-input v-if="row.idx==idx" @blur="saveEdit(row)" v-model="row.name" placeholder="请输入内容" style="width:220px"></el-input>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="100">
                    <template slot-scope="scope">
                        <button class="button" style="background-color:#F56C6C" @click="deleteModule(scope.row.id)">删除</button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        <Modal
        v-model="showflag"
        width="280"
        :closable="false"
		:mask-closable="false">
        <p slot="header">
            <i class="el-icon-plus"></i>
            <span>新增模块...</span>
        </p>
        <el-input v-model="new_name" placeholder="请输入模块名称..."></el-input>
        <span slot="footer">
            <el-button type="info" size="small" @click="cancel">取消</el-button>
            <el-button type="primary" size="small" @click="ok">添加</el-button>
        </span>
    </Modal>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
@Component
export default class ModuleView extends Vue {
    private data:any=[];
    private isEdit:any=[];
    private idx:any=-1;
    private name:string="";
    private new_name:string="";
    private showflag:boolean=false;
    get updateModule(){
        if(this.$store.state.module_info.enter>0){
            this.data = [];
            let m_idx = 0;
            if(this.$store.state.steps_info.rulelist.module&&this.$store.state.steps_info.rulelist.module.length){
                for(let it of this.$store.state.steps_info.rulelist.module){
                    this.data.push({id:it,name:this.$store.state.steps_info.reslist[it],idx:m_idx++});
                }
            }
        }
        return;
    }
    private cellDbClick(row:any, column:any){
        if(column.property == "name"){
            this.idx = row.idx;
            this.name = row.name;
        }
    }
    private cellClick(row:any, column:any){
        if(this.idx != row.idx)this.idx = -1;
    }
    private saveEdit(row:any){
        this.idx = -1;
        if(row.name == ""){
            row.name = this.name;
            this.$notify({title: '名称不能为空',message: '', type: 'error',duration:1500});
        }
        else if(row.name != this.name){
            this.sendSeq("res","modify",{id:row.id,name:row.name});
        }   
    }
    private addModule(){
        this.new_name = "";
        this.showflag = true;
    }
    private cancel(){
        this.showflag = false;
    }
    private ok(){
        this.sendSeq("rule","add",{id:"module",name:this.new_name});
        this.showflag = false;
    }
    private deleteModule(id:any){
        this.$store.state.alert_info.showflag = true;
        this.$store.state.alert_info.type = 5;
        this.$store.state.alert_info.info.type = 0;
        this.$store.state.alert_info.info.id = id;
        this.$store.state.alert_info.info.pid = "module";
    }
    private sendSeq(route:any,job:any,msg:any){
        let req = {
            type : "toDB",
            route : route,
            job : job,
            info : {
                prjname : this.$store.state.project_info.current_prj,
                msg : msg
            }
        }
        this.$store.state.app_info.pis.push(req);
    }
}
</script>