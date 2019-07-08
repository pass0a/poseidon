var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var propSchema=new Schema({
	id:String,
	name:String
});
function getResModel(modelName:any){
	return mongoose.model(modelName, propSchema, modelName);
}
exports.getModel = getResModel;