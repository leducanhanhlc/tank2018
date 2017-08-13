var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));

serv.listen(1999);
console.log("server start");

var socket_list = {};

var io = require('socket.io') (serv, {});
io.sockets.on('connection', function(socket) {
	socket.id = Math.random();
	socket.x = 250;
	socket.y = 250;
	socket.gun_x = [];
	socket.gun_y = [];
	socket.direct = [];
	activity_of(socket);
	socket_list[socket.id] = socket;	
	socket.on('disconnect', function() {
		delete socket_list[socket.id];
	});
});

setInterval(function () {
	var pack = [];
	for(var i in socket_list) {
		var socket = socket_list[i];
		var cnt = socket.gun_x.length;
		for(var j = 0; j < cnt; j++) {
		if((socket.gun_x[j] > -1) && (socket.gun_y[j] > -1) && (socket.gun_x[j] < 5000) && (socket.gun_y[j] < 5000)) {
			if(socket.direct[j] === 'up') {
				socket.gun_y[j]-= 5;
			}
		
			if(socket.direct[j] === 'down') {
				socket.gun_y[j]+= 5;
			}
		
			if(socket.direct[j] === 'left') {
				socket.gun_x[j]-= 5;
			}
		
			if(socket.direct[j] === 'right') {
				socket.gun_x[j]+= 5;
			}
		} else {
			delete socket.gun_x[j];
			delete socket.gun_y[j];
			delete socket.direct[j];
		}
		}
		
		pack.push({
			x : socket.x, 
			y : socket.y, 
			gun_x : socket.gun_x,
			gun_y : socket.gun_y, 
			direct : socket.direct
		});
	}
	
	for(var i in socket_list) {
		var socket = socket_list[i];
		socket.emit('newUpdate', pack);
	}
}, 1000/25);

function activity_of(socket) {
	var _direct = 'empty';
	socket.on('KeyPress', function(data) {
		var cnt = socket.gun_x.length;
		
		if(_direct ==='empty') _direct = 'up';
		if(data.KeyType != 'space') _direct = data.KeyType;
		
		if(data.KeyType === 'up') {
			socket.y-= 10;
		}
		
		if(data.KeyType === 'down') {
			socket.y+= 10;
		}
		
		if(data.KeyType === 'left') {
			socket.x-= 10;
		}
		
		if(data.KeyType === 'right') {
			socket.x+= 10;
		}
		
		if(data.KeyType === 'space') {
			socket.gun_x[cnt] = socket.x;
			socket.gun_y[cnt] = socket.y;
			socket.direct[cnt] = _direct;
			cnt++;
			socket.direct[cnt] = _direct;
		}
		//socket_list[socket.id] = socket;
	});
}


