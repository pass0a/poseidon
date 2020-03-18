import * as mongoose from 'mongoose';

let propSchema = new mongoose.Schema(
	{
		cid: mongoose.Schema.Types.ObjectId,
		vid: mongoose.Schema.Types.ObjectId,
		pid: mongoose.Schema.Types.ObjectId,
		uid: mongoose.Schema.Types.ObjectId,
		date: { type: Date, default: Date.now },
		result: String,
		rtcid: String,
		test_type: String
	},
	{ timestamps: { createdAt: 'date', updatedAt: 'date' } }
);
export function getModel(modelName: any) {
	return mongoose.model(modelName, propSchema, modelName);
}
export function getMrModel(modelName: any) {
	return mongoose.model(modelName, propSchema, modelName);
}
