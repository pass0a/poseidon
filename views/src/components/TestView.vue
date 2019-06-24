<template>
    <div>
        <el-link v-model="updateStatusTitle" v-show="false"></el-link>
        <el-card class="box-card" shadow="never" style="margin:10px 10px 10px 10px;">
            <el-row :gutter="10">
                <el-col :span="5"> 
                    <el-card class="box-card" style="text-align:center;" shadow="never">
                        <button class="btn_start" @click="startTest()" v-show="btnMode==0"><i class="el-icon-video-play"></i>开始测试</button>
                        <button class="btn_ready" @click="startTest()" v-show="btnMode==1"><i class="el-icon-loading"></i>准备中...</button>
                        <button class="btn_stop" @click="stopTest()" v-show="btnMode==2"><i class="el-icon-video-pause"></i>暂停测试</button>
                        <span v-show="btnMode==3">
                        <button class="btn_continue" @click="startTest()"><i class="el-icon-video-play"></i>继续测试</button>
                        <button class="btn_replay" @click="startTest()"><i class="el-icon-refresh-left"></i>重新开始</button>
                        </span>
                    </el-card>
                </el-col>
                <el-col :span="19">
                    <el-card class="box-card" shadow="never">
                        <div style="width:660px">
                            <el-progress :text-inside="true" :stroke-width="33" :percentage="0"></el-progress>
                        </div>
                        <div style="margin:18px 0px 12px 10px">
                            <span><font size="4"><strong>测试状态: </strong></font></span>
                            <span style="margin:0px 0px 0px 10px"><font size="3" color="#C0C4CC">{{initTitle.t_status}}</font></span>
                            <span style="margin:0px 0px 0px 20px"><font size="4"><strong>预计时间: </strong></font></span>
                            <span style="margin:0px 0px 0px 10px"><font size="3" color="#C0C4CC">{{initTitle.t_time}}</font></span>
                            <span style="margin:0px 0px 0px 20px"><font size="4"><strong>测试结果: </strong></font></span>
                            <span style="margin:0px 0px 0px 10px"><font size="3" color="#C0C4CC">{{initTitle.t_result}}</font></span>
                        </div>
                    </el-card>
                </el-col>
		    </el-row>
        </el-card>
        <el-card class="box-card" shadow="never" style="margin:10px 10px 10px 10px;">
            <el-card class="box-card" shadow="never">
            <span style="margin:0px 0px 0px 5px"><font size="3"><strong>测试输出</strong></font></span>
            <el-input type="textarea" :readonly="true" :autosize="{ minRows: 10, maxRows: 10}" placeholder="" v-model="logCmd" ref="table"></el-input>
            </el-card>
        </el-card>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
@Component({
  components: {
  }
})
export default class TestView extends Vue {
    private btnMode=0;
    private initTitle:any={t_status:"未启动",t_time:"- - - -",t_result:"- - - -"};
    private logCmd:any="用例ID : TC_FUNC_003_01_01\r点击--主界面--FM : OK\r判断--FM模式--FM : OK\r";
    get updateStatusTitle(){
        if(this.btnMode){
            switch(this.btnMode){
                case 1:
                    this.initTitle.t_status="准备中";
                    this.initTitle.t_time="计算中";
                    this.initTitle.t_result="- - - -";
                    break;
                case 2:
                    break;
                case 3:
                    break;
            }
            
        }else{
            this.initTitle={t_status:"未启动",t_time:"- - - -",t_result:"- - - -"};
        }
        return;
    }
    private startTest(){
        if(this.$store.state.project_info.current_prj.length){
            this.btnMode=1;
            this.$store.state.app_info.type="startTest";
            this.$store.state.app_info.reqCount++;
        }else{
            this.$notify({title: '当前无项目,请选择项目',message: '', type: 'warning',duration:1500});
        }
        
    }
    private stopTest(){
        this.btnMode=3;
    }
}
</script>
<style>
.btn_start,.btn_ready,.btn_stop,.btn_continue,.btn_replay {
    background-color: rgba(45, 130, 241, 0.993);
    border: none;
    border-radius: 4px;
    color: white;
    padding: 7px 42px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 26px;
    margin: 4px 2px;
    cursor: pointer;
    height: 82px;
}
.btn_ready {
    background-color: #909399
}
.btn_stop {
    background-color: #F56C6C
}
.btn_continue {
    background-color: #67C23A;
    font-size: 17px;
    height: 37px
}
.btn_replay {
    background-color: #E6A23C;
    font-size: 17px;
    height: 37px
}
</style>