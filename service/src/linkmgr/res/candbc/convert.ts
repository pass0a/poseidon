import * as fs from 'fs';
import dbc from '@passoa/dbcparser';

class ConvertDBC {
	private convertDBC: any = {
		Messages_List: [],
		Messages_Info: {},
		Signals_Info: {}
	};
	convertFile(dbc_path: any, json_path: any) {
		return new Promise((resolve) => {
			this.convertDBC.Messages_List = [];
			this.convertDBC.Messages_Info = {};
			this.convertDBC.Signals_Info = {};
			new dbc().parse(dbc_path, (data: any) => {
				this.convertFormat(data, json_path, () => {
					resolve(0);
				});
			});
		});
	}
	private convertFormat(data: any, json_path: any, callback: any) {
		for (let prop in data.messages) {
			this.convertDBC.Messages_List.push(data.messages[prop].name);
			this.convertDBC.Messages_Info[data.messages[prop].name] = {
				id: parseInt(prop),
				dlc: data.messages[prop].dlc,
				signals: []
			};
			for (let i = 0; i < data.messages[prop].signals.length; i++) {
				this.convertDBC.Messages_Info[data.messages[prop].name].signals.push(
					data.messages[prop].signals[i].name
				);
				let s_name = data.messages[prop].signals[i].name;
				for (let s_prop in data.messages[prop].signals[i]) {
					if (s_prop == 'name') {
						this.convertDBC.Signals_Info[s_name] = {};
					} else {
						this.convertDBC.Signals_Info[s_name][s_prop] = data.messages[prop].signals[i][s_prop];
					}
				}
				if (data.value[s_name] != undefined) {
					this.convertDBC.Signals_Info[s_name].physics = false;
					this.convertDBC.Signals_Info[s_name].value = data.value[s_name].list;
				} else {
					this.convertDBC.Signals_Info[s_name].physics = true;
				}
			}
		}
		fs.writeFileSync(json_path, JSON.stringify(this.convertDBC));
		callback();
	}
}
export default new ConvertDBC();
