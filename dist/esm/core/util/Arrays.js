var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import System from './System';
import IllegalArgumentException from '../IllegalArgumentException';
import ArrayIndexOutOfBoundsException from '../ArrayIndexOutOfBoundsException';
var Arrays = /** @class */ (function () {
    function Arrays() {
    }
    /**
     * Assigns the specified int value to each element of the specified array
     * of ints.
     *
     * @param a the array to be filled
     * @param val the value to be stored in all elements of the array
     */
    Arrays.fill = function (a, val) {
        for (var i = 0, len = a.length; i < len; i++)
            a[i] = val;
    };
    /**
     * Assigns the specified int value to each element of the specified
     * range of the specified array of ints.  The range to be filled
     * extends from index {@code fromIndex}, inclusive, to index
     * {@code toIndex}, exclusive.  (If {@code fromIndex==toIndex}, the
     * range to be filled is empty.)
     *
     * @param a the array to be filled
     * @param fromIndex the index of the first element (inclusive) to be
     *        filled with the specified value
     * @param toIndex the index of the last element (exclusive) to be
     *        filled with the specified value
     * @param val the value to be stored in all elements of the array
     * @throws IllegalArgumentException if {@code fromIndex > toIndex}
     * @throws ArrayIndexOutOfBoundsException if {@code fromIndex < 0} or
     *         {@code toIndex > a.length}
     */
    Arrays.fillWithin = function (a, fromIndex, toIndex, val) {
        Arrays.rangeCheck(a.length, fromIndex, toIndex);
        for (var i = fromIndex; i < toIndex; i++)
            a[i] = val;
    };
    /**
     * Checks that {@code fromIndex} and {@code toIndex} are in
     * the range and throws an exception if they aren't.
     */
    Arrays.rangeCheck = function (arrayLength, fromIndex, toIndex) {
        if (fromIndex > toIndex) {
            throw new IllegalArgumentException('fromIndex(' + fromIndex + ') > toIndex(' + toIndex + ')');
        }
        if (fromIndex < 0) {
            throw new ArrayIndexOutOfBoundsException(fromIndex);
        }
        if (toIndex > arrayLength) {
            throw new ArrayIndexOutOfBoundsException(toIndex);
        }
    };
    Arrays.asList = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return args;
    };
    Arrays.create = function (rows, cols, value) {
        var arr = Array.from({ length: rows });
        return arr.map(function (x) { return Array.from({ length: cols }).fill(value); });
    };
    Arrays.createInt32Array = function (rows, cols, value) {
        var arr = Array.from({ length: rows });
        return arr.map(function (x) { return Int32Array.from({ length: cols }).fill(value); });
    };
    Arrays.equals = function (first, second) {
        if (!first) {
            return false;
        }
        if (!second) {
            return false;
        }
        if (!first.length) {
            return false;
        }
        if (!second.length) {
            return false;
        }
        if (first.length !== second.length) {
            return false;
        }
        for (var i = 0, length_1 = first.length; i < length_1; i++) {
            if (first[i] !== second[i]) {
                return false;
            }
        }
        return true;
    };
    Arrays.hashCode = function (a) {
        var e_1, _a;
        if (a === null) {
            return 0;
        }
        var result = 1;
        try {
            for (var a_1 = __values(a), a_1_1 = a_1.next(); !a_1_1.done; a_1_1 = a_1.next()) {
                var element = a_1_1.value;
                result = 31 * result + element;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (a_1_1 && !a_1_1.done && (_a = a_1.return)) _a.call(a_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return result;
    };
    Arrays.fillUint8Array = function (a, value) {
        for (var i = 0; i !== a.length; i++) {
            a[i] = value;
        }
    };
    Arrays.copyOf = function (original, newLength) {
        return original.slice(0, newLength);
    };
    Arrays.copyOfUint8Array = function (original, newLength) {
        if (original.length <= newLength) {
            var newArray = new Uint8Array(newLength);
            newArray.set(original);
            return newArray;
        }
        return original.slice(0, newLength);
    };
    Arrays.copyOfRange = function (original, from, to) {
        var newLength = to - from;
        var copy = new Int32Array(newLength);
        System.arraycopy(original, from, copy, 0, newLength);
        return copy;
    };
    /*
     * Returns the index of of the element in a sorted array or (-n-1) where n is the insertion point
     * for the new element.
     * Parameters:
     *     ar - A sorted array
     *     el - An element to search for
     *     comparator - A comparator function. The function takes two arguments: (a, b) and returns:
     *        a negative number  if a is less than b;
     *        0 if a is equal to b;
     *        a positive number of a is greater than b.
     * The array may contain duplicate elements. If there are more than one equal elements in the array,
     * the returned value can be the index of any one of the equal elements.
     *
     * http://jsfiddle.net/aryzhov/pkfst550/
     */
    Arrays.binarySearch = function (ar, el, comparator) {
        if (undefined === comparator) {
            comparator = Arrays.numberComparator;
        }
        var m = 0;
        var n = ar.length - 1;
        while (m <= n) {
            var k = (n + m) >> 1;
            var cmp = comparator(el, ar[k]);
            if (cmp > 0) {
                m = k + 1;
            }
            else if (cmp < 0) {
                n = k - 1;
            }
            else {
                return k;
            }
        }
        return -m - 1;
    };
    Arrays.numberComparator = function (a, b) {
        return a - b;
    };
    /**
     * Inserts the specified array into the specified original array at the specified index.
     *
     * @param original the original array into which we want to insert another array
     * @param index the index at which we want to insert the array
     * @param inserted the array that we want to insert
     * @return the combined array
     */
    Arrays.insertArray = function (
    /*int[]*/ original, 
    /*int*/ index, 
    /*int[]*/ inserted) {
        return __spreadArray(__spreadArray(__spreadArray([], __read(original.slice(0, index)), false), __read(inserted), false), __read(original.slice(index)), false);
    };
    /**
     * Returns <code>true</code> if the specified array contains the specified sub-array at the specified index.
     *
     * @param array the array to search in
     * @param searchFor the sub-array to search for
     * @param index the index at which to search
     * @return whether or not the specified array contains the specified sub-array at the specified index
     */
    Arrays.containsAt = function (array, searchFor, index) {
        for (var i = 0; i < searchFor.length; i++) {
            if (index + i >= array.length || array[index + i] != searchFor[i]) {
                return false;
            }
        }
        return true;
    };
    return Arrays;
}());
export default Arrays;
//# sourceMappingURL=Arrays.js.map