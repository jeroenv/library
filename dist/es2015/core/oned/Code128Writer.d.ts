import BarcodeFormat from '../BarcodeFormat';
import EncodeHintType from '../EncodeHintType';
import OneDimensionalCodeWriter from './OneDimensionalCodeWriter';
/**
 * This object renders a CODE128 code as a {@link BitMatrix}.
 *
 * @author erik.barbara@gmail.com (Erik Barbara)
 */
export default class Code128Writer extends OneDimensionalCodeWriter {
    static CODE_START_A: number;
    static CODE_START_B: number;
    static CODE_START_C: number;
    static CODE_CODE_A: number;
    static CODE_CODE_B: number;
    static CODE_CODE_C: number;
    static CODE_STOP: number;
    static ESCAPE_FNC_1: string;
    static ESCAPE_FNC_2: string;
    static ESCAPE_FNC_3: string;
    static ESCAPE_FNC_4: string;
    static CODE_FNC_1: number;
    static CODE_FNC_2: number;
    static CODE_FNC_3: number;
    static CODE_FNC_4_A: number;
    static CODE_FNC_4_B: number;
    protected getSupportedWriteFormats(): BarcodeFormat[];
    encodeContents(contents: string, hints: Map<EncodeHintType, unknown>): boolean[];
    static check(contents: string, hints: Map<EncodeHintType, unknown>): number;
    private static encodeFast;
    static produceResult(patterns: Array<number[]>, checkSum: number): boolean[];
    private static findCType;
    private static chooseCode;
}
