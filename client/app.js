var io = require('socket.io-client');
var ss = require('socket.io-stream');
var socket = io.connect('http://localhost:3000');
// var stream = ss.createStream();
var fs = require('fs');
const path = require('path');
var chokidar = require('chokidar');
const clientpath = '/home/ranjith/Documents/Client1/';
var watcher = chokidar.watch(clientpath, {ignored: /^\./, persistent: true, ignoreInitial: true});
var unzip = require('unzip');
var count = 0;

//unzip Master content

if(count == 0 ) //initial add- chokidar  
		{ss(socket).on('master-sent', function(stream) {
		console.log("recieving Master folder");
		console.log('unzipping master back');
		stream.pipe(unzip.Extract({ path: clientpath }));
		console.log("recieved Master Folder");}); }

watcher
  .on('add', function(path) {
		console.log("Client watcher called");
		console.log('File', path, 'has been added, being to sent to server');
		var stream = ss.createStream();
		ss(socket).emit('client-added', stream, {name: path});
		fs.createReadStream(path).pipe(stream);
		count++;
	})
   .on('change', function(path) {console.log('File', path, 'has been changed, being to sent to server');
				var stream = ss.createStream();
				ss(socket).emit('client-modified', stream, {name: path});
				fs.createReadStream(path).pipe(stream);
				})
  .on('unlink', function(path) {console.log('File', path, 'has been removed, Filename being sent to server');
				var stream = ss.createStream();
				ss(socket).emit('client-removed',{name: path});
				});





  // .on('error', function(error) {console.error('Error happened', error);})
	// ss(socket).emit('profile-image1', stream);
	// stream.pipe(fs.createWriteStream('/home/ranjith/Documents/Client1/' + filename));
	ss(socket).on('server-added', function(stream, data) {
		console.log("recieving new file");
		var filename = path.basename(data.name);
	stream.pipe(fs.createWriteStream(clientpath + filename)); });
	ss(socket).on('server-modified', function(stream, data) {
		console.log("recieving modified file");
		var filename = path.basename(data.name);
	stream.pipe(fs.createWriteStream(clientpath + filename, {flags: 'w'}));});
	ss(socket).on('server-removed', function(data) {
		console.log("recieving removed file name");
		var filename = path.basename(data.name);
	fs.unlink(clientpath + filename, function(error) {
   			 if (error) {
        			console.log("Error:File not deleted");
				
    				}else{console.log("File deleted");}});


});
