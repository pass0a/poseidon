<template>
    <div>
        <el-link v-model="updateTableData" v-show="false"></el-link>
        <el-link v-model="updateCaselist" v-show="false"></el-link>
        <el-button-group style="margin:5px 0px 0px 10px;">
            <el-button plain icon="el-icon-download" size="small">保存用例</el-button>
            <el-button plain icon="el-icon-plus" size="small" @click="addCase">新建用例</el-button>
            <el-button plain icon="el-icon-s-fold" size="small">管理步骤</el-button>
        </el-button-group>
        <el-tabs type="border-card" tab-position="bottom" style="margin:5px 10px 10px 10px;" v-model="current_case_module" @tab-click="select_module">
            <el-tab-pane v-for="it of case_module.keys()" :label="case_module.get(it)" :key="it" :name="it"></el-tab-pane>
            <el-checkbox-group style="margin:0px 0px 5px 0px" v-model="select_prop">
                <el-checkbox v-for="it of case_prop.keys()" :label="it" :key="it">{{case_prop.get(it)}}</el-checkbox>
            </el-checkbox-group>
            <el-table v-loading="tableLoading" :data="current_data" style="width: 100%" height="370" size="mini" stripe border ref="CasesTable">
                <el-table-column type="index" label="No." width="50"></el-table-column>
                <el-table-column v-for="it in isShowRow" :label="case_prop.get(it)" :key="it" :prop="it" resizable></el-table-column>
                <el-table-column prop="case_status" width="80" label="状态">
					<template slot-scope="scope">
						<el-button type="text" @click="changeCaseStatus(scope.$index)"><font size="2" :color="scope.row.case_status?'#67C23A':'#909399'">{{scope.row.case_status?'开启':'关闭'}}</font></el-button>
					</template>
				</el-table-column>
                <el-table-column label="操作" width="220">
					<template slot-scope="scope">
						<button class="button" @click="editCase(scope.$index)">修改</button>
						<!-- <button class="button" style="background-color:#4CAF50" @click="copyCase(scope.$index)">复制</button> -->
						<button class="button" style="background-color:#F56C6C" @click="deleteCase(scope.$index)">删除</button>
					</template>
				</el-table-column>
            </el-table>
        </el-tabs>
        <div><CaseInfoView/></div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import CaseInfoView from "./CaseInfoView.vue";
@Component({
  components: {
      CaseInfoView
  }
})
export default class EditCasesView extends Vue {
    private case_module:any=this.$store.state.case_module;
    private case_prop:any=this.$store.state.case_prop;
    private select_prop:any=this.$store.state.init_checkbox;
    private current_data:any=[];
    private current_case_module:any="";
    private updateflag:any=0;
    private caselist:any=[];
    get isShowRow(){
        let rows:any=[];
        for(let item of this.case_prop.keys()){
            if(this.select_prop.indexOf(item)>-1)rows.push(item);
        }
        return rows; 
    }
    get tableLoading(){
        return this.$store.state.editcase_info.refresh_data;
    }
    get updateTableData(){
        let data=this.$store.state.editcase_info.data;
        if(data.length>0){
            this.caselist=[];
            let firstModule;
            for(var i=0;i<data.length;i++){
                if(this.caselist[data[i].case_module]==undefined)this.caselist[data[i].case_module]=[];
                if(i==0)firstModule=data[i].case_module;
                this.caselist[data[i].case_module].push(data[i]);
            }
            this.current_case_module=firstModule;
            this.current_data=this.caselist[firstModule];
        }
        return;
    }
    get updateCaselist(){
        if(this.$store.state.editcase_info.update_count>0){
            switch(this.$store.state.case_info.type){
                case 0:
                    let module = this.$store.state.case_info.data.case_module;
                    break;
                case 1:
                    break;
            }
        }
        return;
    }
    private select_module(){
        this.current_data=this.caselist[this.current_case_module];
    }
    private addCase(){
        this.$store.state.case_info.type=0;
        this.$store.state.case_info.showflag=true;
    }
    private editCase(idx:any){
        this.$store.state.case_info.type=1;
        this.$store.state.case_info.data=this.current_data[idx];
        this.$store.state.case_info.showflag=true;
    }
    private deleteCase(){

    }
    private changeCaseStatus(idx:any){
        this.current_data[idx].case_status=!this.current_data[idx].case_status;
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
