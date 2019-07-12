<template>
    <div style="margin:5px 5px 0px 0px;">
        <el-link v-model="clearInfo" v-show="false"></el-link>
        <el-link v-model="ResList" v-show="false"></el-link>
        <el-link v-model="RuleList" v-show="false"></el-link>
        <el-link v-model="StepList" v-show="false"></el-link>
        <ul v-for="(it,idx) in steplist" :key="idx">
            <div v-show="idx==s_idx&&s_op>1">
                <el-select placeholder="请选择" filterable size="small" style="width:100px" v-model="s_action" @change="changeSel(0)">
                    <el-option v-for="val in Action" :key="val" :label="getResName(val)" :value="val"></el-option>
                </el-select>
                <el-select placeholder="请选择" filterable size="small" style="width:75px" v-model="s_clicktype" v-show="showClickType(s_action)">
                    <el-option v-for="val in clickType.keys()" :label="clickType.get(val)" :value="val" :key="val"></el-option>
                </el-select>
                <el-input-number v-model="s_clicktime" style="width:100px" controls-position="right" :min="1500" size="small" v-show="showClickTime(s_clicktype)"></el-input-number>
                <el-select placeholder="请选择" filterable size="small" style="width:140px" v-model="s_module" v-show="s_action!=waitType" @change="changeSel(1)">
                    <el-option v-for="val in Module" :key="val" :label="getResName(val)" :value="val"></el-option>
                </el-select>
                <el-select placeholder="请选择" filterable clearable  size="small" style="width:155px" v-model="s_clid" v-show="s_action!=waitType" @change="changeSel(2)">
                    <el-option v-for="val in Clid" :key="val" :label="getResName(val)" :value="val"></el-option>
                </el-select>
                <el-input-number v-model="s_wait" controls-position="right" :min="0" size="small" v-show="s_action==waitType"></el-input-number>
                <button class="steps_button" @click="onSetWait" v-show="s_action==waitType">确定</button>
                <button class="steps_button" style="background-color:#606266"  @click="initOp">取消</button>
            </div>
            <div v-show="idx!=s_idx||s_op==1||s_op==3">
                <span><font size="2">{{ showStep(it) }}</font></span>
                <a @click.prevent="showEditBtn(1,idx)">
                    <i class="el-icon-edit"></i>
                </a>
                <span v-show="idx==s_idx&&s_op==1">
                    <Button type="primary" size="small" @click="editStep(0,idx,it)">修改</Button>
                    <Button type="success" size="small" @click="editStep(1,idx)">插入</Button>
                    <Button type="error" size="small" @click="editStep(2,idx)">删除</Button>
                    <Button type="warning" size="small" @click="showEditBtn(0)">取消</Button>
                </span>
            </div>
        </ul>
        <div v-show="s_op==0">
            <el-select placeholder="请选择" filterable size="small" style="width:100px" v-model="s_action" @change="changeSel(0)">
                <el-option v-for="val in Action" :key="val" :label="getResName(val)" :value="val"></el-option>
            </el-select>
            <el-select placeholder="请选择" filterable size="small" style="width:75px" v-model="s_clicktype" v-show="showClickType(s_action)">
                <el-option v-for="val in clickType.keys()" :label="clickType.get(val)" :value="val" :key="val"></el-option>
            </el-select>
            <el-input-number v-model="s_clicktime" style="width:100px" controls-position="right" :min="1500" size="small" v-show="showClickTime(s_clicktype)"></el-input-number>
            <el-select placeholder="请选择" filterable size="small" style="width:140px" v-model="s_module" v-show="s_action!=waitType" @change="changeSel(1)">
                <el-option v-for="val in Module" :key="val" :label="getResName(val)" :value="val"></el-option>
            </el-select>
            <el-select placeholder="请选择" filterable clearable  size="small" style="width:155px" v-model="s_clid" v-show="s_action!=waitType" @change="changeSel(2)">
                <el-option v-for="val in Clid" :key="val" :label="getResName(val)" :value="val"></el-option>
            </el-select>
            <el-input-number v-model="s_wait" controls-position="right" :min="0" size="small" v-show="s_action==waitType"></el-input-number>
            <button class="steps_button" @click="onSetWait" v-show="s_action==waitType">确定</button>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
