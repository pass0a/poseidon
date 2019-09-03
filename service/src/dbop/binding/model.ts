import * as mongoose from 'mongoose';

let propSchema = new mongoose.Schema({
	id:String,
	pid:String,
	content:Object,
	date: { type: Date, default: Date.now }
});

export function getModel(modelName:any){
	return mongoose.model(modelName, propSchema, modelName);
}