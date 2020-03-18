import * as mongoose from 'mongoose';

let propSchema = new mongoose.Schema({
	version: String,
	pid: mongoose.Schema.Types.ObjectId,
	uid: mongoose.Schema.Types.ObjectId,
	date: { type: Date, default: Date.now }
});

export function getModel(modelName: any) {
	return mongoose.model(modelName, propSchema, modelName);
}
