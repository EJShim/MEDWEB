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
    socket.emit("SIGNAL_JOIN_CALLBACK", socket.id);
    socket.broadcast.emit("SIGNAL_JOIN", socket.id);

    socket.on("SIGNAL_SCENE", function(data){
      that.HandleCamera(socket, data);
    });

    socket.on("SIGNAL_CHAT", function(data){
      that.HandleChat(socket, data);
    })


    socket.on("disconnet", function(){
      console.log("A User Disconnected : ");
    });

  });
}

ES_SocketManager.prototype.HandleCamera = function(socket, data)
{
  //console.log(data);

  socket.emit("SIGNAL_SCENE_CALLBACK", null);
  socket.broadcast.emit("SIGNAL_SCENE", data);
}

ES_SocketManager.prototype.HandleChat = function(socket, data)
{
  var io = this.IO();

  socket.emit('SIGNAL_CHAT_CALLBACK', data);
  socket.broadcast.emit("SIGNAL_CHAT", data);
}

module.exports = ES_SocketManager;
