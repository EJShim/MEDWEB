var express = require('express');
var app = express();
var router = require('./router/main')(app);

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(express.static('public'));

var port = process.env.PORT || 8080;

var server = app.listen(port, function(){
    console.log("Express server has started on port " + port);
});
