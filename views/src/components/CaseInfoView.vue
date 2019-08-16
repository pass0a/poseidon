<template>
    <Modal
        v-model="showflag"
        width="650"
        :closable="false"
		:mask-closable="false">
        <p slot="header">
            <i class="el-icon-warning"></i>
            <span>{{ title }}</span>
        </p>
        <el-form :inline="true" label-position="right" ref="caseform" :model="case_info" :rules="caseValidate" label-width="80px" style="margin:0px 0px 0px 30px;" size="small">
            <el-form-item label="用例ID" prop="case_id">
                <el-input style="width:180px" placeholder="请输入" v-model="case_info.case_id" :disabled="title=='修改用例'"></el-input>
            </el-form-item>
            <el-form-item label="用例名称">
                <el-input style="width:180px" placeholder="请输入" v-model="case_info.case_name"></el-input>
            </el-form-item>
            <el-form-item label="所属模块" prop="case_module">
                <el-select style="width:180px" v-model="case_info.case_module" :disabled="title=='修改用例'">
                    <el-option v-for="val in ModuleData" :label="getResName(val)" :value="val" :key="val"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="测试次数">
                <el-input-number style="width:105px" v-model="case_info.case_mode" controls-position="right" :min="1" :max="100000"></el-input-number>
            </el-form-item>
            <el-form-item label="需求名称" v-if="expand">
                <el-input style="width:180px" placeholder="请输入" v-model="case_info.case_dam"></el-input>
            </el-form-item>
            <el-form-item label="需求编号" v-if="expand">
                <el-input style="width:180px" placeholder="请输入" v-model="case_info.case_num"></el-input>
            </el-form-item>
            <el-form-item label="前提条件" v-if="expand">
                <el-input type="textarea" style="width:454px" autosize placeholder="请输入" v-model="case_info.case_pre"></el-input>
            </el-form-item>
            <el-form-item label="操作步骤" v-if="expand">
                <el-input type="textarea" style="width:454px" autosize placeholder="请输入" v-model="case_info.case_op"></el-input>
            </el-form-item>
            <el-form-item label="预期结果" v-if="expand">
                <el-input type="textarea" style="width:454px" autosize placeholder="请输入" v-model="case_info.case_exp"></el-input>
            </el-form-item>
            <el-form-item label="备注" v-if="expand">
                <el-input type="textarea" style="width:454px" autosize placeholder="请输入" v-model="case_info.case_note"></el-input>
            </el-form-item>
            <el-form-item label="优先级" v-if="expand">
                <el-select style="width:100px" v-model="case_info.case_level">
                    <el-option v-for="val in case_level_list.keys()" :label="case_level_list.get(val)" :value="val" :key="val"></el-option>
                </el-select>
            </el-form-item>
        </el-form>
        <el-button type="text" :icon="expand?'el-icon-caret-top':'el-icon-caret-bottom'" style="margin:0px 0px 0px 500px;" @click="clickExpand()">{{expand?"收起部分":"展开更多"}}</el-button>
        <div>
            <span><font size="2"><strong>自动化测试步骤</strong></font></span>
            <StepsView/>
        </div>
        <span slot="footer">
            <el-button type="info" @click="cancel">取消</el-button>
            <el-button type="primary" @click="ok">确定</el-button>
        </span>
    </Modal>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import StepsView from "./StepsView.vue";
@Component({
  components: {
      StepsView
  }
})
export default class CaseInfoView extends Vue {
    private title:any="";
    private case_level_list:any=new Map([["1","低"],["2","中"],["3","高"]]);
    private expand:Boolean=false;
    private caseValidate:any={case_id:[{ required: true, message: '用例ID不能为空', trigger: 'blur' }],case_module:[{ required: true, message: '所属模块不能为空', trigger: 'blur' }]}
    private case_info:any={case_module:""};
    get showflag(){
        if(this.$store.state.case_info.showflag){
            this.title=this.$store.state.case_info.type?"修改用例":"新建用例";
            this.case_info=this.$store.state.case_info.type?JSON.parse(JSON.stringify(this.$store.state.case_info.data)):this.initCaseData();
            this.$store.state.steps_info.steplist=JSON.parse(JSON.stringify(this.case_info.case_steps));
        }else{
            if((this as any).$refs.caseform)(this as any).$refs.caseform.resetFields();
        }
        return this.$store.state.case_info.showflag;
    }
    get ModuleData(){
        if(this.$store.state.steps_info.rulelist.module)return this.$store.state.steps_info.rulelist.module;
        return [];
    }
    private getResName(id:any){
        let name = this.$store.state.steps_info.reslist[id];
        return name!=undefined?name:id+"(已删除)";
    }
    private initCaseData(){
        return {case_id:"",case_name:"",case_dam:"",case_num:"",case_module:"",case_mode:1,case_status:true,case_pre:"",case_op:"",case_exp:"",case_note:"",case_level:"",case_steps:[]};
    }
    private cancel(){
        (this as any).$refs.caseform.resetFields();
        this.$store.state.case_info.showflag=false;
    }
    private ok(){
        (this as any).$refs.caseform.validate((valid:any) => {
            if(valid){
                this.case_info.case_steps=this.$store.state.steps_info.steplist;
                this.$store.state.case_info.data=this.case_info;
                let req = {
                    type : "toDB",
                    route : "cases",
                    job : this.$store.state.case_info.type?"modify":"add",
                    info : {
                        prjname:this.$store.state.project_info.current_prj,
                        casedata:this.case_info
                    }
                }
                this.$store.state.app_info.pis.write(req);
            }
        });
    }
    private clickExpand(){
        this.expand=!this.expand;
    }
}
</script>