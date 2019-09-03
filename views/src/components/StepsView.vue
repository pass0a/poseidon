<template>
    <div style="margin:5px 5px 0px 0px;">
        <el-link v-model="clearInfo" v-show="false"></el-link>
        <el-link v-model="ActList" v-show="false"></el-link>
        <el-link v-model="StepList" v-show="false"></el-link>
        <ul v-for="(it,idx) in steplist" :key="idx">
            <div v-show="idx==s_idx&&(s_op>1&&s_op<4)">
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
                <el-input-number v-model="s_box" style="width:130px" controls-position="right" :min="2.529" size="small" v-show="s_module==boxType.freq"></el-input-number>
                <el-select placeholder="请选择" filterable clearable  size="small" style="width:155px" v-model="s_clid" v-show="s_action!=waitType&&s_action!=boxType.act">
                    <el-option v-for="val in Clid" :key="val" :label="getResName(val)" :value="val"></el-option>
                </el-select>
                <Checkbox v-model="s_skip" v-show="s_action=='click'">不判断</Checkbox>
                <el-input-number v-model="s_wait" controls-position="right" :min="0" size="small" v-show="s_action==waitType"></el-input-number>
                <button class="steps_button" @click="onSet" v-show="s_action==waitType||s_module==boxType.freq">设置</button>
                <button class="steps_button" @click="changeSel(2)" v-show="s_action!=waitType&&s_module!=boxType.freq">确定</button>
                <button class="steps_button" style="background-color:#606266"  @click="initOp">取消</button>
            </div>
            <div v-show="idx!=s_idx||s_op==1||s_op>=3">
                <span><font size="2">{{ showStep(it) }}</font></span>
                <a @click.prevent="showEditBtn(1,idx)">
                    <i class="el-icon-edit"></i>
                </a>
                <span v-show="idx==s_idx&&s_op==1">
                    <Button type="primary" size="small" @click="editStep(0,idx,it)">修改</Button>
                    <Button type="success" size="small" @click="editStep(1,idx)">插入</Button>
                    <Button type="error" size="small" @click="editStep(2,idx)">删除</Button>
                    <Button type="info" size="small" @click="editStep(3,idx,it)">循环</Button>
                    <Button type="warning" size="small" @click="showEditBtn(0)">取消</Button>
                </span>
                <span v-show="idx==s_idx&&s_op==4">
                    <el-input-number v-model="s_loop" style="width:100px" controls-position="right" :min="2" size="small" :precision="0"></el-input-number>
                    <Button type="primary" size="small" @click="editLoop(0,it)">开启循环</Button>
                    <Button type="error" size="small" @click="editLoop(1,it)">关闭循环</Button>
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
            <el-input-number v-model="s_box" style="width:130px" controls-position="right" :min="2.529" size="small" v-show="s_module==boxType.freq"></el-input-number>
            <el-select placeholder="请选择" filterable clearable  size="small" style="width:155px" v-model="s_clid" v-show="s_action!=waitType&&s_action!=boxType.act" @change="changeSel(2)">
                <el-option v-for="val in Clid" :key="val" :label="getResName(val)" :value="val" :disabled="checkBinding(0,val)">
                    <span style="float: left">{{ getResName(val) }}</span>
                    <span style="float: right"><font :color="checkBinding(1,val)">{{ checkBinding(2,val) }}</font></span>
                </el-option>
            </el-select>
            <Checkbox v-model="s_skip" v-show="s_action=='click'">不判断</Checkbox>
            <el-input-number v-model="s_wait" controls-position="right" :min="0" size="small" v-show="s_action==waitType"></el-input-number>
            <button class="steps_button" @click="onSet" v-show="s_action==waitType||s_module==boxType.freq">设置</button>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
