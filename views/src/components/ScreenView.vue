<template>
    <div>
        <el-link v-model="inScreenView" v-show="false"></el-link>
        <el-link v-model="updateImage" v-show="false"></el-link>
        <el-link v-model="updateSaveStatus" v-show="false"></el-link>
        <el-link v-model="testStatus" v-show="false"></el-link>
        <el-link v-model="ResList" v-show="false"></el-link>
        <el-link v-model="RuleList" v-show="false"></el-link>
        <el-card :body-style="{ padding: '8px' }" style="margin:5px 10px 0px 10px;" shadow="never">
            <el-button style="margin:5px 0px 0px 10px;" plain icon="el-icon-picture" @click="onSync" v-show="!btnStatus"><strong>同步车机</strong></el-button>
            <el-button style="margin:5px 0px 0px 10px;" plain icon="el-icon-loading" v-show="btnStatus"><strong>同步中...</strong></el-button>
            <span style="margin:0px 0px 0px 10px;"><strong><font size="3">同步模式 : {{ readSyncMode }}</font></strong></span>
            <el-divider direction="vertical"></el-divider>
            <span style="margin:0px 0px 0px 10px;"><strong><font size="3">启动模式 : {{ start_mode }}</font></strong></span>
            <el-divider direction="vertical"></el-divider>
            <span style="margin:0px 0px 0px 10px;"><strong><font size="3">绑定类型 : </font></strong></span>
            <RadioGroup v-model="bind_type" style="margin:0px 0px 5px 10px;" @on-change="selectBindType">
                <Radio :label="0"><font size="2">图片</font></Radio>
                <Radio :label="1"><font size="2">坐标</font></Radio>
                <Radio :label="2"><font size="2">轨迹</font></Radio>
            </RadioGroup>
        </el-card>
        <el-card style="margin:5px 10px 0px 10px;" shadow="never">
            <img id="screen" src="/src/assets/none.png" :draggable="false">
        </el-card>
        <Modal v-model="cutflag" :width="imgW" :mask-closable="false" :closable="false">
			<p slot="header">{{ getModelTitle() }}</p>
            <h3>{{ getModelWarn() }}</h3>
            <canvas id="icanvasimg" v-if="bind_type==0"></canvas>
            <div v-else>
				<h3>图片信息</h3>
				<p>宽: {{ info.w }}</p>
				<p>高: {{ info.h }}</p>
				<div v-if="bind_type==1">
					<h3>所点坐标</h3>
					<p>X: {{ info.x1 }}</p>
					<p>Y: {{ info.y1 }}</p>
				</div>
				<div v-else>
					<h3>划动轨迹</h3>
					<p>( {{ info.x1 }} , {{ info.y1 }}) ==> ( {{ info.x2 }} , {{ info.y2 }})</p>
				</div>
			</div>
            <h3>绑定步骤</h3>
            <div>
                <el-select placeholder="请选择" filterable size="small" style="width:100px" v-model="s_action" @change="changeSel(0)">
                    <el-option v-for="val in Action" :key="val" :label="getResName(val)" :value="val"></el-option>
                </el-select>
                <el-select placeholder="请选择" filterable size="small" style="width:140px" v-model="s_module" @change="changeSel(1)">
                    <el-option v-for="val in Module" :key="val" :label="getResName(val)" :value="val"></el-option>
                </el-select>
                <el-select placeholder="请选择" filterable clearable  size="small" style="width:155px" v-model="s_clid" @change="changeSel(2)">
                    <el-option v-for="val in Clid" :key="val" :label="getResName(val)" :value="val">
                        <span style="float: left">{{ getResName(val) }}</span>
                        <span style="float: right"><font :color="checkBinding(0,val)">{{ checkBinding(1,val) }}</font></span>
                    </el-option>
                </el-select>
            </div>
            <span slot="footer">
                <el-button type="info" @click="cancel">取消</el-button>
                <el-button type="primary" v-show="!saveStatus" @click="ok">保存</el-button>
                <el-button type="primary" v-show="saveStatus" icon="el-icon-loading" disabled>保存中</el-button>
            </span>
		</Modal>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
