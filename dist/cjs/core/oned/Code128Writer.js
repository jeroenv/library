"use strict";
/*
 * Copyright 2010 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
Object.defineProperty(exports, "__esModule", { value: true });
var BarcodeFormat_1 = require("../BarcodeFormat");
var EncodeHintType_1 = require("../EncodeHintType");
var OneDimensionalCodeWriter_1 = require("./OneDimensionalCodeWriter");
var Boolean_1 = require("../util/Boolean");
var IllegalArgumentException_1 = require("../IllegalArgumentException");
var Integer_1 = require("../util/Integer");
var Code128Reader_1 = require("./Code128Reader");
// Results of minimal lookahead for code C
var CType;
(function (CType) {
    CType[CType["UNCODABLE"] = 0] = "UNCODABLE";
    CType[CType["ONE_DIGIT"] = 1] = "ONE_DIGIT";
    CType[CType["TWO_DIGITS"] = 2] = "TWO_DIGITS";
    CType[CType["FNC_1"] = 3] = "FNC_1";
})(CType || (CType = {}));
/**
 * This object renders a CODE128 code as a {@link BitMatrix}.
 *
 * @author erik.barbara@gmail.com (Erik Barbara)
 */
var Code128Writer = /** @class */ (function (_super) {
    __extends(Code128Writer, _super);
    function Code128Writer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Code128Writer.prototype.getSupportedWriteFormats = function () {
        return [BarcodeFormat_1.default.CODE_128];
    };
    Code128Writer.prototype.encodeContents = function (contents, hints) {
        var /*int*/ forcedCodeSet = Code128Writer.check(contents, hints);
        var hasCompactionHint = hints != null &&
            hints.has(EncodeHintType_1.default.CODE128_COMPACT) &&
            Boolean_1.default.parseBoolean(hints.get(EncodeHintType_1.default.CODE128_COMPACT).toString());
        return hasCompactionHint
            ? new MinimalEncoder().encode(contents)
            : Code128Writer.encodeFast(contents, forcedCodeSet);
    };
    Code128Writer.check = function (contents, hints) {
        var /*int*/ length = contents.length;
        // Check length
        if (length < 1 || length > 80) {
            throw new IllegalArgumentException_1.default('Contents length should be between 1 and 80 characters, but got ' +
                length);
        }
        // Check for forced code set hint.
        var /*int*/ forcedCodeSet = -1;
        if (hints != null && hints.has(EncodeHintType_1.default.FORCE_CODE_SET)) {
            var codeSetHint = hints.get(EncodeHintType_1.default.FORCE_CODE_SET).toString();
            switch (codeSetHint) {
                case 'A':
                    forcedCodeSet = Code128Writer.CODE_CODE_A;
                    break;
                case 'B':
                    forcedCodeSet = Code128Writer.CODE_CODE_B;
                    break;
                case 'C':
                    forcedCodeSet = Code128Writer.CODE_CODE_C;
                    break;
                default:
                    throw new IllegalArgumentException_1.default('Unsupported code set hint: ' + codeSetHint);
            }
        }
        // Check content
        for (var i = 0; i < length; i++) {
            var c = contents.charAt(i).charCodeAt(0);
            // check for non ascii characters that are not special GS1 characters
            switch (c) {
                // special function characters
                case Code128Writer.ESCAPE_FNC_1.charCodeAt(0):
                case Code128Writer.ESCAPE_FNC_2.charCodeAt(0):
                case Code128Writer.ESCAPE_FNC_3.charCodeAt(0):
                case Code128Writer.ESCAPE_FNC_4.charCodeAt(0):
                    break;
                // non ascii characters
                default:
                    if (c > 127) {
                        // no full Latin-1 character set available at the moment
                        // shift and manual code change are not supported
                        throw new IllegalArgumentException_1.default('Bad character in input: ASCII value=' + /*(int)*/ c);
                    }
            }
            // check characters for compatibility with forced code set
            switch (forcedCodeSet) {
                case Code128Writer.CODE_CODE_A:
                    // allows no ascii above 95 (no lower caps, no special symbols)
                    if (c > 95 && c <= 127) {
                        throw new IllegalArgumentException_1.default('Bad character in input for forced code set A: ASCII value=' +
                            /*(int)*/ c);
                    }
                    break;
                case Code128Writer.CODE_CODE_B:
                    // allows no ascii below 32 (terminal symbols)
                    if (c <= 32) {
                        throw new IllegalArgumentException_1.default('Bad character in input for forced code set B: ASCII value=' +
                            /*(int)*/ c);
                    }
                    break;
                case Code128Writer.CODE_CODE_C:
                    // allows only numbers and no FNC 2/3/4
                    if (c < 48 ||
                        (c > 57 && c <= 127) ||
                        c == Code128Writer.ESCAPE_FNC_2.charCodeAt(0) ||
                        c == Code128Writer.ESCAPE_FNC_3.charCodeAt(0) ||
                        c == Code128Writer.ESCAPE_FNC_4.charCodeAt(0)) {
                        throw new IllegalArgumentException_1.default('Bad character in input for forced code set C: ASCII value=' +
                            /*(int)*/ c);
                    }
                    break;
            }
        }
        return forcedCodeSet;
    };
    Code128Writer.encodeFast = function (contents, 
    /*int*/ forcedCodeSet) {
        var /*int*/ length = contents.length;
        var /*Collection<int[]>*/ patterns = new Array(); // temporary storage for patterns
        var /*int*/ checkSum = 0;
        var /*int*/ checkWeight = 1;
        var /*int*/ codeSet = 0; // selected code (CODE_CODE_B or CODE_CODE_C)
        var /*int*/ position = 0; // position in contents
        while (position < length) {
            //Select code to use
            var /*int*/ newCodeSet = void 0;
            if (forcedCodeSet == -1) {
                newCodeSet = this.chooseCode(contents, position, codeSet);
            }
            else {
                newCodeSet = forcedCodeSet;
            }
            //Get the pattern index
            var /*int*/ patternIndex = void 0;
            if (newCodeSet == codeSet) {
                // Encode the current character
                // First handle escapes
                switch (contents.charAt(position)) {
                    case Code128Writer.ESCAPE_FNC_1:
                        patternIndex = Code128Writer.CODE_FNC_1;
                        break;
                    case Code128Writer.ESCAPE_FNC_2:
                        patternIndex = Code128Writer.CODE_FNC_2;
                        break;
                    case Code128Writer.ESCAPE_FNC_3:
                        patternIndex = Code128Writer.CODE_FNC_3;
                        break;
                    case Code128Writer.ESCAPE_FNC_4:
                        if (codeSet == Code128Writer.CODE_CODE_A) {
                            patternIndex = Code128Writer.CODE_FNC_4_A;
                        }
                        else {
                            patternIndex = Code128Writer.CODE_FNC_4_B;
                        }
                        break;
                    default:
                        // Then handle normal characters otherwise
                        switch (codeSet) {
                            case Code128Writer.CODE_CODE_A:
                                patternIndex =
                                    contents.charAt(position).charCodeAt(0) - ' '.charCodeAt(0);
                                if (patternIndex < 0) {
                                    // everything below a space character comes behind the underscore in the code patterns table
                                    patternIndex += '`';
                                }
                                break;
                            case Code128Writer.CODE_CODE_B:
                                patternIndex =
                                    contents.charAt(position).charCodeAt(0) - ' '.charCodeAt(0);
                                break;
                            default: // Also incremented below
                                // CODE_CODE_C
                                if (position + 1 == length) {
                                    // this is the last character, but the encoding is C, which always encodes two characers
                                    throw new IllegalArgumentException_1.default('Bad number of characters for digit only encoding.');
                                }
                                patternIndex = Integer_1.default.parseInt(contents.substring(position, position + 2));
                                position++;
                                break;
                        }
                }
                position++;
            }
            else {
                // Should we change the current code?
                // Do we have a code set?
                if (codeSet == 0) {
                    // No, we don't have a code set
                    switch (newCodeSet) {
                        case Code128Writer.CODE_CODE_A:
                            patternIndex = Code128Writer.CODE_START_A;
                            break;
                        case Code128Writer.CODE_CODE_B:
                            patternIndex = Code128Writer.CODE_START_B;
                            break;
                        default:
                            patternIndex = Code128Writer.CODE_START_C;
                            break;
                    }
                }
                else {
                    // Yes, we have a code set
                    patternIndex = newCodeSet;
                }
                codeSet = newCodeSet;
            }
            // Get the pattern
            patterns.push(__spreadArray([], __read(Code128Reader_1.default.CODE_PATTERNS[patternIndex]), false));
            // Compute checksum
            checkSum += patternIndex * checkWeight;
            if (position != 0) {
                checkWeight++;
            }
        }
        return this.produceResult(patterns, checkSum);
    };
    Code128Writer.produceResult = function (
    /*Collection<int[]>*/ patterns, 
    /*int*/ checkSum) {
        var e_1, _a, e_2, _b, e_3, _c;
        // Compute and append checksum
        checkSum %= 103;
        patterns.push(__spreadArray([], __read(Code128Reader_1.default.CODE_PATTERNS[checkSum]), false));
        // Append stop code
        patterns.push(__spreadArray([], __read(Code128Reader_1.default.CODE_PATTERNS[Code128Writer.CODE_STOP]), false));
        // Compute code width
        var codeWidth = 0;
        try {
            for (var patterns_1 = __values(patterns), patterns_1_1 = patterns_1.next(); !patterns_1_1.done; patterns_1_1 = patterns_1.next()) {
                var pattern = patterns_1_1.value;
                try {
                    for (var pattern_1 = (e_2 = void 0, __values(pattern)), pattern_1_1 = pattern_1.next(); !pattern_1_1.done; pattern_1_1 = pattern_1.next()) {
                        var width = pattern_1_1.value;
                        codeWidth += width;
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (pattern_1_1 && !pattern_1_1.done && (_b = pattern_1.return)) _b.call(pattern_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (patterns_1_1 && !patterns_1_1.done && (_a = patterns_1.return)) _a.call(patterns_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        // Compute result
        var result = new Array(codeWidth);
        var pos = 0;
        try {
            for (var patterns_2 = __values(patterns), patterns_2_1 = patterns_2.next(); !patterns_2_1.done; patterns_2_1 = patterns_2.next()) {
                var pattern = patterns_2_1.value;
                pos += this.appendPattern(result, pos, pattern, true);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (patterns_2_1 && !patterns_2_1.done && (_c = patterns_2.return)) _c.call(patterns_2);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return result;
    };
    Code128Writer.findCType = function (
    /*CharSequence*/ value, 
    /*int*/ start) {
        var /*int*/ last = value.length;
        if (start >= last) {
            return CType.UNCODABLE;
        }
        var c = value.charAt(start).charCodeAt(0);
        if (c == Code128Writer.ESCAPE_FNC_1.charCodeAt(0)) {
            return CType.FNC_1;
        }
        if (c < '0'.charCodeAt(0) || c > '9'.charCodeAt(0)) {
            return CType.UNCODABLE;
        }
        if (start + 1 >= last) {
            return CType.ONE_DIGIT;
        }
        c = value.charAt(start + 1).charCodeAt(0);
        if (c < '0'.charCodeAt(0) || c > '9'.charCodeAt(0)) {
            return CType.ONE_DIGIT;
        }
        return CType.TWO_DIGITS;
    };
    Code128Writer.chooseCode = function (
    /*CharSequence*/ value, 
    /*int*/ start, 
    /*int*/ oldCode) {
        var lookahead = this.findCType(value, start);
        if (lookahead == CType.ONE_DIGIT) {
            if (oldCode == Code128Writer.CODE_CODE_A) {
                return Code128Writer.CODE_CODE_A;
            }
            return Code128Writer.CODE_CODE_B;
        }
        if (lookahead == CType.UNCODABLE) {
            if (start < value.length) {
                var c = value.charAt(start).charCodeAt(0);
                if (c < ' '.charCodeAt(0) ||
                    (oldCode == Code128Writer.CODE_CODE_A &&
                        (c < '`'.charCodeAt(0) ||
                            (c >= Code128Writer.ESCAPE_FNC_1.charCodeAt(0) &&
                                c <= Code128Writer.ESCAPE_FNC_4.charCodeAt(0))))) {
                    // can continue in code A, encodes ASCII 0 to 95 or FNC1 to FNC4
                    return Code128Writer.CODE_CODE_A;
                }
            }
            return Code128Writer.CODE_CODE_B; // no choice
        }
        if (oldCode == Code128Writer.CODE_CODE_A && lookahead == CType.FNC_1) {
            return Code128Writer.CODE_CODE_A;
        }
        if (oldCode == Code128Writer.CODE_CODE_C) {
            // can continue in code C
            return Code128Writer.CODE_CODE_C;
        }
        if (oldCode == Code128Writer.CODE_CODE_B) {
            if (lookahead == CType.FNC_1) {
                return Code128Writer.CODE_CODE_B; // can continue in code B
            }
            // Seen two consecutive digits, see what follows
            lookahead = this.findCType(value, start + 2);
            if (lookahead == CType.UNCODABLE || lookahead == CType.ONE_DIGIT) {
                return Code128Writer.CODE_CODE_B; // not worth switching now
            }
            if (lookahead == CType.FNC_1) {
                // two digits, then FNC_1...
                lookahead = this.findCType(value, start + 3);
                if (lookahead == CType.TWO_DIGITS) {
                    // then two more digits, switch
                    return Code128Writer.CODE_CODE_C;
                }
                else {
                    return Code128Writer.CODE_CODE_B; // otherwise not worth switching
                }
            }
            // At this point, there are at least 4 consecutive digits.
            // Look ahead to choose whether to switch now or on the next round.
            var index = start + 4;
            while ((lookahead = this.findCType(value, index)) == CType.TWO_DIGITS) {
                index += 2;
            }
            if (lookahead == CType.ONE_DIGIT) {
                // odd number of digits, switch later
                return Code128Writer.CODE_CODE_B;
            }
            return Code128Writer.CODE_CODE_C; // even number of digits, switch now
        }
        // Here oldCode == 0, which means we are choosing the initial code
        if (lookahead == CType.FNC_1) {
            // ignore FNC_1
            lookahead = this.findCType(value, start + 1);
        }
        if (lookahead == CType.TWO_DIGITS) {
            // at least two digits, start in code C
            return Code128Writer.CODE_CODE_C;
        }
        return Code128Writer.CODE_CODE_B;
    };
    Code128Writer.CODE_START_A = 103;
    Code128Writer.CODE_START_B = 104;
    Code128Writer.CODE_START_C = 105;
    Code128Writer.CODE_CODE_A = 101;
    Code128Writer.CODE_CODE_B = 100;
    Code128Writer.CODE_CODE_C = 99;
    Code128Writer.CODE_STOP = 106;
    // Dummy characters used to specify control characters in input
    Code128Writer.ESCAPE_FNC_1 = '\u00f1';
    Code128Writer.ESCAPE_FNC_2 = '\u00f2';
    Code128Writer.ESCAPE_FNC_3 = '\u00f3';
    Code128Writer.ESCAPE_FNC_4 = '\u00f4';
    Code128Writer.CODE_FNC_1 = 102; // Code A, Code B, Code C
    Code128Writer.CODE_FNC_2 = 97; // Code A, Code B
    Code128Writer.CODE_FNC_3 = 96; // Code A, Code B
    Code128Writer.CODE_FNC_4_A = 101; // Code A
    Code128Writer.CODE_FNC_4_B = 100; // Code B
    return Code128Writer;
}(OneDimensionalCodeWriter_1.default));
exports.default = Code128Writer;
/*private*/ var Charset;
(function (Charset) {
    Charset[Charset["A"] = 0] = "A";
    Charset[Charset["B"] = 1] = "B";
    Charset[Charset["C"] = 2] = "C";
    Charset[Charset["NONE"] = 3] = "NONE";
})(Charset || (Charset = {}));
/*private*/ var Latch;
(function (Latch) {
    Latch[Latch["A"] = 0] = "A";
    Latch[Latch["B"] = 1] = "B";
    Latch[Latch["C"] = 2] = "C";
    Latch[Latch["SHIFT"] = 3] = "SHIFT";
    Latch[Latch["NONE"] = 4] = "NONE";
})(Latch || (Latch = {}));
var getOrdinal = function (enm, value) {
    return Object.keys(enm).indexOf(value.toString());
};
/**
 * Encodes minimally using Divide-And-Conquer with Memoization
 **/
/*private static final*/ var MinimalEncoder = /** @class */ (function () {
    function MinimalEncoder() {
    }
    MinimalEncoder.prototype.encode = function (contents) {
        this.memoizedCost = new Array(4); //new int[4][contents.length];
        for (var i = 0; i < 4; i++) {
            this.memoizedCost[i] = new Array(contents.length);
        }
        this.minPath = new Array(4); //new Latch[4][contents.length];
        for (var i = 0; i < 4; i++) {
            this.minPath[i] = new Array(contents.length);
        }
        this.encodeContents(contents, Charset.NONE, 0);
        var /*Collection<int[]>*/ patterns = new Array();
        var /*int[]*/ checkSum = [0]; //new int[] {0};
        var /*int[]*/ checkWeight = [1]; //new int[] {1};
        var /*int*/ length = contents.length;
        var charset = Charset.NONE;
        for (var i = 0; i < length; i++) {
            var latch = this.minPath[getOrdinal(Charset, charset)][i]; //charset.ordinal()
            switch (latch) {
                case Latch.A:
                    charset = Charset.A;
                    MinimalEncoder.addPattern(patterns, i == 0 ? Code128Writer.CODE_START_A : Code128Writer.CODE_CODE_A, checkSum, checkWeight, i);
                    break;
                case Latch.B:
                    charset = Charset.B;
                    MinimalEncoder.addPattern(patterns, i == 0 ? Code128Writer.CODE_START_B : Code128Writer.CODE_CODE_B, checkSum, checkWeight, i);
                    break;
                case Latch.C:
                    charset = Charset.C;
                    MinimalEncoder.addPattern(patterns, i == 0 ? Code128Writer.CODE_START_C : Code128Writer.CODE_CODE_C, checkSum, checkWeight, i);
                    break;
                case Latch.SHIFT:
                    MinimalEncoder.addPattern(patterns, MinimalEncoder.CODE_SHIFT, checkSum, checkWeight, i);
                    break;
            }
            if (charset == Charset.C) {
                if (contents.charAt(i).charCodeAt(0) ==
                    Code128Writer.ESCAPE_FNC_1.charCodeAt(0)) {
                    MinimalEncoder.addPattern(patterns, Code128Writer.CODE_FNC_1, checkSum, checkWeight, i);
                }
                else {
                    MinimalEncoder.addPattern(patterns, Integer_1.default.parseInt(contents.substring(i, i + 2)), checkSum, checkWeight, i);
                    if (!(i + 1 < length)) {
                        //assert i + 1 < length; //the algorithm never leads to a single trailing digit in character set C
                        throw new Error();
                    }
                    if (i + 1 < length) {
                        i++;
                    }
                }
            }
            else {
                // charset A or B
                var patternIndex = void 0;
                switch (contents.charAt(i).charCodeAt(0)) {
                    case Code128Writer.ESCAPE_FNC_1.charCodeAt(0):
                        patternIndex = Code128Writer.CODE_FNC_1;
                        break;
                    case Code128Writer.ESCAPE_FNC_2.charCodeAt(0):
                        patternIndex = Code128Writer.CODE_FNC_2;
                        break;
                    case Code128Writer.ESCAPE_FNC_3.charCodeAt(0):
                        patternIndex = Code128Writer.CODE_FNC_3;
                        break;
                    case Code128Writer.ESCAPE_FNC_4.charCodeAt(0):
                        if ((charset == Charset.A && latch != Latch.SHIFT) ||
                            (charset == Charset.B && latch == Latch.SHIFT)) {
                            patternIndex = Code128Writer.CODE_FNC_4_A;
                        }
                        else {
                            patternIndex = Code128Writer.CODE_FNC_4_B;
                        }
                        break;
                    default:
                        patternIndex = contents.charAt(i).charCodeAt(0) - ' '.charCodeAt(0);
                }
                if (((charset == Charset.A && latch != Latch.SHIFT) ||
                    (charset == Charset.B && latch == Latch.SHIFT)) &&
                    patternIndex < 0) {
                    patternIndex += '`';
                }
                MinimalEncoder.addPattern(patterns, patternIndex, checkSum, checkWeight, i);
            }
        }
        this.memoizedCost = null;
        this.minPath = null;
        return Code128Writer.produceResult(patterns, checkSum[0]);
    };
    MinimalEncoder.addPattern = function (
    /*Collection<int[]>*/ patterns, 
    /*int*/ patternIndex, 
    /*int[]*/ checkSum, 
    /*int[]*/ checkWeight, 
    /*int*/ position) {
        patterns.push(__spreadArray([], __read(Code128Reader_1.default.CODE_PATTERNS[patternIndex]), false));
        if (position != 0) {
            checkWeight[0]++;
        }
        checkSum[0] += patternIndex * checkWeight[0];
    };
    MinimalEncoder.prototype.isDigit = function (c) {
        return c >= '0'.charCodeAt(0) && c <= '9'.charCodeAt(0);
    };
    MinimalEncoder.prototype.canEncode = function (
    /*CharSequence*/ contents, 
    /*Charset*/ charset, 
    /*int*/ position) {
        var c = contents.charAt(position).charCodeAt(0);
        switch (charset) {
            case Charset.A:
                return (c == Code128Writer.ESCAPE_FNC_1.charCodeAt(0) ||
                    c == Code128Writer.ESCAPE_FNC_2.charCodeAt(0) ||
                    c == Code128Writer.ESCAPE_FNC_3.charCodeAt(0) ||
                    c == Code128Writer.ESCAPE_FNC_4.charCodeAt(0) ||
                    getOrdinal(Charset, c) >= 0); //A.indexOf(c) >= 0
            case Charset.B:
                return (c == Code128Writer.ESCAPE_FNC_1.charCodeAt(0) ||
                    c == Code128Writer.ESCAPE_FNC_2.charCodeAt(0) ||
                    c == Code128Writer.ESCAPE_FNC_3.charCodeAt(0) ||
                    c == Code128Writer.ESCAPE_FNC_4.charCodeAt(0) ||
                    getOrdinal(Charset, c) >= 0); //B.indexOf(c) >= 0;
            case Charset.C:
                return (c == Code128Writer.ESCAPE_FNC_1.charCodeAt(0) ||
                    (position + 1 < contents.length &&
                        this.isDigit(c) &&
                        this.isDigit(contents.charAt(position + 1).charCodeAt(0))));
            default:
                return false;
        }
    };
    /**
     * Encode the string starting at position position starting with the character set charset
     **/
    MinimalEncoder.prototype.encodeContents = function (
    /*CharSequence*/ contents, charset, 
    /*int*/ position) {
        if (position > contents.length) {
            //assert position < contents.length();
            throw new Error();
        }
        var /*int*/ mCost = this.memoizedCost[getOrdinal(Charset, charset)][position]; //charset.ordinal()
        if (mCost > 0) {
            return mCost;
        }
        var /*int*/ minCost = Integer_1.default.MAX_VALUE;
        var minLatch = Latch.NONE;
        var atEnd = position + 1 >= contents.length;
        var sets = [Charset.A, Charset.B];
        for (var i = 0; i <= 1; i++) {
            if (this.canEncode(contents, sets[i], position)) {
                var cost = 1;
                var latch = Latch.NONE;
                if (charset != sets[i]) {
                    cost++;
                    latch = sets[i].toString();
                }
                if (!atEnd) {
                    cost += this.encodeContents(contents, sets[i], position + 1);
                }
                if (cost < minCost) {
                    minCost = cost;
                    minLatch = latch;
                }
                cost = 1;
                if (charset == sets[(i + 1) % 2]) {
                    cost++;
                    latch = Latch.SHIFT;
                    if (!atEnd) {
                        cost += this.encodeContents(contents, charset, position + 1);
                    }
                    if (cost < minCost) {
                        minCost = cost;
                        minLatch = latch;
                    }
                }
            }
        }
        if (this.canEncode(contents, Charset.C, position)) {
            var /*int*/ cost = 1;
            var latch = Latch.NONE;
            if (charset != Charset.C) {
                cost++;
                latch = Latch.C;
            }
            var /*int*/ advance = contents.charAt(position).charCodeAt(0) ==
                Code128Writer.ESCAPE_FNC_1.charCodeAt(0)
                ? 1
                : 2;
            if (position + advance < contents.length) {
                cost += this.encodeContents(contents, Charset.C, position + advance);
            }
            if (cost < minCost) {
                minCost = cost;
                minLatch = latch;
            }
        }
        if (minCost == Integer_1.default.MAX_VALUE) {
            throw new IllegalArgumentException_1.default('Bad character in input: ASCII value=' +
                /*(int)*/ contents.charAt(position));
        }
        this.memoizedCost[getOrdinal(Charset, charset)][position] = minCost;
        this.minPath[getOrdinal(Charset, charset)][position] = minLatch;
        return minCost;
    };
    MinimalEncoder.A = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_\u0000\u0001\u0002' +
        '\u0003\u0004\u0005\u0006\u0007\u0008\u0009\n\u000B\u000C\r\u000E\u000F\u0010\u0011' +
        '\u0012\u0013\u0014\u0015\u0016\u0017\u0018\u0019\u001A\u001B\u001C\u001D\u001E\u001F' +
        '\u00FF';
    MinimalEncoder.B = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqr' +
        'stuvwxyz{|}~\u007F\u00FF';
    MinimalEncoder.CODE_SHIFT = 98;
    return MinimalEncoder;
}());
//# sourceMappingURL=Code128Writer.js.map