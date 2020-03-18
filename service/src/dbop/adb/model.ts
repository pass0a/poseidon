import * as mongoose from 'mongoose';

let propSchema = new mongoose.Schema({
	id:String,
	pid:String,
	send_data:String,
	type:Number,
	timeout:Number,
	rev_data:String
});

export function getModel(modelName:any){
	return mongoose.model(modelName, propSchema, modelName);
}