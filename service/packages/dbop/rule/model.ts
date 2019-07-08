var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var propSchema=new Schema({
	id:String,
	content:Array
});
function getRuleModel(modelName:any){
	return mongoose.model(modelName, propSchema, modelName);
}
exports.getModel = getRuleModel;