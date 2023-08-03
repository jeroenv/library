/**
 * Data object to specify the minimum and maximum number of rows and columns for a PDF417 barcode.
 *
 * @author qwandor@google.com (Andrew Walbran)
 */
export default class Dimensions {
    private minCols;
    private maxCols;
    private minRows;
    private maxRows;
    constructor(minCols: number, maxCols: number, minRows: number, maxRows: number);
    getMinCols(): number;
    getMaxCols(): number;
    getMinRows(): number;
    getMaxRows(): number;
}
