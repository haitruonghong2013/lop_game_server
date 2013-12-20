var Character = require('../constant/character.js').Character;
var createCharacter = exports.createCharacter = function()
{
    var createCharacterObj = {};
    createCharacterObj.name = '';
    createCharacterObj.maxHp = 0;
    createCharacterObj.maxMp = 0;
    createCharacterObj.hp = 0;
    createCharacterObj.mp = 0;
    createCharacterObj.lv = 0;
    createCharacterObj.atk1 = 0;
    createCharacterObj.atk2 = 0;
    createCharacterObj.atk3 = 0;
    createCharacterObj.def = 0;
    createCharacterObj.money = 0;
    createCharacterObj.race = 0;
    createCharacterObj.dizzyDuration = 0;
    createCharacterObj.guardedDuration = 0;
    createCharacterObj.reflectDuration = 0;
    createCharacterObj.totalDamageDealt	= 0;
    createCharacterObj.status = Character.STATUS_NORMAL;

    // use to mark last update time stamp, use in process
    createCharacterObj.lastUpdate = -1;

    createCharacterObj.addTotalDamageDealt = function( damage )
    {
        createCharacterObj.totalDamageDealt += damage;
    }

    createCharacterObj.getMaxHp = function( )
    {
        return createCharacterObj.maxHp;
    }

    createCharacterObj.getMaxMp = function( )
    {
        return createCharacterObj.maxMp;
    }

    createCharacterObj.getStatus = function( )
    {
        return createCharacterObj.status;
    }

    createCharacterObj.getTotalDamageDealt = function( )
    {
        return createCharacterObj.totalDamageDealt;
    }

    createCharacterObj.isDizzy = function( )
    {
        return ( createCharacterObj.status & Character.STATUS_DIZZY ) != 0;
    };
    createCharacterObj.isGuarded = function( )
    {
        return ( createCharacterObj.status & Character.STATUS_GUARDED ) != 0;
    };

    createCharacterObj.isNormal = function( )
    {
        return createCharacterObj.status == 0;
    };

    createCharacterObj.isReflect = function( )
    {
        return ( createCharacterObj.status & Character.STATUS_REFLECT ) != 0;
    };

    createCharacterObj.setStatus = function( on, statusCode )
    {
        switch ( statusCode )
        {
            case Character.STATUS_DIZZY:
                createCharacterObj.status = on ? createCharacterObj.status | Character.STATUS_DIZZY : createCharacterObj.status & ~Character.STATUS_DIZZY;
                createCharacterObj.dizzyDuration = Character.DEFAULT_STATUS_DURATION;
                break;
            case Character.STATUS_GUARDED:
                createCharacterObj.status = on ? createCharacterObj.status | Character.STATUS_GUARDED : createCharacterObj.status & ~Character.STATUS_GUARDED;
                createCharacterObj.guardedDuration = Character.DEFAULT_STATUS_DURATION;
                break;
            case Character.STATUS_REFLECT:
                createCharacterObj.status = on ? createCharacterObj.status | Character.STATUS_REFLECT : createCharacterObj.status & ~Character.STATUS_REFLECT;
                createCharacterObj.reflectDuration = Character.DEFAULT_STATUS_DURATION;
                break;
            case Character.STATUS_NORMAL:
                createCharacterObj.status = 0;
                break;
        }
    };

    createCharacterObj.copy = function( character )
    {
        createCharacterObj.maxHp = character.maxHp;
        createCharacterObj.maxMp = character.maxMp;

        createCharacterObj.name = character.name;
        // HP
        createCharacterObj.hp = character.hp;
        // Mana
        createCharacterObj.mp = character.mp;

        createCharacterObj.lv = character.lv;

        createCharacterObj.race = character.race;

        createCharacterObj.atk1 = character.atk1;
        createCharacterObj.atk2 = character.atk2;
        createCharacterObj.atk3 = character.atk3;
        createCharacterObj.def = character.def;
        createCharacterObj.money = character.money;

        createCharacterObj.totalDamageDealt = character.totalDamageDealt;

        createCharacterObj.dizzyDuration = character.dizzyDuration;
        createCharacterObj.guardedDuration = character.guardedDuration;
        createCharacterObj.reflectDuration = character.reflectDuration;

        createCharacterObj.status = character.status;
    };


    createCharacterObj.setMaxHp = function( maxHp )
    {
        createCharacterObj.maxHp = maxHp;
    }

    createCharacterObj.setMaxMp = function( maxMp )
    {
        createCharacterObj.maxMp = maxMp;
    }

    /**
     * Make sure hp and mp in bound.
     */
    createCharacterObj.trim = function( )
    {
        if ( createCharacterObj.hp < 0 )
        {
            createCharacterObj.hp = 0;
        }
        else if ( createCharacterObj.hp > createCharacterObj.maxHp )
        {
            createCharacterObj.hp = createCharacterObj.maxHp;
        }

        if ( createCharacterObj.mp < 0 )
        {
            createCharacterObj.mp = 0;
        }
        else if ( createCharacterObj.mp > createCharacterObj.maxMp )
        {
            createCharacterObj.mp = createCharacterObj.maxMp;
        }
    }

    createCharacterObj.charProcess = function( )
    {
        var delta = 0.017;
        if(createCharacterObj.lastUpdate < 0)
        {
            createCharacterObj.lastUpdate = Date.now();
        }
        else
        {
            var timeInMs = Date.now();
            delta = (timeInMs - createCharacterObj.lastUpdate)/1000.0;
            createCharacterObj.lastUpdate = timeInMs;
        }

        if ( createCharacterObj.status == Character.STATUS_NORMAL )
        {
            return;
        }

        if ( createCharacterObj.isDizzy( ) && createCharacterObj.dizzyDuration > Character.MINIMUM_STATUS_DURATION )
        {
            createCharacterObj.dizzyDuration -= delta;

            if ( createCharacterObj.dizzyDuration <= Character.MINIMUM_STATUS_DURATION )
            {
                createCharacterObj.dizzyDuration = 0;
                createCharacterObj.setStatus( false, Character.STATUS_DIZZY );
            }
        }

        if ( createCharacterObj.isGuarded( ) && createCharacterObj.guardedDuration > Character.MINIMUM_STATUS_DURATION )
        {
            createCharacterObj.guardedDuration -= delta;

            if ( createCharacterObj.guardedDuration <= Character.MINIMUM_STATUS_DURATION )
            {
                createCharacterObj.guardedDuration = 0;
                createCharacterObj.setStatus( false, Character.STATUS_GUARDED );
            }
        }

        if ( createCharacterObj.isReflect( ) && createCharacterObj.reflectDuration > Character.MINIMUM_STATUS_DURATION )
        {
            createCharacterObj.reflectDuration -= delta;

            if ( createCharacterObj.reflectDuration <= Character.MINIMUM_STATUS_DURATION )
            {
                createCharacterObj.reflectDuration = 0;
                createCharacterObj.setStatus( false, Character.STATUS_REFLECT );
            }
        }
    };

    return createCharacterObj;
};