module.exports = Route;

// for static files
var fs = require('fs');

function Route(app){
	// Route for "HTTP GET /"
	app.get('/', function($){	
		var file = fs.readFileSync(app.path + '/static/html/homepage.html','utf8');
		$.header('content-type', 'text/html');
		$.end(file);
	});

	// Route for "HTTP GET /board"
	app.get('/board/:id', function($){
		var file = fs.readFileSync(app.path + '/static/html/board.html','utf8');
		$.header('content-type', 'text/html');
		$.end(file);
	});
}