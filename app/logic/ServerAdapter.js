var utils = require('./../common/Utils.js');
var logics = require('./Logic.js');

var ServerAdapter =
{
	WAIT_TIME_OUT : 5
}

// fromPlayerX is callback object hold method
//public void sendBattleCommand( int playerId, BattleCommand command );
//public void sendGameOver( int playerId, Score score );
//public void sendModel( BattleModel model );
//public void sendStart( BattleModel battleModel );
//public void setServerCallBack( IServerChordCallBack callback );
// IServerChordCallBack:
//Send gems to other device
//public void clientActiveSkill( int playerId, Command command );
//public void clientNotifySkillDone( int playerId, BattleCommand finishCommand );
//public void clientReady( int playerId );
//public void clientRequestNextSkill( int playerId );
//Send gems to other device.
//void clientSendGems( int playerId, LinkedList< Command > commands );
//public void clientSuicide( int playerId );
//public void clientDisconnect();

/*
 fromPlayerX is callback object hold method
 @param battleModel: {battleModel}
 @param fromPlayer1: {ServerManager}
 @param fromPlayer2: {ServerManager}
 */

var createServerAdapter = exports.createServerAdapter = function(battleModel, fromPlayer1, fromPlayer2)
{
	var createServerAdapterObj = {};
    createServerAdapterObj.theme_id = '';
	createServerAdapterObj.battleModel = battleModel;

	createServerAdapterObj.player1commands = utils.newLinkedList();
	createServerAdapterObj.player2commands = utils.newLinkedList();

	createServerAdapterObj.player1Request = true;
	createServerAdapterObj.player2Request = true;

	createServerAdapterObj.lastBattleCommand1 = logics.createBattleCommand( );
	createServerAdapterObj.lastBattleCommand2 = logics.createBattleCommand( );

	createServerAdapterObj.waitingForPlayerDone	= false;

	createServerAdapterObj.waitForPlayerDoneTime = 0;

	fromPlayer1.adapter = createServerAdapterObj;
	createServerAdapterObj.fromPlayer1 = fromPlayer1;
	fromPlayer2.adapter = createServerAdapterObj;
	createServerAdapterObj.fromPlayer2 = fromPlayer2;

	createServerAdapterObj.p1Ready = false
	createServerAdapterObj.p2Ready = false;
	createServerAdapterObj.playerWin = 0;

	// player that is acting, other should wait
	createServerAdapterObj.activingPlayer = -1;

	createServerAdapterObj.getScore = function(playerId)
	{
		var sco1 = logics.createScore( );
		sco1.timeRemain = 0;
		sco1.charMaxHp = playerId == 1 ? createServerAdapterObj.battleModel.character1.getMaxHp( ) : createServerAdapterObj.battleModel.character2.getMaxHp( );
		sco1.remainBlood = playerId == 1 ? createServerAdapterObj.battleModel.character1.hp : createServerAdapterObj.battleModel.character2.hp;
		sco1.isWin = playerId == createServerAdapterObj.playerWin;
		sco1.totalNumberOfDamageDealt = playerId == 1 ? createServerAdapterObj.battleModel.character1.getTotalDamageDealt( ) : createServerAdapterObj.battleModel.character2.getTotalDamageDealt( );
	};

	createServerAdapterObj.battleLogic = logics.createBattleLogic( createServerAdapterObj.battleModel,
	{ // callback
		notifyListener : function( battleCommand )
		{
			if ( createServerAdapterObj.gameOver )
			{
				return false;
			}

			if ( battleCommand.commandType == logics.BattleCommand.COMMAND_KO
					|| battleCommand.commandType == logics.BattleCommand.COMMAND_TIME_OUT )
			{
				// XXX Calculate static
				var sco1 = logics.createScore( );
				sco1.timeRemain = 0;
				sco1.charMaxHp = createServerAdapterObj.battleModel.character1.getMaxHp( );
				sco1.remainBlood = createServerAdapterObj.battleModel.character1.hp;
				sco1.isWin = battleCommand.playerId == logics.BattleCommand.PLAYER_1;
				sco1.totalNumberOfDamageDealt = createServerAdapterObj.battleModel.character1.getTotalDamageDealt( );
				if(sco1.isWin)
					createServerAdapterObj.playerWin = 1;

				var sco2 = logics.createScore( );
				sco2.timeRemain = sco1.timeRemain;
				sco2.charMaxHp = createServerAdapterObj.battleModel.character2.getMaxHp( );
				sco2.remainBlood = createServerAdapterObj.battleModel.character2.hp;
				sco2.isWin = battleCommand.playerId == logics.BattleCommand.PLAYER_2;
				sco2.totalNumberOfDamageDealt = createServerAdapterObj.battleModel.character2.getTotalDamageDealt( );
				if(sco2.isWin)
					createServerAdapterObj.playerWin = 2;

				console.log('game gonna be over now');
				console.log(sco1);
				console.log(sco2);

				if ( createServerAdapterObj.adapterCallBack1 != null )
				{
					createServerAdapterObj.adapterCallBack1.gotNextSkill( battleCommand );
					createServerAdapterObj.adapterCallBack1.updatedModel( createServerAdapterObj.battleModel );
					createServerAdapterObj.lastBattleCommand1.copy( battleCommand );

					createServerAdapterObj.adapterCallBack1.gameOver( sco1, sco2 );
				}

				if ( createServerAdapterObj.adapterCallBack2 != null )
				{
					createServerAdapterObj.adapterCallBack2.gotNextSkill( battleCommand );
					createServerAdapterObj.adapterCallBack2.updatedModel( createServerAdapterObj.battleModel );
					createServerAdapterObj.lastBattleCommand2.copy( battleCommand );

					createServerAdapterObj.adapterCallBack2.gameOver( sco1, sco2 );
				}

				// end game normally
				createServerAdapterObj.fromPlayer1.endGame();
				createServerAdapterObj.fromPlayer2.endGame();
				createServerAdapterObj.gameOver = true;
			}

			return false;
		}
	});

	createServerAdapterObj.adapterCallBack2 =
	{
		gameOver : function( score1, score2 )
		{
			createServerAdapterObj.fromPlayer2.sendGameOver( logics.BattleCommand.PLAYER_1, score1 );
			createServerAdapterObj.fromPlayer2.sendGameOver( logics.BattleCommand.PLAYER_2, score2 );
		},

		gameStart : function( battleModel,theme_id )
		{
			createServerAdapterObj.fromPlayer2.sendStart( battleModel,theme_id );
			createServerAdapterObj.fromPlayer1.sendStart( battleModel,theme_id );
		},

		gotNextSkill : function( battleCommand )
		{
			createServerAdapterObj.fromPlayer2.sendBattleCommand( logics.BattleCommand.PLAYER_2, battleCommand );
			createServerAdapterObj.fromPlayer1.sendBattleCommand( logics.BattleCommand.PLAYER_2, battleCommand );
		},

		updatedModel : function( battleModel )
		{
			createServerAdapterObj.fromPlayer2.sendModel( battleModel );
			createServerAdapterObj.fromPlayer1.sendModel( battleModel );
		}
	};

	createServerAdapterObj.adapterCallBack1 =
	{
		gameOver : function( score1, score2 )
		{
			createServerAdapterObj.fromPlayer1.sendGameOver( logics.BattleCommand.PLAYER_1, score1 );
			createServerAdapterObj.fromPlayer1.sendGameOver( logics.BattleCommand.PLAYER_2, score2 );
		},

		gameStart : function( battleModel,theme_id )
		{
			createServerAdapterObj.fromPlayer1.sendStart( battleModel,theme_id );
			createServerAdapterObj.fromPlayer2.sendStart( battleModel,theme_id );
		},

		gotNextSkill : function( battleCommand )
		{
			createServerAdapterObj.fromPlayer1.sendBattleCommand( logics.BattleCommand.PLAYER_1, battleCommand );
			createServerAdapterObj.fromPlayer2.sendBattleCommand( logics.BattleCommand.PLAYER_2, battleCommand );
		},

		updatedModel : function( battleModel )
		{
			createServerAdapterObj.fromPlayer1.sendModel( battleModel );
			createServerAdapterObj.fromPlayer2.sendModel( battleModel );
		}
	};

	createServerAdapterObj.fromPlayer1.setServerCallBack(
	{
		clientActiveSkill : function( playerId, command )
		{
			createServerAdapterObj.activeNewSkill( playerId, command );
		},

		clientDisconnect : function( )
		{
			if ( createServerAdapterObj.gameOver )
			{
				return;
			}

			var battleCommand = logics.createBattleCommand( );
			battleCommand.commandType = logics.BattleCommand.COMMAND_DISCONNECTED;

			if ( createServerAdapterObj.adapterCallBack1 != null )
			{
				createServerAdapterObj.adapterCallBack1.gotNextSkill( battleCommand );
				createServerAdapterObj.adapterCallBack1.updatedModel( createServerAdapterObj.battleModel );
				createServerAdapterObj.lastBattleCommand1.copy( battleCommand );
			}

			if ( createServerAdapterObj.adapterCallBack2 != null )
			{
				createServerAdapterObj.adapterCallBack2.gotNextSkill( battleCommand );
				createServerAdapterObj.adapterCallBack2.updatedModel( createServerAdapterObj.battleModel );
				createServerAdapterObj.lastBattleCommand2.copy( battleCommand );
			}

			// allow reconnect from disconnecting
			//createServerAdapterObj.fromPlayer1.endGame();
			//createServerAdapterObj.fromPlayer2.endGame();
			//createServerAdapterObj.gameOver = true;
		},

		clientNotifySkillDone : function( playerId, finishCommand )
		{
			createServerAdapterObj.notifySkillDone( playerId, finishCommand );
		},

		clientPause : function( playerId, isPause )
		{
			createServerAdapterObj.fromPlayer1.sendPauseGame( playerId, isPause );
			createServerAdapterObj.fromPlayer2.sendPauseGame( playerId, isPause );
		},

		clientReady : function( playerId,theme_id )
		{
			createServerAdapterObj.ready( playerId,theme_id );
		},

		clientRequestNextSkill : function( playerId )
		{
			if ( playerId == logics.BattleCommand.PLAYER_1 )
			{
				createServerAdapterObj.player1Request = true;
			}
			else if ( playerId == logics.BattleCommand.PLAYER_2 )
			{
				createServerAdapterObj.player2Request = true;
			}
		},

		clientSendGems : function( playerId, commands )
		{
			createServerAdapterObj.commitNewSkill( playerId, commands );
		},

		clientSuicide : function( playerId )
		{
			createServerAdapterObj.suicide( playerId );
		}
	} );

	createServerAdapterObj.fromPlayer2.setServerCallBack(
	{
		clientActiveSkill : function( playerId, command )
		{
			createServerAdapterObj.activeNewSkill( playerId, command );
		},

		clientDisconnect : function( )
		{
			if ( createServerAdapterObj.gameOver )
			{
				return;
			}

			var battleCommand = logics.createBattleCommand( );
			battleCommand.commandType = logics.BattleCommand.COMMAND_DISCONNECTED;

			if ( createServerAdapterObj.adapterCallBack1 != null )
			{
				createServerAdapterObj.adapterCallBack1.gotNextSkill( battleCommand );
				createServerAdapterObj.adapterCallBack1.updatedModel( createServerAdapterObj.battleModel );
				createServerAdapterObj.lastBattleCommand1.copy( battleCommand );
			}

			if ( createServerAdapterObj.adapterCallBack2 != null )
			{
				createServerAdapterObj.adapterCallBack2.gotNextSkill( battleCommand );
				createServerAdapterObj.adapterCallBack2.updatedModel( createServerAdapterObj.battleModel );
				createServerAdapterObj.lastBattleCommand2.copy( battleCommand );
			}

			// allow reconnect from disconnecting
			// createServerAdapterObj.fromPlayer1.endGame();
			// createServerAdapterObj.fromPlayer2.endGame();
			// createServerAdapterObj.gameOver = true;
		},

		clientNotifySkillDone : function( playerId, finishCommand )
		{
			createServerAdapterObj.notifySkillDone( playerId, finishCommand );
		},

		clientPause : function( playerId, isPause )
		{
			createServerAdapterObj.fromPlayer1.sendPauseGame( playerId, isPause );
			createServerAdapterObj.fromPlayer2.sendPauseGame( playerId, isPause );
		},

		clientReady : function( playerId )
		{
			console.log('got ready from player ' + playerId);
			createServerAdapterObj.ready( playerId );
		},

		clientRequestNextSkill : function( playerId )
		{
			if ( playerId == logics.BattleCommand.PLAYER_1 )
			{
				createServerAdapterObj.player1Request = true;
			}
			else if ( playerId == logics.BattleCommand.PLAYER_2 )
			{
				createServerAdapterObj.player2Request = true;
			}
		},

		clientSendGems : function( playerId, commands )
		{
			createServerAdapterObj.commitNewSkill( playerId, commands );
		},

		clientSuicide : function( playerId )
		{
			createServerAdapterObj.suicide( playerId );
		}
	} );

	createServerAdapterObj.lastBattleCommand1.commandType = logics.BattleCommand.COMMAND_NULL;
	createServerAdapterObj.lastBattleCommand2.commandType = logics.BattleCommand.COMMAND_NULL;
	createServerAdapterObj.gameOver = false;

	createServerAdapterObj.activeNewSkill = function( playerId, skill )
	{
		//console.log( '### skill active ' + skill.commandId + ' ' + skill.gemType + ' ' + skill.param2Y );
		var c = skill;
		if ( playerId == logics.BattleCommand.PLAYER_1 )
		{
			var n = createServerAdapterObj.player1commands.size( );
			var added = false;
			for ( var i = 0; i < n; i++ )
			{
				if ( createServerAdapterObj.player1commands.get( i ).commandId != logics.Command.COMMAND_CREATE_SKILL_RIGHT )
				{
					createServerAdapterObj.player1commands.addAt( i, c );
					added = true;
					break;
				}
			}
			if ( !added )
			{
				createServerAdapterObj.player1commands.addLast( c );
			}
			//console.log('player 1 active skill');
		}
		else if ( playerId == logics.BattleCommand.PLAYER_2 )
		{
			var n = createServerAdapterObj.player2commands.size( );
			var added = false;
			for ( var i = 0; i < n; i++ )
			{
				if ( createServerAdapterObj.player2commands.get( i ).commandId != logics.Command.COMMAND_CREATE_SKILL_RIGHT )
				{
					createServerAdapterObj.player2commands.addAt( i, c );
					added = true;
					break;
				}
			}
			if ( !added )
			{
				createServerAdapterObj.player2commands.addLast( c );
			}
			//console.log('player 2 active skill');
		}
		else
		{
			console.log( 'LocalAdapter:activeNewSkill(): unknown player ' + playerId );
		}

		createServerAdapterObj.serverAdapterProcess();
	};

	createServerAdapterObj.commitNewSkill = function( playerId, skills )
	{
		//console.log('commit new skill:');
		//console.log(skills);
		for(var i = 0; i < skills.length; i++)
		{
			var c = skills[i];
			if ( playerId == logics.BattleCommand.PLAYER_1 )
			{
				createServerAdapterObj.player1commands.add( c );
			}
			else if ( playerId == logics.BattleCommand.PLAYER_2 )
			{
				createServerAdapterObj.player2commands.add( c );
			}
			else
			{
				console.log( 'LocalAdapter:commitNewSkill(): unknown player ' + playerId );
			}
//			createServerAdapterObj.serverAdapterProcess();
//			return false;
		}

		createServerAdapterObj.serverAdapterProcess();
	};

	/**
	 * Depend on playerId, send next command to that player.
	 */
	createServerAdapterObj.handleRequest = function( playerId )
	{
		if ( playerId == logics.BattleCommand.PLAYER_1 && createServerAdapterObj.adapterCallBack1 == null || playerId == logics.BattleCommand.PLAYER_2
				&& createServerAdapterObj.adapterCallBack2 == null )
		{
			return;
		}

		if ( playerId == logics.BattleCommand.PLAYER_1 && !createServerAdapterObj.player1commands.isEmpty( ) && !createServerAdapterObj.waitingForPlayerDone )
		{
			createServerAdapterObj.player1Request = false;
			var c = createServerAdapterObj.player1commands.poll( );
			//console.log( '### handle request ' + c.commandId + ' ' + c.gemType + ' ' + c.param2Y );
			var bc = logics.BattleCommand.gemsSkillToBattleCommand( c );
			//console.log( '### handled request bc ' + bc.playerId + ' ' + bc.commandType + ' ' + bc.param2Y );
			bc.playerId = playerId;
			createServerAdapterObj.waitingForPlayerDone = true;
			createServerAdapterObj.waitForPlayerDoneTime = 0;
			createServerAdapterObj.lastBattleCommand1.copy( bc );
			createServerAdapterObj.adapterCallBack1.gotNextSkill( bc );

			createServerAdapterObj.activingPlayer = playerId;
		}
		else if ( playerId == logics.BattleCommand.PLAYER_2 && !createServerAdapterObj.player2commands.isEmpty( ) && !createServerAdapterObj.waitingForPlayerDone )
		{
			createServerAdapterObj.player2Request = false;
			var c = createServerAdapterObj.player2commands.poll( );
			//console.log( '### handle request ' + c.commandId + ' ' + c.gemType + ' ' + c.param2Y );
			var bc = logics.BattleCommand.gemsSkillToBattleCommand( c );
			//console.log( '### handled request bc ' + bc.playerId + ' ' + bc.commandType + ' ' + bc.param2Y );
			bc.playerId = playerId;
			createServerAdapterObj.waitingForPlayerDone = true;
			createServerAdapterObj.waitForPlayerDoneTime = 0;
			createServerAdapterObj.lastBattleCommand2.copy( bc );
			createServerAdapterObj.adapterCallBack2.gotNextSkill( bc );

			createServerAdapterObj.activingPlayer = playerId;
		}
	};

	createServerAdapterObj.isGameOver = function( )
	{
		return createServerAdapterObj.gameOver;
	};

	createServerAdapterObj.notifySkillDone = function( playerId, skill )
	{
		// console.log(skill);
		if ( createServerAdapterObj.gameOver )
		{
			// refuse any attack if game is over
			console.log( 'LocalAdapter:notifySkillDone(): Game Over ' + skill.commandType );
			createServerAdapterObj.serverAdapterProcess();
			return;
		}
		if ( skill.commandType == logics.BattleCommand.COMMAND_KO || skill.commandType == logics.BattleCommand.COMMAND_TIME_OUT )
		{
			// gameOver = true;
			console.log( 'LocalAdapter:notifySkillDone(): Game over already ' + skill.commandType );
			createServerAdapterObj.serverAdapterProcess();
			return;
		}
		createServerAdapterObj.activingPlayer = -1;
		switch ( playerId )
		{
			case logics.BattleCommand.PLAYER_1:
				if ( !createServerAdapterObj.waitingForPlayerDone )
				{
					console.log( 'LocalAdapter:notifySkillDone(): Player 1: not time to notify done' );
					createServerAdapterObj.serverAdapterProcess();
					return;
				}
				if ( skill.commandType != createServerAdapterObj.lastBattleCommand1.commandType )
				{
					console.log( 'LocalAdapter:notifySkillDone(): Invalid client 1 call back skill '
							+ skill.commandType + '/' + createServerAdapterObj.lastBattleCommand1.commandType );
					createServerAdapterObj.serverAdapterProcess();
					return;
				}
				createServerAdapterObj.waitingForPlayerDone = false;
				createServerAdapterObj.waitForPlayerDoneTime = 0;
				createServerAdapterObj.battleLogic.command( skill );
				if ( createServerAdapterObj.adapterCallBack1 != null )
				{
					createServerAdapterObj.adapterCallBack1.updatedModel( createServerAdapterObj.battleModel );
				}
				break;
			case logics.BattleCommand.PLAYER_2:
				if ( !createServerAdapterObj.waitingForPlayerDone )
				{
					console.log( 'LocalAdapter:notifySkillDone(), Player 2: not time to notify done' );
					createServerAdapterObj.serverAdapterProcess();
					return;
				}
				if ( skill.commandType != createServerAdapterObj.lastBattleCommand2.commandType )
				{
					console.log( 'LocalAdapter:notifySkillDone(), Invalid client 2 call back skill '
							+ skill.commandType + '/' + createServerAdapterObj.lastBattleCommand2.commandType );
					createServerAdapterObj.serverAdapterProcess();
					return;
				}
				createServerAdapterObj.waitingForPlayerDone = false;
				createServerAdapterObj.waitForPlayerDoneTime = 0;
				createServerAdapterObj.battleLogic.command( skill );
				if ( createServerAdapterObj.adapterCallBack2 != null )
				{
					createServerAdapterObj.adapterCallBack2.updatedModel( createServerAdapterObj.battleModel );
				}
				break;
			default:
				console.log( 'LocalAdapter:notifySkillDone(), wth is this player ' + playerId );
				break;
		}

		createServerAdapterObj.serverAdapterProcess();
	};

	createServerAdapterObj.lastUpdate = -1;
	createServerAdapterObj.serverAdapterProcess = function( )
	{
        //time duration for a loop game, game loop = 60 fps
		var delta = 0.017;

		if(createServerAdapterObj.lastUpdate > 0)
		{
			var n = Date.now();
			delta = (n-createServerAdapterObj.lastUpdate)/1000.0;
		}

		if ( createServerAdapterObj.gameOver )
		{
			return;
		}

		createServerAdapterObj.battleLogic.battleLogicProcess( );

		// updated in battle logic
		// battleModel.process( delta );

		if ( createServerAdapterObj.player1Request )
		{
			// player1Request = false;
			createServerAdapterObj.handleRequest( logics.BattleCommand.PLAYER_1 );
		}
		if ( createServerAdapterObj.player2Request )
		{
			// player2Request = false;
			createServerAdapterObj.handleRequest( logics.BattleCommand.PLAYER_2 );
		}

		if ( createServerAdapterObj.waitingForPlayerDone )
		{
			createServerAdapterObj.waitForPlayerDoneTime += delta;
			if ( createServerAdapterObj.waitForPlayerDoneTime > ServerAdapter.WAIT_TIME_OUT )
			{
				createServerAdapterObj.waitingForPlayerDone = false;
				createServerAdapterObj.waitForPlayerDoneTime = 0;
			}
		}
	};

	createServerAdapterObj.ready = function( playerId, theme_id )
	{
		console.log( 'ServerAdapter:ready(): id is ready: ' + playerId+ "theme id is "+theme_id);
        if (theme_id != null && theme_id != ''){
            createServerAdapterObj.theme_id =  theme_id;
        }
		if ( playerId == logics.BattleCommand.PLAYER_1 )
		{
			createServerAdapterObj.p1Ready = true;
		}

		if ( playerId == logics.BattleCommand.PLAYER_2 )
		{
			createServerAdapterObj.p2Ready = true;
		}

		if ( createServerAdapterObj.p1Ready && createServerAdapterObj.p2Ready )
		{
			if ( createServerAdapterObj.adapterCallBack1 != null )
			{
				createServerAdapterObj.adapterCallBack1.gameStart( createServerAdapterObj.battleModel,createServerAdapterObj.theme_id );
			}

			if ( createServerAdapterObj.adapterCallBack2 != null )
			{
				createServerAdapterObj.adapterCallBack2.gameStart( createServerAdapterObj.battleModel,createServerAdapterObj.theme_id );
			}
		}

		createServerAdapterObj.serverAdapterProcess();
	};

	createServerAdapterObj.requestNextSkill = function( playerId )
	{
		if ( playerId == logics.BattleCommand.PLAYER_1 )
		{
			createServerAdapterObj.player1Request = true;
		}
		else if ( playerId == logics.BattleCommand.PLAYER_2 )
		{
			createServerAdapterObj.player2Request = true;
		}
		else
		{
			console.log('unknown playerId ' + playerId);
		}

		createServerAdapterObj.serverAdapterProcess();
	};

	createServerAdapterObj.suicide = function( playerId )
	{
		createServerAdapterObj.battleLogic.suicide( playerId );

		createServerAdapterObj.serverAdapterProcess();
	};

	return createServerAdapterObj;
};