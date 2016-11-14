function E_SocketManager(Mgr)
{
  this.Mgr = Mgr;
  this.socket = io();
}

module.exports = E_SocketManager;
