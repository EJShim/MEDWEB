var express = require('express');
var app = express();
var router = require('./router/main')(app);

//Eungjune Server Manager
var ES_Manager = require("./core/Server/ES_Manager.js");


//Initialize Server
var Manager = new ES_Manager(express, app, router);
