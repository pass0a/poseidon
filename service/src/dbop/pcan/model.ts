import * as mongoose from 'mongoose';

let propSchema = new mongoose.Schema({
    id:String,
    pid:String,
    content:Array
});

export function getModel(modelName:any){
	return mongoose.model(modelName, propSchema, modelName);
}