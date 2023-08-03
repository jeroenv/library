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
import BarcodeRow from './BarcodeRow';
/**
 * Holds all of the information for a barcode in a format where it can be easily accessible
 *
 * @author Jacob Haynes
 */
export default class BarcodeMatrix {
    /**
     * @param height the height of the matrix (Rows)
     * @param width  the width of the matrix (Cols)
     */
    constructor(/*int*/ height, /*int*/ width) {
        this.matrix = new Array(height);
        //Initializes the array to the correct width
        for (let i = 0, matrixLength = this.matrix.length; i < matrixLength; i++) {
            this.matrix[i] = new BarcodeRow((width + 4) * 17 + 1);
        }
        this.width = width * 17;
        this.height = height;
        this.currentRow = -1;
    }
    /*void*/ set(/*int*/ x, /*int*/ y, /*byte*/ value) {
        this.matrix[y].set(x, value);
    }
    /*void*/ startRow() {
        ++this.currentRow;
    }
    getCurrentRow() {
        return this.matrix[this.currentRow];
    }
    getMatrix() {
        return this.getScaledMatrix(1, 1);
    }
    getScaledMatrix(
    /*int*/ xScale, 
    /*int*/ yScale) {
        const yMax = this.height * yScale;
        const matrixOut = new Array(yMax); //[this.height * yScale][this.width * xScale]();
        for (let i = 0; i < yMax; i++) {
            matrixOut[i] = new Uint8Array(this.width * xScale);
        }
        for (let i = 0; i < yMax; i++) {
            matrixOut[yMax - i - 1] =
                this.matrix[Math.floor(i / yScale)].getScaledRow(xScale);
        }
        return matrixOut;
    }
}
//# sourceMappingURL=BarcodeMatrix.js.map