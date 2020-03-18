import * as mongoose from 'mongoose';

let propSchema = new mongoose.Schema({
	cid : mongoose.Schema.Types.ObjectId,
	module : String,
	start_time: Date,
	end_time: { type:Date, default: Date.now },
	result : Number,
	case_info : Object, 
	fail_info : Object,
	tested_mode : Number
});

export function getModel(modelName:any){
	return mongoose.model(modelName, propSchema, modelName);
}
export function getResultsModel(modelName:any){
	return mongoose.model(modelName, propSchema, modelName);
}