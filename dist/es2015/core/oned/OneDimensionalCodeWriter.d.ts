import BarcodeFormat from '../BarcodeFormat';
import BitMatrix from '../common/BitMatrix';
import EncodeHintType from '../EncodeHintType';
import Writer from '../Writer';
/**
 * <p>Encapsulates functionality and implementation that is common to one-dimensional barcodes.</p>
 *
 * @author dsbnatut@gmail.com (Kazuki Nishiura)
 */
export default abstract class OneDimensionalCodeWriter implements Writer {
    private static NUMERIC;
    /**
     * Encode the contents to boolean array expression of one-dimensional barcode.
     * Start code and end code should be included in result, and side margins should not be included.
     *
     * @param contents barcode contents to encode
     * @return a {@code boolean[]} of horizontal pixels (false = white, true = black)
     */
    abstract encodeContents(contents: string, hints?: Map<EncodeHintType, unknown>): boolean[];
    /**
     * Encode the contents following specified format.
     * {@code width} and {@code height} are required size. This method may return bigger size
     * {@code BitMatrix} when specified size is too small. The user can set both {@code width} and
     * {@code height} to zero to get minimum size barcode. If negative value is set to {@code width}
     * or {@code height}, {@code IllegalArgumentException} is thrown.
     */
    encode(contents: string, format: BarcodeFormat, width: number, height: number, hints?: Map<EncodeHintType, unknown>): BitMatrix;
    protected getSupportedWriteFormats(): BarcodeFormat[];
    /**
     * @return a byte array of horizontal pixels (0 = white, 1 = black)
     */
    private static renderResult;
    /**
     * @param contents string to check for numeric characters
     * @throws IllegalArgumentException if input contains characters other than digits 0-9.
     */
    protected static checkNumeric(contents: string): void;
    /**
     * @param target encode black/white pattern into this array
     * @param pos position to start encoding at in {@code target}
     * @param pattern lengths of black/white runs to encode
     * @param startColor starting color - false for white, true for black
     * @return the number of elements added to target.
     */
    protected static appendPattern(target: boolean[], pos: number, pattern: number[], startColor: boolean): number;
    getDefaultMargin(): number;
}
