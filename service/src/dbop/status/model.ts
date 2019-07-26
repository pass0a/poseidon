var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var propSchema=new Schema({
	type: Number,
	module: {
		type : String,
		default: ""
	},
	cid: Schema.Types.ObjectId,
	uid: Schema.Types.ObjectId
});
function getStatus(modelName:any){
	return mongoose.model(modelName, propSchema, modelName);
}
exports.getModel = getStatus;