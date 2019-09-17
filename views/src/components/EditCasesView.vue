<template>
    <div>
        <el-link v-model="updateTableData" v-show="false"></el-link>
        <el-link v-model="updateCaselist" v-show="false"></el-link>
        <el-link v-model="testStatus" v-show="false"></el-link>
        <el-button-group style="margin:5px 0px 0px 10px;">
            <el-button plain icon="el-icon-plus" size="small" @click="addCase">新建用例</el-button>
            <el-button plain icon="el-icon-check" size="small" @click="changeAllCases(0)">当前全部开启</el-button>
            <el-button plain icon="el-icon-close" size="small" @click="changeAllCases(1)">当前全部关闭</el-button>
        </el-button-group>
        <el-tabs type="border-card" tab-position="bottom" style="margin:5px 10px 10px 10px;" v-model="current_case_module" @tab-click="select_module">
            <el-tab-pane v-for="it of ModuleData" :label="getResName(it)" :key="it" :name="it"></el-tab-pane>
            <el-checkbox-group style="margin:0px 0px 5px 0px" v-model="select_prop">
                <el-checkbox v-for="it in case_prop_id" :label="it" :key="it">{{case_prop_name[it]}}</el-checkbox>
            </el-checkbox-group>
            <el-table v-loading="tableLoading" :data="current_data" style="width: 100%" height="370" size="mini" stripe border ref="CasesTable">
                <el-table-column type="index" label="No." width="50"></el-table-column>
                <el-table-column v-for="it in isShowRow" :label="case_prop_name[it]" :key="it" :prop="it" resizable></el-table-column>
                <el-table-column prop="c_status" width="80" label="状态">
					<template slot-scope="scope">
						<el-button type="text" @click="changeCaseStatus(scope.$index)"><font size="2" :color="scope.row.c_status.length?'#67C23A':'#909399'">{{scope.row.c_status.length?'开启':'关闭'}}</font></el-button>
					</template>
				</el-table-column>
                <el-table-column label="操作" width="220">
					<template slot-scope="scope">
						<button class="button" @click="editCase(scope.$index)">修改</button>
						<button class="button" style="background-color:#4CAF50" @click="copyCase(scope.$index)">复制</button>
						<button class="button" style="background-color:#F56C6C" @click="deleteCase(scope.$index)">删除</button>
					</template>
				</el-table-column>
            </el-table>
        </el-tabs>
        <Modal
            v-model="copy_info.copyflag"
            width="450"
            :closable="false"
            :mask-closable="false">
            <p slot="header">
                <i class="el-icon-warning"></i>
                <span>复制</span>
            </p>
            <el-form label-position="right" ref="copyform" :model="copy_info" label-width="115px" size="small">
                <el-form-item label="复制对象 :">{{ copy_info.copyID }}</el-form-item>
                <el-form-item label="复制模式 :">
                    <el-radio-group v-model="copy_info.coypType">
                        <el-radio :label="0">全部信息</el-radio>
                        <el-radio :label="1">仅自动化步骤</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="复制到ID :" v-show="copy_info.coypType">
                    <el-input style="width:180px" placeholder="请输入用例ID" v-model="copy_info.caseID"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer">
                <el-button type="info" @click="copyCancel">取消</el-button>
                <el-button type="primary" v-show="!copy_info.loading" @click="copyOk">确定</el-button>
                <el-button type="primary" v-show="copy_info.loading" icon="el-icon-loading" disabled>复制中</el-button>
            </span>
        </Modal>
        <div><CaseInfoView/></div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import CaseInfoView from "./CaseInfoView.vue";
