/*
	- homepage loads list of boards
	- board sets title
	- board loads paper.js
	- socket registration
	- socket subscribe
	- socket point
*/

/*
	The test stack looks like this:
		- mocha (test runner)
		- selenium-webdriver (browser and controls for browser)
		- socket.io-client (listens to boards)
*/

var webdriver = require('selenium-webdriver');
var test = require('selenium-webdriver/testing');
var assert = require('assert');
var By = webdriver.By;
var until = webdriver.until;
var io = require('socket.io-client');

before(function(){
	this.timeout = 10000;
	this.driver = new webdriver.Builder()
		.withCapabilities(webdriver.Capabilities.phantomjs())
		.build();
});

after(function(){
	this.driver.quit();
});

test.describe('End-to-End tests', function(){
	test.describe('Homepage', function(){
		beforeEach(function(){
			this.driver.get('http://localhost:8000/');
		});

		test.it('has the right title',function(){			
			var title = this.driver.findElement(By.tagName('title'));
			title.getInnerHtml().then(function(value) {
			  assert.equal((value.indexOf('All Boards') >= 0), true);
			});

		});

		test.it('socket put an <li> in the list',function(done){
			var d = this.driver;
			d.wait(function(){
				return d.isElementPresent(By.tagName('li'));
			}, 5000);
			
			var ul = d.findElement(By.id('list')).getInnerHtml().then(function(value){
				assert.equal((value.indexOf('<li') >= 0), true);
			});
			
			done();
		});

	});

	test.describe('/board', function(){
		beforeEach(function(){
			this.driver.get('http://localhost:8000/board');
		});

		test.it('returns 404 message',function(){			
			var title = this.driver.findElement(By.tagName('body'));
			title.getInnerHtml().then(function(value) {
			  assert.equal((value.indexOf('404 page not found') >= 0), true);
			});

		});
	});
	
	test.describe('/board/mochatestboard', function(){
		before(function(){
			this.driver.get('http://localhost:8000/board/mochatestboard');
		});

		test.it('initializes canvas with \'board\' class',function(done){			
			var d = this.driver;
			d.wait(function(){
				return d.isElementPresent(By.className('board'));
			}, 1000);
			
			done();
		});
		
		test.it('sends and receives point data',function(done){
			// use socket.io-client to connect to server, subscribe to mochatestboard, listen for point data
			var socket = io.connect('http://localhost:8000', {'force new connection': true});
			socket.emit('subscribe','mochatestboard');
			socket.on('point',function(msg){
				socket.disconnect();
				done();
			});
			
			// send mousemove event to the board in-browser
			var d = this.driver;
			d.wait(function(){
				return d.isElementPresent(By.className('board'));
			}, 1000);
			var board = d.findElement(By.className('board'));
			d.actions().mouseMove(board).perform();
		});
		
		test.it('does not hear point data for other boards',function(done){
			// use socket.io-client to connect to server, subscribe to mochatestboard2, listen for point data
			var socket = io.connect('http://localhost:8000', {'force new connection': true});
			socket.emit('subscribe','mochatestboard2');

			var timeout = setTimeout(function(){ socket.disconnect(); done(); }, 500);
			
			socket.on('point',function(msg){
				clearTimeout(timeout);
				console.log("pont",msg);
				socket.disconnect();
				done(new Error('Received point data for another board'));
			});
			
			// send mousemove event to the board in-browser to mochatestboard (not 2)
			var d = this.driver;
			d.wait(function(){
				return d.isElementPresent(By.className('board'));
			}, 100);
			var board = d.findElement(By.className('board'));
			d.actions().mouseMove(board).perform();
		});
		
		test.it('gets unique colors to draw with',function(done){
			var color1 = "";
			var color2 = "";
			
			var flow = webdriver.promise.controlFlow();
			flow.execute(function(){
				var deferred = webdriver.promise.defer();
				
				var socket = io.connect('http://localhost:8000', {'force new connection': true});
				socket.on('registered',function(msg){
					color1 = JSON.parse(msg).color;
					if (color1.length > 0 && color2.length > 0)
						deferred.fulfill();
					socket.disconnect();
				});
				
				var socket2 = io.connect('http://localhost:8000', {'force new connection': true});
				socket2.on('registered',function(msg){
					color2 = JSON.parse(msg).color;
					if (color1.length > 0 && color2.length > 0)
						deferred.fulfill();
					socket2.disconnect();
				});
				
				return deferred.promise;
			}).then(function(){
				assert.notEqual(color1,color2);
			});
			
			done();
		});
	});
});