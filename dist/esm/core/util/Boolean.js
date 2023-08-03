var Boolean = /** @class */ (function () {
    function Boolean() {
    }
    /**
     * It takes one parameter value of type string which contains the value which is to be converted to boolean.
     *
     * It returns a primitive boolean value. It returns the true if the given value is equals “true” ignoring cases.
     * Else it returns false.
     * @param value
     * @returns
     */
    Boolean.parseBoolean = function (value) {
        return value.toLowerCase() === 'true';
    };
    return Boolean;
}());
export default Boolean;
//# sourceMappingURL=Boolean.js.map