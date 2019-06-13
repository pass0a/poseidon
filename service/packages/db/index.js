'use strict';

var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/test', {
	useNewUrlParser: true,
	ssl: false
});
var Cat = mongoose.model('Cat', {
	name: String
});
var kitty = new Cat({
	name: 'Zildjian'
});
kitty.save().then(() => {
	console.log('meow');
});
