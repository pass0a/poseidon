<template>
    <Modal
        v-model="showflag"
        width="650"
        :closable="false"
		:mask-closable="false">
        <p slot="header">
            <i class="el-icon-warning"></i>
            <span>自动化测试结果</span>
            <a style="float:right" @click="ok"><i class="el-icon-close"></i></a>
        </p>
        <el-table :data="caseData" style="width: 100%" size="mini" stripe border ref="caseResultTable">
            <el-table-column label="用例ID" prop="case_id" resizable></el-table-column>
            <el-table-column label="测试次数" prop="case_mode" resizable></el-table-column>
            <el-table-column label="测试结果" prop="briefResl" resizable>
                <template>
                    <span><strong><font size="2" :color="getColor()">{{ getResultTitle() }}</font></strong></span>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
                <template slot-scope="scope">
                    <button class="button" @click="replayCase(scope.$index)" disabled>重新执行</button>
                    <button class="button" @click="replayCase(scope.$index)" disabled>重新截图</button>
                </template>
            </el-table-column>
        </el-table>
        <div style="margin:10px 0px 0px 10px;" v-if="caseData.length">
            <span><font size="2"><strong>自动化测试步骤</strong></font></span>
            <Steps direction="vertical">
				<Step v-for="(it,idx) in caseData[0].case_steps" :key="idx" :title="getStepTitleOrStatus(0,idx)" :content="showStep(it)" :status="getStepTitleOrStatus(1,idx)"></Step>
			</Steps>
            <div v-if="caseData[0].case_mode==1">
                <div v-if="caseData[0].match!=undefined">
                    <span><font size="2"><strong>当前匹配度 : {{caseData[0].match}}</strong></font></span><br/>
                </div>
                <div v-if="caseData[0].briefResl>0&&caseData[0].image!=undefined&&caseData[0].image!=''">
                    <span><font size="2"><strong>截图对比</strong></font></span><br/>
                    <img :src="'http://127.0.0.1:6003/'+'?action=image&image='+caseData[0].image+'&id='+imgreq" style="max-width:100%;max-height:100%;"/>
                    <img :src="'http://127.0.0.1:6003/'+'?action=image&image='+caseData[0].screen+'&id='+scrreq" style="max-width:100%;max-height:100%;"/>
                </div>
                <div v-if="caseData[0].briefResl>0&&caseData[0].image==''">
                    <img id="screen" src="/src/assets/nopic.png" :draggable="false">
                </div>
            </div>
            <div v-else>
                <span><font size="2"><strong>测试结果</strong></font></span><br/>
                <span style="margin:10px 10px 10px 10px">共{{caseData[0].case_mode}}次循环 [ <font color="green">通过：{{caseData[0].case_mode-caseData[0].results.length}}次</font> | <font color="red">失败：{{caseData[0].results.length}}次</font> ] </span>
                <div v-for="(it,idx) in caseData[0].results" style="margin:5px 5px 10px 10px" :key="idx">
                    <span><font color="red">第{{it.runNum+1}}次循环测试中: {{it.stepNum+1}}.{{ showStep(caseData[0].case_steps[it.stepNum]) }}</font></span>
                </div>
            </div>
        </div>
        <div slot="footer">
			<Button type="info" size="large" long @click="ok">返回</Button>
		</div>
    </Modal>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
@Component
export default class CaseResultView extends Vue {
    private caseData:any=[];
    private stepTitle:any=["未执行","执行成功","执行失败"];
    private stepStatus:any=["wait","finish","error"];
    private imgreq:any=0;
    private scrreq:any=0;
    get showflag(){
        if(this.$store.state.report_info.showflag){
            this.caseData=[];
            this.caseData.push(this.$store.state.report_info.case_data);
            this.imgreq++;
            this.scrreq++;
        }
        return this.$store.state.report_info.showflag;
    }
    private cancel(){
        this.$store.state.report_info.showflag=false;
    }
    private ok(){
        this.$store.state.report_info.showflag=false;
    }
    private replayCase(){

    }
    private getStepTitleOrStatus(type:number,idx:any){
        if(this.caseData.length){
            let content = type?this.stepStatus:this.stepTitle
            let data = this.caseData[0];
            if(data.briefResl!=undefined){
                if(data.briefResl==0) return content[1];
                else if(data.briefResl==-1) return content[0];
                else{
                    let error_idx = data.results[0].stepNum;
                    if(error_idx > idx) return content[1];
                    else if(error_idx == idx) return content[2];
                    else return content[0];
                }
            }else return content[0];
        }
    }
    private showStep(it:any){
        let action = this.getResName(it.action);
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
    private getResName(id:any){
        let name = this.$store.state.steps_info.reslist[id];
        return name!=undefined?name:id+"(已删除)";
    }
    private getColor(){
        if(this.caseData.length==0)return "";
        if(this.caseData[0].case_mode==1){
            return this.caseData[0].briefResl!=undefined?(this.caseData[0].briefResl!=-1?(this.caseData[0].briefResl==0?'#67C23A':'#F56C6C'):'#bbbec4'):'#bbbec4';
        }else{
            if(this.caseData[0].results.length){
                return '#F56C6C';
            }else{
                return this.caseData[0].briefResl!=undefined?(this.caseData[0].briefResl!=-1?'#67C23A':'#bbbec4'):'#bbbec4';
            }
        }
    }
    private getResultTitle(){
        if(this.caseData.length==0)return "";
        if(this.caseData[0].case_mode==1){
            return this.caseData[0].briefResl!=undefined?(this.caseData[0].briefResl!=-1?(this.caseData[0].briefResl==0?'OK':'NG'):'NotTest'):'NotTest';
        }else{
            if(this.caseData[0].results.length){
                return 'NG';
            }else{
                return this.caseData[0].briefResl!=undefined?(this.caseData[0].briefResl!=-1?'OK':'NotTest'):'NotTest';
            }
        }
         
    }
}
</script>