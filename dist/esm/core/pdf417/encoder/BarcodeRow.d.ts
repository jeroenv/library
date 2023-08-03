/**
 * @author Jacob Haynes
 */
export default class BarcodeRow {
    private row;
    private currentLocation;
    /**
     * Creates a Barcode row of the width
     */
    constructor(/*int*/ width: number);
    /**
     * Sets a specific location in the bar
     *
     * @param x The location in the bar
     * @param value Black if true, white if false;
     */
    set(/*int*/ x: number, /*byte*/ value: number): void;
    /**
     * @param black A boolean which is true if the bar black false if it is white
     * @param width How many spots wide the bar is.
     */
    addBar(/*boolean*/ black: boolean, /*int*/ width: number): void;
    /**
     * This function scales the row
     *
     * @param scale How much you want the image to be scaled, must be greater than or equal to 1.
     * @return the scaled row
     */
    getScaledRow(/*int*/ scale: number): Uint8Array;
}
