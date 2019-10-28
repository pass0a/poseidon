<template>
    <div>
        <el-link v-model="report" v-show="false"></el-link>
        <el-link v-model="ResultInfo" v-show="false"></el-link>
        <el-link v-model="testStatus" v-show="false"></el-link>
        <el-link v-model="showFirstModule" v-show="false"></el-link>
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
                <el-checkbox v-for="it in case_prop_id" :label="it" :key="it">{{case_prop_name[it]}}</el-checkbox>
            </el-checkbox-group>
            <el-table :data="current_data" style="width: 100%" height="365" size="mini" stripe border ref="reportTable" v-loading="tableLoading">
                <el-table-column type="index" label="No." width="50"></el-table-column>
                <el-table-column v-for="it in isShowRow" :label="case_prop_name[it]" :key="it" :prop="it" resizable></el-table-column>
                <el-table-column width="150" label="测试结果" prop="result">
					<template slot-scope="scope">
						<span><strong><font size="2" :color="!scope.row.result?'#67C23A':'#F56C6C'">{{ !scope.row.result?'OK':'NG' }}</font></strong></span>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="200">
					<template slot-scope="scope">
						<button class="button" @click="checkCase(scope.$index)">查看用例</button>
                        <button class="button" style="background-color:#4CAF50" @click="editCase(scope.$index)">修改用例</button>
					</template>
				</el-table-column>
            </el-table>
            <el-pagination
            @current-change="handleCurrentChange"
            :current-page="curPage"
            :page-size="pageSize"
            layout="total, prev, pager, next, jumper"
            :total="moduleTotal"
            style="margin:10px 10px 0px 10px;float:right">
            </el-pagination>
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
    private case_prop_id:any=this.$store.state.case_prop_id;
    private case_prop_name:any=this.$store.state.case_prop_name;
    private select_prop:any=this.$store.state.init_checkbox;
    private test_status:any=false;
    private pageSize = this.$store.state.editcase_info.limit;
    private curPage = 1;
    get report(){
        if(this.$store.state.report_info.data!=""){
            this.setReportData(this.$store.state.report_info.data);
        }
        return;
    }
    get isShowRow(){
        let rows:any=[];
        for(let i=0;i<this.case_prop_id.length;i++){
            if(this.select_prop.indexOf(this.case_prop_id[i])>-1)rows.push(this.case_prop_id[i]);
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
    get tableLoading(){
        return this.$store.state.report_info.refresh_data;
    }
    get showFirstModule(){
        this.current_case_module = this.$store.state.report_info.firstModule;
        return;
    }
    get ResultInfo(){
        if(this.$store.state.report_info.info!=""){
            this.setReportInfo(this.$store.state.report_info.info);
        }
        return;
    }
    get moduleTotal(){
        if(this.$store.state.report_info.module_total){
            this.curPage = 1;
        }else{
            this.curPage = 0;
            this.current_data = [];
        }
        return this.$store.state.report_info.module_total;
    }
    private handleCurrentChange(page:any){
        this.curPage = page;
        this.$store.state.report_info.refresh_data = true;
        let l_req = {
            type : "toDB",
            route : "results",
            job : "list",
            info : {prjname:this.$store.state.project_info.current_prj,module:this.current_case_module,skip:this.$store.state.editcase_info.limit*(page-1),limit:this.$store.state.editcase_info.limit}
        }
        this.$store.state.app_info.pis.write(l_req);
    }
    private getResName(id:any){
        let name = this.$store.state.steps_info.reslist[id];
        return name!=undefined?name:id+"(已删除)";
    }
    private setReportInfo(data:any){
        if(data!=null){
            this.report_info.startTime = data.startTime.toLocaleString().split('+')[0];;
            this.report_info.endTime = data.endTime.toLocaleString().split('+')[0];
            this.report_info.testTime = this.disposedTestTime(data.startTime,data.endTime);
            this.report_info.ngCount = data.ng;
            this.report_info.okCount = data.ok;
            this.report_info.passRate =  (data.ok*100/(data.ng+data.ok)).toFixed(2)+"%";
        }
    }
    private disposedTestTime(startTime:Date, endTime:Date){
        let info:any={};
        let value = endTime.getTime() - startTime.getTime();
        info.days = Math.floor(value / (24 * 3600 * 1000));
        let value1 = value % (24 * 3600 * 1000);
        info.hours = Math.floor(value1 / (3600 * 1000));
        let value2 = value1 % (3600 * 1000);
        info.minutes = Math.floor(value2 / (60 * 1000));
        let value3 = value2 % (60 * 1000);
        info.seconds = Math.floor(value3 / 1000);
        let value4 = value3 % 1000;
        info.millisecond = value4;
        //show
        let time_str="";
        time_str+=info.days?info.days+"天":"";
        time_str+=info.hours?info.hours+"小时":"";
        time_str+=info.minutes?info.minutes+"分":"";
        time_str+=info.seconds?info.seconds+"秒":"";
        time_str+=info.millisecond?info.millisecond+"毫秒":"";
        return time_str;
    }
    private setReportData(data:any){
        this.current_data = [];
        for(let i=0;i<data.length;i++){
            let case_info:any = data[i].case_info;
            case_info.result = data[i].result;
            case_info.fail_info = data[i].fail_info;
            this.current_data.push(case_info);
        }
    }
    private select_module(tab:any){
        this.$store.state.report_info.firstModule = this.current_case_module;
        let c_pname = this.$store.state.project_info.current_prj;
        this.$store.state.app_info.pis.write({type:"toDB",route:"results",job:"total",info:{prjname:c_pname,module:this.current_case_module}});
    }
    private checkCase(idx:any){
        if(this.test_status){
            this.$notify({title: '测试进行中!!!无法进行操作',message: '', type: 'warning',duration:1500});
        }else{
            this.$store.state.report_info.case_data=this.current_data[idx];
            this.$store.state.report_info.showflag=true;
        }
    }
    private editCase(idx:number){
        let case_info = this.current_data[idx];
        this.$store.state.app_info.pis.write({type:"toDB",route:"cases",job:"editInReport",info:{prjname:this.$store.state.project_info.current_prj,case_id:case_info.case_id}});
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