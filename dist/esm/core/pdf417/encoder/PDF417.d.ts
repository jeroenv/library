import Charset from '../../util/Charset';
import BarcodeMatrix from './BarcodeMatrix';
import Compaction from './Compaction';
/**
 * Top-level class for the logic part of the PDF417 implementation.
 */
export default class PDF417 {
    /**
     * The start pattern (17 bits)
     */
    private static START_PATTERN;
    /**
     * The stop pattern (18 bits)
     */
    private static STOP_PATTERN;
    /**
     * The codeword table from the Annex A of ISO/IEC 15438:2001(E).
     */
    private static CODEWORD_TABLE;
    private static PREFERRED_RATIO;
    private static DEFAULT_MODULE_WIDTH;
    private static HEIGHT;
    private barcodeMatrix;
    private compact;
    private compaction;
    private encoding;
    private minCols;
    private maxCols;
    private maxRows;
    private minRows;
    constructor(compact?: boolean);
    getBarcodeMatrix(): BarcodeMatrix;
    /**
     * Calculates the necessary number of rows as described in annex Q of ISO/IEC 15438:2001(E).
     *
     * @param m the number of source codewords prior to the additional of the Symbol Length
     *          Descriptor and any pad codewords
     * @param k the number of error correction codewords
     * @param c the number of columns in the symbol in the data region (excluding start, stop and
     *          row indicator codewords)
     * @return the number of rows in the symbol (r)
     */
    private static calculateNumberOfRows;
    /**
     * Calculates the number of pad codewords as described in 4.9.2 of ISO/IEC 15438:2001(E).
     *
     * @param m the number of source codewords prior to the additional of the Symbol Length
     *          Descriptor and any pad codewords
     * @param k the number of error correction codewords
     * @param c the number of columns in the symbol in the data region (excluding start, stop and
     *          row indicator codewords)
     * @param r the number of rows in the symbol
     * @return the number of pad codewords
     */
    private static getNumberOfPadCodewords;
    private static encodeChar;
    private encodeLowLevel;
    /**
     * @param msg message to encode
     * @param errorCorrectionLevel PDF417 error correction level to use
     * @param autoECI automatically insert ECIs if needed
     * @throws WriterException if the contents cannot be encoded in this format
     */
    generateBarcodeLogic(msg: string, errorCorrectionLevel: number, autoECI?: boolean): void;
    /**
     * Determine optimal nr of columns and rows for the specified number of
     * codewords.
     *
     * @param sourceCodeWords number of code words
     * @param errorCorrectionCodeWords number of error correction code words
     * @return dimension object containing cols as width and rows as height
     */
    private determineDimensions;
    /**
     * Sets max/min row/col values
     *
     * @param maxCols maximum allowed columns
     * @param minCols minimum allowed columns
     * @param maxRows maximum allowed rows
     * @param minRows minimum allowed rows
     */
    setDimensions(maxCols: number, minCols: number, maxRows: number, minRows: number): void;
    /**
     * @param compaction compaction mode to use
     */
    setCompaction(compaction: Compaction): void;
    /**
     * @param compact if true, enables compaction
     */
    setCompact(compact: boolean): void;
    /**
     * @param encoding sets character encoding to use
     */
    setEncoding(encoding: Charset): void;
}
