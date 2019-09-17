import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
	state:{
		req_info:{
			new_prj : 0,
			remove_id : 0,
			refresh_rl : 0
		},
		app_info:{
			pis:{},
			connect_info:{
				server:0,
				db:0,
				link:0
			},
			cflag:0
		},
		auth_info:{
			showflag:false,
			data:{}
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
			info:{}
		},
		report_info:{
			data:"",
			showflag:false,
			case_data:{}
		},
		editcase_info:{
			refresh_data:false,
			update_op:false,
			ret: true,
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
			buttonlist:{},
			grouplist:{},
			adblist:{},
			bindlist:{},
			steplist:[],
			op_data:{
				type:0,
				id:""
			}
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
		module_info:{
			enter:0
		},
		case_prop_id:["case_num","case_dam","case_id","case_name","case_level","case_pre","case_op","case_exp","case_note"],
		case_prop_name:{
			case_num:"需求编号",
			case_dam:"需求名称",
			case_id:"用例ID",
			case_name:"用例名称",
			case_level:"优先级",
			case_pre:"前提条件",
			case_op:"操作步骤",
			case_exp:"预期结果",
			case_note:"备注"
		},
		init_checkbox:["case_id","case_pre","case_op","case_exp"],
		push_info:{
			count:0,
			revdata:{}
		},
		version:"3.2.3"
	},
	mutations:{}
});
