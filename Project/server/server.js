const request = require('request');
const fs = require('fs');
const parse = require('himalaya');
var prettyjson = require('prettyjson');
const path = require('path');
const express = require('express');
var app = express();
const publicPath = path.join(__dirname , '../public');
const socketIO = require('socket.io');
const http = require('http');
var server = http.createServer(app);
var io = socketIO(server);
app.use(express.static(publicPath));

//express server setup
server.listen(3000, function(){
  console.log('server is up');
});

//socket.io setup

io.on('connection' , function(socket){
   console.log('new user connected');

   socket.on('disconnect' , function(){
      console.log('user disconnect');
   });

   socket.on('makeRequest' , function(Requests){
     console.log('Requesting : ' ,Requests);
     getData(Requests ,socket);

   });

});

// handler
function getData(url , socket){
request(url, function (error, response, body) {
  if(error) {
      socket.emit('run', 'error');
      return console.log(error);
    }
  if (response.statusCode == 200){
    fs.writeFile("./build/test.html", body, function(err) {

       var tag = getTags(socket);
       var tree = makeTree(socket);

    });
  };
});
};

// call backs
var getTags = function(socket){
  fs.readFile('./build/test.html', 'utf8', function(err, data) {
    var  response = data;
    var items = new Object();
    var rez = response.split("<");
    for (let i of rez) {
      if (i.charAt(0).match(/[a-z]/i)) {
        var div = "";
        for (let j of i) {
          if (j.match(/[a-z]/i)) {
            div += j;
          } else {
            break;
          }
        }
        if (items.hasOwnProperty(div)) {
          items[div] = items[div] + 1;
        } else {
          items[div] = 1;
        }
      }
    }
      socket.emit('getTags', items);
 })
};

var makeTree = function(socket){
  fs.readFile('./build/test.html', 'utf8', function(err, data) {
    var response = data;
    const html = fs.readFileSync('./build/test.html', {encoding: 'utf8'});
    const json = parse.parse(html);
   socket.emit('getTree', json);
});



};
