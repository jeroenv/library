/*
 * Copyright 2012 ZXing authors
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
import BarcodeFormat from '../BarcodeFormat';
import BitMatrix from '../common/BitMatrix';
import EncodeHintType from '../EncodeHintType';
import IllegalArgumentException from '../IllegalArgumentException';
import Charset from '../util/Charset';
import Integer from '../util/Integer';
import Boolean from '../util/Boolean';
import PDF417 from './encoder/PDF417';
/**
 * @author Jacob Haynes
 * @author qwandor@google.com (Andrew Walbran)
 */
var PDF417Writer = /** @class */ (function () {
    function PDF417Writer() {
    }
    /*@Override*/
    PDF417Writer.prototype.encode = function (contents, format, width, height, hints) {
        if (format != BarcodeFormat.PDF_417) {
            throw new IllegalArgumentException('Can only encode PDF_417, but got ' + format);
        }
        var encoder = new PDF417();
        var margin = PDF417Writer.WHITE_SPACE;
        var errorCorrectionLevel = PDF417Writer.DEFAULT_ERROR_CORRECTION_LEVEL;
        var autoECI = false;
        if (hints != null) {
            if (hints.has(EncodeHintType.PDF417_COMPACT)) {
                encoder.setCompact(Boolean.parseBoolean(hints.get(EncodeHintType.PDF417_COMPACT).toString()));
            }
            if (hints.has(EncodeHintType.PDF417_COMPACTION)) {
                encoder.setCompaction(hints.get(EncodeHintType.PDF417_COMPACTION));
            }
            if (hints.has(EncodeHintType.PDF417_DIMENSIONS)) {
                var dimensions = hints.get(EncodeHintType.PDF417_DIMENSIONS);
                encoder.setDimensions(dimensions.getMaxCols(), dimensions.getMinCols(), dimensions.getMaxRows(), dimensions.getMinRows());
            }
            if (hints.has(EncodeHintType.MARGIN)) {
                margin = Integer.parseInt(hints.get(EncodeHintType.MARGIN).toString());
            }
            if (hints.has(EncodeHintType.ERROR_CORRECTION)) {
                errorCorrectionLevel = Integer.parseInt(hints.get(EncodeHintType.ERROR_CORRECTION).toString());
            }
            if (hints.has(EncodeHintType.CHARACTER_SET)) {
                var encoding = Charset.forName(hints.get(EncodeHintType.CHARACTER_SET).toString());
                encoder.setEncoding(encoding);
            }
            autoECI =
                hints.has(EncodeHintType.PDF417_AUTO_ECI) &&
                    Boolean.parseBoolean(hints.get(EncodeHintType.PDF417_AUTO_ECI).toString());
        }
        return PDF417Writer.bitMatrixFromEncoder(encoder, contents, errorCorrectionLevel, width, height, margin, autoECI);
    };
    /**
     * Takes encoder, accounts for width/height, and retrieves bit matrix
     */
    PDF417Writer.bitMatrixFromEncoder = function (encoder, contents, errorCorrectionLevel, width, height, margin, autoECI) {
        encoder.generateBarcodeLogic(contents, errorCorrectionLevel, autoECI);
        var aspectRatio = 4;
        var originalScale = encoder
            .getBarcodeMatrix()
            .getScaledMatrix(1, aspectRatio);
        var rotated = false;
        if (height > width != originalScale[0].length < originalScale.length) {
            originalScale = this.rotateArray(originalScale);
            rotated = true;
        }
        var scaleX = Math.floor(width / originalScale[0].length);
        var scaleY = Math.floor(height / originalScale.length);
        var scale = Math.min(scaleX, scaleY);
        if (scale > 1) {
            var scaledMatrix = encoder
                .getBarcodeMatrix()
                .getScaledMatrix(scale, scale * aspectRatio);
            if (rotated) {
                scaledMatrix = this.rotateArray(scaledMatrix);
            }
            return this.bitMatrixFromBitArray(scaledMatrix, margin);
        }
        return this.bitMatrixFromBitArray(originalScale, margin);
    };
    /**
     * This takes an array holding the values of the PDF 417
     *
     * @param input a byte array of information with 0 is black, and 1 is white
     * @param margin border around the barcode
     * @return BitMatrix of the input
     */
    PDF417Writer.bitMatrixFromBitArray = function (input, margin) {
        // Creates the bit matrix with extra space for whitespace
        var output = new BitMatrix(input[0].length + 2 * margin, input.length + 2 * margin);
        output.clear();
        for (var y = 0, yOutput = output.getHeight() - margin - 1; y < input.length; y++, yOutput--) {
            var inputY = input[y];
            for (var x = 0; x < input[0].length; x++) {
                // Zero is white in the byte matrix
                if (inputY[x] === 1) {
                    output.set(x + margin, yOutput);
                }
            }
        }
        return output;
    };
    /**
     * Takes and rotates the it 90 degrees
     */
    PDF417Writer.rotateArray = function (bitarray) {
        var temp = new Array(bitarray[0].length); // new byte[bitarray[0].length][bitarray.length];
        for (var i = 0; i !== bitarray[0].length; i++) {
            temp[i] = new Uint8Array(bitarray.length);
        }
        for (var ii = 0; ii < bitarray.length; ii++) {
            // This makes the direction consistent on screen when rotating the
            // screen;
            var inverseii = bitarray.length - ii - 1;
            for (var jj = 0; jj < bitarray[0].length; jj++) {
                temp[jj][inverseii] = bitarray[ii][jj];
            }
        }
        return temp;
    };
    /**
     * default white space (margin) around the code
     */
    PDF417Writer.WHITE_SPACE = 30;
    /**
     * default error correction level
     */
    PDF417Writer.DEFAULT_ERROR_CORRECTION_LEVEL = 2;
    return PDF417Writer;
}());
export default PDF417Writer;
//# sourceMappingURL=PDF417Writer.js.map