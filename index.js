var app = require('express')();
var io = require('socket.io')(http);
var http = require('http').createServer(app);

const REFRESH_TOKEN_TIME = 5000

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

var tokens = {};
var clients = [];
io.on('connection', (socket) => {
    clients.push(socket.id);
    tokens[socket.id] = generateToken();
     
    console.log(clients)
    console.log(tokens)
    console.log()
    socket.on('chat message', (msg) => {
        
    });

    socket.on('disconnect', () => {
        console.log('User with ID ' + socket.id + ' has disconnected\n');
    });
});

http.listen(3000, () => {
    console.log("Listening on port 3000");
});

setInterval(() => {
    clients.forEach(client => {
        try {
            tokens[client] = generateToken()
            io.sockets.connected[client].emit("greeting", tokens[client]);
        } catch(err) {
            //tokens[client] = undefined;
            //var index_to_remove = cli
            //console.log(err);
            // ****************************
            // remeber to remove the disconnected clients from memory
            // ****************************
        }
    });
}, 5000)



var generateToken = () => {
	token = ""
	token += Math.random().toString(36).substr(2)
	token += Math.random().toString(36).substr(2)
	return token
}