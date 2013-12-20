var CharacterEntity = require('./character.js');
/*
 createBattleModel
 */

var createBattleModel = exports.createBattleModel = function()
{
    var createBattleModelObj = {};
    createBattleModelObj.character1 = CharacterEntity.createCharacter();
    createBattleModelObj.character2 = CharacterEntity.createCharacter();

    createBattleModelObj.copy = function( other )
    {
        createBattleModelObj.character1.copy( other.character1 );
        createBattleModelObj.character2.copy( other.character2 );
    };

    createBattleModelObj.battleModelProcess = function()
    {
        createBattleModelObj.character1.charProcess();
        createBattleModelObj.character2.charProcess();
    };

    return createBattleModelObj;
};