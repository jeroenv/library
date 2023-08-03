"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EnumUtils = /** @class */ (function () {
    function EnumUtils() {
    }
    EnumUtils.prototype.getOrdinal = function (enumType, value) {
        return Object.keys(enumType).indexOf(value.toString());
    };
    return EnumUtils;
}());
exports.default = EnumUtils;
//# sourceMappingURL=EnumUtils.js.map