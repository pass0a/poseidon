import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
	state:{
		req_info:{
			new_prj : 0,
			refresh_rl : 0
		},
		app_info:{
			pis:{}
		},
		home_info: {
			count:0,
			mode:0
		},
		project_info:{
			openflag:false,
			newflag:false,
			current_prj:"",
			prjlist:[]
		},
		login_info:{
			name:"",
			psw:"",
			_id:"",
			showflag:false
		},
		test_info:{
			info : {},
			count : 0,
			testing : false,
			stopflag : false 
		},
		setting_info:{
			info:{},
			select_serial:""
		},
		alert_info:{
			showflag:false,
			type: 0,
			info:""
		},
		report_info:{
			data:"",
			showflag:false,
			case_data:{}
		},
		editcase_info:{
			refresh_data:false,
			update_op:false,
			data:{}
		},
		case_info:{
			showflag:false,
			type:0,
			data:{}
		},
		steps_info:{
			reslist:{},
			rulelist:{},
			steplist:[]
		},
		screen_info:{
			count:0,
			running:false,
			status:false,
			path:"",
			save_count:0
		},
		id_info:{
			count:0
		},
		case_prop:new Map([
			["case_num","需求编号"],
			["case_dam","需求名称"],
			["case_id","用例ID"],
			["case_name","用例名称"],
			["case_level","优先级"],
			["case_pre","前提条件"],
			["case_op","操作步骤"],
			["case_exp","预期结果"],
			["case_note","备注"]
		]),
		case_module:new Map([
			["module_1","System"],
			["module_2","AUX"],
			["module_3","USB"],
			["module_4","IPOD"],
			["module_5","Radio"],
		]),
		init_checkbox:["case_id","case_pre","case_op","case_exp"]
	},
	mutations:{}
});