@Component
export default class StepsView extends Vue {
    private reslist:any;
    private rulelist:any;
    private Action:any=[];
    private s_action:string="";
    private s_module:string="";
    private s_clicktype:string="0";
    private s_clicktime:Number=1500;
    private s_clid:string="";
    private s_wait:Number=100;
    private s_op:Number=0;
    private s_idx:any=-1;
    private steplist:any=[];
    private waitType:string="wait";
    private clickType:any=new Map([["0","短按"],["1","长按"]]);
    get clearInfo(){
        if(this.$store.state.case_info.showflag){
            this.initOp();
        }
        return;
    }
    get ResList(){
        this.reslist=this.$store.state.steps_info.reslist;
        return;
    }
    get RuleList(){
        this.rulelist=this.$store.state.steps_info.rulelist;
        this.Action=this.$store.state.steps_info.rulelist.action;
        return;
    }
    get StepList(){
        this.steplist=this.$store.state.steps_info.steplist;
        return;
    }
    get Module(){
        return this.rulelist[this.s_action]!=undefined?this.rulelist[this.s_action]:[];
    }
    get Clid(){
        return this.rulelist[this.s_module]!=undefined?this.rulelist[this.s_module]:[];
    }
    private getResName(id:any){
        return this.reslist[id];
    }
    private changeSel(flag:Number){
        switch(flag){
            case 0:
                this.s_module="";
                this.s_clid="";
                this.s_clicktype="0";
                this.s_clicktime=1500;
                break;
            case 1:
                this.s_clid="";
                break;
            case 2:
                if(this.s_clid!=undefined){
                    let obj:any = {action:this.s_action,module:this.s_module,id:this.s_clid};
                    if(this.s_action=="button"){
                        obj["click_type"]=this.s_clicktype;
                        obj["click_time"]=this.s_clicktime;
                    }
                    if(this.s_op==0)this.steplist.push(obj);
                    else if(this.s_op==2)this.steplist[this.s_idx]=obj;
                    else if(this.s_op==3)this.steplist.splice(this.s_idx,0,obj);
                    if(this.s_op!=0)this.initOp();
                }
                break;
        }
    }
    private onSetWait(){
        if(this.s_wait==undefined)this.s_wait=100;
        let obj = {action:"wait",time:this.s_wait};
        if(this.s_op==0)this.steplist.push(obj);
        else if(this.s_op==2)this.steplist[this.s_idx]=obj;
        else if(this.s_op==3)this.steplist.splice(this.s_idx,0,obj);
        this.initOp();
    }
    private initOp(){
        this.s_action="";
        this.s_module="";
        this.s_clid="";
        this.s_clicktype="0";
        this.s_clicktime=1500;
        this.s_op=0;
        this.s_idx=-1;
        this.s_wait=100;
    }
    private showStep(it:any){
        let action=this.getResName(it.action);
        if(it.action=="button"&&it.click_type=="1")action+=" [长按:"+it.click_time+"ms]";
        let content=it.time!=undefined?it.time+"毫秒":" ["+this.getResName(it.module)+"] "+this.getResName(it.id);
        return action+" ==> "+content;
    }
    private showClickType(act:any){
        if(act=="button")return true;
        return false;
    }
    private showClickTime(clicktype:any){
        if(clicktype=="1")return true;
        return false;
    }
    private showEditBtn(flag:number,idx:number){
        if(flag){
            this.s_idx=idx;
            this.s_op=1;
        }else{
            this.s_op=0;
            this.s_idx=-1;
        }
    }
    private editStep(type:number,idx:number,item?:any){
        switch(type){
            case 0:
                this.s_op=2;
                this.s_idx=idx;
                this.s_action=item.action;
                if(this.s_action==this.waitType){
                    this.s_wait=item.time;
                }else{
                    this.s_module=item.module;
                    this.s_clid=item.id;
                    if(item.action=="button"&&item.click_type=="1"){
                        this.s_clicktype=item.click_type;
                        this.s_clicktime=item.click_time;
                    }
                }
                break;
            case 1:
                this.s_op=3;
                this.s_idx=idx;
                this.s_action="";
                this.s_module="";
                this.s_clid="";
                break;
            case 2:
                this.steplist.splice(idx,1);
                this.s_op=0;
                this.s_idx=-1;
                break;
        }
    }
}
</script>
<style>
.steps_button {
	background-color:#67C23A;
	border: none;
    border-radius: 4px;
    color: white;
    padding: 3px 12px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 14px;
    margin: 4px 2px;
    cursor: pointer;
}
</style>