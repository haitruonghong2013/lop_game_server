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

		sendStart : function( battleModel,theme_id )
		{
			createServerManagerObj.socket.emit( 'sendStart', battleModel,theme_id);
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

//    when player click 5 skills on game client
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
    //    when player done an action, emit 'clientNotifySkillDone'
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
    //When init game board ready to play
	createServerManagerObj.socket.on('clientReady', function( playerId, theme_id )
	{
		// console.log('player ' + playerId + ' ready');
		// if(!createServerManagerObj.clientInfo['Playing'])
		// {
		// 	createServerManagerObj.socket.emit('clientdis', createServerManagerObj.clientInfo);
		// 	return;
		// }

		if(createServerManagerObj.callback)
		{
			createServerManagerObj.callback.clientReady( playerId,theme_id );
		}
	});

    //When ??
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

    //When :
    //  - Enough gems for execute an action
    //  - Eat blood gems or money gems
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

    //When player want to loose game
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