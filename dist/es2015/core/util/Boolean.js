export default class Boolean {
    /**
     * It takes one parameter value of type string which contains the value which is to be converted to boolean.
     *
     * It returns a primitive boolean value. It returns the true if the given value is equals “true” ignoring cases.
     * Else it returns false.
     * @param value
     * @returns
     */
    static parseBoolean(value) {
        return value.toLowerCase() === 'true';
    }
}
//# sourceMappingURL=Boolean.js.map