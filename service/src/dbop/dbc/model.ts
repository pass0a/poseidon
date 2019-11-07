import * as mongoose from 'mongoose';

let propSchema = new mongoose.Schema({
	path: String
});

export function getModel(modelName:any){
	return mongoose.model(modelName, propSchema, modelName);
}