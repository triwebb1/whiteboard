var board = (function(){
	var reg = {user:'', color:''};
	var thisBoard = null;
	
	var paths = []; // array of all other users' paths, this may grow too large in memory
	
	// save the user's id and color properties
	function registered(msg, socket, path){
		reg = $.parseJSON(msg);
		path.strokeColor = reg.color;
		console.log("I'm user " + reg.user + " and my color is " + reg.color);
		console.log("I am subscribed to board " + thisBoard);
		
		// subscribe to updates for this board id
		socket.emit('subscribe',thisBoard);
	};
	
	// draw new points on the board
	function recvPoint(msg){
		//console.log("got point",msg);
		var data = $.parseJSON(msg);
		var matched = false;
		
		// abort if this is my point
		if (data.user == reg.user)
			return;
		
		// if path already exists for this userid and color then add point
		for (var i=0; i<paths.length; i++){
			if (paths[i].id == data.id && paths[i].color == data.color){
				paths[i].path.lineTo(data.point[0],data.point[1]);
				matched = true;
			}
		}
		
		// otherwise create new path
		if (!matched){
			var path = new paper.Path();
			path.strokeColor = data.color;
			paths.push({
				id: data.id,
				color: data.color,
				path: path
			});
		}
		
		paper.view.draw();
	};
	
	return {		
		setup: function(canvasID,board){
			thisBoard = board;
			paper.setup(canvasID);
			
			var path = new paper.Path(); // my path
			var socket = io();
			
			// bind socket.io listeners
			socket.on('registered',function(msg){ registered(msg, socket, path); });
			socket.on('point',function(msg){ recvPoint(msg); });
			
			// draw every mousemove and also emit to server
			$("#canvas").on('mousemove',function(event){
				var point = {
					id: thisBoard,
					user: reg.user,
					color: reg.color,
					point: [event.clientX,event.clientY]
				};
				socket.emit('point', JSON.stringify(point));
				
				path.lineTo(event.clientX,event.clientY);
			});
			
			$('#'+canvasID).addClass('board');
		}
	};	
}());