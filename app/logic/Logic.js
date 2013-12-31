//Constants
var Model = exports.Model = require('../constant/model.js').Model;
var Character = exports.Character = require('../constant/character.js').Character;
var Command = exports.Command = require('../constant/command.js').Command;
var BattleCommand = exports.BattleCommand = require('../model/battleCommand.js').BattleCommand;

//Model
var BattleLogic = exports.BattleLogic = require('../model/battleCommand.js').BattleLogic;
var BattleCommandEntity = require('../model/battleCommand.js');
var BattleModelEntity = require('../model/battleModel.js');
var CharacterEntity = require('../model/character.js');
var CommandEntity = require('../model/command.js');
var ScoreEntity = require('../model/score.js');



var createBattleCommand = exports.createBattleCommand = function(){
    return BattleCommandEntity.createBattleCommand();
}

var createBattleModel = exports.createBattleModel =  function(){
    return BattleModelEntity.createBattleModel();
}
var createCharacter = exports.createCharacter = function(){         l
    return CharacterEntity.createCharacter();
}
var createCommand =  exports.createCommand = function(){
    return CommandEntity.createCommand();
}
var createScore = exports.createScore =  function(){
    return ScoreEntity.createScore();
}

/*
Calculation for battle
    @param invoker :{Character}
    @param taker :{Character}
    @param command :{BattleCommand}
 */


