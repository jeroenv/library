import StringBuilder from '../../util/StringBuilder';
import Charset from '../../util/Charset';
/**
 * <p>
 * Implements MaxiCode according to ISO 16023:2000.
 *
 * <p>
 * MaxiCode employs a pattern of hexagons around a central 'bulls-eye'
 * finder pattern. Encoding in several modes is supported, but encoding in
 * Mode 2 and 3 require primary messages to be set. Input characters can be
 * any from the ISO 8859-1 (Latin-1) character set.
 *
 * <p>
 * TODO: Add ECI functionality.
 *
 * @author <a href="mailto:rstuart114@gmail.com">Robin Stuart</a>
 * @author Daniel Gredler
 */
export default class MaxiCode {
    private mode;
    private structuredAppendPosition;
    private structuredAppendTotal;
    private primaryData;
    private codewords;
    private set;
    private character;
    grid: boolean[][];
    content: string;
    eciMode: number;
    inputData: number[];
    readable: string;
    pattern: string[];
    row_count: number;
    row_height: number[];
    symbol_height: number;
    symbol_width: number;
    encodeInfo: StringBuilder;
    constructor();
    setContent(content: string): void;
    /**
     * Sets the MaxiCode mode to use. Only modes 2 to 6 are supported.
     *
     * @param mode the MaxiCode mode to use
     */
    setMode(/*int*/ mode: number): void;
    /**
     * Returns the MaxiCode mode being used. Only modes 2 to 6 are supported.
     *
     * @return the MaxiCode mode being used
     */
    getMode(): number;
    /**
     * If this MaxiCode symbol is part of a series of MaxiCode symbols appended in a structured format, this method sets the
     * position of this symbol in the series. Valid values are 1 through 8 inclusive.
     *
     * @param position the position of this MaxiCode symbol in the structured append series
     */
    setStructuredAppendPosition(/*int*/ position: number): void;
    /**
     * Returns the position of this MaxiCode symbol in a series of symbols using structured append. If this symbol is not part of
     * such a series, this method will return <code>1</code>.
     *
     * @return the position of this MaxiCode symbol in a series of symbols using structured append
     */
    getStructuredAppendPosition(): number;
    /**
     * If this MaxiCode symbol is part of a series of MaxiCode symbols appended in a structured format, this method sets the total
     * number of symbols in the series. Valid values are 1 through 8 inclusive. A value of 1 indicates that this symbol is not
     * part of a structured append series.
     *
     * @param total the total number of MaxiCode symbols in the structured append series
     */
    setStructuredAppendTotal(/*int*/ total: number): void;
    /**
     * Returns the size of the series of MaxiCode symbols using structured append that this symbol is part of. If this symbol is
     * not part of a structured append series, this method will return <code>1</code>.
     *
     * @return size of the series that this symbol is part of
     */
    getStructuredAppendTotal(): number;
    /**
     * Sets the primary data. Should only be used for modes 2 and 3. Must conform to the following structure:
     *
     * <table>
     *   <tr><th>Characters</th><th>Meaning</th></tr>
     *   <tr><td>1-9</td><td>Postal code data which can consist of up to 9 digits (for mode 2) or up to 6
     *                       alphanumeric characters (for mode 3). Remaining unused characters should be
     *                       filled with the SPACE character (ASCII 32).</td></tr>
     *   <tr><td>10-12</td><td>Three-digit country code according to ISO-3166.</td></tr>
     *   <tr><td>13-15</td><td>Three digit service code. This depends on your parcel courier.</td></tr>
     * </table>
     *
     * @param primary the primary data
     */
    setPrimary(/*String*/ primary: string): void;
    /**
     * Returns the primary data for this MaxiCode symbol. Should only be used for modes 2 and 3.
     *
     * @return the primary data for this MaxiCode symbol
     */
    getPrimary(): string;
    encode(): void;
    /**
     * Extracts the postal code, country code and service code from the primary data and returns the corresponding primary message
     * codewords.
     *
     * @return the primary message codewords
     */
    private getPrimaryCodewords;
    /**
     * Returns the primary message codewords for mode 2.
     *
     * @param postcode the postal code
     * @param country the country code
     * @param service the service code
     * @return the primary message, as codewords
     */
    private getMode2PrimaryCodewords;
    /**
     * Returns the primary message codewords for mode 3.
     *
     * @param postcode the postal code
     * @param country the country code
     * @param service the service code
     * @return the primary message, as codewords
     */
    private getMode3PrimaryCodewords;
    /**
     * Formats text according to Appendix A, populating the {@link #set} and {@link #character} arrays.
     *
     * @return true if the content fits in this symbol and was formatted; false otherwise
     */
    private processText;
    /**
     * Guesses the best set to use at the specified index by looking at the surrounding sets. In general, characters in
     * lower-numbered sets are more common, so we choose them if we can. If no good surrounding sets can be found, the default
     * value returned is the first value from the valid set.
     *
     * @param index the current index
     * @param length the maximum length to look at
     * @param valid the valid sets for this index
     * @return the best set to use at the specified index
     */
    private bestSurroundingSet;
    /**
     * Moves everything up so that the specified shift or latch character can be inserted.
     *
     * @param position the position beyond which everything needs to be shifted
     * @param c the latch or shift character to insert at the specified position, after everything has been shifted
     */
    private insert;
    /**
     * Returns the error correction codewords for the specified data codewords.
     *
     * @param codewords the codewords that we need error correction codewords for
     * @param ecclen the number of error correction codewords needed
     * @return the error correction codewords for the specified data codewords
     */
    private getErrorCorrection;
    getCodewords(): number[];
    bin2pat(/*CharSequence*/ bin: string): string;
    /**
     * Chooses the ECI mode most suitable for the content of this symbol.
     */
    eciProcess(): void;
    protected toBytes(s: string, charset: Charset, ...suffix: number[]): number[];
}
