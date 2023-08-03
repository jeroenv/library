"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BarcodeFormat_1 = require("../BarcodeFormat");
var BitMatrix_1 = require("../common/BitMatrix");
var MaxiCode_1 = require("./encoder/MaxiCode");
var MaxiCodeWriter = /** @class */ (function () {
    function MaxiCodeWriter() {
        this.hexagons = [];
        this.target = [];
    }
    MaxiCodeWriter.prototype.encode = function (contents, format, width, height, hints) {
        if (hints === void 0) { hints = null; }
        if (contents.trim() === '') {
            throw new Error('Found empty contents');
        }
        if (format !== BarcodeFormat_1.default.MAXICODE) {
            throw new Error('Can only encode MAXICODE, but got ' + format);
        }
        if (width < 0 || height < 0) {
            throw new Error("Requested dimensions can't be negative: " + width + 'x' + height);
        }
        var encoder = new MaxiCode_1.default();
        // Pass primaryData through hints
        encoder.setPrimary('');
        // Pass mode through hints
        encoder.setMode(4);
        encoder.setContent(contents);
        encoder.encode();
        this.plotSymbol(encoder);
        return this.converGridToMatrix(encoder.grid, width, height);
    };
    /*protected void*/ MaxiCodeWriter.prototype.plotSymbol = function (encoder) {
        var symbol_height = 72;
        var symbol_width = 74;
        // hexagons
        for (var /*int*/ row = 0; row < 33; row++) {
            for (var /*int*/ col = 0; col < 30; col++) {
                if (encoder.grid[row][col]) {
                    var /*double*/ x = 2.46 * col + 1.23;
                    if ((row & 1) != 0) {
                        x += 1.23;
                    }
                    var /*double*/ y = 2.135 * row + 1.43;
                    this.hexagons.push({
                        x: Number(x.toFixed(2)),
                        y: Number(y.toFixed(2)),
                    });
                }
            }
        }
        // circles
        var /*double[]*/ radii = [10.85, 8.97, 7.1, 5.22, 3.31, 1.43];
        for (var /*int*/ i = 0; i < radii.length; i++) {
            this.target.push({ x: 35.76, y: 35.6, r: radii[i] });
        }
        return {};
    };
    /**
     * Get BitMatrix.
     *
     * @param reqHeight The requested height of the image (in pixels) with the Datamatrix code
     * @param reqWidth The requested width of the image (in pixels) with the Datamatrix code
     * @return The output matrix.
     */
    MaxiCodeWriter.prototype.converGridToMatrix = function (grid, reqWidth, reqHeight) {
        var matrixWidth = 74;
        var matrixHeight = 72;
        var outputWidth = Math.max(reqWidth, matrixWidth);
        var outputHeight = Math.max(reqHeight, matrixHeight);
        var multiple = Math.min(outputWidth / matrixWidth, outputHeight / matrixHeight);
        var output = new BitMatrix_1.default(33, 30);
        output.clear();
        for (var inputY = 0, outputY = 0; inputY < 30; inputY++, outputY += multiple) {
            for (var inputX = 0, outputX = 0; inputX < 33; inputX++, outputX += multiple) {
                if (grid[inputX][inputY]) {
                    output.setRegion(outputX, outputY, multiple, multiple);
                }
            }
        }
        return output;
    };
    return MaxiCodeWriter;
}());
exports.default = MaxiCodeWriter;
//# sourceMappingURL=MaxiCodeWriter.js.map