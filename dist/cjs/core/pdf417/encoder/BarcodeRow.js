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
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @author Jacob Haynes
 */
var BarcodeRow = /** @class */ (function () {
    /**
     * Creates a Barcode row of the width
     */
    function BarcodeRow(/*int*/ width) {
        this.row = new Uint8Array(width);
        this.currentLocation = 0;
    }
    /**
     * Sets a specific location in the bar
     *
     * @param x The location in the bar
     * @param value Black if true, white if false;
     */
    /*void*/ BarcodeRow.prototype.set = function (/*int*/ x, /*byte*/ value) {
        this.row[x] = value;
    };
    /**
     * @param black A boolean which is true if the bar black false if it is white
     * @param width How many spots wide the bar is.
     */
    /*void*/ BarcodeRow.prototype.addBar = function (/*boolean*/ black, /*int*/ width) {
        for (var ii = 0; ii < width; ii++) {
            this.set(this.currentLocation++, black ? 1 : 0);
        }
    };
    /**
     * This function scales the row
     *
     * @param scale How much you want the image to be scaled, must be greater than or equal to 1.
     * @return the scaled row
     */
    /*byte[]*/ BarcodeRow.prototype.getScaledRow = function (/*int*/ scale) {
        var output = new Uint8Array(this.row.length * scale);
        for (var i = 0; i < output.length; i++) {
            output[i] = this.row[Math.floor(i / scale)];
        }
        return output;
    };
    return BarcodeRow;
}());
exports.default = BarcodeRow;
//# sourceMappingURL=BarcodeRow.js.map