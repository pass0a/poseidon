<template>
    <div>
        <el-link v-model="ButtonList" v-show="false"></el-link>
        <el-link v-model="updateShowflage" v-show="false"></el-link>
        <el-tabs type="border-card" style="margin:5px 10px 10px 10px;" v-model="actionName" @tab-click="clickAction()">
			<el-tab-pane v-for="it in actionList" :name="it" :key="it" :label="getResName(it)"></el-tab-pane>
            <el-button-group style="margin:0px 0px 10px 0px;" v-show="actionName.length>1&&actionName!='button'">
                <el-button plain icon="el-icon-plus" size="small" @click="addID(0)">添加二级选项</el-button>
                <el-button plain icon="el-icon-plus" size="small" @click="addID(1)">添加三级选项</el-button>
            </el-button-group>
            <el-button style="margin:0px 0px 10px 0px;" plain icon="el-icon-plus" size="small" @click="addID(2)" v-show="actionName.length>1&&actionName=='button'">添加硬按键</el-button>
            <el-tabs tab-position="left" v-model="moduleName" @tab-click="clickModule()">
				<el-tab-pane v-for="it in Module" :name="it" :key="it">
                    <span slot="label">
                        {{getResName(it)}}  
                        <a @click.prevent="editID(it)" v-if="showEditIcon(it)">
                            <i class="el-icon-edit"></i>
                        </a>
                        <a @click.prevent="deleteID(1,it)" v-if="showEditIcon(it)">
                            <i class="el-icon-delete"></i>
                        </a>
                    </span>
                </el-tab-pane>
                <el-table :data="TableData" style="width: 100%" height="370" size="mini" stripe border ref="stepsTable" :empty-text="emptyText()">
                    <el-table-column prop="id" label="名称">
                        <template slot-scope="scope">
                            <span v-if="scope.row">{{ getResName(scope.row.id) }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="id" label="ID"></el-table-column>
                    <el-table-column label="操作" width="150">
                        <template slot-scope="scope">
                            <button class="button" @click="editID(scope.row.id)">修改</button>
                            <button class="button" style="background-color:#F56C6C" @click="deleteID(0,scope.row.id)">删除</button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-tabs>
        </el-tabs>
        <Modal
            v-model="showflag"
            :width="add_info.action=='group'?650:500"
            :closable="false"
            :mask-closable="false">
            <p slot="header">
                <i class="el-icon-warning"></i>
                <span>{{ title }}</span>
            </p>
            <el-form label-position="right" ref="caseform" :model="add_info" :rules="idValidate" label-width="115px" size="small">
                <el-form-item label="所属动作 :" prop="action">
                    <el-select style="width:180px" v-model="add_info.action" @change="changeAction()">
                        <el-option v-for="val in actionList" :label="getResName(val)" :value="val" :key="val"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="所属二级选项 :" prop="module" v-if="add_type">
                    <el-select style="width:180px" v-model="add_info.module">
                        <el-option v-for="val in moduleList" :label="getResName(val)" :value="val" :key="val"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="名称 :" prop="name">
                    <el-input style="width:180px" placeholder="请输入" v-model="add_info.name"></el-input>
                </el-form-item>
                <div v-if="add_info.action=='button'">
                    <el-form-item label="Event :" prop="event">
                        <el-input style="width:180px" placeholder="请输入" v-model="add_info.event"></el-input>
                    </el-form-item>
                    <el-form-item label="按下事件 :">
                        <el-input style="width:220px" placeholder="请输入事件" v-model="add_info.event_down_1"></el-input>
                        <el-input style="width:220px" placeholder="请输入事件" v-model="add_info.event_down_2"></el-input>
                    </el-form-item>
                    <el-form-item label="抬起事件 :">
                        <el-input style="width:220px" placeholder="请输入事件" v-model="add_info.event_up_1"></el-input>
                        <el-input style="width:220px" placeholder="请输入事件" v-model="add_info.event_up_2"></el-input>
                    </el-form-item>
                </div>
                <div v-if="add_info.action=='group'&&add_type">
                    <span><font size="2">步骤组合</font></span>
                    <StepsView/>
                </div>
            </el-form>
            <span slot="footer">
                <el-button type="info" @click="cancel">取消</el-button>
                <el-button type="primary" v-show="!loading" @click="ok">添加</el-button>
                <el-button type="primary" v-show="loading" icon="el-icon-loading" disabled>添加中</el-button>
            </span>
        </Modal>
        <Modal
            v-model="editflag"
            :width="actionName=='group'?650:400"
            :closable="false"
            :mask-closable="false">
            <p slot="header">
                <i class="el-icon-warning"></i>
                <span>修改</span>
            </p>
            <el-form label-position="right" ref="editform" :model="edit_info" :rules="editVal" label-width="115px" size="small">
                <el-form-item label="名称 :" prop="name">
                    <el-input style="width:180px" placeholder="请输入" v-model="edit_info.name"></el-input>
                </el-form-item>
                <div v-if="actionName=='button'">
                    <el-form-item label="Event :" prop="event">
                        <el-input style="width:180px" placeholder="请输入" v-model="edit_info.event"></el-input>
                    </el-form-item>
                    <el-form-item label="按下事件 :">
                        <el-input style="width:220px" placeholder="请输入事件" v-model="edit_info.event_down_1"></el-input>
                        <el-input style="width:220px" placeholder="请输入事件" v-model="edit_info.event_down_2"></el-input>
                    </el-form-item>
                    <el-form-item label="抬起事件 :">
                        <el-input style="width:220px" placeholder="请输入事件" v-model="edit_info.event_up_1"></el-input>
                        <el-input style="width:220px" placeholder="请输入事件" v-model="edit_info.event_up_2"></el-input>
                    </el-form-item>
                </div>
                <div v-if="actionName=='group'">
                    <span><font size="2">步骤组合</font></span>
                    <StepsView/>
                </div>
            </el-form>
            <span slot="footer">
                <el-button type="info" @click="editCancel">取消</el-button>
                <el-button type="primary" v-show="!loading" @click="editOk">保存</el-button>
                <el-button type="primary" v-show="loading" icon="el-icon-loading" disabled>保存中</el-button>
            </span>
        </Modal>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import StepsView from "./StepsView.vue";
@Component({
  components: {
      StepsView
  }
})
export default class StepsMgrView extends Vue {
    private actionList:any=["click","assert_pic","button","group"];
    private actionName:any=this.actionList[0];
    private moduleName:any="";
    private rulelist:any;
    private buttonlist:any;
    private current_data:any=[];
    private showflag:boolean = false;
    private editflag:boolean = false;
    private add_type:any=0;
    private title:any="";
    private count:any=0;
    private loading:boolean = false;
    private add_info:any= {action:"",module:"",name:"",event:"/dev/input/event1",event_down_1:"",event_down_2:"",event_up_1:"",event_up_2:"",grouplist:[]};
    private edit_info:any = {id:"",name:"",event:"",event_down_1:"",event_down_2:"",event_up_1:"",event_up_2:""};
    private idValidate:any={
        action:[{ required: true, message: '所属动作不能为空', trigger: 'blur' }],
        name:[{ required: true, message: '名称不能为空', trigger: 'blur' }],
        module:[{ required: true, message: '所属二级选项不能为空', trigger: 'blur' }],
        event:[{ required: true, message: 'Event不能为空', trigger: 'blur' }]
    };
    private editVal:any={
        name:[{ required: true, message: '名称不能为空', trigger: 'blur' }],
        event:[{ required: true, message: 'Event不能为空', trigger: 'blur' }]
    };
    private leak:any={group:"组合步骤"};
    get ButtonList(){
        this.buttonlist=this.$store.state.steps_info.buttonlist;
        return;
    }
    get Module(){
        this.rulelist=this.$store.state.steps_info.rulelist;
        if(this.moduleName==""||this.moduleName==0){
            if(this.rulelist[this.actionName]!=undefined&&this.rulelist[this.actionName].length){
                this.moduleName = this.rulelist[this.actionName][0];
            }
        }
        return this.rulelist[this.actionName]!=undefined?this.rulelist[this.actionName]:[];
    }
    get moduleList(){
        return this.rulelist[this.add_info.action]!=undefined?this.rulelist[this.add_info.action]:[];
    }
    get TableData(){
        if(this.moduleName.length>1){
            let rl = this.$store.state.steps_info.rulelist[this.moduleName];
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
    private showEditIcon(id:any){
        return id.indexOf("button")>-1?false:true;
    }
    private clickAction(){
        let rl = this.rulelist[this.actionName];
        if(rl!=undefined){
            if(rl.length){
                this.moduleName = rl[0];
            }else{
                this.moduleName = "";
            }
        }else this.moduleName = "";
    }
    private clickModule(){  
    }
    private changeAction(){
        this.add_info.module = "";
    }
    private editID(id:any){
        this.edit_info.id = id;
        this.edit_info.name = this.getResName(id);
        if(id.indexOf("button")>-1){
            let btn = this.buttonlist[id];
            this.edit_info.event = btn.event;
            this.edit_info.event_down_1 =btn.event_down_1;
            this.edit_info.event_down_2 =btn.event_down_2;
            this.edit_info.event_up_1 =btn.event_up_1;
            this.edit_info.event_up_2 =btn.event_up_2;
        }else if(id.indexOf("group")>-1){
            this.$store.state.steps_info.steplist=JSON.parse(JSON.stringify(this.$store.state.steps_info.grouplist[id]));
        }
        this.editflag = true;
    }
    private deleteID(type:number,id:any){
        this.$store.state.alert_info.showflag = true;
        this.$store.state.alert_info.type = 4;
        this.$store.state.alert_info.info = {
            type : type,
            id : id,
            pid : type?this.actionName:this.moduleName
        };
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
                if(this.actionName=="group")this.$store.state.steps_info.steplist=[];
                this.title="添加三级选项";
                break;
            case 2:
                this.add_info.action = this.actionName;
                this.title="添加三级选项";
                break;
        }
    }
    private ok(){
        (this as any).$refs.caseform.validate((valid:any) => {
            if(valid){
                this.loading = true;
                let req:any = {name:this.add_info.name};
                switch(this.add_type){
                    case 0:
                        req.id = this.add_info.action;
                        break;
                    case 1:
                        req.id = this.add_info.module;
                        if(this.add_info.action=="group"){
                            req.pid =  this.add_info.module;
                            this.add_info.grouplist = JSON.stringify(this.$store.state.steps_info.steplist);
                            req.grouplist = this.add_info.grouplist;
                        }
                        break;
                    case 2:
                        req.id = this.add_info.module;
                        req.event = this.add_info.event;
                        req.content = [[this.add_info.event_down_1,this.add_info.event_down_2],[this.add_info.event_up_1,this.add_info.event_up_2]];
                        break;
                }
                this.sendReq("rule","add",req);
            }
        });
    }
    private cancel(){
        (this as any).$refs.caseform.resetFields();
        this.add_info.module = "";
        this.showflag = false;
    }
    private editOk(){
        (this as any).$refs.editform.validate((valid:any) => {
            if(valid){
                this.loading = true;
                this.sendReq("res","modify",{ id:this.edit_info.id,name:this.edit_info.name });
                if(this.edit_info.id.indexOf("button")>-1){
                    let msg = {
                        id : this.edit_info.id,
                        event : this.edit_info.event,
                        content : [[this.edit_info.event_down_1,this.edit_info.event_down_2],[this.edit_info.event_up_1,this.edit_info.event_up_2]]
                    }
                    this.sendReq("buttons","modify",msg);
                }
                else if(this.edit_info.id.indexOf("group")>-1){
                    let m_cont = JSON.stringify(this.$store.state.steps_info.steplist);
                    this.sendReq("group","modify",{id:this.edit_info.id,grouplist:m_cont});
                }
                this.editflag = false;
            }
        });
    }
    private editCancel(){
        (this as any).$refs.caseform.resetFields();
        this.editflag = false;
    }
    private getResName(id:any){
        let name = this.$store.state.steps_info.reslist[id];
        return name?name:this.leak[id];
    }
    private emptyText(){
        return this.actionName.length>1?"暂无数据":"请选择动作";
    }
    private sendReq(route:any,job:any,msg:any){
        let req = {
            type : "toDB",
            route : route,
            job : job,
            info : {
                prjname : this.$store.state.project_info.current_prj,
                msg : msg
            }
        }
        this.$store.state.app_info.pis.write(req);
    }
}
</script>