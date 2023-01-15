/*
 * Copyright 2011 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @author Jacob Haynes
 */
export default /*final*/ class BarcodeRow {
  private /*final byte[]*/ row: Uint8Array;
  //A tacker for position in the bar
  private /*int*/ currentLocation: number;

  /**
   * Creates a Barcode row of the width
   */
  constructor(/*int*/ width: number) {
    this.row = new Uint8Array(width);
    this.currentLocation = 0;
  }

  /**
   * Sets a specific location in the bar
   *
   * @param x The location in the bar
   * @param value Black if true, white if false;
   */
  /*void*/ set(/*int*/ x: number, /*byte*/ value: number) {
    this.row[x] = value;
  }

  /**
   * @param black A boolean which is true if the bar black false if it is white
   * @param width How many spots wide the bar is.
   */
  /*void*/ addBar(/*boolean*/ black: boolean, /*int*/ width: number) {
    for (let ii = 0; ii < width; ii++) {
      this.set(this.currentLocation++, black ? 1 : 0);
    }
  }

  /**
   * This function scales the row
   *
   * @param scale How much you want the image to be scaled, must be greater than or equal to 1.
   * @return the scaled row
   */
  /*byte[]*/ getScaledRow(/*int*/ scale: number) {
    const output = new Uint8Array(this.row.length * scale);
    for (let i = 0; i < output.length; i++) {
      output[i] = this.row[Math.floor(i / scale)];
    }
    return output;
  }
}