var battleCalculation = function( invoker, taker, command )
{
	// System.out.println( "calculating command " + command.commandType );
	// he is stun? discard attack
	if ( invoker.isDizzy( ) )
	{
		console.log( 'BattleLogic:battleCalculation: player is dizzy' );
		return;
	}

	var normalized = BattleCommand.normalizeSkillType( command.commandType );
	var rank = BattleCommand.getSkillRank( command.commandType );

	// invoker changing to hp and mp
	var invokerDamage = 0;
	var invokerMpCost = 0;

	// taker changing to hp and mp
	var takerDamage = 0;
	var takerMpCost = 0;

	switch ( normalized )
	{
		case BattleCommand.COMMAND_ATTACK_1:
			if ( rank == 1 )
			{
				invoker.setStatus( true, Character.STATUS_GUARDED );
				break;
			}
			// else if ( rank > 0 )
			// {
			// takerDamage = command.power * invoker.atk1;
			// }
			else if ( rank == 2 )
			{
				takerDamage = 150 - taker.def;
			}
			else if ( rank == 3 )
			{
				takerDamage = 188 - taker.def;
			}
			else
			{
				// invokerMpCost = command.power * BattleLogic.MP_COST_RATE;
				// if ( invoker.mp >= invokerMpCost )
				// {
				// takerDamage = command.power * invoker.atk1 - taker.def;
				// }
				// else
				// {
				// invokerMpCost = 0;
				// }
				if ( command.power == 0 )
				{
					takerDamage = invoker.atk1 * 3 - taker.def;
				}
				else if ( command.power == 1 )
				{
					takerDamage = invoker.atk1 * 6 - taker.def;
				}
				else
				{
					takerDamage = invoker.atk1 * 10 - taker.def;
				}
			}

			// what a pity, atk < def
			if ( takerDamage < 1 )
			{
				takerDamage = 1;
			}
			break;
		case BattleCommand.COMMAND_ATTACK_2:
			if ( rank == 1 )
			{
				invoker.setStatus( true, Character.STATUS_REFLECT );
				break;
			}
			// else if ( rank > 0 )
			// {
			// takerDamage = command.power * invoker.atk2;
			// }
			else if ( rank == 2 )
			{
				takerDamage = 180 - taker.def;
			}
			else if ( rank == 3 )
			{
				takerDamage = 225 - taker.def;
			}
			else
			{
				// invokerMpCost = command.power * BattleLogic.MP_COST_RATE;
				// if ( invoker.mp >= invokerMpCost )
				// {
				// takerDamage = command.power * invoker.atk2 - taker.def;
				// }
				// else
				// {
				// invokerMpCost = 0;
				// }

				takerDamage = invoker.atk2 * 15 - taker.def;
			}

			// what a pity, atk < def
			if ( takerDamage < 1 )
			{
				takerDamage = 1;
			}
			break;
		case BattleCommand.COMMAND_ATTACK_3:
			if ( rank == 1 )
			{
				taker.setStatus( true, Character.STATUS_DIZZY );
				break;
			}
			// else if ( rank > 0 )
			// {
			// takerDamage = command.power * invoker.atk3;
			// }
			else if ( rank == 2 )
			{
				takerDamage = 210 - taker.def;
			}
			else if ( rank == 3 )
			{
				takerDamage = 263 - taker.def;
			}
			else
			{
				// invokerMpCost = command.power * BattleLogic.MP_COST_RATE;
				// if ( invoker.mp >= invokerMpCost )
				// {
				// takerDamage = command.power * invoker.atk3 - taker.def;
				// }
				if ( command.power == 0 )
				{
					takerDamage = invoker.atk3 * 3 - taker.def;
				}
				else if ( command.power == 1 )
				{
					takerDamage = invoker.atk3 * 6 - taker.def;
				}
				else
				{
					takerDamage = invoker.atk3 * 10 - taker.def;
				}
			}

			// what a pity, atk < def
			if ( takerDamage < 1 )
			{
				takerDamage = 1;
			}
			break;
		case BattleCommand.COMMAND_HEAL:
			if ( rank > 0 )
			{
				var hpu = ( invoker.getMaxHp( ) * ( rank * 0.25 ) ) << 0;
				invokerDamage = -hpu;
			}
			else
			{
				invokerDamage = -command.power * BattleLogic.HP_COMBO_FILL_RATE;
			}
			break;
        //Restore Mana but current not use
		case BattleCommand.COMMAND_ENERGY_UP:
			// if ( rank > 0 )
			// {
			//  var mpu = ( var ) ( invoker.getMaxMp( ) * ( rank * 0.25f ) );
			// invokerMpCost = -mpu;
			// }
			// else
			// {
			// invokerMpCost = -command.power * BattleLogic.MP_COMBO_FILL_RATE;
			// }
			// break;
		case BattleCommand.COMMAND_MONEY:
		default:
			break;
	}

	// status checking
	// if ( invoker.isGuarded( ) )
	// {
	// if ( invokerDamage > 0 )
	// {
	// invokerDamage >>= 1;
	// }
	// }
	// if ( invoker.isReflect( ) )
	// {
	// if ( invokerDamage > 0 )
	// {
	// takerDamage += invokerDamage >> 1;
	// }
	// }
	if ( taker.isGuarded( ) )
	{
		if ( takerDamage > 0 )
		{
//            Damage decrease a half
			takerDamage >>= 1;
			// Gdx.app.log( "BattleLogic:battleCalculation()", "Target guarded, damage half" );
		}
	}
	if ( taker.isReflect( ) )
	{
		if ( takerDamage > 0 )
		{
			invokerDamage += takerDamage >> 1;
			// Gdx.app.log( "BattleLogic:battleCalculation()", "Target reflected, damage return" );
		}
	}

	// Gdx.app.log( "BattleLogic:battleCalculation()", "Applying damage" );

	// update total damage dealt
	if ( invokerDamage > 0 )
	{
		taker.addTotalDamageDealt( invokerDamage );
	}

	if ( takerDamage > 0 )
	{
		invoker.addTotalDamageDealt( takerDamage );
	}

	invoker.hp -= invokerDamage;
	invoker.mp -= invokerMpCost;
	invoker.trim( );

	taker.hp -= takerDamage;
	taker.mp -= takerMpCost;
	taker.trim( );

	// System.out.println( "invoker " + invokerDamage + " " + invokerMpCost );
	// System.out.println( "taker " + takerDamage + " " + takerMpCost );
}

