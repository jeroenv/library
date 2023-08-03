import BarcodeRow from './BarcodeRow';
/**
 * Holds all of the information for a barcode in a format where it can be easily accessible
 *
 * @author Jacob Haynes
 */
export default class BarcodeMatrix {
    private matrix;
    private currentRow;
    private height;
    private width;
    /**
     * @param height the height of the matrix (Rows)
     * @param width  the width of the matrix (Cols)
     */
    constructor(/*int*/ height: number, /*int*/ width: number);
    set(/*int*/ x: number, /*int*/ y: number, /*byte*/ value: number): void;
    startRow(): void;
    getCurrentRow(): BarcodeRow;
    getMatrix(): Uint8Array[];
    getScaledMatrix(xScale: number, yScale: number): Uint8Array[];
}
