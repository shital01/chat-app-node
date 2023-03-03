const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io')
const {generateMessage} = require('./utils/messages.js')
const {addUser,removeUser,getUser,getUsersInRoom} = require('./utils/users.js')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT||3000;

const publicDirectoryPath = path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath));

let count = 0; 
//here on socket code
io.on('connection',(socket)=>{
	//console.log("a new connection")
	socket.on('join',({username,room},callback)=>{
		//id of each connection
		const {error,user} = addUser({id:socket.id,username,room})
		if(error){
			return callback(error)
		}
		console.log(getUsersInRoom(user.room))
		socket.join(user.room);
		socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username}  had joined in`))
		io.to(user.room).emit('roomData',{
			room:user.room,
			users:getUsersInRoom(user.room)
		})

		callback();
	})
	//socket.broadcast.emit('message',generateMessage("user had joined in"))
	socket.on('sendMessage',(message,callback)=>{
		//console.log(message);
		const user = getUser(socket.id);

		io.to(user.room).emit('message',generateMessage(user.username,message));
		callback('delievered');		
	})

	socket.on('disconnect',()=>{
			const user = removeUser(socket.id)
			if(user){
				io.to(user.room).emit('message',generateMessage('Admin',`${user.username} had left ...`))
				io.to(user.room).emit('roomData',{
					room:user.room,
					users:getUsersInRoom(user.room)
					})
			}
		})
});

server.listen(port,()=>{
	console.log(`server is up on port ${port}!!`)
})