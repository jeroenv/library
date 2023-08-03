/*
 * Copyright 2014-2015 Robin Stuart, Daniel Gredler
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import GenericGF from '../../common/reedsolomon/GenericGF';
import ReedSolomonEncoder from '../../common/reedsolomon/ReedSolomonEncoder';
import IllegalArgumentException from '../../IllegalArgumentException';
import Arrays from '../../util/Arrays';
import Integer from '../../util/Integer';
import StringBuilder from '../../util/StringBuilder';
import Charset from '../../util/Charset';
import StringUtils from '../../common/StringUtils';
/*package uk.org.okapibarcode.backend;

import IllegalArgumentException from "src/core/IllegalArgumentException";
import static uk.org.okapibarcode.util.Arrays.contains;
import static uk.org.okapibarcode.util.Arrays.Arrays.insertArray;

import java.util.Arrays;

import uk.org.okapibarcode.graphics.Circle;
import uk.org.okapibarcode.graphics.Hexagon;
*/
/** MaxiCode module sequence, from ISO/IEC 16023 Figure 5 (30 x 33 data grid). */
const /*final int[]*/ MAXICODE_GRID = [
    122, 121, 128, 127, 134, 133, 140, 139, 146, 145, 152, 151, 158, 157, 164,
    163, 170, 169, 176, 175, 182, 181, 188, 187, 194, 193, 200, 199, 0, 0, 124,
    123, 130, 129, 136, 135, 142, 141, 148, 147, 154, 153, 160, 159, 166, 165,
    172, 171, 178, 177, 184, 183, 190, 189, 196, 195, 202, 201, 817, 0, 126,
    125, 132, 131, 138, 137, 144, 143, 150, 149, 156, 155, 162, 161, 168, 167,
    174, 173, 180, 179, 186, 185, 192, 191, 198, 197, 204, 203, 819, 818, 284,
    283, 278, 277, 272, 271, 266, 265, 260, 259, 254, 253, 248, 247, 242, 241,
    236, 235, 230, 229, 224, 223, 218, 217, 212, 211, 206, 205, 820, 0, 286,
    285, 280, 279, 274, 273, 268, 267, 262, 261, 256, 255, 250, 249, 244, 243,
    238, 237, 232, 231, 226, 225, 220, 219, 214, 213, 208, 207, 822, 821, 288,
    287, 282, 281, 276, 275, 270, 269, 264, 263, 258, 257, 252, 251, 246, 245,
    240, 239, 234, 233, 228, 227, 222, 221, 216, 215, 210, 209, 823, 0, 290,
    289, 296, 295, 302, 301, 308, 307, 314, 313, 320, 319, 326, 325, 332, 331,
    338, 337, 344, 343, 350, 349, 356, 355, 362, 361, 368, 367, 825, 824, 292,
    291, 298, 297, 304, 303, 310, 309, 316, 315, 322, 321, 328, 327, 334, 333,
    340, 339, 346, 345, 352, 351, 358, 357, 364, 363, 370, 369, 826, 0, 294,
    293, 300, 299, 306, 305, 312, 311, 318, 317, 324, 323, 330, 329, 336, 335,
    342, 341, 348, 347, 354, 353, 360, 359, 366, 365, 372, 371, 828, 827, 410,
    409, 404, 403, 398, 397, 392, 391, 80, 79, 0, 0, 14, 13, 38, 37, 3, 0, 45,
    44, 110, 109, 386, 385, 380, 379, 374, 373, 829, 0, 412, 411, 406, 405, 400,
    399, 394, 393, 82, 81, 41, 0, 16, 15, 40, 39, 4, 0, 0, 46, 112, 111, 388,
    387, 382, 381, 376, 375, 831, 830, 414, 413, 408, 407, 402, 401, 396, 395,
    84, 83, 42, 0, 0, 0, 0, 0, 6, 5, 48, 47, 114, 113, 390, 389, 384, 383, 378,
    377, 832, 0, 416, 415, 422, 421, 428, 427, 104, 103, 56, 55, 17, 0, 0, 0, 0,
    0, 0, 0, 21, 20, 86, 85, 434, 433, 440, 439, 446, 445, 834, 833, 418, 417,
    424, 423, 430, 429, 106, 105, 58, 57, 0, 0, 0, 0, 0, 0, 0, 0, 23, 22, 88,
    87, 436, 435, 442, 441, 448, 447, 835, 0, 420, 419, 426, 425, 432, 431, 108,
    107, 60, 59, 0, 0, 0, 0, 0, 0, 0, 0, 0, 24, 90, 89, 438, 437, 444, 443, 450,
    449, 837, 836, 482, 481, 476, 475, 470, 469, 49, 0, 31, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 1, 54, 53, 464, 463, 458, 457, 452, 451, 838, 0, 484, 483, 478,
    477, 472, 471, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 466, 465,
    460, 459, 454, 453, 840, 839, 486, 485, 480, 479, 474, 473, 52, 51, 32, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 43, 468, 467, 462, 461, 456, 455, 841, 0,
    488, 487, 494, 493, 500, 499, 98, 97, 62, 61, 0, 0, 0, 0, 0, 0, 0, 0, 0, 27,
    92, 91, 506, 505, 512, 511, 518, 517, 843, 842, 490, 489, 496, 495, 502,
    501, 100, 99, 64, 63, 0, 0, 0, 0, 0, 0, 0, 0, 29, 28, 94, 93, 508, 507, 514,
    513, 520, 519, 844, 0, 492, 491, 498, 497, 504, 503, 102, 101, 66, 65, 18,
    0, 0, 0, 0, 0, 0, 0, 19, 30, 96, 95, 510, 509, 516, 515, 522, 521, 846, 845,
    560, 559, 554, 553, 548, 547, 542, 541, 74, 73, 33, 0, 0, 0, 0, 0, 0, 11,
    68, 67, 116, 115, 536, 535, 530, 529, 524, 523, 847, 0, 562, 561, 556, 555,
    550, 549, 544, 543, 76, 75, 0, 0, 8, 7, 36, 35, 12, 0, 70, 69, 118, 117,
    538, 537, 532, 531, 526, 525, 849, 848, 564, 563, 558, 557, 552, 551, 546,
    545, 78, 77, 0, 34, 10, 9, 26, 25, 0, 0, 72, 71, 120, 119, 540, 539, 534,
    533, 528, 527, 850, 0, 566, 565, 572, 571, 578, 577, 584, 583, 590, 589,
    596, 595, 602, 601, 608, 607, 614, 613, 620, 619, 626, 625, 632, 631, 638,
    637, 644, 643, 852, 851, 568, 567, 574, 573, 580, 579, 586, 585, 592, 591,
    598, 597, 604, 603, 610, 609, 616, 615, 622, 621, 628, 627, 634, 633, 640,
    639, 646, 645, 853, 0, 570, 569, 576, 575, 582, 581, 588, 587, 594, 593,
    600, 599, 606, 605, 612, 611, 618, 617, 624, 623, 630, 629, 636, 635, 642,
    641, 648, 647, 855, 854, 728, 727, 722, 721, 716, 715, 710, 709, 704, 703,
    698, 697, 692, 691, 686, 685, 680, 679, 674, 673, 668, 667, 662, 661, 656,
    655, 650, 649, 856, 0, 730, 729, 724, 723, 718, 717, 712, 711, 706, 705,
    700, 699, 694, 693, 688, 687, 682, 681, 676, 675, 670, 669, 664, 663, 658,
    657, 652, 651, 858, 857, 732, 731, 726, 725, 720, 719, 714, 713, 708, 707,
    702, 701, 696, 695, 690, 689, 684, 683, 678, 677, 672, 671, 666, 665, 660,
    659, 654, 653, 859, 0, 734, 733, 740, 739, 746, 745, 752, 751, 758, 757,
    764, 763, 770, 769, 776, 775, 782, 781, 788, 787, 794, 793, 800, 799, 806,
    805, 812, 811, 861, 860, 736, 735, 742, 741, 748, 747, 754, 753, 760, 759,
    766, 765, 772, 771, 778, 777, 784, 783, 790, 789, 796, 795, 802, 801, 808,
    807, 814, 813, 862, 0, 738, 737, 744, 743, 750, 749, 756, 755, 762, 761,
    768, 767, 774, 773, 780, 779, 786, 785, 792, 791, 798, 797, 804, 803, 810,
    809, 816, 815, 864, 863,
];
/**
 * ASCII character to Code Set mapping, from ISO/IEC 16023 Appendix A.
 * 1 = Set A, 2 = Set B, 3 = Set C, 4 = Set D, 5 = Set E.
 * 0 refers to special characters that fit into more than one set (e.g. GS).
 */
