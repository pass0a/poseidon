import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
	state:{
		app_info:{
			reqCount:0,
			type:""
		},
		home_info: {},
		project_info:{
			openflag:false,
			newflag:false,
			current_prj:"",
			prjlist:[
				{
					name:"Test"
				}
			]
		},
		login_info:{
			showflag:false
		},
		setting_info:{
			info:{},
			select_serial:""
		},
		alert_info:{
			showflag:false,
			type: 0
		}
	},
	mutations:{}
});
