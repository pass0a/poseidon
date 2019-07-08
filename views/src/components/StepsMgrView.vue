<template>
    <div>
        <el-link v-model="ResList" v-show="false"></el-link>
        <el-link v-model="RuleList" v-show="false"></el-link>
        <el-link v-model="updateShowflage" v-show="false"></el-link>
        <el-tabs type="border-card" style="margin:5px 10px 10px 10px;" v-model="actionName" @tab-click="clickAction()">
			<el-tab-pane v-for="it in actionList" :name="it" :key="it" :label="getResName(it)"></el-tab-pane>
            <el-button-group style="margin:0px 0px 10px 0px;" v-show="actionName.length>1">
                <el-button plain icon="el-icon-plus" size="small" @click="addID(0)">添加二级选项</el-button>
                <el-button plain icon="el-icon-plus" size="small" @click="addID(1)">添加三级选项</el-button>
            </el-button-group>
            <el-tabs tab-position="left" v-model="moduleName" @tab-click="clickModule()">
				<el-tab-pane v-for="it in Module" :name="it" :key="it" :label="getResName(it)"></el-tab-pane>
                <el-table :data="TableData" style="width: 100%" height="370" size="mini" stripe border ref="stepsTable" :empty-text="emptyText()">
                    <el-table-column prop="id" label="名称">
                        <template slot-scope="scope">
                            <span  v-if="scope.row">{{ getResName(scope.row.id) }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="id" label="ID"></el-table-column>
                </el-table>
            </el-tabs>
        </el-tabs>
        <Modal
            v-model="showflag"
            width="450"
            :closable="false"
            :mask-closable="false">
            <p slot="header">
                <i class="el-icon-warning"></i>
                <span>{{ title }}</span>
            </p>
            <el-form :inline="true" label-position="right" ref="caseform" :model="add_info" :rules="idValidate" label-width="110px" size="small">
                <el-form-item label="所属动作" prop="action">
                    <el-select style="width:180px" v-model="add_info.action" @change="changeAction()">
                        <el-option v-for="val in actionList" :label="getResName(val)" :value="val" :key="val"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="所属二级选项" prop="module" v-if="add_type">
                    <el-select style="width:180px" v-model="add_info.module">
                        <el-option v-for="val in moduleList" :label="getResName(val)" :value="val" :key="val"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="名称" prop="name">
                    <el-input style="width:180px" placeholder="请输入" v-model="add_info.name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer">
                <el-button type="info" @click="cancel">取消</el-button>
                <el-button type="primary" v-show="!loading" @click="ok">添加</el-button>
                <el-button type="primary" v-show="loading" icon="el-icon-loading" disabled>添加中</el-button>
            </span>
        </Modal>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
@Component
export default class StepsMgrView extends Vue {
    private actionList:any=["click","assert_pic"];
    private actionName:any="";
    private moduleName:any="";
    private reslist:any;
    private rulelist:any;
    private current_data:any=[];
    private showflag:Boolean=false;
    private add_type:any=0;
    private title:any="";
    private count:any=0;
    private loading:Boolean = false;
    private add_info:any={action:"",module:"",name:""};
    private idValidate:any={
        action:[{ required: true, message: '所属动作不能为空', trigger: 'change' }],
        name:[{ required: true, message: '名称不能为空', trigger: 'blur' }],
        module:[{ required: true, message: '所属二级选项不能为空', trigger: 'change' }]
    }
    get ResList(){
        this.reslist=this.$store.state.steps_info.reslist;
        return;
    }
    get RuleList(){
        this.rulelist=this.$store.state.steps_info.rulelist;
        return;
    }
    get Module(){
        return this.rulelist[this.actionName]!=undefined?this.rulelist[this.actionName]:[];
    }
    get moduleList(){
        return this.rulelist[this.add_info.action]!=undefined?this.rulelist[this.add_info.action]:[];
    }
    get TableData(){
        if(this.moduleName.length>1){
            let rl = this.rulelist[this.moduleName];
            if(rl!=undefined){
                let content=[];
                for(let i=0;i<rl.length;i++){
                    content.push({id:rl[i]});
                }
                return content;
            }
        }
        return [];
    }
    get updateShowflage(){
        if(this.$store.state.id_info.count>this.count){
            let a_tmp = this.actionName;
            let m_tmp = this.moduleName;
            this.actionName = "";
            this.moduleName = "";
            this.actionName = a_tmp;
            this.moduleName = m_tmp;
            this.loading = false;
            this.cancel();
        }
        return;
    }
    private clickAction(){
        let rl = this.rulelist[this.actionName];
        if(rl!=undefined){
            if(rl.length){
                this.moduleName = rl[0];
            }
        }else this.moduleName = "";
    }
    private clickModule(){
        
    }
    private changeAction(){
        this.add_info.module = "";
    }
    private addID(type:number){
        this.count = this.$store.state.id_info.count;
        this.showflag = true;
        this.add_type = type;
        switch(type){
            case 0:
                this.add_info.action = this.actionName;
                this.title="添加二级选项";
                break;
            case 1:
                this.add_info.action = this.actionName;
                this.add_info.module = this.moduleName;
                this.title="添加三级选项";
                break;
        }
    }
    private ok(){
        (this as any).$refs.caseform.validate((valid:any) => {
            if(valid){
                this.loading = true;
                this.$store.state.id_info.info={
                    id:this.add_type?this.add_info.module:this.add_info.action,
                    name:this.add_info.name
                }
                this.setSeq("rule","add");
            }
        });
    }
    private cancel(){
        (this as any).$refs.caseform.resetFields();
        this.add_info.module = "";
        this.showflag = false;
    }
    private getResName(id:any){
        return this.reslist[id];
    }
    private emptyText(){
        return this.actionName.length>1?"暂无数据":"请选择动作";
    }
    private setSeq(route:any,job:any){
        this.$store.state.app_info.type="toDB";
        this.$store.state.app_info.route=route;
        this.$store.state.app_info.job=job;
        this.$store.state.app_info.reqCount++;
    }
}
</script>