@Component
export default class ScreenView extends Vue {
    private btnStatus:any = false;
    private saveStatus:any = false;
    private img_src:any = "";
    private idx:any=0;
    private stopDraw:any = false;
    private cutflag:any = false;
    private imgW:any = 450;
    private info:any = {x1:-1,y1:-1,x2:-1,y2:-1,w:0,h:0};
    private reslist:any=[];
    private rulelist:any=[];
    private Action:any=["click","assert_pic"];
    private s_action:string="";
    private s_module:string="";
    private s_clid:string="";
    private test_status:any=false;
    private start_mode:string="";
    private bind_type:number = 0;
    private sync_count:number = 0;
    get inScreenView(){
        if(this.$store.state.home_info.mode!="6_3"){
            this.stopDraw = true;
            // let img:any = document.getElementById("screen");
            // if(img)img.src="/none.21306cad.png";
        }else{
            if(this.sync_count>0)this.stopDraw = false;
        }
        return;
    }
    get updateImage(){
        if(this.$store.state.screen_info.count){
            this.btnStatus = false;
            this.$store.state.screen_info.running = false;
            this.showImage();
        }
        return;
    }
    get updateSaveStatus(){
        if(this.$store.state.screen_info.save_count){
            this.saveStatus = false;
            this.cancel();
        }
        return;
    }
    get testStatus(){
        this.test_status = this.$store.state.test_info.testing;
        return;
    }
    get ResList(){
        this.reslist=this.$store.state.steps_info.reslist;
        return;
    }
    get RuleList(){
        this.rulelist=this.$store.state.steps_info.rulelist;
        return;
    }
    get Module(){
        return this.rulelist[this.s_action]!=undefined?this.rulelist[this.s_action]:[];
    }
    get Clid(){
        return this.rulelist[this.s_module]!=undefined?this.rulelist[this.s_module]:[];
    }
    get readSyncMode(){
        let mode = "";
        if(this.$store.state.setting_info.info.da_server!=undefined){
            switch(this.$store.state.setting_info.info.da_server.type){
                case 0:
                    mode = "Wi-Fi";
                    this.start_mode = "COM";
                    break;
                case 1:
                    mode = "Wi-Fi";
                    this.start_mode = "ADB";
                    break;
                case 2:
                    mode = "ADB";
                    this.start_mode = "ADB";
                    break;
            }
        }
        return mode;
    }
    private selectBindType(){
        switch(this.bind_type){
            case 0:
                this.Action = ["click","assert_pic"];
                break;
            case 1:
                this.Action = ["click_poi"];
                break;
            case 2:
                this.Action = ["slide"];
                break;
        }
    }
    private checkBinding(type:number,id:string){
        let bind = this.$store.state.steps_info.bindlist[id];
        switch(type){
            case 0:
                return bind?"#67C23A":"#F56C6C";
            case 1:
                return bind?"已绑定":"未绑定";
        }
    }
    private getResName(id:any){
        let name = this.reslist[id];
        if(name == undefined){
            let tmp:any = {click_poi:"坐标点击",slide:"轨迹划动"};
            name = tmp[id];
        }
        return name;
    }
    private onSync(){
        if(this.test_status){
            this.$notify({title: '测试进行中!!!无法进行操作',message: '', type: 'warning',duration:1500});
        }else{
            this.btnStatus = true;
            this.stopDraw = true;
            this.$store.state.screen_info.running = true;
            this.$store.state.app_info.pis.write({type:"toSer",job:"syncRemote",info:{prjname:this.$store.state.project_info.current_prj}});
        }
    }
    private showImage(){
        let img:any = document.getElementById("screen");
        if(this.$store.state.screen_info.status){
            img.src='http://127.0.0.1:6003/?action=image&image='+this.$store.state.screen_info.path+'&id='+this.idx++;
            this.stopDraw = false;
            this.sync_count++;
            this.onCutImage();
        }else{
            this.sync_count = 0;
            this.stopDraw = true;
            img.src="/none.21306cad.png";
        }
    }
    private ok(){
        if(this.s_clid&&this.s_clid.length){
            this.saveStatus=true;
            let bind_info:any = {type:"toDB",route:"binding",job:"add",info:{prjname:this.$store.state.project_info.current_prj,msg:{id:this.s_clid,pid:this.s_module,content:""}}}; 
            switch(this.bind_type){
                case 0:
                    let s_req = {
                        type : "toSer",
                        job : "saveCutImage",
                        info : {prjname : this.$store.state.project_info.current_prj,cut_info : {id : this.s_clid, info : this.info}}
                    }
                    this.$store.state.app_info.pis.write(s_req);
                    break;
                case 1:
                    bind_info.info.msg.content = this.info;
                    break;
                case 2:
                    bind_info.info.msg.content = this.info;
                    break;
            }
            this.$store.state.app_info.pis.write(bind_info);
        }else{
            this.$notify({title: '请绑定步骤',message: '', type: 'warning',duration:1500});
        }
    }
    private cancel(){
        this.cutflag=false;
        this.stopDraw = false;
        this.s_action="";
        this.s_module="";
        this.s_clid="";
    }
    private onCutImage(){
        let that = this;
        let wId = "w";
        let index = 0;
        let startX = 0, startY = 0;
        let scrollTop:any,scrollLeft:any;
        let minX:any,maxX:any,minY:any,maxY:any;
        let flag = false;
        let retcLeft = 0, retcTop = 0, retcHeight = 0, retcWidth = 0;
        let img:any = document.getElementById("screen");
        img.onload = function() {
            minX=img.offsetLeft;
            maxX=img.offsetLeft+img.offsetWidth;
            minY=img.offsetTop;
            maxY=img.offsetTop+img.offsetHeight;
        };
        document.onmousedown = function(e){
            if(!that.stopDraw){
                let evt:any = window.event || e;
                scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
                scrollLeft = document.body.scrollLeft || document.documentElement.scrollLeft;
                startX = evt.clientX + scrollLeft;
                startY = evt.clientY + scrollTop;
                if(startX>minX&&maxX>startX){
                    if(startY>minY&&maxY>startY){
                        flag=true;
                        switch(that.bind_type){
                            case 0:
                                let p:any = document.createElement("p");
                                p.id = wId + index;
                                p.className = "p";
                                p.style.marginLeft = startX + "px";
                                p.style.marginTop = startY + "px";
                                document.body.appendChild(p);
                                let c:any=document.getElementById("icanvasimg");
                                let ctx=c.getContext("2d");
                                ctx.clearRect(0,0,c.width,c.height);
                                break;
                            default:
                                that.info.x1=Math.floor(startX-minX);
                                that.info.y1=Math.floor(startY-minY);
                                that.info.w=maxX-minX;
                                that.info.h=maxY-minY;
                                break;
                        }
                    }
                }
            }
        };
        document.onmousemove = function(e){
            if(!that.stopDraw&&flag){
                switch(that.bind_type){
                    case 0:
                        let evt:any = window.event || e;
                        let scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
                        let scrollLeft = document.body.scrollLeft || document.documentElement.scrollLeft;
                        let moveX=evt.clientX + scrollLeft;
                        let moveY=evt.clientY + scrollTop;
                        retcLeft=(startX-moveX>0?(moveX<minX?minX:(moveX>maxX?maxX:moveX)):startX);
                        retcWidth=Math.abs(startX-(moveX<minX?minX:(moveX>maxX?maxX:moveX)));
                        retcTop=(startY-moveY>0?(moveY<minY?minY:(moveY>maxY?maxY:moveY)):startY);
                        retcHeight=Math.abs(startY-(moveY<minY?minY:(moveY>maxY?maxY:moveY)));
                        let wid_img:any=document.getElementById(wId + index);
                        wid_img.style.marginLeft = retcLeft+"px";
                        wid_img.style.marginTop = retcTop+"px";
                        wid_img.style.width = retcWidth+"px";
                        wid_img.style.height = retcHeight+"px";
                        break;
                    case 1:
                        break;
                    case 2:
                        break;
                }
            }
        };
        document.onmouseup = function(e){
            let evt:any = window.event || e;
            if(!that.stopDraw&&flag){
                that.imgW=450;
                // console.log("X:"+(retcLeft-minX)+" Y:"+(retcTop-minY)+" W:"+retcWidth+" H:"+retcHeight);
                switch(that.bind_type){
                    case 0:
                        let wid_img:any = document.getElementById(wId + index);
                        document.body.removeChild(wid_img);
                        if(retcWidth&&retcHeight){
                            that.info.x1=retcLeft-minX;
                            that.info.y1=retcTop-minY;
                            that.info.w=retcWidth;
                            that.info.h=retcHeight;
                            that.drawimg(retcLeft-minX,retcTop-minY,retcWidth,retcHeight);
                            that.imgW=that.imgW>retcWidth?450:(retcWidth+50);
                            that.cutflag=true;
                            that.stopDraw=true;
                            retcLeft = 0;
                            retcTop = 0;
                            retcHeight = 0;
                            retcWidth = 0;
                        }
                        break;
                    case 1:
                        let endX_p = evt.clientX + scrollLeft;
                        let endY_p = evt.clientY + scrollTop;
                        if(endX_p==startX&&endY_p==startY){
                            that.cutflag=true;
                            that.stopDraw=true;
                        }
                        break;
                    case 2:
                        let endX_s = evt.clientX + scrollLeft;
                        let endY_s = evt.clientY + scrollTop;
                        if(endX_s!=startX&&endY_s!=startY){
                            that.info.x2=Math.floor(endX_s-minX>maxX?maxX-minX:(endX_s-minX<0?0:endX_s-minX));
                            that.info.y2=Math.floor(endY_s-minY>maxY?maxY-minY:(endY_s-minY<0?0:endY_s-minY));
                            that.cutflag=true;
                            that.stopDraw=true;
                        }
                        break;
                    default:
                        break;
                }
                flag=false;
            }
        };
    }
    private drawimg(x:any,y:any,w:any,h:any){
        let icanvasimg:any=document.getElementById("icanvasimg");
        icanvasimg.width=w;
        icanvasimg.height=h;
        let firstcanvas=document.getElementById("screen");
        let contextimg=icanvasimg.getContext("2d");
        contextimg.drawImage(firstcanvas,x,y,w,h,0,0,w,h);
    }
    private changeSel(flag:Number){
        switch(flag){
            case 0:
                this.s_module="";
                this.s_clid="";
                break;
            case 1:
                this.s_clid="";
                break;
            case 2:
                break;
        }
    }
    private getModelTitle(){
        switch(this.bind_type){
            case 0:
                return "绑定图片";
            case 1:
                return "绑定坐标";
            case 2:
                return "绑定路径";
        }
    }
	private	getModelWarn(){
        switch(this.bind_type){
            case 0:
                return "是否使用该图片?";
            case 1:
                return "是否使用该坐标?";
            case 2:
                return "是否使用该路径?";
        }
    }
}
</script>
<style type="text/css">
	body,p,canvas{margin:0;padding:0}
	.p{position:absolute; border:2px dashed red; width:0px; height:0px;left:0px; top:0px; overflow:hidden;cursor:crosshair}
</style>