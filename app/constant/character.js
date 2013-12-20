var Character = exports.Character =
{
    STATUS_NORMAL : 0,
    STATUS_DIZZY : 1 << 0,
    STATUS_GUARDED : 1 << 1,
    STATUS_REFLECT : 1 << 2,
    DEFAULT_STATUS_DURATION	: 10,
    MINIMUM_STATUS_DURATION	: 0.0001
}