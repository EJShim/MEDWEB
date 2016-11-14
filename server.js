var express = require('express');
var app = express();
var router = require('./router/main')(app);


app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(express.static('public'));

var port = process.env.PORT || 8080;

//Createe Server
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

//Open Server
server.listen(port, function(){
    console.log("Express server has started on port " + port);
});


io.on('connection', function(socket){
  console.log('a user connected');
});
