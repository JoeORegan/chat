/*
	Joe O'Regan
	30/01/2019
*/
const express = require("express"),
  http = require("http");
socketio = require("socket.io");

var port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = require("socket.io")(server);

const red = "\x1b[31m";
const green = "\x1b[32m";
const blue = "\x1b[34m";
const white = "\x1b[37m";
const magenta = "\x1b[35m";
const cyan = "\x1b[36m";
const reset = "\x1b[0m";

app.use(express.static("static"));

var users = [];

io.on("connection", (socket) => {
  //socket.broadcast.emit('user.events', {name: 'system', message: 'Someone has joined!'});
  console.log(green + "New User Connected" + reset);

  socket.on("newuser", (data) => {
    console.log("new connection from ");

    var nameExists = false;

    for (var i = 0; i < users.length; i++) {
      if (users[i] == data.name) {
        nameExists = true;
        break;
      }
    }

    if (!nameExists) {
      users.push(data.name);
    }

    console.log("Current Users (" + users.length + "): " + users);
    //socket.broadcast.emit('user.events', {name: 'update', message: 'User: ' + data.name + ' has joined the chat. Users: ' + userList.length, users: userList});
    socket.broadcast.emit("user.events", {
      name: "system",
      message:
        "User: " + data.name + " has joined the chat. Users: " + users.length,
    });

    io.emit("update-user-list", users);
  });

  socket.on("updateuser", (data) => {
    var nameChanged = false;

    for (var i = 0; i < users.length; i++) {
      if (users[i] == data.oldname) {
        users[i] = data.newname;
        nameChanged = true;
        break;
      }
    }

    if (nameChanged) {
      console.log("User: " + data.oldname + ' is now "' + data.newname + '"');
      console.log("Current Users (" + users.length + "): " + users);
      socket.broadcast.emit("user.events", {
        name: "system",
        message: "User: " + data.oldname + ' is now "' + data.newname + '"',
      });

      io.emit("update-user-list", users);
    }
  });

  socket.on("message", (data) => {
    console.log(data.name, "says", data.message);
    socket.broadcast.emit("message", data); // broadcast to everyone except this
  });

  socket.on("disconnect", function (data) {
    console.log(red + "User has disconnected / reset connection" + reset);
    // console.log(data);

    if (users.length > 0) {
      socket.broadcast.emit("user.events", {
        name: "system",
        message: "Someone has left the chat!",
      });
    }
  });
});

server.listen(port);

console.log(
  `${red}   ___  ___________  ${blue} _____ _           _   
${red}  |_  ||  _  | ___ \\${blue} /  __ \\ |         | |  
${red}    | || | | | |_/ /${blue} | /  \\/ |__   __ _| |_ 
${red}    | || | | |    / ${blue} | |   | '_ \\ / _\` | __|
${red}/\\__/ /\\ \\_/ / |\\ \\ ${blue} | \\__/\\ | | | (_| | |_ 
${red}\\____/  \\___/\\_| \\_| ${blue} \\____/_| |_|\\__,_|\\__|${reset}`
);

console.log(
  white + "Server running at " + magenta + "http://localhost:" + port + reset
);
console.log("Press " + cyan + "Ctrl+C" + reset + " to stop the server");
