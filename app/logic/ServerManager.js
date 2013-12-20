// work like a chanel between clients and server.
var createServerManager = exports.createServerManager = function( sock, info )
{
	var createServerManagerObj =
	{
		socket : sock,
		clientInfo : info,
		callback : null,
		adapter : null,
		//clientActiveSkill( int playerId, Command command );
		//clientNotifySkillDone( int playerId, BattleCommand finishCommand );
		//clientReady( int playerId );
		//clientRequestNextSkill( int playerId );
		//clientSendGems( int playerId, LinkedList< Command > commands );
		//clientSuicide( int playerId );
		//clientDisconnect();
		//clientPause( int playerId, boolean isPause );

		sendBattleCommand : function( playerId, command )
		{
			createServerManagerObj.socket.emit( 'sendBattleCommand', playerId, command );
		},

		sendGameOver : function( playerId, score )
		{
			createServerManagerObj.socket.emit( 'sendGameOver', playerId, score );
		},

		sendModel : function( model )
		{
			createServerManagerObj.socket.emit( 'sendModel', model );
		},

		sendStart : function( battleModel )
		{
			createServerManagerObj.socket.emit( 'sendStart', battleModel );
		},

		setServerCallBack : function( callback )
		{
			createServerManagerObj.callback = callback;
		},

		sendPauseGame : function( playerId, isPause )
		{
			createServerManagerObj.socket.emit( 'sendPause', playerId, isPause );
		},

		endGame : function()
		{
			if(createServerManagerObj.clientInfo)
				createServerManagerObj.clientInfo['Playing'] = false;
		}
	}

	createServerManagerObj.socket.onGameDisconnect = function()
	{
		//if(!createServerManagerObj.clientInfo['Playing'])
		//{
		//	createServerManagerObj.socket.emit('clientdis', createServerManagerObj.clientInfo);
		//	return;
		//}

		if(createServerManagerObj.callback)
		{
			createServerManagerObj.callback.clientDisconnect();
		}
	};

	createServerManagerObj.socket.on('isplaying', function (myCharName) {
		if(createServerManagerObj.clientInfo['Playing'])
		{
			createServerManagerObj.socket.emit('stillplay', true, null, null);
		}
		else
		{
			createServerManagerObj.socket.emit('stillplay', false,
				createServerManagerObj.adapter != null ? createServerManagerObj.adapter.battleModel : null,
				createServerManagerObj.adapter != null ? createServerManagerObj.adapter.getScore( createServerManagerObj.clientInfo['playerId'] ) : null);
		}
	});

	createServerManagerObj.socket.on('gamepause', function ()
	{
		// if(!createServerManagerObj.clientInfo['Playing'])
		// {
		// 	createServerManagerObj.socket.emit('clientdis', createServerManagerObj.clientInfo);
		// 	return;
		// }

		if(createServerManagerObj.callback)
		{
			createServerManagerObj.callback.clientPause( createServerManagerObj.clientInfo['playerId'], true );
		}
	});

	createServerManagerObj.socket.on('gameresume', function ()
	{
		// if(!createServerManagerObj.clientInfo['Playing'])
		// {
		// 	createServerManagerObj.socket.emit('clientdis', createServerManagerObj.clientInfo);
		// 	return;
		// }

		if(createServerManagerObj.callback)
		{
			createServerManagerObj.callback.clientPause( createServerManagerObj.clientInfo['playerId'], false );
		}
	});

	createServerManagerObj.socket.on('clientActiveSkill', function( playerId, command )
	{
		// if(!createServerManagerObj.clientInfo['Playing'])
		// {
		// 	createServerManagerObj.socket.emit('clientdis', createServerManagerObj.clientInfo);
		// 	return;
		// }

		if(createServerManagerObj.callback)
		{
			createServerManagerObj.callback.clientActiveSkill(playerId, JSON.parse( command ) );
		}
	});

	createServerManagerObj.socket.on('clientNotifySkillDone', function( playerId, finishCommand )
	{
		// if(!createServerManagerObj.clientInfo['Playing'])
		// {
		// 	createServerManagerObj.socket.emit('clientdis', createServerManagerObj.clientInfo);
		// 	return;
		// }

		if(createServerManagerObj.callback)
		{
			createServerManagerObj.callback.clientNotifySkillDone( playerId, JSON.parse( finishCommand ) );
		}
	});

	createServerManagerObj.socket.on('clientReady', function( playerId )
	{
		// console.log('player ' + playerId + ' ready');
		// if(!createServerManagerObj.clientInfo['Playing'])
		// {
		// 	createServerManagerObj.socket.emit('clientdis', createServerManagerObj.clientInfo);
		// 	return;
		// }

		if(createServerManagerObj.callback)
		{
			createServerManagerObj.callback.clientReady( playerId );
		}
	});

	createServerManagerObj.socket.on('clientRequestNextSkill', function( playerId )
	{
		// if(!createServerManagerObj.clientInfo['Playing'])
		// {
		// 	createServerManagerObj.socket.emit('clientdis', createServerManagerObj.clientInfo);
		// 	return;
		// }

		if(createServerManagerObj.callback)
		{
			createServerManagerObj.callback.clientRequestNextSkill( playerId );
		}
	});

	createServerManagerObj.socket.on('clientSendGems', function( playerId, commands )
	{
		// if(!createServerManagerObj.clientInfo['Playing'])
		// {
		// 	createServerManagerObj.socket.emit('clientdis', createServerManagerObj.clientInfo);
		// 	return;
		// }

		if(createServerManagerObj.callback)
		{
			createServerManagerObj.callback.clientSendGems( playerId, JSON.parse( commands ) );
		}
	});

	createServerManagerObj.socket.on('clientSuicide', function( playerId )
	{
		// if(!createServerManagerObj.clientInfo['Playing'])
		// {
		// 	createServerManagerObj.socket.emit('clientdis', createServerManagerObj.clientInfo);
		// 	return;
		// }

		if(createServerManagerObj.callback)
		{
			createServerManagerObj.callback.clientSuicide( playerId );
		}
	});

	createServerManagerObj.socket.on('clientDisconnect', function()
	{
		// if(!createServerManagerObj.clientInfo['Playing'])
		// {
		// 	createServerManagerObj.socket.emit('clientdis', createServerManagerObj.clientInfo);
		// 	return;
		// }

		if(createServerManagerObj.callback)
		{
			createServerManagerObj.callback.clientDisconnect( );
		}
	});

	console.log('manager created');
	return createServerManagerObj;
};