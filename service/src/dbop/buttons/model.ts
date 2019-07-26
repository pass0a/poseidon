var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var propSchema=new Schema({
    id:String,
    event:String,
    content:Array
});
function getButtonModel(modelName:any){
	return mongoose.model(modelName, propSchema, modelName);
}
exports.getModel = getButtonModel;