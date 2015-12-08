
module.exports = Routes;

function Routes(io){
	// these are arrays of currently assigned values
	var colors = [];
	var boards = [];

	// Listen on websocket connection
	io.on('connection', function(socket){
		// generate random color for user and assign it to their client immediately after connecting
		var reg = {
			user: socket.id,
			color: getColor(),
			board: null
		};
		socket.emit('registered',JSON.stringify(reg));
		
		// log all user connects and disconnects
		console.log('user ' + reg.user + ' connected');
		socket.on('disconnect', function(msg){
			console.log('user ' + reg.user + ' disconnected');
			
			// remove color from the assignment list
			colors.splice(colors.indexOf(reg.color),1);
			
			// remove the user from the board channel
			for (var i=0; i<boards.length; i++){
				for (var i2=0; i2<boards[i].users.length; i2++){
					if (boards[i].users[i2] == socket.id){
						boards[i].users.splice(i2,1);
						
						if (boards[i].users.length <= 0){
							boards.splice(i,1);
							break;
						}
					}
				}
			}
		});
		
		// client subscribes to updates for a specific board by joining that board channel
		socket.on('subscribe',function(msg){
			console.log("user " + socket.id + " joining " + msg);
			socket.join(msg);
			reg.board = msg;
			
			// track this user's subscription
			var matched = false;
			for (var i=0; i<boards.length; i++){
				if (boards[i].board == msg){
					boards[i].users.push(socket.id);
					matched = true;
					break;
				}
			}
			
			if (!matched){
				boards.push({board:msg,users:[socket.id]});
			}
		});
		
		// relay the point data to the board's channel
		socket.on('point', function(msg){
			if (reg.board)
				io.to(reg.board).emit('point',msg);
		});
		
		// return a list of active boards
		socket.on('getList',function(msg){
			var list = [];
			for (var i=0; i<boards.length; i++)
				list.push(boards[i].board);
			
			socket.emit('listActive',JSON.stringify(boards));
		});
	});

	// generates a random hex color string, and ensures it is not already assigned
	function getColor(){
		var color = '#'+Math.floor(Math.random()*16777215).toString(16);
		while (colors.indexOf(color) >= 0)
			color = '#'+Math.floor(Math.random()*16777215).toString(16);
		
		colors.push(color);
		return color;
	}
}