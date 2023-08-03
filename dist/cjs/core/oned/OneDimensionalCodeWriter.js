"use strict";
/*
 * Copyright 2011 ZXing authors
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
var BitMatrix_1 = require("../common/BitMatrix");
var EncodeHintType_1 = require("../EncodeHintType");
var IllegalArgumentException_1 = require("../IllegalArgumentException");
var Integer_1 = require("../util/Integer");
/**
 * <p>Encapsulates functionality and implementation that is common to one-dimensional barcodes.</p>
 *
 * @author dsbnatut@gmail.com (Kazuki Nishiura)
 */
var OneDimensionalCodeWriter = /** @class */ (function () {
    function OneDimensionalCodeWriter() {
    }
    /**
     * Encode the contents following specified format.
     * {@code width} and {@code height} are required size. This method may return bigger size
     * {@code BitMatrix} when specified size is too small. The user can set both {@code width} and
     * {@code height} to zero to get minimum size barcode. If negative value is set to {@code width}
     * or {@code height}, {@code IllegalArgumentException} is thrown.
     */
    OneDimensionalCodeWriter.prototype.encode = function (contents, format, 
    /*int*/ width, 
    /*int*/ height, hints) {
        if (!contents) {
            //contents.isEmpty()
            throw new IllegalArgumentException_1.default('Found empty contents');
        }
        if (width < 0 || height < 0) {
            throw new IllegalArgumentException_1.default('Negative size is not allowed. Input: ' + width + 'x' + height);
        }
        var supportedFormats = this.getSupportedWriteFormats();
        if (supportedFormats != null && !supportedFormats.includes(format)) {
            throw new IllegalArgumentException_1.default('Can only encode ' + supportedFormats + ', but got ' + format);
        }
        var sidesMargin = this.getDefaultMargin();
        if (hints != null && hints.has(EncodeHintType_1.default.MARGIN)) {
            sidesMargin = Integer_1.default.parseInt(hints.get(EncodeHintType_1.default.MARGIN).toString());
        }
        var code = this.encodeContents(contents, hints);
        return OneDimensionalCodeWriter.renderResult(code, width, height, sidesMargin);
    };
    OneDimensionalCodeWriter.prototype.getSupportedWriteFormats = function () {
        return null;
    };
    /**
     * @return a byte array of horizontal pixels (0 = white, 1 = black)
     */
    OneDimensionalCodeWriter.renderResult = function (code, 
    /*int*/ width, height, sidesMargin) {
        var /*int*/ inputWidth = code.length;
        // Add quiet zone on both sides.
        var /*int*/ fullWidth = inputWidth + sidesMargin;
        var /*int*/ outputWidth = Math.max(width, fullWidth);
        var /*int*/ outputHeight = Math.max(1, height);
        var /*int*/ multiple = Math.floor(outputWidth / fullWidth);
        var /*int*/ leftPadding = Math.floor((outputWidth - inputWidth * multiple) / 2);
        var output = new BitMatrix_1.default(outputWidth, outputHeight);
        for (var inputX = 0, outputX = leftPadding; inputX < inputWidth; inputX++, outputX += multiple) {
            if (code[inputX]) {
                output.setRegion(outputX, 0, multiple, outputHeight);
            }
        }
        return output;
    };
    /**
     * @param contents string to check for numeric characters
     * @throws IllegalArgumentException if input contains characters other than digits 0-9.
     */
    OneDimensionalCodeWriter.checkNumeric = function (contents) {
        if (!OneDimensionalCodeWriter.NUMERIC.test(contents)) {
            throw new IllegalArgumentException_1.default('Input should only contain digits 0-9');
        }
    };
    /**
     * @param target encode black/white pattern into this array
     * @param pos position to start encoding at in {@code target}
     * @param pattern lengths of black/white runs to encode
     * @param startColor starting color - false for white, true for black
     * @return the number of elements added to target.
     */
    OneDimensionalCodeWriter.appendPattern = function (target, 
    /*int*/ pos, 
    /*int[]*/ pattern, startColor) {
        var e_1, _a;
        var color = startColor;
        var numAdded = 0;
        try {
            for (var pattern_1 = __values(pattern), pattern_1_1 = pattern_1.next(); !pattern_1_1.done; pattern_1_1 = pattern_1.next()) {
                var len = pattern_1_1.value;
                for (var j = 0; j < len; j++) {
                    target[pos++] = color;
                }
                numAdded += len;
                color = !color; // flip color after each segment
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (pattern_1_1 && !pattern_1_1.done && (_a = pattern_1.return)) _a.call(pattern_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return numAdded;
    };
    OneDimensionalCodeWriter.prototype.getDefaultMargin = function () {
        // CodaBar spec requires a side margin to be more than ten times wider than narrow space.
        // This seems like a decent idea for a default for all formats.
        return 10;
    };
    OneDimensionalCodeWriter.NUMERIC = /[0-9]+/; //Pattern.compile("[0-9]+")
    return OneDimensionalCodeWriter;
}());
exports.default = OneDimensionalCodeWriter;
//# sourceMappingURL=OneDimensionalCodeWriter.js.map