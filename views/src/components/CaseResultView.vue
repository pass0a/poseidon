<template>
    <Modal
        v-model="showflag"
        width="650"
        :closable="false"
		:mask-closable="false">
        <p slot="header">
            <i class="el-icon-warning"></i>
            <span>自动化测试结果</span>
        </p>
        <el-table :data="caseData" style="width: 100%" size="mini" stripe border ref="caseResultTable">
            <el-table-column label="用例ID" prop="case_id" resizable></el-table-column>
            <el-table-column label="测试模式" prop="case_mode" resizable></el-table-column>
            <el-table-column label="操作">
                <template slot-scope="scope">
                    <button class="button" @click="replayCase(scope.$index)">重新执行</button>
                    <button class="button" @click="replayCase(scope.$index)">重新截图</button>
                </template>
            </el-table-column>
        </el-table>
        <div style="margin:10px 0px 0px 10px;" v-if="caseData.length">
            <span><font size="2"><strong>自动化测试步骤</strong></font></span>
            <Steps direction="vertical">
				<Step v-for="(it,idx) in caseData[0].case_steps" :key="idx" :title="getStepTitleOrStatus(0,idx)" :content="showStep(it,idx)" :status="getStepTitleOrStatus(1,idx)"></Step>
			</Steps>
            <div v-if="caseData[0].briefResl>0&&caseData[0].image!=undefined">
                <span><font size="2"><strong>截图对比</strong></font></span><br/>
                <img :src="'http://127.0.0.1:6003/'+'?action=image&image='+caseData[0].image+'&id='+imgreq" style="max-width:100%;max-height:100%;"/>
                <img :src="'http://127.0.0.1:6003/'+'?action=image&image='+caseData[0].screen+'&id='+scrreq" style="max-width:100%;max-height:100%;"/>
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
    private showStep(it:any,idx:any){
        let reslist = this.$store.state.steps_info.reslist;
        let action = reslist[it.action];
        if(it.action == "home")return action;
        let content = it.time!=undefined?it.time+"毫秒":" ["+reslist[it.module]+"] "+reslist[it.id];
        let stepTitle = action+" ==> "+content;
        return stepTitle;
    }
}
</script>