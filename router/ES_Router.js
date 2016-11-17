var multiparty = require("multiparty");
var fs = require("fs");

function ES_Router(Mgr, app)
{
  this.Mgr = Mgr;
  this.app = app;

  this.Initialize();
}

ES_Router.prototype.Initialize = function()
{
  var app = this.app;
  var router = this;

  //TEST

  app.get('/',function(req,res){
    res.render('index.html')
  });

  app.get('/about',function(req,res){
    res.render('about.html');
  });

  app.post('/upload', function(req, res){
    //When Upload Mesh
    router.HandleFileUpload(req, res)
  });
}

ES_Router.prototype.HandleFileUpload = function(req, res)
{
  var socket = this.Mgr.SocketMgr();
  var meshMgr = this.Mgr.MeshMgr();
  var form = new multiparty.Form();

  form.on('field', function(name, value){
    console.log('normal filed / name = ' + name + ', value = ' + value);
  });

  form.on('part', function(part){
    var filename;
    var size;
    if(part.filename){
      filename = part.filename;
      size = part.byteCount;

      console.log("file name : " + filename);
      console.log("file size : " + size);
    }else{
      part.resume();
    }

    console.log("Write Streaming file : " + filename);
    var writeStream = fs.createWriteStream('./public/workingdata/'+filename);
    writeStream.filename = filename;
    part.pipe(writeStream);

    part.on('data', function(chunk){
      console.log(filename + ' read ' + chunk.length + 'bytes');
    });

    part.on('end', function(){
      console.log(filename + 'Part read complete');
      writeStream.end();
      meshMgr.AddMesh(filename);
      socket.OnFinishFileUpload(filename);
    });
  });

  form.on('close', function(){
    res.status(200).send('Upload Complete');
  });

  form.on('progress', function(byteRead, byteExcepted){
    //console.log('Reading total' + byteRead + '/' + byteExcepted);
  });

  form.parse(req);

}

ES_Router.prototype.DeleteFile = function(path)
{
  fs.stat(path, function (err, stats) {
   console.log(stats);//here we got all information of file in stats variable

   if (err) {
       return console.error(err);
   }

   fs.unlink(path,function(err){
        if(err) return console.log(err);
        console.log('file deleted successfully');
   });
 });
}


module.exports = ES_Router;
