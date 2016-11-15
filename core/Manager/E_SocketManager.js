function E_SocketManager(Mgr)
{
  this.Mgr = Mgr;
  this.socket = io();

  this.Initialize();
}

E_SocketManager.prototype.Initialize = function()
{
  this.HandleSignal();
}

E_SocketManager.prototype.EmitData = function(signal, data)
{
  var socket = this.socket;

  socket.emit(signal, data);
}

E_SocketManager.prototype.HandleSignal = function()
{
  var socket = this.socket;
  var Mgr = this.Mgr;


  socket.on("scene", function(data){
    ///TEST Socket Interaction
    var renderer = Mgr.GetRenderer();
    renderer[0].camera.position.set(data.pos.x, data.pos.y, data.pos.z);
    //renderer[0].control.update();

    Mgr.Render();
  })

  socket.on("SOCKET_CHAT", function(data){
    var val = $$("ID_CHAT_RESULT").getValue() + "\n" + data;
    $$("ID_CHAT_RESULT").setValue(val);
  });
}

module.exports = E_SocketManager;
