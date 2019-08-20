import * as mongoose from 'mongoose';

let propSchema = new mongoose.Schema({
	id:String,
	pid:String,
	date: { type: Date, default: Date.now }
});

export function getModel(modelName:any){
	return mongoose.model(modelName, propSchema, modelName);
}