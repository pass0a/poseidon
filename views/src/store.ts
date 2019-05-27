import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
	state:{
		home_info: {
			select_mode : "0"
		},
		project_info:{
			openflag:false,
			newflag:false,
			current_prj:"",
			prjlist:[
				{
					name:"SU2"
				}
			]
		}
	},
	mutations:{}
});
