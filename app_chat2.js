var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);

server.listen(3000, ()=>{
        console.log("server listen on 3000 port");
});

io.on('connection', function (socket) {
        console.log("a user connected");
        socket.on("chat message", (msg,username) =>{
                console.log(msg);
                console.log(username)
                io.emit("chat message" ,msg,username)
        })
});