// BattleLogicEvent:
//	public boolean notifyListener( BattleCommand battleCommand );
var createBattleLogic = exports.createBattleLogic = function( battleModel, logicEvents )
{
	var createBattleLogicObj = {};
	createBattleLogicObj.battleModel = battleModel;
	createBattleLogicObj.battleLogicEvents = logicEvents;
	createBattleLogicObj.gameOver	= false;
	createBattleLogicObj.command = function( command )
	{
		if ( command.playerId == BattleCommand.PLAYER_1 )
		{
			// Gdx.app.log( "BattleLogic:process()", "Calculate player 1" );
			battleCalculation( createBattleLogicObj.battleModel.character1, createBattleLogicObj.battleModel.character2, command );
		}
		else if ( command.playerId == BattleCommand.PLAYER_2 )
		{
			// Gdx.app.log( "BattleLogic:process()", "Calculate player 2" );
			battleCalculation( createBattleLogicObj.battleModel.character2, createBattleLogicObj.battleModel.character1, command );
		}
		else
		{
			console.log( 'BattleLogic:command(): unknown player ' + command.playerId );
		}

		if ( createBattleLogicObj.battleLogicEvents != null )
		{
			createBattleLogicObj.battleLogicEvents.notifyListener( command );

			var player1die = createBattleLogicObj.battleModel.character1.hp <= 0;
			var player2die = createBattleLogicObj.battleModel.character2.hp <= 0;
			if ( player1die || player2die )
			{
				createBattleLogicObj.gameOver = true;
				var bc = BattleCommandEntity.createBattleCommand();
				bc.commandType = BattleCommand.COMMAND_KO;
				bc.playerId = player1die && player2die ? BattleCommand.PLAYER_ZERO
						: player1die ? BattleCommand.PLAYER_2 : BattleCommand.PLAYER_1;
				createBattleLogicObj.battleLogicEvents.notifyListener( bc );

				// Gdx.app.log( "BattleLogic:command()",
				// "Player 1 total damage dealt " + battleModel.character1.getTotalDamageDealt( ) );
				// Gdx.app.log( "BattleLogic:command()",
				// "Player 2 total damage dealt " + battleModel.character2.getTotalDamageDealt( ) );
				// freed in battleLogicEventFilter
				// BattleCommand.free( bc );

				// System.err.println( "In battle logic KO" );
				// Thread.dumpStack( );
			}
		}
	};

	createBattleLogicObj.getBattleModel = function( )
	{
		return battleModel;
	};

	createBattleLogicObj.newGame = function( )
	{
		createBattleLogicObj.gameOver = false;
		if ( createBattleLogicObj.battleLogicEvents != null )
		{
			var command = BattleCommandEntity.createBattleCommand( );
			command.commandType = BattleCommand.COMMAND_NEW_GAME;
			createBattleLogicObj.battleLogicEvents.notifyListener( command );
		}
	}

	createBattleLogicObj.battleLogicProcess = function( )
	{
		if ( createBattleLogicObj.gameOver )
		{
			return;
		}

		createBattleLogicObj.battleModel.battleModelProcess( );
	};


	createBattleLogicObj.setBattleLogicEvent = function( battleLogicEvent )
	{
		createBattleLogicObj.battleLogicEvents = battleLogicEvent;
	}

	createBattleLogicObj.suicide = function( playerId )
	{
		// TODO Auto-generated method stub
		if ( playerId == BattleCommand.PLAYER_1 )
		{
			createBattleLogicObj.battleModel.character1.hp = 0;
		}
		else if ( playerId == BattleCommand.PLAYER_2 )
		{
			createBattleLogicObj.battleModel.character2.hp = 0;
		}

		if ( createBattleLogicObj.battleLogicEvents != null )
		{
			var player1die = createBattleLogicObj.battleModel.character1.hp <= 0;
			var player2die = createBattleLogicObj.battleModel.character2.hp <= 0;
			if ( player1die || player2die )
			{
				createBattleLogicObj.gameOver = true;
				var bc = BattleCommandEntity.createBattleCommand( );
				bc.commandType = BattleCommand.COMMAND_KO;
				bc.playerId = player1die && player2die ? BattleCommand.PLAYER_ZERO
						: player1die ? BattleCommand.PLAYER_2 : BattleCommand.PLAYER_1;
				createBattleLogicObj.battleLogicEvents.notifyListener( bc );

				console.log( "BattleLogic:suicide()",
						"Player 1 total damage dealt " + createBattleLogicObj.battleModel.character1.getTotalDamageDealt( ) );
				console.log( "BattleLogic:suicide()",
						"Player 2 total damage dealt " + createBattleLogicObj.battleModel.character2.getTotalDamageDealt( ) );
			}
		}
	}

	return createBattleLogicObj;
};