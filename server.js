var sys = require('util');
var io = require('socket.io').listen(8081);
var http = require('http');

io.set('log level', 0);

var url = require('url');
var fs = require('fs');

// A simple web browser displaying files in /public
http.createServer(function(request, response) {
    var file = url.parse(request.url).pathname;
    file = file.substring(1);
    if (file.length == 0) {
        file = 'index.html';
    }
    file = 'public/' + file;

    console.log(request.method + ' ' + file);
    fs.readFile(file, function(error, content) {
        if (error) {
            response.writeHead(500);
            response.end();
        } else {
            response.writeHead(200, {'Content-type': 'text/html'});
            response.end(content, 'utf-8');
        }
    });
}).listen(8080);

var clients = {};

// Simply keep a list of clients as they join, and rebroadcast submitted data
// from the client to them.
io.sockets.on('connection', function (socket) {
    sys.debug('Connected ' + socket.id);
    clients[socket.id] = socket;

    socket.on('info', function(msg) {
        sys.debug(socket.id + ': ' + msg);
    });

    socket.on('data', function(data) {
        socket.broadcast.emit('update', data);
    });

    socket.on('close', function() {
        sys.debug('Disconnected ' + socket.id);
        delete clients[socket.id];
    });
});
