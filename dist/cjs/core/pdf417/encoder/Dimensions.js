"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Data object to specify the minimum and maximum number of rows and columns for a PDF417 barcode.
 *
 * @author qwandor@google.com (Andrew Walbran)
 */
var Dimensions = /** @class */ (function () {
    function Dimensions(minCols, maxCols, minRows, maxRows) {
        this.minCols = minCols;
        this.maxCols = maxCols;
        this.minRows = minRows;
        this.maxRows = maxRows;
    }
    Dimensions.prototype.getMinCols = function () {
        return this.minCols;
    };
    Dimensions.prototype.getMaxCols = function () {
        return this.maxCols;
    };
    Dimensions.prototype.getMinRows = function () {
        return this.minRows;
    };
    Dimensions.prototype.getMaxRows = function () {
        return this.maxRows;
    };
    return Dimensions;
}());
exports.default = Dimensions;
//# sourceMappingURL=Dimensions.js.map