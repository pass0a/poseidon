import * as mongoose from 'mongoose';

let propSchema = new mongoose.Schema({
	name: String,
	psw : String
},{ collection: 'users' });

export function getModel(modelName:any){
	return mongoose.model(modelName, propSchema, modelName);
}