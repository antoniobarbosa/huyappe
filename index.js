var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.all('/', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

var names = [
"Mojo Jojo",
"King Louie",
"Terk",
"Cheeta",
"Monkey D. Luffy",
"Curious George",
"Rafiki",
"Kerchak",
"King Kong",
"Bubbles",
"Grape Ape",
"DK",
"Abu",
"Mr. Teeny",
"Evil Monkey",
"Monkey",
"Bippy",
"Paul Frank",
];
var users = {};
var currentRound = 0;
var numOfRounds = 20;
var usersQueue = [];

function executeHuya(callback){

	var leader = users[usersQueue[0]]
    console.log(usersQueue.length);
	for(var i=1; i<usersQueue.length;i++){
		console.log("for");
		if(users[usersQueue[i]].pos==leader.pos){
			users[usersQueue[i]].score--;
			users[usersQueue[0]].score++;
		}else{
			users[usersQueue[i]].score++;
		}
		if(i==usersQueue.length-1){
            users[usersQueue[0]].isLeader = false;
			var ape = usersQueue.shift();
			users[usersQueue[0]].isLeader = true;
			usersQueue.push(ape);
            currentRound ++;
            if(currentRound==numOfRounds){
                restart();
            }
            callback();

		}
	}
}

function restart(){
    currentRound = 0;
    for(var i=0; i<usersQueue.length;i++){
        users[usersQueue[i]].pos=1;
        users[usersQueue[i]].score = 0;

    }
}


app.get('/', function(req, res){
  res.sendfile('index.html');
});



io.on('connection', function(socket){	
	  socket.on('disconnect', function(){
		console.log('user disconnected');
          var index = usersQueue.indexOf(socket.id);
          console.log(index);
          if(index>-1){
            delete users[socket.id];
            console.log(JSON.stringify(usersQueue));
            usersQueue.splice(index,1);
            console.log(JSON.stringify(usersQueue));
          }
	  });
  socket.on('join', function(username){
    if(usersQueue.indexOf(socket.id)==-1){
    var user ={};
	if (username=='__guest'){
		user.name = names[Math.floor(Math.random()*names.length)];
	}else{
		user.name = username;
	}
	user.id= socket.id;
	user.pos = 1;
	user.score = 0;
	users[socket.id] = user;
    usersQueue.push(socket.id);
    io.emit('update queue', usersQueue);
    io.emit('update users', users);
    io.emit('leader', usersQueue[0]);
    }
  });
  
  socket.on('chat message', function(msg){
    console.log(socket.id+ ' message: ' + msg);
	io.emit('chat message', users[socket.id].name+": "+msg);
  });
  
   socket.on('change position', function(pos){
    if(pos>5||pos<0){
		
	}else{
        users[socket.id].pos=pos;
		io.emit('change position', users[socket.id]);
	}
  });
  
  socket.on('huya', function(){
      console.log("huya");
	var user = users[socket.id];
    if(socket.id==usersQueue[0]){
		executeHuya(function(){
            io.emit('round',currentRound);
            console.log(usersQueue[0]);
            io.emit('leader', usersQueue[0]);
            io.emit('update users', users);
        });
	}
  });
	
  });
http.listen(3000, function(){
  console.log('listening on *:3000');
});











