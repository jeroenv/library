import BarcodeFormat from '../BarcodeFormat';
import BitMatrix from '../common/BitMatrix';
import EncodeHintType from '../EncodeHintType';
import Writer from '../Writer';
/**
 * @author Jacob Haynes
 * @author qwandor@google.com (Andrew Walbran)
 */
export default class PDF417Writer implements Writer {
    /**
     * default white space (margin) around the code
     */
    private static WHITE_SPACE;
    /**
     * default error correction level
     */
    private static DEFAULT_ERROR_CORRECTION_LEVEL;
    encode(contents: string, format: BarcodeFormat, width: number, height: number, hints?: Map<EncodeHintType, unknown>): BitMatrix;
    /**
     * Takes encoder, accounts for width/height, and retrieves bit matrix
     */
    private static bitMatrixFromEncoder;
    /**
     * This takes an array holding the values of the PDF 417
     *
     * @param input a byte array of information with 0 is black, and 1 is white
     * @param margin border around the barcode
     * @return BitMatrix of the input
     */
    private static bitMatrixFromBitArray;
    /**
     * Takes and rotates the it 90 degrees
     */
    private static rotateArray;
}
