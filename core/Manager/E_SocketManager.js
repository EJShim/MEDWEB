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
  var that = this;
  var socket = this.socket;
  var Mgr = this.Mgr;

  socket.on("SIGNAL_JOIN", function(data){
    var val = $$("ID_CHAT_RESULT").getValue() + "\n" + data + " is joined";
    $$("ID_CHAT_RESULT").setValue(val);
    var textarea = $$("ID_CHAT_RESULT").getNode().childNodes[0].childNodes[0];
    textarea.scrollTop = textarea.scrollHeight;
  });

  socket.on("SIGNAL_JOIN_CALLBACK", function(data){
    $$("ID_CHAT_USER").setValue(data);
    $$("ID_CHAT_RESULT").setValue(data + " is joined");
  });

  socket.on("SIGNAL_INIT_MESHLIST", function(data){
    Mgr.MeshMgr().InitMeshList(data);
  });

  socket.on("disconnected", function(){
    socket.emit("disconnect");
  });


  socket.on("SIGNAL_SCENE", function(data){
    that.HandleCamera();
  });


  socket.on("SIGNAL_CHAT", function(data){
    that.HandleChat(data);
  });

  socket.on("SIGNAL_CHAT_CALLBACK", function(data){
    that.HandleChat();
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

E_SocketManager.prototype.HandleCamera = function(data)
{
  var renderer = Mgr.GetRenderer();
  renderer[0].camera.position.set(data.pos.x, data.pos.y, data.pos.z);
  renderer[0].camera.rotation.set(data.rot.x, data.rot.y, data.rot.z);
  renderer[0].camera.up.set(data.up.x, data.up.y, data.up.z);
  renderer[0].control.target.set(data.tar.x, data.tar.y, data.tar.z);
}

E_SocketManager.prototype.HandleChat = function(data){
  var val = $$("ID_CHAT_RESULT").getValue() + "\n" + data.user + " : " + data.value;
  $$("ID_CHAT_RESULT").setValue(val);
  var textarea = $$("ID_CHAT_RESULT").getNode().childNodes[0].childNodes[0];
  textarea.scrollTop = textarea.scrollHeight;
  //console.log($$("ID_CHAT_RESULT").getNode().childNodes[0].childNodes[0]);
}

module.exports = E_SocketManager;
