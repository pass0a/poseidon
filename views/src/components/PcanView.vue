<template>
    <div>
        <el-form label-position="right" ref="pcanform" :model="PcanData" label-width="115px" size="small">
            <el-form-item label="发送数据:">
                <el-button icon="el-icon-plus" size="mini" @click="onAdd()" v-show="!showInput"></el-button><br/>
                <div v-for="(it,index) in pcan_info.data" :key="index">
                    <span>{{ showData(it) }}</span>
                    <a @click.prevent="editShow(index)">
                        <i class="el-icon-edit"></i>
                    </a>
                    <span v-if="idx==index">
                        <el-button-group>
                            <el-button type="primary" size="mini" @click="editItem(index,it)">修改</el-button>
                            <el-button type="success" size="mini" @click="insertItem(index)">插入</el-button>
                            <el-button type="danger" size="mini" @click="deleteItem(index)">删除</el-button> 
                        </el-button-group>
                        <a @click.prevent="editHide()">
                            <i class="el-icon-error"></i>
                        </a>
                    </span>
                </div>
            </el-form-item>
            <el-form-item label="Can_Data:" v-show="showInput">
                <span v-for="index in pcan_info.len" :key="index">
                    <input size="2" maxlength="2" 
                    oninput="value=(value.replace(/[^0-9a-fA-F]/g,'')).toUpperCase()" 
                    onbeforepaste="clipboardData.setData('text',clipboardData.getData('text').replace(/[^\d]/g,''))"
                    v-model="can_data[index-1]"
                    />
                    <span>{{ cpot(index) }}</span>
                </span>
            </el-form-item>
            <el-form-item label="Can_ID:" v-show="showInput">
                <input size="3" maxlength="4" 
                oninput="value=(value.replace(/[^0-9a-fA-F]/g,'')).toUpperCase()" 
                onbeforepaste="clipboardData.setData('text',clipboardData.getData('text').replace(/[^\d]/g,''))" 
                v-model="can_id"/>
                <el-button-group>
                    <el-button type="success" size="small" @click="ok()">{{ btnTitle }}</el-button>
                    <el-button type="danger" size="small" @click="cancel()">取消</el-button>
                </el-button-group>
            </el-form-item>
        </el-form>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
@Component
export default class PcanView extends Vue {
    private pcan_info:any = {data:[],len:8};
    private showInput = false;
    private idx=-1;
    private op=-1;
    private editIdx=-1;
    private btnTitle="";
    private can_data=["00","00","00","00","00","00","00","00"];
    private can_id="0000";
    get PcanData(){
        this.pcan_info = {data:this.$store.state.pcan_info.data, len:8};
        return this.pcan_info;
    }
    private onAdd(){
        this.idx = -1;
        this.can_data=["00","00","00","00","00","00","00","00"];
        this.can_id="0000";
        this.op = 0;
        this.btnTitle = "添加";
        this.showInput = true;
    }
    private showData(it:any){
        let str="";
        for(let i=0;i<it.data.length;i++){
            if(i<it.data.length-1){
                str=str+it.data[i]+"-";
            }else{
                str=str+it.data[i];
            }
        }
        str=str+"  [ Can_ID: "+it.id+" ]";
        return str;
    }
    private editShow(index:number){
        this.idx = index;
    }
    private editHide(){
        this.idx = -1;
    }
    private editItem(index:number,it:any){
        this.editHide();
        this.editIdx = index;
        this.can_data = JSON.parse(JSON.stringify(it.data));
		this.can_id = JSON.parse(JSON.stringify(it.id));
        this.op = 1;
        this.btnTitle = "修改";
        this.showInput = true;
    }
    private insertItem(index:number){
        this.editHide();
        this.editIdx = index;
        this.can_data=["00","00","00","00","00","00","00","00"];
        this.can_id="0000";
        this.op = 2;
        this.btnTitle = "插入";
        this.showInput = true;
    }
    private deleteItem(index:number){
        this.pcan_info.data.splice(index,1);
        this.editHide();
    }
    private cpot(){}
    private ok(){
        let candata=this.disposeData(1,this.can_data);
        let canid=this.disposeData(0,this.can_id);
        switch (this.op) {
            case 0:
                this.pcan_info.data.push({data:candata,id:canid});
                break;
            case 1:
                this.pcan_info.data[this.editIdx].data = candata;
				this.pcan_info.data[this.editIdx].id = canid;
                break;
            case 2:
                this.pcan_info.data.splice(this.editIdx,0,{data:candata,id:canid});
                break;
            default:
                break;
        }
        this.showInput = false;
    }
    private cancel(){
        this.showInput = false;
    }
    private disposeData(ft:any,data:any){
        if(ft){
            for(let i=0;i<data.length;i++){
                let str="";
                for(let j=0;j<2-data[i].length;j++){
                    str=str+"0";
                }
                data[i]=str+data[i];
            }
        }else{
            let str="";
            for(let i=0;i<4-data.length;i++){
                str=str+"0";
            }
            data=str+data;
        }
        return data;
    }
}
</script>