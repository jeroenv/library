var EnumUtils = /** @class */ (function () {
    function EnumUtils() {
    }
    EnumUtils.prototype.getOrdinal = function (enumType, value) {
        return Object.keys(enumType).indexOf(value.toString());
    };
    return EnumUtils;
}());
export default EnumUtils;
//# sourceMappingURL=EnumUtils.js.map