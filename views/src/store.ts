import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
	state:{
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
		setting_info:{},
		port_info:{}
	},
	mutations:{}
});
