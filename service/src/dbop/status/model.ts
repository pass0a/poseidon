import * as mongoose from 'mongoose';

let propSchema = new mongoose.Schema({
	module: {
		type : String,
		default: ""
	},
	cid: mongoose.Schema.Types.ObjectId,
	uid: mongoose.Schema.Types.ObjectId
});

export function getModel(modelName:any){
	return mongoose.model(modelName, propSchema, modelName);
}