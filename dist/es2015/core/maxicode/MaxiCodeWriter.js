import BarcodeFormat from '../BarcodeFormat';
import BitMatrix from '../common/BitMatrix';
import MaxiCode from './encoder/MaxiCode';
export default class MaxiCodeWriter {
    constructor() {
        this.hexagons = [];
        this.target = [];
    }
    encode(contents, format, width, height, hints = null) {
        if (contents.trim() === '') {
            throw new Error('Found empty contents');
        }
        if (format !== BarcodeFormat.MAXICODE) {
            throw new Error('Can only encode MAXICODE, but got ' + format);
        }
        if (width < 0 || height < 0) {
            throw new Error("Requested dimensions can't be negative: " + width + 'x' + height);
        }
        const encoder = new MaxiCode();
        // Pass primaryData through hints
        encoder.setPrimary('');
        // Pass mode through hints
        encoder.setMode(4);
        encoder.setContent(contents);
        encoder.encode();
        this.plotSymbol(encoder);
        return this.converGridToMatrix(encoder.grid, width, height);
    }
    /*protected void*/ plotSymbol(encoder) {
        const symbol_height = 72;
        const symbol_width = 74;
        // hexagons
        for (let /*int*/ row = 0; row < 33; row++) {
            for (let /*int*/ col = 0; col < 30; col++) {
                if (encoder.grid[row][col]) {
                    let /*double*/ x = 2.46 * col + 1.23;
                    if ((row & 1) != 0) {
                        x += 1.23;
                    }
                    const /*double*/ y = 2.135 * row + 1.43;
                    this.hexagons.push({
                        x: Number(x.toFixed(2)),
                        y: Number(y.toFixed(2)),
                    });
                }
            }
        }
        // circles
        const /*double[]*/ radii = [10.85, 8.97, 7.1, 5.22, 3.31, 1.43];
        for (let /*int*/ i = 0; i < radii.length; i++) {
            this.target.push({ x: 35.76, y: 35.6, r: radii[i] });
        }
        return {};
    }
    /**
     * Get BitMatrix.
     *
     * @param reqHeight The requested height of the image (in pixels) with the Datamatrix code
     * @param reqWidth The requested width of the image (in pixels) with the Datamatrix code
     * @return The output matrix.
     */
    converGridToMatrix(grid, reqWidth, reqHeight) {
        const matrixWidth = 74;
        const matrixHeight = 72;
        const outputWidth = Math.max(reqWidth, matrixWidth);
        const outputHeight = Math.max(reqHeight, matrixHeight);
        const multiple = Math.min(outputWidth / matrixWidth, outputHeight / matrixHeight);
        let output = new BitMatrix(33, 30);
        output.clear();
        for (let inputY = 0, outputY = 0; inputY < 30; inputY++, outputY += multiple) {
            for (let inputX = 0, outputX = 0; inputX < 33; inputX++, outputX += multiple) {
                if (grid[inputX][inputY]) {
                    output.setRegion(outputX, outputY, multiple, multiple);
                }
            }
        }
        return output;
    }
}
//# sourceMappingURL=MaxiCodeWriter.js.map