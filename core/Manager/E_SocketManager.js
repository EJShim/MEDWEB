function E_SocketManager(Mgr)
{
  this.Mgr = Mgr;
  this.socket = io();

  this.socket.on("scene", function(data){
    ///TEST Socket Interaction
    var renderer = Mgr.GetRenderer();
    renderer[0].camera.position.set(data.pos.x, data.pos.y, data.pos.z);
    //renderer[0].control.update();

    Mgr.Render();
  })
}

module.exports = E_SocketManager;
