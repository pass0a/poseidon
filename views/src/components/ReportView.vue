<template>
    <div>
        <el-link v-model="report" v-show="false"></el-link>
        <el-link v-model="testStatus" v-show="false"></el-link>
        <el-card class="box-card" shadow="never" style="margin:5px 10px 5px 10px;height:50px">
            <span><font size="3"><strong>测试开始时间: </strong></font></span>
            <span style="margin:0px 0px 0px 10px"><font size="2">{{report_info.startTime}}</font></span>
            <span style="margin:0px 0px 0px 20px"><font size="3"><strong>测试结束时间: </strong></font></span>
            <span style="margin:0px 0px 0px 10px"><font size="2">{{report_info.endTime}}</font></span>
            <span style="margin:0px 0px 0px 20px"><font size="3"><strong>测试总耗时长: </strong></font></span>
            <span style="margin:0px 0px 0px 10px"><font size="2">{{report_info.testTime}}</font></span>
            <span style="margin:0px 0px 0px 20px"><font size="4" color="#67C23A"><strong>OK: </strong></font></span>
            <span style="margin:0px 0px 0px 10px"><font size="3" color="#67C23A">{{report_info.okCount}}</font></span>
            <span style="margin:0px 0px 0px 20px"><font size="4" color="#F56C6C"><strong>NG: </strong></font></span>
            <span style="margin:0px 0px 0px 10px"><font size="3" color="#F56C6C">{{report_info.ngCount}}</font></span>
            <span style="margin:0px 0px 0px 20px"><font size="3"><strong>通过率: </strong></font></span>
            <span style="margin:0px 0px 0px 10px"><font size="2">{{report_info.passRate}}</font></span>
        </el-card>
        <el-tabs type="border-card" tab-position="bottom" style="margin:5px 10px 5px 10px;" v-model="current_case_module" @tab-click="select_module">
            <el-tab-pane v-for="it of ModuleData" :label="getResName(it)" :key="it" :name="it"></el-tab-pane>
            <el-checkbox-group v-model="select_prop">
                <el-checkbox v-for="it of case_prop.keys()" :label="it" :key="it">{{case_prop.get(it)}}</el-checkbox>
            </el-checkbox-group>
            <el-table :data="current_data" style="width: 100%" height="365" size="mini" stripe border ref="reportTable">
                <el-table-column type="index" label="No." width="50"></el-table-column>
                <el-table-column v-for="it in isShowRow" :label="case_prop.get(it)" :key="it" :prop="it" resizable></el-table-column>
                <el-table-column width="150" label="测试结果" prop="briefResl">
					<template slot-scope="scope">
						<span><strong><font size="2" :color="scope.row.briefResl!=undefined?(scope.row.briefResl!=-1?(scope.row.briefResl==0?'#67C23A':'#F56C6C'):'#bbbec4'):'#bbbec4'">{{ scope.row.briefResl!=undefined?(scope.row.briefResl!=-1?(scope.row.briefResl==0?'OK':'NG'):'NotTest'):'NotTest' }}</font></strong></span>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="150">
					<template slot-scope="scope">
						<button class="button" @click="checkCase(scope.$index)">查看</button>
					</template>
				</el-table-column>
            </el-table>
        </el-tabs>
        <div><CaseResultView/></div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import CaseResultView from "./CaseResultView.vue";
@Component({
  components: {
      CaseResultView
  }
})
export default class ReportView extends Vue {
    private report_info:any={startTime:"",endTime:"",testTime:"",ngCount:0,okCount:0,passRate:""};
    private current_case_module:any="";
    private report_data:any={};
    private current_data:any=[];
    private case_prop:any=this.$store.state.case_prop;
    private select_prop:any=this.$store.state.init_checkbox;
    private test_status:any=false;
    get report(){
        if(this.$store.state.report_info.data!=""){
            this.setReportInfo(this.$store.state.report_info.data.testInfo);
            this.setReportData(this.$store.state.report_info.data.caseData);
        }
        return;
    }
    get isShowRow(){
        let rows:any=[];
        for(let item of this.case_prop.keys()){
            if(this.select_prop.indexOf(item)>-1)rows.push(item);
        }
        return rows; 
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
    private setReportInfo(data:any){
        if(data!=null){
            this.report_info.startTime = data.startTime;
            this.report_info.endTime = data.endTime;
            this.report_info.testTime = this.disposedTestTime(data);
            this.report_info.ngCount = data.ngCount;
            this.report_info.okCount = data.okCount;
            this.report_info.passRate =  (data.okCount*100/(data.ngCount+data.okCount)).toFixed(2)+"%";
        }else{
            this.report_info.startTime = "";
            this.report_info.endTime = "";
            this.report_info.testTime = "";
            this.report_info.ngCount = 0;
            this.report_info.okCount = 0;
            this.report_info.passRate = "";
        }
    }
    private disposedTestTime(data:any){
        var time_str="";
        time_str+=data.days?data.days+"天":"";
        time_str+=data.hours?data.hours+"小时":"";
        time_str+=data.minutes?data.minutes+"分钟":"";
        time_str+=data.seconds?data.seconds+"秒":"";
        time_str+=data.millisecond?data.millisecond+"毫秒":"";
        return time_str;
    }
    private setReportData(data:any){
        this.report_data={};
        let firstModule;
        for(let i=0;i<data.length;i++){
            let case_module = data[i].case_module;
            if(i==0){
                this.current_case_module=case_module;
                firstModule=case_module;
            }
            if(this.report_data[case_module]==undefined)this.report_data[case_module]=[];
            this.report_data[case_module].push(data[i]);
        }
        this.current_data=this.report_data[firstModule];
    }
    private select_module(tab:any){
        this.current_data=this.report_data[this.current_case_module];
    }
    private checkCase(idx:any){
        if(this.test_status){
            this.$notify({title: '测试进行中!!!无法进行操作',message: '', type: 'warning',duration:1500});
        }else{
            this.$store.state.report_info.case_data=this.current_data[idx];
            this.$store.state.report_info.showflag=true;
        }
    }
}
</script>
<style>
.button {
	background-color: rgba(45, 130, 241, 0.993);
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