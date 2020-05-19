class Parse_Data {
	disposeSendData(obj: any) {
		let cmdbase: any = [];
		switch (obj.p_type) {
			case 'init':
				cmdbase = [ 0x4f, 0x55, 0x54, 0x50, 0x20, 0x4f, 0x4e, 0x0a ];
				return cmdbase;
			case 'set_power1':
				cmdbase = [
					0x49,
					0x4e,
					0x53,
					0x54,
					0x20,
					0x4f,
					0x55,
					0x54,
					0x31,
					0x3b,
					0x3a,
					0x56,
					0x4f,
					0x4c,
					0x54,
					0x20
				];
				break;
			case 'set_power2':
				cmdbase = [
					0x49,
					0x4e,
					0x53,
					0x54,
					0x20,
					0x4f,
					0x55,
					0x54,
					0x32,
					0x3b,
					0x3a,
					0x56,
					0x4f,
					0x4c,
					0x54,
					0x20
				];
				break;
			case 'set_both':
				cmdbase = [
					[ 0x49, 0x4e, 0x53, 0x54, 0x20, 0x4f, 0x55, 0x54, 0x31, 0x3b, 0x3a, 0x56, 0x4f, 0x4c, 0x54, 0x20 ],
					[
						0x3b,
						0x49,
						0x4e,
						0x53,
						0x54,
						0x20,
						0x4f,
						0x55,
						0x54,
						0x32,
						0x3b,
						0x3a,
						0x56,
						0x4f,
						0x4c,
						0x54,
						0x20
					]
				];
				break;
			default:
				break;
		}
		let volt = obj.value.toString(10);
		for (let i = 0; i < volt.length; i++) {
			if (obj.p_type == 'set_both') {
				cmdbase[0].push(volt.charCodeAt(i));
				cmdbase[1].push(volt.charCodeAt(i));
				if (i == volt.length - 1) {
					cmdbase = cmdbase[0].concat(cmdbase[1]);
				}
			} else {
				cmdbase.push(volt.charCodeAt(i));
			}
		}
		cmdbase.push(0x0a);
		return cmdbase;
	}
}
export default new Parse_Data();
