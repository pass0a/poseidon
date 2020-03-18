import * as mongoose from 'mongoose';

let propSchema = new mongoose.Schema({
	case_num:String,
	case_dam:String,
	case_module:String,
	case_id:String,
	case_name:String,
	case_level:String,
	case_pre:String,
	case_op:String,
	case_exp:String,
	case_assert:String,
	case_mode:Number,
	case_note:String,
	case_steps:Array
});
export function getModel(modelName:any){
	return mongoose.model(modelName, propSchema, modelName);
}
export function getCaseModel(modelName:any){
	return mongoose.model(modelName, propSchema, modelName);
}