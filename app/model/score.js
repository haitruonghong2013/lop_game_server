var createScore = exports.createScore = function()
{
    var createScoreObj = {};
    createScoreObj.totalNumberOfGems			= 0;
    createScoreObj.totalNumberOfCombo			= 0;
    createScoreObj.remainBlood					= 0;
    createScoreObj.timeRemain					= 0;
    createScoreObj.totalNumberOfGoldCollected	= 0;
    createScoreObj.totalNumberOfDamageDealt		= 0;
    createScoreObj.charMaxHp					= 0;
    createScoreObj.smallChessOpened = [];
    createScoreObj.bigChessOpened = [];
    createScoreObj.isWin = false;


    createScoreObj.calculateMedal = function( )
    {
        var medal = 0;
        if ( createScoreObj.timeRemain > 169 )
        {
            return medal;
        }
        if ( createScoreObj.totalNumberOfGems < 11 )
        {
            return medal;
        }
        var gold = createScoreObj.totalNumberOfGoldCollected * 10;
        medal += createScoreObj.totalNumberOfGems >= 300 ? 3 : createScoreObj.totalNumberOfGems >= 200 ? 2 : 1;
        medal += createScoreObj.totalNumberOfCombo >= 100 ? 3 : createScoreObj.totalNumberOfCombo >= 50 ? 2 : createScoreObj.totalNumberOfCombo >= 10 ? 1 : 0;

        if ( createScoreObj.isWin )
        {
            if ( createScoreObj.charMaxHp != 0 )
            {
                var mid = createScoreObj.charMaxHp >> 1;
                var small = createScoreObj.charMaxHp / 10;
                medal += createScoreObj.remainBlood >= mid ? 3 : createScoreObj.remainBlood >= small ? 2 : 1;
            }
            medal += createScoreObj.timeRemain >= 54 ? 3 : createScoreObj.timeRemain >= 18 ? 2 : 1;
        }
        medal += createScoreObj.gold >= 300 ? 3 : createScoreObj.gold >= 100 ? 2 : 1;
        return medal;
    };

    createScoreObj.getTotalChestMoney = function( )
    {
        var sm = 0;
        if ( createScoreObj.smallChessOpened != null )
        {
            for ( var i = 0; i < createScoreObj.smallChessOpened.size; i++ )
            {
                sm += createScoreObj.smallChessOpened.items[ i ];
            }
        }

        var bm = 0;
        if ( createScoreObj.bigChessOpened != null )
        {
            for ( var i = 0; i < createScoreObj.bigChessOpened.size; i++ )
            {
                bm += createScoreObj.bigChessOpened.items[ i ];
            }
        }

        return sm + bm;
    };

    createScoreObj.getTotalScore = function( )
    {
        var score = 0;
        score += createScoreObj.totalNumberOfGems;
        score += createScoreObj.totalNumberOfCombo;
        score += createScoreObj.remainBlood;
        score += createScoreObj.timeRemain;
        score += createScoreObj.totalNumberOfGoldCollected;
        score += createScoreObj.totalNumberOfDamageDealt;
        return score;
    };

    createScoreObj.reset = function( )
    {
        createScoreObj.totalNumberOfGems = 0;
        createScoreObj.totalNumberOfCombo = 0;
        createScoreObj.remainBlood = 0;
        createScoreObj.timeRemain = 0;
        createScoreObj.totalNumberOfGoldCollected = 0;
        createScoreObj.totalNumberOfDamageDealt = 0;
    };

    return createScoreObj;
};