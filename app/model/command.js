var createCommand = exports.createCommand = function()
{
    var createCommandObj = {};
    createCommandObj.commandId = 0;
    createCommandObj.gemType = 0;
    createCommandObj.param1X = 0;
    createCommandObj.param1Y = 0;
    createCommandObj.param2X = 0
    createCommandObj.param2Y = 0;

    createCommandObj.copy = function( other )
    {
        createCommandObj.commandId = other.commandId;
        createCommandObj.gemType = other.gemType;
        createCommandObj.param1X = other.param1X;
        createCommandObj.param1Y = other.param1Y;
        createCommandObj.param2X = other.param2X;
        createCommandObj.param2Y = other.param2Y;
    }

    return createCommandObj;
}