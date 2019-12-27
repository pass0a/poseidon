//var x = require('run.js');
var Benchmark = require('benchmark');
var cp = require('child_process');
var suite = new Benchmark.Suite();

// add tests
suite
	.add('RegExp#test', function() {})
	.add('String#indexOf', function() {
		'Hello World!'.indexOf('o') > -1;
	})
	// add listeners
	.on('cycle', function(event) {
		console.log(String(event.target));
	})
	.on('complete', function() {
		console.log('Fastest is ' + this.filter('fastest').map('name'));
	})
	// run async
	.run({ async: true });
