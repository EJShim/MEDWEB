var THREE = require("three");

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

  socket.on("SIGNAL_JOIN", function(data){
    var val = $$("ID_CHAT_RESULT").getValue() + "\n" + data + " is joined";
    $$("ID_CHAT_RESULT").setValue(val);
  });

  socket.on("SIGNAL_JOIN_CALLBACK", function(data){
    $$("ID_CHAT_USER").setValue(data);
    $$("ID_CHAT_RESULT").setValue(data + " is joined");
  });


  socket.on("SIGNAL_SCENE", function(data){
    var renderer = Mgr.GetRenderer();
    renderer[0].camera.position.set(data.pos.x, data.pos.y, data.pos.z);
    renderer[0].camera.rotation.set(data.rot.x, data.rot.y, data.rot.z);
    renderer[0].camera.up.set(data.up.x, data.up.y, data.up.z);
    renderer[0].control.target.set(data.tar.x, data.tar.y, data.tar.z);

  });


  socket.on("SIGNAL_CHAT", function(data){

    var val = $$("ID_CHAT_RESULT").getValue() + "\n" + data.user + " : " + data.value;
    $$("ID_CHAT_RESULT").setValue(val);
  });

  socket.on("SIGNAL_CHAT_CALLBACK", function(data){

    var val = $$("ID_CHAT_RESULT").getValue() + "\n" + data.user + " : " + data.value;
    $$("ID_CHAT_RESULT").setValue(val);

    //Clear
    $$("ID_CHAT_INPUT").setValue("");
  });


  //File Upload SIGNAL_MESH_UPLOAD
  socket.on("SIGNAL_MESH_UPLOAD", function(data){
    Mgr.MeshMgr().ImportMesh("./workingdata/" + data, data);
  });

  socket.on("SIGNAL_MESH_SHOWHIDE", function(data){
    Mgr.MeshMgr().ShowHide(data.id, data.show);
  })

  socket.on("SIGNAL_REMOVE_MESH", function(data){
    Mgr.MeshMgr().RemoveMesh(data);
  });
}

module.exports = E_SocketManager;
