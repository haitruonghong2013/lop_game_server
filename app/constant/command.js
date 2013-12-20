var Command = exports.Command =
{
    // move by player
    COMMAND_INPUT_MOVE				: 0,

    // swap 2 point and swap back
    COMMAND_WRONG_MOVE				: 1,

    // move by logic
    COMMAND_MOVE					: 2,

    // select 1 point
    COMMAND_SELECT					: 3,

    // finish calculate hint
    COMMAND_HINT					: 4,

    // notify game is over
    COMMAND_GAME_OVER				: 5,

    // clear all balls on view
    COMMAND_NEW_GAME				: 6,

    // clear all balls on view to refresh match
    COMMAND_REFRESH					: 7,

    // ready for user input
    COMMAND_READY					: 8,

    // first two params are coordinate of sp gem, param2X is type of gem
    COMMAND_CREATE_SP1_GEM			: 9,

    // first two params are coordinate of sp gem, has gemtype, params2y is the number of gems eaten.
    COMMAND_CREATE_SP2_GEM			: 10,

    // first two params are coordinate of sp gem
    COMMAND_CREATE_SP3_GEM			: 11,

    // first two params are coordinate of gem, second two are interesting point
    COMMAND_EAT_GEMS_VERTICAL		: 12,

    // first two params are coordinate of gem, second two are interesting point
    COMMAND_EAT_GEMS_HORIZONTAL		: 13,

    // first two params are coordinate of gem, second two are interesting point
    COMMAND_EAT_GEMS_RIGHT_ANGLE	: 14,

    // first two params are coordinate of gem, second two are interesting point
    COMMAND_ACTIVE_SP1				: 15,

    // first two params are coordinate of gem, second two are interesting point
    COMMAND_ACTIVE_SP2				: 16,

    // first two params are coordinate of gem, second two are interesting point
    COMMAND_ACTIVE_SP3				: 17,

    // first two params are coordinate of gem, second two are interesting point
    COMMAND_ACTIVE_SP_UL			: 18,

    // first two params are coordinate of gem, second two are interesting point
    COMMAND_EAT_GEMS_SP_UL			: 19,

    // first two params are coordinate of gem, second two are interesting point
    COMMAND_EAT_GEMS_SP1			: 20,

    // first two params are coordinate of gem, second two are interesting point
    COMMAND_EAT_GEMS_SP2			: 21,

    // first two params are coordinate of gem
    COMMAND_EAT_GEMS_MONEY_1		: 22,

    // first two params are coordinate of gem
    COMMAND_EAT_GEMS_MONEY_2		: 23,

    // first two params are coordinate of combo, params2X is number of comboes
    COMMAND_NOTIFY_COMBO			: 24,

    // first two params are coordinate of skill gem, gem type is normalise type of gems
    // params2Y is actually number of gems eaten to create that skill
    COMMAND_CREATE_SKILL_RIGHT		: 25,

    // first two params are coordinate of skill gem, gem type is normalise type of gems
    // params2Y is actually number of gems eaten to create that skill
    COMMAND_CREATE_SKILL_LINE		: 26,

    // this command is used to combine combo to send to battle logic
    // param2Y hold number of gem collected
    COMMAND_COMBINE_GEMS			: 27,

    COMMAND_EAT_GEMS_SP3			: 28,

    isPostActiveSkill : function( skill )
    {
        if ( skill.commandId == Command.COMMAND_CREATE_SKILL_RIGHT )
        {
            return true;
        }
        else
        {
            return false;
        }
    }
}