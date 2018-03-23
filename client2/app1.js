var io = require('socket.io-client');
var ss = require('socket.io-stream');
var socket = io.connect('http://localhost:3000');
// var stream = ss.createStream();
var fs = require('fs');
const path = require('path');
var chokidar = require('chokidar');
const clientpath = '/home/ranjith/Documents/Client2/'; //client data source
var watcher = chokidar.watch(clientpath, {ignored: /^\./, persistent: true, ignoreInitial: true});
var unzip = require('unzip');
var count = 0;
const empty = require('empty-folder');
 

//unzip Master content

if(count == 0 ) //initial add- chokidar  
		{ss(socket).on('master-sent', function(stream) {
		console.log("recieving Master folder");

		empty(clientpath, false, (o)=>{
  			if(o.error) console.error("parent folder not refreshed");
		console.log('unzipping master back');
		stream.pipe(unzip.Extract({ path: clientpath }));
		console.log("recieved Master Folder");});

}); }

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
	watcher.unwatch(clientpath + filename);
	stream.pipe(fs.createWriteStream(clientpath + filename));
	stream.on('end', function() {
      watcher.add(clientpath + filename);
    }); });
	ss(socket).on('server-modified', function(stream, data) {
    console.log("recieving modified file");
    var filename = path.basename(data.name);
    watcher.unwatch(clientpath + filename);
    stream.pipe(fs.createWriteStream(clientpath + filename, {flags: 'w'}));
    stream.on('end', function() {
      watcher.add(clientpath + filename);
    });
  });
	ss(socket).on('server-removed', function(data) {
		console.log("recieving removed file name");
		var filename = path.basename(data.name);
watcher.unwatch(clientpath + filename);
	fs.unlink(clientpath + filename, function(error) {
   			 if (error) {
        			console.log("Error:File not deleted");
				
    				}else{console.log("File deleted");}});


});
