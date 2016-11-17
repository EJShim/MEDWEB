var ES_SocketManager = require("./ES_SocketManager.js");
var ES_MeshManager = require("./ES_MeshManager.js");
var ES_Router = require('./ES_Router.js');

function ES_Manager(express, app)
{
  //Initialize Server.set('views', __dirname + '/../views');
  app.set('view engine', 'ejs');
  app.engine('html', require('ejs').renderFile);
  app.use(express.static('public'));

  var port = process.env.PORT || 8080;

  //Createe Server
  var server = require('http').createServer(app);


  //Open Server
  server.listen(port, function(){
      console.log("Express server has started on port " + port);
  });

  var m_router = new ES_Router(this, app);
  var m_socketManager = new ES_SocketManager(this, server);
  var m_meshManager = new ES_MeshManager(this);
  this.camera = null





  this.Router = function()
  {
    return m_router;
  }

  this.SocketMgr = function(){
    return m_socketManager;
  }

  this.MeshMgr = function(){
    return m_meshManager;
  }
}

ES_Manager.prototype.Destroy = function()
{
  var socket = this.socketMgr();
  this.MeshMgr().Destroy();
}

module.exports = ES_Manager;