const /*final int[]*/ MAXICODE_SET = [
    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
    5, 5, 5, 0, 0, 0, 5, 0, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 0, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5,
    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 4, 5, 5, 5, 5, 5, 5, 4, 5, 3, 4, 3, 5, 5,
    4, 4, 3, 3, 3, 4, 3, 5, 4, 4, 3, 3, 4, 3, 3, 3, 4, 3, 3, 3, 3, 3, 3, 3, 3,
    3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4,
    4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    4, 4, 4, 4, 4, 4,
];
/** ASCII character to symbol value, from ISO/IEC 16023 Appendix A. */
const /*final int[]*/ MAXICODE_SYMBOL_CHAR = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23, 24, 25, 26, 30, 28, 29, 30, 35, 32, 53, 34, 35, 36, 37, 38, 39,
    40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58,
    37, 38, 39, 40, 41, 52, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
    16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 42, 43, 44, 45, 46, 0, 1, 2, 3,
    4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
    24, 25, 26, 32, 54, 34, 35, 36, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 47,
    48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 48, 49, 50, 51, 52, 53, 54, 55, 56,
    57, 36, 37, 37, 38, 39, 40, 41, 42, 43, 38, 44, 37, 39, 38, 45, 46, 40, 41,
    39, 40, 41, 42, 42, 47, 43, 44, 43, 44, 45, 45, 46, 47, 46, 0, 1, 2, 3, 4,
    5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
    25, 26, 32, 33, 34, 35, 36, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
    14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 32, 33, 34, 35, 36,
];
const FNC1 = -1;
const FNC2 = -2;
const FNC3 = -3;
const FNC4 = -4;
const FNC1_STRING = `\\${FNC1}`;
const FNC2_STRING = `\\${FNC2}`;
const FNC3_STRING = `\\${FNC3}`;
const FNC4_STRING = `\\${FNC4}`;
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
export default /*public*/ class MaxiCode /*extends Symbol*/ {
    //protected List< Rectangle > rectangles = new ArrayList<>(); // note positions do not account for quiet zones (handled in renderers)
    //protected List< TextBox > texts = new ArrayList<>();        // note positions do not account for quiet zones (handled in renderers)
    //protected List< Hexagon > hexagons = new ArrayList<>();     // note positions do not account for quiet zones (handled in renderers)
    //protected List< Circle > target = new ArrayList<>();        // note positions do not account for quiet zones (handled in renderers)
    constructor() {
        this.structuredAppendPosition = 1;
        this.structuredAppendTotal = 1;
        this.primaryData = '';
        this.set = new Array(144); //new int[144]
        this.character = new Array(144); //new int[144]
        /*protected int*/ this.eciMode = -1;
        /*protected String*/ this.readable = '';
        /*protected int*/ this.row_count = 0;
        /*protected int*/ this.symbol_height = 0;
        /*protected int*/ this.symbol_width = 0;
        /*protected StringBuilder*/ this.encodeInfo = new StringBuilder();
        this.grid = new Array(33);
        for (let i = 0; i < 33; i++) {
            this.grid[i] = new Array(30);
        }
    }
    setContent(content) {
        this.content = content;
    }
    /**
     * Sets the MaxiCode mode to use. Only modes 2 to 6 are supported.
     *
     * @param mode the MaxiCode mode to use
     */
    setMode(/*int*/ mode) {
        if (mode < 2 || mode > 6) {
            throw new IllegalArgumentException('Invalid MaxiCode mode: ${mode}' + mode);
        }
        this.mode = mode;
    }
    /**
     * Returns the MaxiCode mode being used. Only modes 2 to 6 are supported.
     *
     * @return the MaxiCode mode being used
     */
    getMode() {
        return this.mode;
    }
    /**
     * If this MaxiCode symbol is part of a series of MaxiCode symbols appended in a structured format, this method sets the
     * position of this symbol in the series. Valid values are 1 through 8 inclusive.
     *
     * @param position the position of this MaxiCode symbol in the structured append series
     */
    setStructuredAppendPosition(/*int*/ position) {
        if (position < 1 || position > 8) {
            throw new IllegalArgumentException('Invalid MaxiCode structured append position: ' + position);
        }
        this.structuredAppendPosition = position;
    }
    /**
     * Returns the position of this MaxiCode symbol in a series of symbols using structured append. If this symbol is not part of
     * such a series, this method will return <code>1</code>.
     *
     * @return the position of this MaxiCode symbol in a series of symbols using structured append
     */
    getStructuredAppendPosition() {
        return this.structuredAppendPosition;
    }
    /**
     * If this MaxiCode symbol is part of a series of MaxiCode symbols appended in a structured format, this method sets the total
     * number of symbols in the series. Valid values are 1 through 8 inclusive. A value of 1 indicates that this symbol is not
     * part of a structured append series.
     *
     * @param total the total number of MaxiCode symbols in the structured append series
     */
    setStructuredAppendTotal(/*int*/ total) {
        if (total < 1 || total > 8) {
            throw new IllegalArgumentException('Invalid MaxiCode structured append total: ' + total);
        }
        this.structuredAppendTotal = total;
    }
    /**
     * Returns the size of the series of MaxiCode symbols using structured append that this symbol is part of. If this symbol is
     * not part of a structured append series, this method will return <code>1</code>.
     *
     * @return size of the series that this symbol is part of
     */
    getStructuredAppendTotal() {
        return this.structuredAppendTotal;
    }
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
    setPrimary(/*String*/ primary) {
        this.primaryData = primary;
    }
    /**
     * Returns the primary data for this MaxiCode symbol. Should only be used for modes 2 and 3.
     *
     * @return the primary data for this MaxiCode symbol
     */
    getPrimary() {
        return this.primaryData;
    }
    /*void*/ encode() {
        this.eciProcess();
        // mode 2 -> mode 3 if postal code isn't strictly numeric
        if (this.mode == 2) {
            for (let /*int*/ i = 0; i < 10 && i < this.primaryData.length; i++) {
                if (this.primaryData.charAt(i).charCodeAt(0) < '0'.charCodeAt(0) ||
                    this.primaryData.charAt(i).charCodeAt(0) > '9'.charCodeAt(0)) {
                    this.mode = 3;
                    break;
                }
            }
        }
        // initialize the set and character arrays
        this.processText();
        // start building the codeword array, starting with a copy of the character data
        // insert primary message if this is a structured carrier message; insert mode otherwise
        this.codewords = Array.from(Arrays.copyOf(Int32Array.from(this.character), this.character.length));
        if (this.mode == 2 || this.mode == 3) {
            const /*int[]*/ primary = this.getPrimaryCodewords();
            this.codewords = Arrays.insertArray(this.codewords, 0, primary);
        }
        else {
            this.codewords = Arrays.insertArray(this.codewords, 0, 
            /*new int[] { mode }*/ [this.mode]);
        }
        // insert structured append flag if necessary
        if (this.structuredAppendTotal > 1) {
            const /*int[]*/ flag = new Array(2); //new int[2];
            flag[0] = 33; // padding
            flag[1] =
                ((this.structuredAppendPosition - 1) << 3) |
                    (this.structuredAppendTotal - 1); // position + total
            let /*int*/ index;
            if (this.mode == 2 || this.mode == 3) {
                index = 10; // first two data symbols in the secondary message
            }
            else {
                index = 1; // first two data symbols in the primary message (first symbol at index 0 isn't a data symbol)
            }
            this.codewords = Arrays.insertArray(this.codewords, index, flag);
        }
        let /*int*/ secondaryMax, secondaryECMax;
        if (this.mode == 5) {
            // 68 data codewords, 56 error corrections in secondary message
            secondaryMax = 68;
            secondaryECMax = 56;
        }
        else {
            // 84 data codewords, 40 error corrections in secondary message
            secondaryMax = 84;
            secondaryECMax = 40;
        }
        // truncate data codewords to maximum data space available
        const /*int*/ totalMax = secondaryMax + 10;
        if (this.codewords.length > totalMax) {
            this.codewords = Array.from(Arrays.copyOfRange(Int32Array.from(this.codewords), 0, totalMax));
        }
        // insert primary error correction between primary message and secondary message (always EEC)
        const /*int[]*/ primary = Array.from(Arrays.copyOfRange(Int32Array.from(this.codewords), 0, 10));
        const /*int[]*/ primaryCheck = this.getErrorCorrection(primary, 10);
        this.codewords = Arrays.insertArray(this.codewords, 10, primaryCheck);
        // calculate secondary error correction
        const /*int[]*/ secondary = Array.from(Arrays.copyOfRange(Int32Array.from(this.codewords), 20, this.codewords.length));
        const /*int[]*/ secondaryOdd = new Array(secondary.length / 2); //new int[secondary.length / 2];
        const /*int[]*/ secondaryEven = new Array(secondary.length / 2); //new int[secondary.length / 2];
        for (let /*int*/ i = 0; i < secondary.length; i++) {
            if ((i & 1) != 0) {
                // odd
                secondaryOdd[(i - 1) / 2] = secondary[i];
            }
            else {
                // even
                secondaryEven[i / 2] = secondary[i];
            }
        }
        const /*int[]*/ secondaryECOdd = this.getErrorCorrection(secondaryOdd, Math.floor(secondaryECMax / 2));
        const /*int[]*/ secondaryECEven = this.getErrorCorrection(secondaryEven, Math.floor(secondaryECMax / 2));
        // add secondary error correction after secondary message
        this.codewords = Array.from(Arrays.copyOf(Int32Array.from(this.codewords), this.codewords.length + secondaryECOdd.length + secondaryECEven.length));
        for (let /*int*/ i = 0; i < secondaryECOdd.length; i++) {
            this.codewords[20 + secondaryMax + 2 * i + 1] = secondaryECOdd[i];
        }
        for (let /*int*/ i = 0; i < secondaryECEven.length; i++) {
            this.codewords[20 + secondaryMax + 2 * i] = secondaryECEven[i];
        }
        //infoLine("Mode: " + mode);
        //infoLine("ECC Codewords: " + secondaryECMax);
        //info("Codewords: ");
        //for (int i = 0; i < codewords.length; i++) {
        //    infoSpace(codewords[i]);
        //}
        //infoLine();
        // copy data into symbol grid
        const /*int[]*/ bit_pattern = new Array(7); //new int[7];
        for (let /*int*/ i = 0; i < 33; i++) {
            for (let /*int*/ j = 0; j < 30; j++) {
                const /*int*/ block = Math.floor((MAXICODE_GRID[i * 30 + j] + 5) / 6);
                const /*int*/ bit = (MAXICODE_GRID[i * 30 + j] + 5) % 6;
                if (block != 0) {
                    bit_pattern[0] = (this.codewords[block - 1] & 0x20) >> 5;
                    bit_pattern[1] = (this.codewords[block - 1] & 0x10) >> 4;
                    bit_pattern[2] = (this.codewords[block - 1] & 0x8) >> 3;
                    bit_pattern[3] = (this.codewords[block - 1] & 0x4) >> 2;
                    bit_pattern[4] = (this.codewords[block - 1] & 0x2) >> 1;
                    bit_pattern[5] = this.codewords[block - 1] & 0x1;
                    if (bit_pattern[bit] != 0) {
                        this.grid[i][j] = true;
                    }
                    else {
                        this.grid[i][j] = false;
                    }
                }
            }
        }
        // add orientation markings
        this.grid[0][28] = true; // top right filler
        this.grid[0][29] = true;
        this.grid[9][10] = true; // top left marker
        this.grid[9][11] = true;
        this.grid[10][11] = true;
        this.grid[15][7] = true; // left hand marker
        this.grid[16][8] = true;
        this.grid[16][20] = true; // right hand marker
        this.grid[17][20] = true;
        this.grid[22][10] = true; // bottom left marker
        this.grid[23][10] = true;
        this.grid[22][17] = true; // bottom right marker
        this.grid[23][17] = true;
        // the following is provided for compatibility, but the results are not useful
        this.row_count = 33;
        this.readable = '';
        this.pattern = new Array(33);
        this.row_height = new Array(33);
        for (let /*int*/ i = 0; i < 33; i++) {
            const bin = new StringBuilder();
            for (let /*int*/ j = 0; j < 30; j++) {
                if (this.grid[i][j]) {
                    bin.append('1');
                }
                else {
                    bin.append('0');
                }
            }
            this.pattern[i] = this.bin2pat(bin.toString());
            this.row_height[i] = 1;
        }
    }
    /**
     * Extracts the postal code, country code and service code from the primary data and returns the corresponding primary message
     * codewords.
     *
     * @return the primary message codewords
     */
    getPrimaryCodewords() {
        //assert mode == 2 || mode == 3;
        if (!(this.mode == 2 || this.mode === 3)) {
            throw new IllegalArgumentException('Invalid mode');
        }
        if (this.primaryData.length != 15) {
            throw new IllegalArgumentException('Invalid Primary String');
        }
        for (let /*int*/ i = 9; i < 15; i++) {
            /* check that country code and service are numeric */
            if (this.primaryData.charAt(i).charCodeAt(0) < '0'.charCodeAt(0) ||
                this.primaryData.charAt(i).charCodeAt(0) > '9'.charCodeAt(0)) {
                throw new IllegalArgumentException('Invalid Primary String');
            }
        }
        let /*String*/ postcode;
        if (this.mode == 2) {
            postcode = this.primaryData.substring(0, 9);
            const /*int*/ index = postcode.indexOf(' ');
            if (index != -1) {
                postcode = postcode.substring(0, index);
            }
        }
        else {
            //assert mode == 3;
            if (!(this.mode === 3)) {
                throw new IllegalArgumentException('Invalid mode');
            }
            postcode = this.primaryData.substring(0, 6);
        }
        const /*int*/ country = Integer.parseInt(this.primaryData.substring(9, 12));
        const /*int*/ service = Integer.parseInt(this.primaryData.substring(12, 15));
        //infoLine("Postal Code: " + postcode);
        //infoLine("Country Code: " + country);
        //infoLine("Service: " + service);
        if (this.mode == 2) {
            return this.getMode2PrimaryCodewords(postcode, country, service);
        }
        else {
            //assert mode == 3;
            if (!(this.mode === 3)) {
                throw new IllegalArgumentException('Invalid mode');
            }
            return this.getMode3PrimaryCodewords(postcode, country, service);
        }
    }
    /**
     * Returns the primary message codewords for mode 2.
     *
     * @param postcode the postal code
     * @param country the country code
     * @param service the service code
     * @return the primary message, as codewords
     */
    getMode2PrimaryCodewords(
    /*String*/ postcode, 
    /*int*/ country, 
    /*int*/ service) {
        for (let /*int*/ i = 0; i < postcode.length; i++) {
            if (postcode.charAt(i).charCodeAt(0) < '0'.charCodeAt(0) ||
                postcode.charAt(i).charCodeAt(0) > '9'.charCodeAt(0)) {
                postcode = postcode.substring(0, i);
                break;
            }
        }
        const /*int*/ postcodeNum = Integer.parseInt(postcode);
        const /*int[]*/ primary = new Array(10); //new int[10];
        primary[0] = ((postcodeNum & 0x03) << 4) | 2;
        primary[1] = (postcodeNum & 0xfc) >> 2;
        primary[2] = (postcodeNum & 0x3f00) >> 8;
        primary[3] = (postcodeNum & 0xfc000) >> 14;
        primary[4] = (postcodeNum & 0x3f00000) >> 20;
        primary[5] =
            ((postcodeNum & 0x3c000000) >> 26) | ((postcode.length & 0x3) << 4);
        primary[6] = ((postcode.length & 0x3c) >> 2) | ((country & 0x3) << 4);
        primary[7] = (country & 0xfc) >> 2;
        primary[8] = ((country & 0x300) >> 8) | ((service & 0xf) << 2);
        primary[9] = (service & 0x3f0) >> 4;
        return primary;
    }
    /**
     * Returns the primary message codewords for mode 3.
     *
     * @param postcode the postal code
     * @param country the country code
     * @param service the service code
     * @return the primary message, as codewords
     */
    getMode3PrimaryCodewords(
    /*String*/ postcode, 
    /*int*/ country, 
    /*int*/ service) {
        const /*int[]*/ postcodeNums = new Array(postcode.length); //new int[postcode.length()];
        postcode = postcode.toUpperCase();
        for (let /*int*/ i = 0; i < postcodeNums.length; i++) {
            postcodeNums[i] = postcode.charAt(i).charCodeAt(0);
            if (postcode.charAt(i).charCodeAt(0) >= 'A'.charCodeAt(0) &&
                postcode.charAt(i).charCodeAt(0) <= 'Z'.charCodeAt(0)) {
                // (Capital) letters shifted to Code Set A values
                postcodeNums[i] -= 64;
            }
            if (postcodeNums[i] == 27 ||
                postcodeNums[i] == 31 ||
                postcodeNums[i] == 33 ||
                postcodeNums[i] >= 59) {
                // Not a valid postal code character, use space instead
                postcodeNums[i] = 32;
            }
            // Input characters lower than 27 (NUL - SUB) in postal code are interpreted as capital
            // letters in Code Set A (e.g. LF becomes 'J')
        }
        const /*int[]*/ primary = new Array(10); //new int[10];
        primary[0] = ((postcodeNums[5] & 0x03) << 4) | 3;
        primary[1] =
            ((postcodeNums[4] & 0x03) << 4) | ((postcodeNums[5] & 0x3c) >> 2);
        primary[2] =
            ((postcodeNums[3] & 0x03) << 4) | ((postcodeNums[4] & 0x3c) >> 2);
        primary[3] =
            ((postcodeNums[2] & 0x03) << 4) | ((postcodeNums[3] & 0x3c) >> 2);
        primary[4] =
            ((postcodeNums[1] & 0x03) << 4) | ((postcodeNums[2] & 0x3c) >> 2);
        primary[5] =
            ((postcodeNums[0] & 0x03) << 4) | ((postcodeNums[1] & 0x3c) >> 2);
        primary[6] = ((postcodeNums[0] & 0x3c) >> 2) | ((country & 0x3) << 4);
        primary[7] = (country & 0xfc) >> 2;
        primary[8] = ((country & 0x300) >> 8) | ((service & 0xf) << 2);
        primary[9] = (service & 0x3f0) >> 4;
        return primary;
    }
    /**
     * Formats text according to Appendix A, populating the {@link #set} and {@link #character} arrays.
     *
     * @return true if the content fits in this symbol and was formatted; false otherwise
     */
    processText() {
        let /*int*/ length = this.content.length;
        let /*int*/ i, j, count, current_set;
        if (length > 138) {
            throw new IllegalArgumentException('Input data too long');
        }
        for (i = 0; i < 144; i++) {
            this.set[i] = -1;
            this.character[i] = 0;
        }
        for (i = 0; i < length; i++) {
            /* Look up characters in table from Appendix A - this gives
                   value and code set for most characters */
            this.set[i] = MAXICODE_SET[this.inputData[i]];
            this.character[i] = MAXICODE_SYMBOL_CHAR[this.inputData[i]];
        }
        // If a character can be represented in more than one code set, pick which version to use.
        if (this.set[0] == 0) {
            if (this.character[0] == 13) {
                this.character[0] = 0;
            }
            this.set[0] = 1;
        }
        for (i = 1; i < length; i++) {
            if (this.set[i] == 0) {
                /* Special character that can be represented in more than one code set. */
                if (this.character[i] == 13) {
                    /* Carriage Return */
                    this.set[i] = this.bestSurroundingSet(i, length, 1, 5);
                    if (this.set[i] == 5) {
                        this.character[i] = 13;
                    }
                    else {
                        this.character[i] = 0;
                    }
                }
                else if (this.character[i] == 28) {
                    /* FS */
                    this.set[i] = this.bestSurroundingSet(i, length, 1, 2, 3, 4, 5);
                    if (this.set[i] == 5) {
                        this.character[i] = 32;
                    }
                }
                else if (this.character[i] == 29) {
                    /* GS */
                    this.set[i] = this.bestSurroundingSet(i, length, 1, 2, 3, 4, 5);
                    if (this.set[i] == 5) {
                        this.character[i] = 33;
                    }
                }
                else if (this.character[i] == 30) {
                    /* RS */
                    this.set[i] = this.bestSurroundingSet(i, length, 1, 2, 3, 4, 5);
                    if (this.set[i] == 5) {
                        this.character[i] = 34;
                    }
                }
                else if (this.character[i] == 32) {
                    /* Space */
                    this.set[i] = this.bestSurroundingSet(i, length, 1, 2, 3, 4, 5);
                    if (this.set[i] == 1) {
                        this.character[i] = 32;
                    }
                    else if (this.set[i] == 2) {
                        this.character[i] = 47;
                    }
                    else {
                        this.character[i] = 59;
                    }
                }
                else if (this.character[i] == 44) {
                    /* Comma */
                    this.set[i] = this.bestSurroundingSet(i, length, 1, 2);
                    if (this.set[i] == 2) {
                        this.character[i] = 48;
                    }
                }
                else if (this.character[i] == 46) {
                    /* Full Stop */
                    this.set[i] = this.bestSurroundingSet(i, length, 1, 2);
                    if (this.set[i] == 2) {
                        this.character[i] = 49;
                    }
                }
                else if (this.character[i] == 47) {
                    /* Slash */
                    this.set[i] = this.bestSurroundingSet(i, length, 1, 2);
                    if (this.set[i] == 2) {
                        this.character[i] = 50;
                    }
                }
                else if (this.character[i] == 58) {
                    /* Colon */
                    this.set[i] = this.bestSurroundingSet(i, length, 1, 2);
                    if (this.set[i] == 2) {
                        this.character[i] = 51;
                    }
                }
            }
        }
        for (i = length; i < this.set.length; i++) {
            /* Add the padding */
            if (this.set[length - 1] == 2) {
                this.set[i] = 2;
            }
            else {
                this.set[i] = 1;
            }
            this.character[i] = 33;
        }
        /* Find candidates for number compression (not allowed in primary message in modes 2 and 3). */
        if (this.mode == 2 || this.mode == 3) {
            j = 9;
        }
        else {
            j = 0;
        }
        count = 0;
        for (i = j; i < 143; i++) {
            if (this.set[i] == 1 &&
                this.character[i] >= 48 &&
                this.character[i] <= 57) {
                /* Character is a number */
                count++;
            }
            else {
                count = 0;
            }
            if (count == 9) {
                /* Nine digits in a row can be compressed */
                this.set[i] = 6;
                this.set[i - 1] = 6;
                this.set[i - 2] = 6;
                this.set[i - 3] = 6;
                this.set[i - 4] = 6;
                this.set[i - 5] = 6;
                this.set[i - 6] = 6;
                this.set[i - 7] = 6;
                this.set[i - 8] = 6;
                count = 0;
            }
        }
        /* Add shift and latch characters */
        current_set = 1;
        i = 0;
        do {
            if (this.set[i] != current_set && this.set[i] != 6) {
                switch (this.set[i]) {
                    case 1:
                        if (i + 1 < this.set.length && this.set[i + 1] == 1) {
                            if (i + 2 < this.set.length && this.set[i + 2] == 1) {
                                if (i + 3 < this.set.length && this.set[i + 3] == 1) {
                                    /* Latch A */
                                    this.insert(i, 63);
                                    current_set = 1;
                                    length++;
                                    i += 3;
                                }
                                else {
                                    /* 3 Shift A */
                                    this.insert(i, 57);
                                    length++;
                                    i += 2;
                                }
                            }
                            else {
                                /* 2 Shift A */
                                this.insert(i, 56);
                                length++;
                                i++;
                            }
                        }
                        else {
                            /* Shift A */
                            this.insert(i, 59);
                            length++;
                        }
                        break;
                    case 2:
                        if (i + 1 < this.set.length && this.set[i + 1] == 2) {
                            /* Latch B */
                            this.insert(i, 63);
                            current_set = 2;
                            length++;
                            i++;
                        }
                        else {
                            /* Shift B */
                            this.insert(i, 59);
                            length++;
                        }
                        break;
                    case 3:
                        if (i + 3 < this.set.length &&
                            this.set[i + 1] == 3 &&
                            this.set[i + 2] == 3 &&
                            this.set[i + 3] == 3) {
                            /* Lock In C */
                            this.insert(i, 60);
                            this.insert(i, 60);
                            current_set = 3;
                            length++;
                            i += 3;
                        }
                        else {
                            /* Shift C */
                            this.insert(i, 60);
                            length++;
                        }
                        break;
                    case 4:
                        if (i + 3 < this.set.length &&
                            this.set[i + 1] == 4 &&
                            this.set[i + 2] == 4 &&
                            this.set[i + 3] == 4) {
                            /* Lock In D */
                            this.insert(i, 61);
                            this.insert(i, 61);
                            current_set = 4;
                            length++;
                            i += 3;
                        }
                        else {
                            /* Shift D */
                            this.insert(i, 61);
                            length++;
                        }
                        break;
                    case 5:
                        if (i + 3 < this.set.length &&
                            this.set[i + 1] == 5 &&
                            this.set[i + 2] == 5 &&
                            this.set[i + 3] == 5) {
                            /* Lock In E */
                            this.insert(i, 62);
                            this.insert(i, 62);
                            current_set = 5;
                            length++;
                            i += 3;
                        }
                        else {
                            /* Shift E */
                            this.insert(i, 62);
                            length++;
                        }
                        break;
                    default:
                        throw new IllegalArgumentException('Unexpected set ' + this.set[i] + ' at index ' + i + '.');
                }
                i++;
            }
            i++;
        } while (i < this.set.length);
        /* Number compression has not been forgotten! It's handled below. */
        i = 0;
        do {
            if (this.set[i] == 6) {
                /* Number compression */
                let /*int*/ value = 0;
                for (j = 0; j < 9; j++) {
                    value *= 10;
                    value += this.character[i + j] - '0'.charCodeAt(0);
                }
                this.character[i] = 31; /* NS */
                this.character[i + 1] = (value & 0x3f000000) >> 24;
                this.character[i + 2] = (value & 0xfc0000) >> 18;
                this.character[i + 3] = (value & 0x3f000) >> 12;
                this.character[i + 4] = (value & 0xfc0) >> 6;
                this.character[i + 5] = value & 0x3f;
                i += 6;
                for (j = i; j < 140; j++) {
                    this.set[j] = this.set[j + 3];
                    this.character[j] = this.character[j + 3];
                }
                length -= 3;
            }
            else {
                i++;
            }
        } while (i < this.set.length);
        /* Inject ECI codes to beginning of data, according to Table 3 */
        if (this.eciMode != 3) {
            this.insert(0, 27); // ECI
            if (this.eciMode >= 0 && this.eciMode <= 31) {
                this.insert(1, this.eciMode & 0x1f);
                length += 2;
            }
            if (this.eciMode >= 32 && this.eciMode <= 1023) {
                this.insert(1, 0x20 + (this.eciMode >> 6));
                this.insert(2, this.eciMode & 0x3f);
                length += 3;
            }
            if (this.eciMode >= 1024 && this.eciMode <= 32767) {
                this.insert(1, 0x30 + (this.eciMode >> 12));
                this.insert(2, (this.eciMode >> 6) & 0x3f);
                this.insert(3, this.eciMode & 0x3f);
                length += 4;
            }
            if (this.eciMode >= 32768 && this.eciMode <= 999999) {
                this.insert(1, 0x38 + (this.eciMode >> 18));
                this.insert(2, (this.eciMode >> 12) & 0x3f);
                this.insert(3, (this.eciMode >> 6) & 0x3f);
                this.insert(4, this.eciMode & 0x3f);
                length += 5;
            }
        }
        /* Make sure we haven't exceeded the maximum data length. */
        let /*int*/ maxLength;
        if (this.mode == 2 || this.mode == 3) {
            maxLength = 84;
        }
        else if (this.mode == 4 || this.mode == 6) {
            maxLength = 93;
        }
        else if (this.mode == 5) {
            maxLength = 77;
        }
        else {
            maxLength = 0; // impossible
        }
        if (length > maxLength) {
            throw new IllegalArgumentException('Input data too long');
        }
    }
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
    bestSurroundingSet(
    /*int*/ index, 
    /*int*/ length, 
    /*int...*/ ...valid) {
        const /*int*/ option1 = this.set[index - 1];
        if (index + 1 < length) {
            // we have two options to check
            const /*int*/ option2 = this.set[index + 1];
            if (valid.includes(option1) && valid.includes(option2)) {
                return Math.min(option1, option2);
            }
            else if (valid.includes(option1)) {
                return option1;
            }
            else if (valid.includes(option2)) {
                return option2;
            }
            else {
                return valid[0];
            }
        }
        else {
            // we only have one option to check
            if (valid.includes(option1)) {
                return option1;
            }
            else {
                return valid[0];
            }
        }
    }
    /**
     * Moves everything up so that the specified shift or latch character can be inserted.
     *
     * @param position the position beyond which everything needs to be shifted
     * @param c the latch or shift character to insert at the specified position, after everything has been shifted
     */
    insert(/*int*/ position, /*int*/ c) {
        for (let /*int*/ i = 143; i > position; i--) {
            this.set[i] = this.set[i - 1];
            this.character[i] = this.character[i - 1];
        }
        this.character[position] = c;
    }
    /**
     * Returns the error correction codewords for the specified data codewords.
     *
     * @param codewords the codewords that we need error correction codewords for
     * @param ecclen the number of error correction codewords needed
     * @return the error correction codewords for the specified data codewords
     */
    getErrorCorrection(
    /*int[]*/ codewords, 
    /*int*/ ecclen) {
        const rs = new ReedSolomonEncoder(GenericGF.MAXICODE_FIELD_64);
        const numDataBytes = codewords.length;
        const toEncode = new Int32Array(numDataBytes + ecclen); // int[numDataBytes + numEcBytesInBlock]
        for (let i = 0; i < numDataBytes; i++) {
            toEncode[i] = codewords[i] & 0xff;
        }
        const start = codewords.length;
        //rs.init_gf(0x43);
        //rs.init_code(ecclen, 1);
        //rs.encode(codewords.length, codewords);
        rs.encode(toEncode, ecclen);
        /*int[] results = new int[ecclen];
            for (int i = 0; i < ecclen; i++) {
                results[i] = rs.getResult(results.length - 1 - i);
            }*/
        return Array.from(toEncode.slice(start)); //results;
    }
    /*protected int[]*/ getCodewords() {
        return this.codewords;
    }
    /*protected static String*/ bin2pat(/*CharSequence*/ bin) {
        let /*int*/ len = 0;
        let /*boolean*/ black = true;
        const pattern = new StringBuilder();
        for (let /*int*/ i = 0; i < bin.length; i++) {
            if (black) {
                if (bin.charAt(i) == '1') {
                    len++;
                }
                else {
                    black = false;
                    pattern.append(/*(char)*/ len + '0');
                    len = 1;
                }
            }
            else {
                if (bin.charAt(i) == '0') {
                    len++;
                }
                else {
                    black = true;
                    pattern.append(/*(char)*/ len + '0');
                    len = 1;
                }
            }
        }
        pattern.append(/*(char)*/ len + '0');
        return pattern.toString();
    }
    /**
     * Chooses the ECI mode most suitable for the content of this symbol.
     */
    /*protected void*/ eciProcess() {
        /*EciMode eci = EciMode.of(content, "ISO8859_1",    3)
                                 .or(content, "ISO8859_2",    4)
                                 .or(content, "ISO8859_3",    5)
                                 .or(content, "ISO8859_4",    6)
                                 .or(content, "ISO8859_5",    7)
                                 .or(content, "ISO8859_6",    8)
                                 .or(content, "ISO8859_7",    9)
                                 .or(content, "ISO8859_8",    10)
                                 .or(content, "ISO8859_9",    11)
                                 .or(content, "ISO8859_10",   12)
                                 .or(content, "ISO8859_11",   13)
                                 .or(content, "ISO8859_13",   15)
                                 .or(content, "ISO8859_14",   16)
                                 .or(content, "ISO8859_15",   17)
                                 .or(content, "ISO8859_16",   18)
                                 .or(content, "Windows_1250", 21)
                                 .or(content, "Windows_1251", 22)
                                 .or(content, "Windows_1252", 23)
                                 .or(content, "Windows_1256", 24)
                                 .or(content, "SJIS",         20)
                                 .or(content, "UTF8",         26);*/
        //if (EciMode.NONE.equals(eci)) {
        //    throw new OkapiException("Unable to determine ECI mode.");
        //}
        this.eciMode = 3;
        this.inputData = this.toBytes(this.content, Charset.forName('ISO-8859-1'));
        //infoLine("ECI Mode: " + eci.mode);
        //infoLine("ECI Charset: " + eci.charset.name());
    }
    toBytes(
    /*String*/ s, charset, 
    /*int...*/ ...suffix) {
        //if (!charset.canEncode(s)) {
        //    return null;
        //}
        const /*byte[]*/ fnc1 = StringUtils.getBytes(FNC1_STRING, charset);
        const /*byte[]*/ fnc2 = StringUtils.getBytes(FNC2_STRING, charset);
        const /*byte[]*/ fnc3 = StringUtils.getBytes(FNC3_STRING, charset);
        const /*byte[]*/ fnc4 = StringUtils.getBytes(FNC4_STRING, charset);
        const /*byte[]*/ bytes = StringUtils.getBytes(s, charset);
        let /*int[]*/ data = new Array(bytes.length + suffix.length); //new int[bytes.length + suffix.length];
        let /*int*/ i = 0, j = 0;
        for (; i < bytes.length; i++, j++) {
            if (Arrays.containsAt(bytes, fnc1, i)) {
                data[j] = FNC1;
                i += fnc1.length - 1;
            }
            else if (Arrays.containsAt(bytes, fnc2, i)) {
                data[j] = FNC2;
                i += fnc1.length - 1;
            }
            else if (Arrays.containsAt(bytes, fnc3, i)) {
                data[j] = FNC3;
                i += fnc1.length - 1;
            }
            else if (Arrays.containsAt(bytes, fnc4, i)) {
                data[j] = FNC4;
                i += fnc1.length - 1;
            }
            else {
                data[j] = bytes[i] & 0xff;
            }
        }
        let k = 0;
        for (; k < suffix.length; k++) {
            data[j + k] = suffix[k];
        }
        if (j + k < i) {
            data = Array.from(Arrays.copyOf(Int32Array.from(data), j + k));
        }
        return data;
    }
}
//# sourceMappingURL=MaxiCode.js.map