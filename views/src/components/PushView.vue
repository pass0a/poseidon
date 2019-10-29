<template>
    <div>
        <el-link v-model="RevData" v-show="false"></el-link>
        <el-link v-model="DaServerPath" v-show="false"></el-link>
        <el-card class="box-card" shadow="never" style="margin:5px 10px 10px 10px;">
            <div class="fixedColumn">
                <el-form :model="pushInfo" ref="pushform" label-width="100px" style="margin:0px 10px 10px 0px;" :rules="pushValidate">
                    <el-form-item label="推送方式:" prop="type">
                        <el-select style="width:220px" v-model="pushInfo.type" size="small" @change="selectType">
                            <el-option v-for="val in pushList" :label="val.name" :value="val.id" :key="val.id" :disabled="val.id=='ssh'?true:false"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="推送版本:" prop="version">
                        <el-select style="width:220px" v-model="pushInfo.version" size="small">
                            <el-option v-for="val in versionList" :label="val.name" :value="val.id" :key="val.id" :disabled="val.id=='linux'?true:false"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="推送路径:" prop="path">
                        <el-input size="small" style="width:220px" placeholder="请输入目标路径..." v-model="pushInfo.path"></el-input>
                    </el-form-item>
                    <el-button type="success" plain size="small" style="margin:0px 0px 0px 100px;width:220px;" @click="startPush" :disabled="startflag">
                        {{ startflag?"推送中...":"开始推送" }}
                    </el-button>
                    <el-progress :percentage="progress.percent" :color="progress.color" style="margin:5px 0px 0px 100px;width:270px;" v-show="progress.flag"></el-progress>
                </el-form>
            </div>
            <div class="flexibleColumn">
                <el-input id="log" type="textarea" :readonly="true" :autosize="{ minRows: 10, maxRows: 10}" placeholder="" v-model="LogCmdOut"></el-input>
            </div>
        </el-card>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
@Component
export default class AboutView extends Vue {
    private pushInfo:any={type:"",version:"",path:""};
    private pushList=[{id:"adb",name:"ADB"},{id:"ssh",name:"SSH"}];
    private versionList=[{id:"android",name:"Android"},{id:"linux",name:"Linux"}];
    private pushValidate:any={
        type:[{ required: true, message: '请选择', trigger: 'blur' }],
        version:[{ required: true, message: '请选择', trigger: 'blur'}],
        path:[{ required: true, message: '不能为空', trigger: 'blur'}]
    };
    private startflag:boolean = false;
    private progress = {percent:0,color:"#67C23A",flag:false};
    private timer:any;
    private logCmd:string="";
    private selectType(){
        switch(this.pushInfo.type){
            case "adb":
                this.pushInfo.version = "android";
                break;
            case "ssh":
                this.pushInfo.version = "linux";
                break;
        }
    }
    private startPush(){
        (this as any).$refs.pushform.validate((valid:any) => {
            if(valid){
                this.logCmd = ""; 
                this.startflag = true;
                this.$store.state.app_info.pis.write({type:"toSer",job:"pushPassoa",info:this.pushInfo});
                this.progress.percent = 0;
                this.progress.color = "#67C23A";
                this.progress.flag = true;
                this.timer = setInterval(()=>{
                    this.progress.percent++;
                    if(this.progress.percent==90){
                        clearTimeout(this.timer);
                    }
                },200);
            }
        });
    }
    get RevData(){
        if(this.$store.state.push_info.count){
            this.startflag = false;
            clearTimeout(this.timer);
            if(this.$store.state.push_info.revdata)this.progress.percent = 100;
            else {
                this.progress.color = "#F56C6C";
                this.progress.flag = false;
            }
        }
        return;
    }
    get DaServerPath(){
        if(this.$store.state.setting_info.info.da_server){
            this.pushInfo.path = this.$store.state.setting_info.info.da_server.path;
        }
        return;
    }
    get LogCmdOut(){
        if(this.$store.state.push_info.log){
            this.logCmd += this.$store.state.push_info.log;
            let div:any = document.getElementById('log');
            div.scrollTop = div.scrollHeight;
        }
        return this.logCmd;
    }
}
</script>
<style scoped>
.fixedColumn{
	width: 300px;
	height: 100%;
	float: left;
	/*position: absolute;
	left: 0;*/
}
.flexibleColumn{
	height: 100%;
	margin-left: 400px;
}
</style>>