import { truncate } from 'fs';
@Component({
  components: {
      CaseInfoView
  }
})
export default class EditCasesView extends Vue {
    private case_module:any=this.$store.state.case_module;
    private case_prop_id:any=this.$store.state.case_prop_id;
    private case_prop_name:any=this.$store.state.case_prop_name;
    private select_prop:any=this.$store.state.init_checkbox;
    private current_data:any=[];
    private current_case_module:any="";
    private updateflag:any=0;
    private caselist:any=[];
    private current_editIdx:any=0;
    private test_status:any=false;
    private copy_info:any={copyflag:false, copyID:"", copy_steps:[], coypType:0, caseID:"", data:{}, loading:false};
    get isShowRow(){
        let rows:any=[];
        for(let i=0;i<this.case_prop_id.length;i++){
            if(this.select_prop.indexOf(this.case_prop_id[i])>-1)rows.push(this.case_prop_id[i]);
        }
        return rows;  
    }
    get tableLoading(){
        return this.$store.state.editcase_info.refresh_data;
    }
    get updateTableData(){
        let data=this.$store.state.editcase_info.data;
        this.caselist=[];
        if(data.length>0){
            let firstModule;
            for(let i=0;i<data.length;i++){
                if(this.caselist[data[i].case_module]==undefined)this.caselist[data[i].case_module]=[];
                if(i==0)firstModule=data[i].case_module;
                this.caselist[data[i].case_module].push(data[i]);
            }
            this.current_case_module=firstModule;
            this.current_data=this.caselist[firstModule];
        }else{
            let module_data = this.$store.state.steps_info.rulelist.module;
            if(module_data&&module_data.length){
                this.current_case_module=module_data[0];
                if(this.caselist[module_data[0]]==undefined)this.caselist[module_data[0]]=[];
                this.current_data=this.caselist[module_data[0]];
            }else{
                this.current_case_module="";
                this.current_data=[];
            }
        }
        return;
    }
    get updateCaselist(){
        if(this.$store.state.editcase_info.update_op){
            let module_op = this.$store.state.case_info.data.case_module;
            switch(this.$store.state.case_info.type){
                case 0:
                    if(this.caselist[module_op]==undefined)this.caselist[module_op]=[];
                    this.caselist[module_op].push(JSON.parse(JSON.stringify(this.$store.state.case_info.data)));
                    this.current_case_module = module_op;
                    this.current_data=this.caselist[module_op];
                    break;
                case 1:
                    let data_op=JSON.parse(JSON.stringify(this.$store.state.case_info.data));
                    let data_edit=this.caselist[module_op][this.current_editIdx];
                    for(let prop in data_edit){
                        data_edit[prop]=data_op[prop];
                    }
                    break;
                case 2:
                    let data_delete:any=this.caselist[module_op];
                    data_delete.splice(this.current_editIdx,1);
                    break;
                case 3:
                    if(!this.copy_info.coypType){
                        if(this.caselist[module_op]==undefined)this.caselist[module_op]=[];
                        this.caselist[module_op].push(JSON.parse(JSON.stringify(this.$store.state.case_info.data)));
                        this.current_case_module = module_op;
                        this.current_data=this.caselist[module_op];
                    }else{
                        this.copy_info.loading = false;
                        this.copy_info.copyflag = !this.$store.state.editcase_info.ret;
                    }
                    break;
            }
            this.$store.state.editcase_info.update_op=false;
        }
        return;
    }
    get testStatus(){
        this.test_status = this.$store.state.test_info.testing;
        return;
    }
    get ModuleData(){
        if(this.$store.state.steps_info.rulelist.module)return this.$store.state.steps_info.rulelist.module;
        return [];
    }
    private getResName(id:any){
        return this.$store.state.steps_info.reslist[id];
    }
    private select_module(){
        this.current_data=this.caselist[this.current_case_module];
        if(this.current_data==undefined)this.current_data=[];
    }
    private addCase(){
        this.$store.state.case_info.type = 0;
        this.$store.state.case_info.showflag=true;
    }
    private editCase(idx:any){
        this.current_editIdx = idx;
        this.$store.state.case_info.type = 1;
        this.$store.state.case_info.data = this.current_data[idx];
        this.$store.state.case_info.showflag=true;
    }
    private copyCase(idx:any){
        this.$store.state.case_info.type  = 3;
        this.copy_info.copyID = this.current_data[idx].case_id;
        if(this.copy_info.coypType){
            this.copy_info.copy_steps = this.current_data[idx].case_steps;
        }else{
            this.copy_info.data = this.current_data[idx];
        }
        this.copy_info.copyflag = true;
    }
    private deleteCase(idx:any){
        this.current_editIdx = idx;
        this.$store.state.alert_info.showflag = true;
        this.$store.state.alert_info.type = 2;
        this.$store.state.case_info.type  = 2;
        this.$store.state.case_info.data = this.current_data[idx];
        this.$store.state.alert_info.info = this.current_data[idx].case_id;
    }
    private copyCancel(){
        this.copy_info.copyflag = false;
    }
    private copyOk(){
        if(this.copy_info.coypType && this.copy_info.caseID == "")this.$notify({title: '内容不能为空',message:"",type: 'error',duration:1500});
        else{
            this.copy_info.loading = true;
            if(this.copy_info.coypType){
                let req = {
                    type : "toDB",
                    route : "cases",
                    job : "copy_steps",
                    info : {
                        prjname:this.$store.state.project_info.current_prj,
                        copy_steps:this.copy_info.copy_steps,
                        case_id:this.copy_info.caseID
                    }
                }
                this.$store.state.app_info.pis.write(req);
            }else{
                this.copy_info.copyflag = false;
                this.copy_info.loading = false;
                this.$store.state.case_info.data = this.copy_info.data;
                this.$store.state.case_info.showflag=true;
            }
        }
    }
    private changeCaseStatus(idx:any){
        let req = {
            type : "toDB",
            route : "status",
            job : this.current_data[idx].c_status.length?"delete":"add",
            info : {
                prjname:this.$store.state.project_info.current_prj,
                module:this.current_data[idx].case_module,
                cid:this.current_data[idx]._id,
                uid:this.$store.state.login_info._id
            }
        }
        this.$store.state.app_info.pis.write(req);
        this.current_data[idx].c_status=this.current_data[idx].c_status.length?[]:[{type:1}];
    }
    private changeAllCases(type:number){
        let changeList:Array<string> = [];
        for(let i=0;i<this.current_data.length;i++){
            if(!type){
                if(!this.current_data[i].c_status.length){
                    this.current_data[i].c_status = [{type:1}];
                    changeList.push(this.current_data[i]._id);
                }
            }else{
                if(this.current_data[i].c_status.length){
                    this.current_data[i].c_status = [];
                    changeList.push(this.current_data[i]._id);
                }
            }
        }
        if(changeList.length>0){
            let req:any = {type : "toDB",route : "status",job:"",info:{}};
            if(!type){
                req.job = "module_add";
                req.info = {prjname:this.$store.state.project_info.current_prj, module:this.current_case_module, uid:this.$store.state.login_info._id,changelist:changeList};
            }else{
                req.job = "module_delete";
                req.info = {prjname:this.$store.state.project_info.current_prj, module:this.current_case_module, uid:this.$store.state.login_info._id}
            }
            console.log(req);
            this.$store.state.app_info.pis.write(req);
        }
        
    }
}
</script>
<style>
.button {
	background-color:#409EFF;
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
