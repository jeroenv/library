import CharacterSetECI from '../../common/CharacterSetECI';
import ECIInput from '../../common/ECIInput';
import Compaction from './Compaction';
/**
 * PDF417 high-level encoder following the algorithm described in ISO/IEC 15438:2001(E) in
 * annex P.
 */
export default class PDF417HighLevelEncoder {
    /**
     * code for Text compaction
     */
    private static TEXT_COMPACTION;
    /**
     * code for Byte compaction
     */
    private static BYTE_COMPACTION;
    /**
     * code for Numeric compaction
     */
    private static NUMERIC_COMPACTION;
    /**
     * Text compaction submode Alpha
     */
    private static SUBMODE_ALPHA;
    /**
     * Text compaction submode Lower
     */
    private static SUBMODE_LOWER;
    /**
     * Text compaction submode Mixed
     */
    private static SUBMODE_MIXED;
    /**
     * Text compaction submode Punctuation
     */
    private static SUBMODE_PUNCTUATION;
    /**
     * mode latch to Text Compaction mode
     */
    private static LATCH_TO_TEXT;
    /**
     * mode latch to Byte Compaction mode (number of characters NOT a multiple of 6)
     */
    private static LATCH_TO_BYTE_PADDED;
    /**
     * mode latch to Numeric Compaction mode
     */
    private static LATCH_TO_NUMERIC;
    /**
     * mode shift to Byte Compaction mode
     */
    private static SHIFT_TO_BYTE;
    /**
     * mode latch to Byte Compaction mode (number of characters a multiple of 6)
     */
    private static LATCH_TO_BYTE;
    /**
     * identifier for a user defined Extended Channel Interpretation (ECI)
     */
    private static ECI_USER_DEFINED;
    /**
     * identifier for a general purpose ECO format
     */
    private static ECI_GENERAL_PURPOSE;
    /**
     * identifier for an ECI of a character set of code page
     */
    private static ECI_CHARSET;
    /**
     * Raw code table for text compaction Mixed sub-mode
     */
    private static TEXT_MIXED_RAW;
    /**
     * Raw code table for text compaction: Punctuation sub-mode
     */
    private static TEXT_PUNCTUATION_RAW;
    private static MIXED;
    private static PUNCTUATION;
    private static DEFAULT_ENCODING;
    /**
     * Performs high-level encoding of a PDF417 message using the algorithm described in annex P
     * of ISO/IEC 15438:2001(E). If byte compaction has been selected, then only byte compaction
     * is used.
     *
     * @param msg the message
     * @param compaction compaction mode to use
     * @param encoding character encoding used to encode in default or byte compaction
     *  or {@code null} for default / not applicable
     * @param autoECI encode input minimally using multiple ECIs if needed
     *   If autoECI encoding is specified and additionally {@code encoding} is specified, then the encoder
     *   will use the specified {@link Charset} for any character that can be encoded by it, regardless
     *   if a different encoding would lead to a more compact encoding. When no {@code encoding} is specified
     *   then charsets will be chosen so that the byte representation is minimal.
     * @return the encoded message (the char values range from 0 to 928)
     */
    static encodeHighLevel(msg: string, compaction: Compaction, encoding: CharacterSetECI, autoECI: boolean): string;
    /**
     * Encode parts of the message using Text Compaction as described in ISO/IEC 15438:2001(E),
     * chapter 4.4.2.
     *
     * @param input          the input
     * @param startpos       the start position within the message
     * @param count          the number of characters to encode
     * @param sb             receives the encoded codewords
     * @param initialSubmode should normally be SUBMODE_ALPHA
     * @return the text submode in which this method ends
     */
    private static encodeText;
    /**
     * Encode all of the message using Byte Compaction as described in ISO/IEC 15438:2001(E)
     *
     * @param input     the input
     * @param startpos  the start position within the message
     * @param count     the number of bytes to encode
     * @param startmode the mode from which this method starts
     * @param sb        receives the encoded codewords
     */
    private static encodeMultiECIBinary;
    static subBytes(input: ECIInput, start: number, end: number): Uint8Array;
    /**
     * Encode parts of the message using Byte Compaction as described in ISO/IEC 15438:2001(E),
     * chapter 4.4.3. The Unicode characters will be converted to binary using the cp437
     * codepage.
     *
     * @param bytes     the message converted to a byte array
     * @param startpos  the start position within the message
     * @param count     the number of bytes to encode
     * @param startmode the mode from which this method starts
     * @param sb        receives the encoded codewords
     */
    private static encodeBinary;
    private static encodeNumeric;
    private static isDigit;
    private static isAlphaUpper;
    private static isAlphaLower;
    private static isMixed;
    private static isPunctuation;
    private static isText;
    /**
     * Determines the number of consecutive characters that are encodable using numeric compaction.
     *
     * @param input      the input
     * @param startpos the start position within the input
     * @return the requested character count
     */
    private static determineConsecutiveDigitCount;
    /**
     * Determines the number of consecutive characters that are encodable using text compaction.
     *
     * @param input      the input
     * @param startpos the start position within the input
     * @return the requested character count
     */
    private static determineConsecutiveTextCount;
    /**
     * Determines the number of consecutive characters that are encodable using binary compaction.
     *
     * @param input    the input
     * @param startpos the start position within the message
     * @param encoding the charset used to convert the message to a byte array
     * @return the requested character count
     */
    private static determineConsecutiveBinaryCount;
    private static encodingECI;
}
