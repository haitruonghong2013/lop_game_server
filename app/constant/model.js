// TODO change Model gem name, add callback to BatleLogic
var Model = exports.Model =
{
    EMPTY_PIECE_ID			: 0,
    RED_PIECE_ID			: 1,
    GREEN_PIECE_ID			: 2,
    YELLOW_PIECE_ID			: 3,
    PURPLE_PIECE_ID			: 4,
    ORANGE_PIECE_ID			: 5,

    UPPER_NORMAL_PIECE_ID	: 10,

    // these balls will explode nearby balls
    SP1_RED_PIECE_ID		: 11,
    SP1_GREEN_PIECE_ID		: 12,
    SP1_YELLOW_PIECE_ID		: 13,
    SP1_PURPLE_PIECE_ID		: 14,
    SP1_ORANGE_PIECE_ID		: 15,

    UPPER_SP1_PIECE_ID		: 20,

    // these balls will explode all ball in straight lines
    SP2_RED_PIECE_ID		: 21,
    SP2_GREEN_PIECE_ID		: 22,
    SP2_YELLOW_PIECE_ID		: 23,
    SP2_PURPLE_PIECE_ID		: 24,
    SP2_ORANGE_PIECE_ID		: 25,

    // // skill list
    // public static final byte SKILL_LINE_PIECE_ID : 18,
    // public static final byte SKILL_RIGH_PIECE_ID : 19,

    // these balls explode all balls in the same color
    SP3_PIECE_ID			: 30,

    // these gems are same as normal gems except they can generate skill
    HD_RED_PIECE_ID			: 31,
    HD_GREEN_PIECE_ID		: 32,
    HD_YELLOW_PIECE_ID		: 33,
    HD_PURPLE_PIECE_ID		: 34,
    HD_ORANGE_PIECE_ID		: 35,

    MAX_TIME				: 30.0
}