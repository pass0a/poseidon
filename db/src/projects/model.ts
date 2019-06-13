var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var propSchema=new Schema({
	name:String,
	date: { type: Date, default: Date.now },
	uid: Schema.Types.ObjectId
},{ collection: 'projects' });
module.exports= mongoose.model('projects', propSchema);