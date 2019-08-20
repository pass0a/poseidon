<template>
    <div>
        <el-link v-model="inScreenView" v-show="false"></el-link>
        <el-link v-model="updateImage" v-show="false"></el-link>
        <el-link v-model="updateSaveStatus" v-show="false"></el-link>
        <el-link v-model="testStatus" v-show="false"></el-link>
        <el-link v-model="ResList" v-show="false"></el-link>
        <el-link v-model="RuleList" v-show="false"></el-link>
        <el-button style="margin:5px 0px 0px 10px;" plain icon="el-icon-picture" @click="onSync" v-show="!btnStatus">同步车机</el-button>
        <el-button style="margin:5px 0px 0px 10px;" plain icon="el-icon-loading" v-show="btnStatus">同步中...</el-button>
        <span style="margin:0px 0px 0px 10px;"><font size="3">当前同步模式 : {{ readSyncMode }}</font></span>
        <el-card  style="margin:5px 10px 0px 10px;" shadow="never">
            <img id="screen" src="/src/assets/none.png" :draggable="false">
        </el-card>
        <Modal v-model="cutflag" :width="imgW" :mask-closable="false" :closable="false">
			<p slot="header"><i class="el-icon-view"></i>{{ getModelTitle() }}</p>
            <h3>{{ getModelWarn() }}</h3>
            <canvas id="icanvasimg" v-if="mode=='pic'"></canvas>
            <h3>绑定步骤</h3>
            <div>
                <el-select placeholder="请选择" filterable size="small" style="width:100px" v-model="s_action" @change="changeSel(0)">
                    <el-option v-for="val in Action" :key="val" :label="getResName(val)" :value="val"></el-option>
                </el-select>
                <el-select placeholder="请选择" filterable size="small" style="width:140px" v-model="s_module" @change="changeSel(1)">
                    <el-option v-for="val in Module" :key="val" :label="getResName(val)" :value="val"></el-option>
                </el-select>
                <el-select placeholder="请选择" filterable clearable  size="small" style="width:155px" v-model="s_clid" @change="changeSel(2)">
                    <el-option v-for="val in Clid" :key="val" :label="getResName(val)" :value="val"></el-option>
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
import { truncate } from 'fs';
@Component
export default class ScreenView extends Vue {
    private btnStatus:any = false;
    private saveStatus:any = false;
    private img_src:any = "";
    private idx:any=0;
    private stopDraw:any = false;
    private cutflag:any = false;
    private mode:any = "pic";
    private imgW:any = 400;
    private info:any = {x1:-1,y1:-1,x2:-1,y2:-1,w:0,h:0};
    private reslist:any=[];
    private rulelist:any=[];
    private Action:any=["click","assert_pic"];
    private s_action:string="";
    private s_module:string="";
    private s_clid:string="";
    private test_status:any=false;
    get inScreenView(){
        if(this.$store.state.home_info.mode!="6_2"){
            this.stopDraw = true;
            let img:any = document.getElementById("screen");
            if(img)img.src="/none.21306cad.png";
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
        // this.Action=this.$store.state.steps_info.rulelist.action;
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
                    break;
                case 1:
                    mode = "Wi-Fi";
                    break;
                case 2:
                    mode = "ADB";
                    break;
            }
        }
        return mode;
    }
    private getResName(id:any){
        return this.reslist[id];
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
            this.onCutImage();
        }else{
            this.stopDraw = true;
            img.src="/none.21306cad.png";
        }
    }
    private ok(){
        if(this.s_clid&&this.s_clid.length){
            this.saveStatus=true;
            let s_req = {
                type : "toSer",
                job : "saveCutImage",
                info : {
                    prjname : this.$store.state.project_info.current_prj,
                    cut_info : {id : this.s_clid, info : this.info}
                }
            }
            this.$store.state.app_info.pis.write(s_req);
            this.$store.state.app_info.pis.write({type:"toDB",route:"imgs",job:"add",info:{prjname:this.$store.state.project_info.current_prj,msg:{id:this.s_clid,pid:this.s_module}}});
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
                        switch(that.mode){
                            case "pic":
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
                switch(that.mode){
                    case "pic":
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
                    case "poi":
                        break;
                    case "sli":
                        break;
                }
            }
        };
        document.onmouseup = function(e){
            let evt:any = window.event || e;
            if(!that.stopDraw&&flag){
                that.imgW=400;
                // console.log("X:"+(retcLeft-minX)+" Y:"+(retcTop-minY)+" W:"+retcWidth+" H:"+retcHeight);
                switch(that.mode){
                    case "pic":
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
                    case "poi":
                        let endX_p = evt.clientX + scrollLeft;
                        let endY_p = evt.clientY + scrollTop;
                        if(endX_p==startX&&endY_p==startY){
                            that.cutflag=true;
                            that.stopDraw=true;
                        }
                        break;
                    case "sli":
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
        switch(this.mode){
            case "pic":
                return "截取图片";
            case "poi":
                return "获取坐标";
            case "sli":
                return "划动路径?";
        }
    }
	private	getModelWarn(){
        switch(this.mode){
            case "pic":
                return "是否使用该图片?";
            case "poi":
                return "是否使用该坐标?";
            case "sli":
                return "是否使用该路径?";
        }
    }
}
</script>
<style type="text/css">
	body,p,canvas{margin:0;padding:0}
	.p{position:absolute; border:2px dashed red; width:0px; height:0px;left:0px; top:0px; overflow:hidden;cursor:crosshair}
</style>