@Component
export default class StepsView extends Vue {
    private Action:any=[];
    private s_action:string="";
    private s_module:string="";
    private s_clicktype:string="0";
    private s_clicktime:Number=1500;
    private s_clid:string="";
    private s_box:any = 2.529;
    private s_wait:Number=100;
    private s_loop:Number = 2;
    private s_skip:Boolean = false;
    private s_op:Number=0;
    private s_idx:any=-1;
    private steplist:any=[];
    private waitType:string="wait";
    private boxType:any={act:"qg_box",freq:"freq"};
    private clickType:any=new Map([["0","短按"],["1","长按"]]);
    private op_data:any={
        type:0,
        id:""
    }
    get clearInfo(){
        if(this.$store.state.case_info.showflag){
            this.initOp();
        }
        return;
    }
    get ActList(){
        this.Action=this.$store.state.steps_info.rulelist.action;
        return;
    }
    get StepList(){
        this.op_data = this.$store.state.steps_info.op_data;
        this.steplist = this.$store.state.steps_info.steplist;
        return;
    }
    get Module(){
        return this.$store.state.steps_info.rulelist[this.s_action]!=undefined?this.$store.state.steps_info.rulelist[this.s_action]:[];
    }
    get Clid(){
        return this.$store.state.steps_info.rulelist[this.s_module]!=undefined?this.$store.state.steps_info.rulelist[this.s_module]:[];
    }
    private getResName(id:any){
        return this.$store.state.steps_info.reslist[id];
    }
    private checkBinding(type:number,id:string){
        let needCheckArr = ["click","assert_pic","click_poi","slide"];
        let idx = needCheckArr.indexOf(this.s_action);
        let bind = this.$store.state.steps_info.bindlist[id];
        switch(type){
            case 0:
                return idx>-1?(bind?false:true):false;
            case 1:
                return idx>-1?(bind?"":"#F56C6C"):"";
            case 2:
                return idx>-1?(bind?"":"未绑定"):"";
        }
    }
    private changeSel(flag:Number){
        switch(flag){
            case 0:
                this.s_module="";
                this.s_clid="";
                this.s_clicktype="0";
                this.s_clicktime=1500;
                this.s_box = 2.529;
                this.s_skip = false;
                break;
            case 1:
                this.s_clid="";
                break;
            case 2:
                if(this.s_clid!=undefined&&this.s_clid.length>0){
                    let obj:any = {action:this.s_action,module:this.s_module,id:this.s_clid};
                    if(this.s_action=="button"||this.s_action=="click"||this.s_action=="click_poi"){
                        obj["click_type"]=this.s_clicktype;
                        if(this.s_clicktype)obj["click_time"]=this.s_clicktime;
                        if(this.s_skip)obj["click_skip"]=this.s_skip;
                    }
                    else if(this.s_action=="group"){
                        if(this.op_data.type){
                            if(this.op_data.id!=""&&this.op_data.id==this.s_clid){
                                this.$notify({title: '无法选择本身!',message: '', type: 'warning',duration:1500});
                                break;
                            }
                            for(let step of this.$store.state.steps_info.grouplist[this.s_clid]){
                                if(step.action=="group"){
                                    this.$notify({title: '子选项不能含组合步骤!',message: '', type: 'warning',duration:1500});
                                    return;
                                }
                            }
                        }
                    }
                    if(this.s_op==0)this.steplist.push(obj);
                    else if(this.s_op==2)this.steplist[this.s_idx]=obj;
                    else if(this.s_op==3)this.steplist.splice(this.s_idx,0,obj);
                    if(this.s_op!=0)this.initOp();
                }
                break;
        }
    }
    private onSet(){
        let obj;
        if(this.s_action == this.waitType){
            if(this.s_wait==undefined)this.s_wait=100;
            obj = {action:this.s_action,time:this.s_wait};
        }else if(this.s_module == this.boxType.freq){
            if(this.s_box==undefined)this.s_box=2.529;
            obj = {action:this.s_action,module:this.s_module,b_volt:this.s_box};
        }
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
        this.s_loop=2;
        this.s_skip=false;
    }
    private showStep(it:any){
        let action=this.getResName(it.action);
        if(it.action=="click"&&it.click_skip)action+=" (不判断) ";
        if((it.action=="button"||it.action=="click")&&it.click_type=="1")action+=" [长按:"+it.click_time+"ms]";
        let content:string="";
        switch(it.action){
            case "wait":
                content = it.time+"毫秒";
                break;
            case "qg_box":
                content = " ["+this.getResName(it.module)+"] "+it.b_volt + " V";
                break;
            default:
                content = " ["+this.getResName(it.module)+"] "+this.getResName(it.id);
                break;
        }
        if(it.loop!=undefined)content += "<循环 "+it.loop+" 次>";
        return action+" ==> "+content;
    }
    private showClickType(act:any){
        if(act=="button"||act=="click"||act=="click_poi")return true;
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
                }
                else if(item.action==this.boxType.act){
                    this.s_module=item.module;
                    this.s_box = item.b_volt;
                }
                else{
                    this.s_module=item.module;
                    this.s_clid=item.id;
                    if((item.action=="button"||item.action=="click")&&item.click_type=="1"){
                        this.s_clicktype=item.click_type;
                        this.s_clicktime=item.click_time;
                    }
                    if(item.action=="click")this.s_skip=item.click_skip?true:false;
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
            case 3:
                this.s_op=4;
                this.s_idx=idx;
                if(item.loop!=undefined)this.s_loop = item.loop;
                break;
        }
    }
    private editLoop(type:number,item:any){
        if(type){
            if(item.loop!=undefined)item.loop = undefined;
        }else{
            item.loop = this.s_loop;
        }
        this.initOp();
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