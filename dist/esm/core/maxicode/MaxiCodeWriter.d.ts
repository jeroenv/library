import BarcodeFormat from '../BarcodeFormat';
import BitMatrix from '../common/BitMatrix';
import EncodeHintType from '../EncodeHintType';
import Writer from '../Writer';
import MaxiCode from './encoder/MaxiCode';
interface Hexagon {
    x: number;
    y: number;
}
interface Circle {
    x: number;
    y: number;
    r: number;
}
export default class MaxiCodeWriter implements Writer {
    hexagons: Hexagon[];
    target: Circle[];
    encode(contents: string, format: BarcodeFormat, width: number, height: number, hints?: Map<EncodeHintType, unknown>): BitMatrix;
    plotSymbol(encoder: MaxiCode): {};
    /**
     * Get BitMatrix.
     *
     * @param reqHeight The requested height of the image (in pixels) with the Datamatrix code
     * @param reqWidth The requested width of the image (in pixels) with the Datamatrix code
     * @return The output matrix.
     */
    private converGridToMatrix;
}
export {};
