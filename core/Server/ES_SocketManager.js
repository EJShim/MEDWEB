function ES_SocketManager(Mgr, server)
{
  this.Mgr = Mgr;

  //Initialize WebSocket
  var m_io = require('socket.io').listen(server);

  this.IO = function(){
    return m_io;
  }


  this.Initialize();

}

ES_SocketManager.prototype.Initialize = function()
{
  this.HandleSignal();
}

ES_SocketManager.prototype.HandleSignal = function()
{
  var io = this.IO();
  var that = this;

  io.on('connection', function(socket){
    console.log('a user connected : ' + socket);

    socket.on("scene", function(data){
      that.HandleCamera(socket, data);
    });

    socket.on("SOCKET_CHAT", function(data){
      that.HandleChat(socket, data);
    })
  });
}

ES_SocketManager.prototype.HandleCamera = function(socket, data)
{
  socket.broadcast.emit("scene", data);
}

ES_SocketManager.prototype.HandleChat = function(socket, data)
{
  var io = this.IO();
  io.emit("SOCKET_CHAT", data);

}

module.exports = ES_SocketManager;
