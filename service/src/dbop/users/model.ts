import * as mongoose from 'mongoose';

let propSchema = new mongoose.Schema(
	{
		username: String,
		password: String,
		name: String,
		role: Number
	},
	{ collection: 'users' }
);

export function getModel(modelName: any) {
	return mongoose.model(modelName, propSchema, modelName);
}
