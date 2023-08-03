/**
 * PDF417 error correction code following the algorithm described in ISO/IEC 15438:2001(E) in
 * chapter 4.10.
 */
export default class PDF417ErrorCorrection {
    /**
     * Tables of coefficients for calculating error correction words
     * (see annex F, ISO/IEC 15438:2001(E))
     */
    private static EC_COEFFICIENTS;
    /**
     * Determines the number of error correction codewords for a specified error correction
     * level.
     *
     * @param errorCorrectionLevel the error correction level (0-8)
     * @return the number of codewords generated for error correction
     */
    static getErrorCorrectionCodewordCount(errorCorrectionLevel: number): number;
    /**
     * Returns the recommended minimum error correction level as described in annex E of
     * ISO/IEC 15438:2001(E).
     *
     * @param n the number of data codewords
     * @return the recommended minimum error correction level
     */
    static getRecommendedMinimumErrorCorrectionLevel(n: number): 2 | 3 | 4 | 5;
    /**
     * Generates the error correction codewords according to 4.10 in ISO/IEC 15438:2001(E).
     *
     * @param dataCodewords        the data codewords
     * @param errorCorrectionLevel the error correction level (0-8)
     * @return the String representing the error correction codewords
     */
    static generateErrorCorrection(dataCodewords: string, errorCorrectionLevel: number): string;
}
