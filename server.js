"use strict";
var HashMap = require('hashmap');
const express = require('express');
const app = express();
const http = require('http');
const httpServer = http.Server(app);
const io = require('socket.io')(httpServer);
const SocketIOFile = require('socket.io-file');
const path = require('path');
var ss = require('socket.io-stream');
const fs = require('fs');
var hmap = new HashMap();;
var chokidar = require('chokidar');
const datapath = '/home/ranjith/Documents/Bot-transfer-master/data/';
const zippath = '/home/ranjith/Documents/Bot-transfer-master/'
var zipFolder = require('zip-folder');
 

// var watcher = chokidar.watch('/home/ranjith/Documents/socket.io-file-example/data', {ignored: /^\./, persistent: true});
//
// watcher
// 	.on('add', function(path) {
// 		console.log("Server watcher called");
//
// 		console.log('File', path, 'has been added');})
// 	.on('change', function(path) {console.log('File', path, 'has been changed');})
// 	.on('unlink', function(path) {console.log('File', path, 'has been removed');})
// 	.on('error', function(error) {console.error('Error happened', error);})





io.on('connection', (socket) => {
	console.log('Socket connected.');
//Zipping for initial download.
zipFolder(datapath, zippath + 'archive.zip', function(err) {
    if(err) {
        console.log('Zipping Error, Master copy not sent');
    } else {
        console.log('Zipping done');
		var stream = ss.createStream();
console.log("Sending Master folder");
fs.createReadStream(zippath + 'archive.zip').pipe(stream);
ss(socket).emit('master-sent',stream);	
console.log("Sent Master Folder");
    }
});

 

	var count = 0;
	console.log(socket.id);
	hmap.set(socket.id, socket);
	console.log(hmap);
	ss(socket).on('client-added', function(stream, data) {
		console.log("client added");
		// ss(socket).broadcast.emit('profile-image1', stream, {name: path});
		var filename = path.basename(data.name);
    stream.pipe(fs.createWriteStream(datapath + filename))
		stream.on("end", function(){
			console.log("end called");
			hmap.forEach(function(value, key) {
					console.log("checking socket");
					if(socket.id != value.id) {
						console.log("asdfasdfasdfasdfasdfasdf")
						console.log(key + " : " + value);
						var stream = ss.createStream();
						fs.createReadStream(datapath + filename).pipe(stream);
						ss(value).emit('server-added', stream, {name: filename});
						
					}
			});
		});
		
		hmap.forEach(function(value, key) {
    console.log(key + " : " + value);
});
		
	})
//modify file event listener
		ss(socket).on('client-modified', function(stream, data) {
		console.log("client modified");
		// ss(socket).broadcast.emit('profile-image1', stream, {name: path});
		var filename = path.basename(data.name);
    		stream.pipe(fs.createWriteStream(datapath + filename, {flags: 'w'}));
		stream.on("end", function(){
			console.log("end called");
			hmap.forEach(function(value, key) {
					console.log("checking socket");
					if(socket.id != value.id) {
						console.log("asdfasdfasdfasdfasdfasdf")
						console.log(key + " : " + value);
						var stream = ss.createStream();
						fs.createReadStream(datapath + filename).pipe(stream);
						ss(value).emit('server-modified', stream, {name: filename});
						
					}
			});
		});
hmap.forEach(function(value, key) {
    console.log(key + " : " + value);
});
	})
//remove file event listener
		ss(socket).on('client-removed', function(data) {
		console.log("client removed");
		// ss(socket).broadcast.emit('profile-image1', stream, {name: path});
		
		var filename = path.basename(data.name);
    		fs.unlink(datapath + filename, function(error) {
   			 if (error) {
        			console.log("Error:File not deleted on server");
    				}else{console.log("File deleted on server");}});
		
			hmap.forEach(function(value, key) {
					console.log("checking socket");
					if(socket.id != value.id) {
						console.log("asdfasdfasdfasdfasdfasdf")
						console.log(key + " : " + value);
						
						ss(value).emit('server-removed', {name: filename});
					}
			});
		
hmap.forEach(function(value, key) {
    console.log(key + " : " + value);
});
	})
socket.on('disconnect', function () {
	// socketconn.pop(socket.id);
	hmap.delete(socket.id);
	 console.log(hmap);
 });
})




httpServer.listen(3000, () => {
	console.log('Server listening on port 3000');
});
