var ES_Manager = require("./router/ES_Manager.js");
var express = require('express');

//Create
var app = express();


//Initialize Server
var Manager = new ES_Manager(express, app);
