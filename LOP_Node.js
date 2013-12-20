//NODE_PATH='/usr/lib/node_modules';

/* var redis = require('/usr/lib/node_modules/redis'),
	client = redis.createClient(6379, '127.0.0.1', {prefix : 'chat'});
	//chat database
	client.select(15);
*/

// var request = require('/usr/lib/node_modules/request');
// var express = require('/usr/lib/node_modules/express');
var request = require('request');
var express = require('express');
var console = require("clim")();

// var app = express()
var mainModule = require('./app.js');
var app = mainModule.app
  , http = mainModule.http
  , server = http.createServer(app)
  //, io = require('/usr/lib/node_modules/socket.io').listen(server);
  , io = require('socket.io').listen(server);

io.set('log level',3);
var logics = require('./app/logic/Logic.js');
var serverAdapter = require('./app/logic/ServerAdapter.js');
var serverManager = require('./app/logic/ServerManager.js');

var lop_port = process.env.PORT || 7998;
console.log('The server is going to start at port ' + lop_port);
server.listen(lop_port);

var clients = {};
var socketsList = {};


// routing
//app.get('/', function (req, res) {
//  res.sendfile(__dirname + '/client.html');
//});

/* SOCKET */
io.configure('production', function(){
	io.set('close timeout', 10);
	//io.set('heartbeat timeout', 20);
	//io.set('heartbeat interval', 10);
	io.set('log level', 1);
	console.log('start in production mode.');
});

