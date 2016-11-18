function ES_SocketManager(Mgr, server)
{
  this.Mgr = Mgr;

  //Initialize WebSocket
  var m_io = require('socket.io').listen(server, {'forceNew':true });

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


  io.sockets.on('connection', function(socket){
    //Initialize Chat
    console.log("New Connection!!");
    socket.emit("SIGNAL_JOIN_CALLBACK", socket.id);
    socket.broadcast.emit("SIGNAL_JOIN", socket.id);

    //Initialize camera
    ;
    if(that.Mgr.camera != null){
      socket.emit("SIGNAL_SCENE", that.Mgr.camera);
    }

    //Initailize Mesh List
    socket.emit("SIGNAL_INIT_MESHLIST", that.Mgr.MeshMgr().m_meshList);

    socket.on("SIGNAL_SCENE", function(data){
      that.HandleCamera(socket, data);
    });

    socket.on("SIGNAL_CHAT", function(data){
      that.HandleChat(socket, data);
    });

    socket.on("SIGNAL_MESH_SHOWHIDE", function(data){
      socket.broadcast.emit("SIGNAL_MESH_SHOWHIDE", data);
    });

    socket.on("SIGNAL_REMOVE_MESH", function(data){
      that.Mgr.MeshMgr().RemoveMesh(data);
      socket.broadcast.emit("SIGNAL_REMOVE_MESH", data);
    });

    socket.on("TEST_MESSAGE", function(data){
      var temp = JSON.parse(data);
      console.log(temp);
      that.HandleCamera(socket, temp);
    });

    socket.once("disconnet", function(){
      console.log("A User Disconnected : ");
    });


  });
}

ES_SocketManager.prototype.HandleCamera = function(socket, data)
{
  this.Mgr.camera = data;
  socket.broadcast.emit("SIGNAL_SCENE", data);
}

ES_SocketManager.prototype.HandleChat = function(socket, data)
{
  var io = this.IO();

  socket.emit('SIGNAL_CHAT_CALLBACK', data);
  socket.broadcast.emit("SIGNAL_CHAT", data);
}

ES_SocketManager.prototype.OnFinishFileUpload = function(path)
{


  //EMIT SIGNAL
  var io = this.IO();
  io.emit('SIGNAL_MESH_UPLOAD', path);
}

module.exports = ES_SocketManager;
