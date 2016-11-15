var ES_SocketManager = require("./ES_SocketManager.js");

function ES_Manager(express, app, router)
{
  //Initialize Server
  app.set('views', __dirname + '/../../views');
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

  var m_socketManager = new ES_SocketManager(this, server);



  console.log("Manager Initialized");

}

module.exports = ES_Manager;