io.sockets.on('connection', function (socket) {

	socket.on('message', function (msg) {
		console.log(msg);
	});

	// when the client emits 'adduser', this listens and executes
	socket.on('register', function(CharName, Race, Level, atk1, atk2, atk3, def, hp, mp){
		console.log('register' , CharName, Race, Level);

		var user = {};

		//id, race, lv,
			//	Setting.getCharAtk1( ), Setting.getCharAtk2( ), Setting.getCharAtk3( ),
			//	Setting.getCharDef( ), Setting.getCharHp( ), Setting.getCharMp( )

		user['CharName'] = CharName;
		user['LowerName'] = CharName.toLowerCase();
		user['Race'] = Race;
		user['Level'] = Level;

		user['atk1'] = atk1;
		user['atk2'] = atk2;
		user['atk3'] = atk3;
		user['def'] = def;
		user['hp'] = hp;
		user['mp'] = mp;

		user['Playing'] = false;
		user['PlayWith'] = null;

		clients[CharName] = user;

		socketsList[CharName] = socket;
		socket.CharName = CharName;
		socket.join(CharName);
		socket.join('lobby');

		//io.sockets.in('lobby').emit('updateusers', clients);
	});

	socket.on('searchusers', function(charName) {
		// socket.join('lobby');
		var lobby = {};
		for (var x in clients)
		{
			if(!clients[x]['Playing'] && clients[x]['PlayWith'] == null)
			{
				lobby[x] = clients[x];
			}
		}
		var l = Object.keys(lobby).length;
		var lowerName = charName.toLowerCase();
		var subClients = {};
		for (var x in lobby)
		{
			if(x != socket.CharName && lobby[x]['LowerName'].indexOf(lowerName) > -1)
			{
				subClients[x] = clients[x];
			}
		}

		socket.emit('foundusers', subClients);
		// io.sockets.in('lobby').emit('updateusers', clients);
	});

	// send back only 1, ...
	socket.on('randomone', function() {
		// socket.join('lobby');
		// console.log('listing user');
		// clients = io.sockets.clients('lobby');
		var lobby = {};
		for (var x in clients)
		{
			if(!clients[x]['Playing'])
			{
				lobby[x] = clients[x];
			}
		}
		var keys = Object.keys(lobby);
		var l = keys.length;
		console.log('lobby size ' + l);
		var subClients = {};

		// only has this current user
		if(l < 2)
		{
			console.log('only one player,z.z.z');
			socket.emit('updateusers', subClients);
			return;
		}

		keys.sort(function(a,b)
		{
			return lobby[a]['Level'] - lobby[b]['Level'];
		});

		var ci = keys.indexOf(socket.CharName);
		console.log('player index ' + ci);
		if(ci == -1)
		{
			console.log('player index not found');
			socket.emit('updateusers', subClients);
			return;
		}

		var id;
		var size = keys.length - ci - 1;
		if(size > 20)
		{
			id = 20 * Math.random() << 0 + 1;
			if(id == 0)
				id = 10;
		}
		else if(size > 0)
		{
			id = size * Math.random() << 0 + 1;
			if(id == 0)
				id = 1;
		}
		else if(ci > 10)
		{
			id = -10 * Math.random() << 0 - 1;
			if(id == 0)
				id = -5;
		}
		else
		{
			id = -ci * Math.random() << 0 - 1;
			if(id == 0)
				id = -1;
		}
		console.log('delta index ' + id);
		id = id+ci;
		console.log('choose index ' + id);
		subClients[keys[id]] = lobby[keys[id]];
		socket.emit('updateusers', subClients);
	});

	// send back only 10, ...
	socket.on('listavailableusers', function() {
		// socket.join('lobby');
		// console.log('listing user');
		// clients = io.sockets.clients('lobby');
		var lobby = {};
		for (var x in clients)
		{
			if(!clients[x]['Playing'] && clients[x]['PlayWith'] == null)
			{
				lobby[x] = clients[x];
			}
		}
		var keys = Object.keys(lobby);
		var l = keys.length;
		console.log('lobby size ' + l);
		var subClients = {};

		if(l < 11)
		{
			console.log('return available users');
			for(x in lobby)
			{
				if(x != socket.CharName)
				{
					subClients[x] = clients[x];
				}
			}
			console.log('user number < 10 ' + subClients);

            //{"name":"updateusers","args":[{"abce1119925592":{"CharName":"abce1119925592","LowerName":"abce1119925592","Race":0,"Level":1,"atk1":9,"atk2":9,"atk3":14,"def":6,"hp":600,"mp":700,"Playing":false,"PlayWith":null}}]}
			socket.emit('updateusers', subClients);
		}
		else
		{
			var chosenIndex = [];
			console.log('randoming 10 users');
			for(var i = 0; i < 10; i++)
			{
				var id = keys[ keys.length * Math.random() << 0];
				while(chosenIndex.indexOf(id) > -1 || keys[id] == socket.CharName)
				{
					id = keys[ keys.length * Math.random() << 0];
				}
				chosenIndex.push(id);
				subClients[id] = clients[id];
			}

			console.log('user number > 10 ' + subClients);
			socket.emit('updateusers', subClients);
		}
		// io.sockets.in('lobby').emit('updateusers', clients);
	});

    /*
    socket listen "sendbytes" event from user trigger fight action(on client)
        @param {string} name of character
        @param {object}:
         {
            messageType: 12,
            data: {
                class: java.lang.String,
                value: "abce, lv 1"
            },
            fromUserId: abce462279222,
            playerId: -1
         }
         message type value:
         12: ask eneny to fight
         14: refuse fighting
         13: agree tofire
         16: user cancel waiting enemy accept
     */
	socket.on('sendbytes', function (CharName, data)
	{
		if(socketsList[CharName])
		{
			socketsList[CharName].emit('receivedbytes', data);
		}
		// io.sockets.in(CharName).emit('receivedbytes', data);
	});

	socket.on('ping', function ()
	{
		socket.emit('fromping', true);
	});

	socket.on('startgame', function (myCharName, oppCharName) {
		//clients[socket.CharName]['Playing'] = true;
		//clients[socket.CharName]['CharName'] = CharName;
		//socket.leave('lobby');
		console.log('starting game');
        console.log(socket.CharName);
		if( !clients[myCharName] || clients[myCharName]['Playing'] || !clients[oppCharName] || clients[oppCharName]['Playing'])
		{
			console.log('Player(s) is/are playing... ');
			return;
		}
		var c1 = clients[myCharName];
		var c2 = clients[oppCharName];

		c1['Playing'] = true;
		c1['CharName'] = myCharName;
		c1['OppName'] = oppCharName;
		c1['playerId'] = 1;
		c1['PlayWith'] = oppCharName;

		c2['Playing'] = true;
		c2['CharName'] = oppCharName;
		c2['OppName'] = myCharName;
		c2['playerId'] = 2;
		c2['PlayWith'] = myCharName;

		socketsList[myCharName].leave('lobby');
		socketsList[oppCharName].leave('lobby');

		socketsList[myCharName].join(myCharName);
		socketsList[myCharName].join(oppCharName);
		socketsList[oppCharName].join(myCharName);
		socketsList[oppCharName].join(oppCharName);

		io.sockets.in('lobby').emit('clientdis', c1);
		io.sockets.in('lobby').emit('clientdis', c2);

		var me = serverManager.createServerManager(socketsList[myCharName], c1);
		var opp = serverManager.createServerManager(socketsList[oppCharName], c2);
		var battleModel = logics.createBattleModel();

		var char1 = battleModel.character1;
		char1.name = myCharName;
		char1.maxHp = c1.hp;
		char1.maxMp = c1.mp;
		char1.hp = c1.hp;
		char1.mp = c1.mp;
		char1.lv = c1.Level;
		char1.atk1 = c1.atk1;
		char1.atk2 = c1.atk2;
		char1.atk3 = c1.atk3;
		char1.def = c1.def;
		char1.money = 0;
		char1.race = c1.Race;

		var char2 = battleModel.character2;
		char2.name = oppCharName;
		char2.maxHp = c2.hp;
		char2.maxMp = c2.mp;
		char2.hp = c2.hp;
		char2.mp = c2.mp;
		char2.lv = c2.Level;
		char2.atk1 = c2.atk1;
		char2.atk2 = c2.atk2;
		char2.atk3 = c2.atk3;
		char2.def = c2.def;
		char2.money = 0;
		char2.race = c2.Race;

		serverAdapter.createServerAdapter( battleModel, me, opp);
		console.log('game started');

		// game played, no need to hold in these lists
		delete clients[socket.CharName];
		delete socketsList[socket.CharName];
	});

	socket.on('isplaying', function (myCharName) {
		if(socket.CharName != myCharName)
		{
			console.log('Invalid CharName ' + myCharName);
			return;
		}

		socket.emit('stillplay', true, null, null);
	});

	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		io.sockets.in('lobby').emit('clientdis', clients[socket.CharName]);
		console.log('disconnecting');
		if(socketsList[socket.CharName])
		{
			if(socketsList[socket.CharName]['OppName'])
			{
				clients[ socketsList[socket.CharName]['OppName'] ]['Playing'] = false;
			}

			if(clients[socket.CharName]['Playing'] == true)
			{
				clients[socket.CharName]['Playing'] = false;

				if(socketsList[socket.CharName].onGameDisconnect)
					socketsList[socket.CharName].onGameDisconnect();
			}
		}

		if(clients[socket.CharName])
			delete clients[socket.CharName];
		if(socketsList[socket.CharName])
			delete socketsList[socket.CharName];
		// io.sockets.in('lobby').emit('updateusers', clients);
	});
});
