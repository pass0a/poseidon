var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var propSchema=new Schema({
	name: String,
	psw : String,
	test: String
},{ collection: 'users' });
module.exports= mongoose.model('users', propSchema);