/*
	Multi-party interactive whiteboard 
	
	Author: Tristan Webb
*/

// Diet Server
var server = require('diet')
var app = server()
app.listen(8000)

// Socket.io
var io = require('socket.io')(app.server); // <-- use app.server

// Handlers for socket.io
var ioroutes = require(app.path + '/routes/io-routes.js')(io);

// Custom routes for web server
var routes = require(app.path + '/routes/routes.js')(app);

// Static files if they are requested
var static = require('diet-static')({ path: app.path+'/static/' });
app.footer(static);

/*
    Ideas for extending functionality
	
	- allow user to start/stop their drawing
	- show other user's cursor/pen when they are drawing
	- allow changing of color
	- allow private boards with permissions system
	- show which users are on the room and what their color is
	- assign more properties to users: email, name, profile info
	- fix scaling so that all users see the same board content, just at different zoom levels
		^or add scrollbars to all users that have a screen smaller than the biggest screen in the room
	- add chat capability
	- add image uploading and positioning/editing on the board
	- allow text to be written on the board
	- persist data so that newly joining users can see everything that was drawn before they joined
	- allow users to save an image of the current state of the board
	- add time information to every point, or maybe keyframes, allow user to go rewind/fast-forward like a movie
	- allow users to downlaod a video of what happened on the board
	- add some kind of server status output for monitoring
	- test limits of this socket.io implementation, add load balancer if necessary
	- spare some server load by having clients use direct P2P messaging if available, fall 
		back to using this server if P2P is not possible
	- don't echo point messages back to the sender
	- allow participating on or viewing multiple boards simultaneously
	- test client side limitations for drawing history, add compression mechanism if needed
	- jQuery could pretty easily be replaced with native JS to lighten board.html
	- consider changing user id to something other than the socket id. The socket id changes every time the client
		reconnects; this may be desirable or it may not be
*/

