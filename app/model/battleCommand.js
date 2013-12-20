var Model = exports.Model = require('../constant/model.js').Model;
var Command = exports.Command = require('../constant/command.js').Command;

var BattleCommand = exports.BattleCommand =
{
    PLAYER_ZERO : 0,
    PLAYER_1 : 1,
    PLAYER_2 : 2,

    // no command
    COMMAND_NULL			: -1,

    // basic: 3 4 5 line
    COMMAND_ATTACK_1		: 0,
    COMMAND_ATTACK_2		: 1,
    COMMAND_ATTACK_3		: 2,
    COMMAND_HEAL			: 3,
    COMMAND_ENERGY_UP		: 4,
    COMMAND_MONEY			: 5,

    // One player is finished, use id to show the winner, 0 : draw
    COMMAND_KO				: 6,

    // time is over, end the battle, use id to show the winner, 0 : draw
    COMMAND_TIME_OUT		: 7,
    COMMAND_NEW_GAME		: 8,

    COMMAND_DISCONNECTED	: 9,

    // status, power in the command is status type, see Character class
    COMMAND_STATUS_START	: 16,
    COMMAND_STATUS_END		: 17,

    // special right 5
    COMMAND_ATTACK_1_SP_1	: 10,
    COMMAND_ATTACK_2_SP_1	: 11,
    COMMAND_ATTACK_3_SP_1	: 12,
    COMMAND_HEAL_SP_1		: 13,
    COMMAND_ENERGY_UP_SP_1	: 14,
    COMMAND_MONEY_SP_1		: 15,

    // special right 6
    COMMAND_ATTACK_1_SP_2	: 20,
    COMMAND_ATTACK_2_SP_2	: 21,
    COMMAND_ATTACK_3_SP_2	: 22,
    COMMAND_HEAL_SP_2		: 23,
    COMMAND_ENERGY_UP_SP_2	: 24,
    COMMAND_MONEY_SP_2		: 25,

    // special right 7+
    COMMAND_ATTACK_1_SP_3	: 30,
    COMMAND_ATTACK_2_SP_3	: 31,
    COMMAND_ATTACK_3_SP_3	: 32,
    COMMAND_HEAL_SP_3		: 33,
    COMMAND_ENERGY_UP_SP_3	: 34,
    COMMAND_MONEY_SP_3		: 35,


    getSkillRank : function( skillType )
    {
        if ( skillType > 29 )
        {
            return 3;
        }
        else if ( skillType > 19 )
        {
            return 2;
        }
        else if ( skillType > 9 )
        {
            return 1;
        }
        return 0;
    },

    normalizeSkillType : function( skillType )
    {
        if ( skillType > 29 )
        {
            skillType -= 30;
        }
        else if ( skillType > 19 )
        {
            skillType -= 20;
        }
        else if ( skillType > 9 )
        {
            skillType -= 10;
        }
        return skillType;
    },
    gemsSkillToBattleCommand : function( c )
    {
        if ( c == null )
        {
            return null;
        }

        var bc = createBattleCommand();

        // currently power = number of gems collected, can be modify by skill type
        // cost same "power" mp to use skill
        bc.power = c.param2Y;
        bc.mpCost = bc.power;

        // 2x store player id
        bc.playerId = c.param2X;
        if ( bc.playerId > 2 || bc.playerId < 0 )
        {
            console.log( 'BattleCommand:gemsSkillToBattleCommand: Unknown player ' + bc.playerId );
        }

        // skill type
        switch ( c.gemType )
        {
            case Model.RED_PIECE_ID:
                bc.commandType = BattleCommand.COMMAND_ATTACK_1;
                break;
            case Model.ORANGE_PIECE_ID:
                bc.commandType = BattleCommand.COMMAND_ATTACK_2;
                break;
            case Model.PURPLE_PIECE_ID:
                bc.commandType = BattleCommand.COMMAND_ATTACK_3;
                break;
            // case Model.BLUE_PIECE_ID:
            // bc.commandType = BattleCommand.COMMAND_ENERGY_UP;
            // break;
            case Model.GREEN_PIECE_ID:
                bc.commandType = BattleCommand.COMMAND_HEAL;
                break;
            case Model.YELLOW_PIECE_ID:
            default:
                bc.commandType = BattleCommand.COMMAND_MONEY;
                break;
        }

        // skill
        if ( c.commandId == Command.COMMAND_CREATE_SKILL_RIGHT )
        {
            bc.mpCost = 0;
            if ( bc.power > 6 )
            {
                bc.commandType += 30;
            }
            else if ( bc.power > 5 )
            {
                bc.commandType += 20;
            }
            else
            {
                bc.commandType += 10;
            }
        }

        return bc;
    }
}

var BattleLogic = exports.BattleLogic =
{
    HP_COMBO_FILL_RATE : 7,
    MP_COMBO_FILL_RATE : 0,
    MP_COST_RATE : 0,

    predictMpCost : function( skillType, power )
    {
        var normalized = BattleCommand.normalizeSkillType( skillType );
        var rank = BattleCommand.getSkillRank( skillType );
        var invokerMpCost = 0;
        switch ( normalized )
        {
            case BattleCommand.COMMAND_ATTACK_1:
            case BattleCommand.COMMAND_ATTACK_2:
            case BattleCommand.COMMAND_ATTACK_3:
                if ( rank == 0 )
                {
                    invokerMpCost = power * BattleLogic.MP_COST_RATE;
                }
                break;
            default:
                invokerMpCost = 0;
                break;
        }
        return invokerMpCost;
    }
}


var createBattleCommand = exports.createBattleCommand = function()
{
    var createBattleCommandObj = {};
    createBattleCommandObj.playerId = 1;
    createBattleCommandObj.commandType = 0;
    createBattleCommandObj.power = 0;
    createBattleCommandObj.mpCost = 0;

    createBattleCommandObj.copy = function( battleCommand )
    {
        createBattleCommandObj.commandType = battleCommand.commandType;
        createBattleCommandObj.playerId = battleCommand.playerId;
        createBattleCommandObj.power = battleCommand.power;
        createBattleCommandObj.mpCost = battleCommand.mpCost;
    };

    return createBattleCommandObj;
};