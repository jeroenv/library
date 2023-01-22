/*
 * Copyright 2010 ZXing authors
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

import BarcodeFormat from '../BarcodeFormat';
import EncodeHintType from '../EncodeHintType';
import OneDimensionalCodeWriter from './OneDimensionalCodeWriter';
import Boolean from '../util/Boolean';
import IllegalArgumentException from '../IllegalArgumentException';
import { char } from 'src/customTypings';
import Integer from '../util/Integer';
import Code128Reader from './Code128Reader';

// Results of minimal lookahead for code C
enum CType {
  UNCODABLE,
  ONE_DIGIT,
  TWO_DIGITS,
  FNC_1,
}

/**
 * This object renders a CODE128 code as a {@link BitMatrix}.
 *
 * @author erik.barbara@gmail.com (Erik Barbara)
 */
export default /*public final*/ class Code128Writer extends OneDimensionalCodeWriter {
  static /*final int*/ CODE_START_A = 103;
  static /*final int*/ CODE_START_B = 104;
  static /*final int*/ CODE_START_C = 105;
  static /*final int*/ CODE_CODE_A = 101;
  static /*final int*/ CODE_CODE_B = 100;
  static /*final int*/ CODE_CODE_C = 99;
  static /*final int*/ CODE_STOP = 106;

  // Dummy characters used to specify control characters in input
  static /*final char*/ ESCAPE_FNC_1 = '\u00f1';
  static /*final char*/ ESCAPE_FNC_2 = '\u00f2';
  static /*final char*/ ESCAPE_FNC_3 = '\u00f3';
  static /*final char*/ ESCAPE_FNC_4 = '\u00f4';

  static /*final int*/ CODE_FNC_1 = 102; // Code A, Code B, Code C
  static /*final int*/ CODE_FNC_2 = 97; // Code A, Code B
  static /*final int*/ CODE_FNC_3 = 96; // Code A, Code B
  static /*final int*/ CODE_FNC_4_A = 101; // Code A
  static /*final int*/ CODE_FNC_4_B = 100; // Code B

  protected getSupportedWriteFormats() {
    return [BarcodeFormat.CODE_128];
  }

  encodeContents(
    contents: string,
    hints: Map<EncodeHintType, unknown>
  ): boolean[] {
    const /*int*/ forcedCodeSet = Code128Writer.check(contents, hints);

    const hasCompactionHint =
      hints != null &&
      hints.has(EncodeHintType.CODE128_COMPACT) &&
      Boolean.parseBoolean(
        hints.get(EncodeHintType.CODE128_COMPACT).toString()
      );

    return hasCompactionHint
      ? new MinimalEncoder().encode(contents)
      : Code128Writer.encodeFast(contents, forcedCodeSet);
  }

  static /*int*/ check(
    contents: string,
    hints: Map<EncodeHintType, unknown>
  ): number {
    const /*int*/ length = contents.length;
    // Check length
    if (length < 1 || length > 80) {
      throw new IllegalArgumentException(
        'Contents length should be between 1 and 80 characters, but got ' +
          length
      );
    }

    // Check for forced code set hint.
    let /*int*/ forcedCodeSet = -1;
    if (hints != null && hints.has(EncodeHintType.FORCE_CODE_SET)) {
      const codeSetHint = hints.get(EncodeHintType.FORCE_CODE_SET).toString();
      switch (codeSetHint) {
        case 'A':
          forcedCodeSet = Code128Writer.CODE_CODE_A;
          break;
        case 'B':
          forcedCodeSet = Code128Writer.CODE_CODE_B;
          break;
        case 'C':
          forcedCodeSet = Code128Writer.CODE_CODE_C;
          break;
        default:
          throw new IllegalArgumentException(
            'Unsupported code set hint: ' + codeSetHint
          );
      }
    }

    // Check content
    for (let i = 0; i < length; i++) {
      const c: char = contents.charAt(i).charCodeAt(0);
      // check for non ascii characters that are not special GS1 characters
      switch (c) {
        // special function characters
        case Code128Writer.ESCAPE_FNC_1.charCodeAt(0):
        case Code128Writer.ESCAPE_FNC_2.charCodeAt(0):
        case Code128Writer.ESCAPE_FNC_3.charCodeAt(0):
        case Code128Writer.ESCAPE_FNC_4.charCodeAt(0):
          break;
        // non ascii characters
        default:
          if (c > 127) {
            // no full Latin-1 character set available at the moment
            // shift and manual code change are not supported
            throw new IllegalArgumentException(
              'Bad character in input: ASCII value=' + /*(int)*/ c
            );
          }
      }
      // check characters for compatibility with forced code set
      switch (forcedCodeSet) {
        case Code128Writer.CODE_CODE_A:
          // allows no ascii above 95 (no lower caps, no special symbols)
          if (c > 95 && c <= 127) {
            throw new IllegalArgumentException(
              'Bad character in input for forced code set A: ASCII value=' +
                /*(int)*/ c
            );
          }
          break;
        case Code128Writer.CODE_CODE_B:
          // allows no ascii below 32 (terminal symbols)
          if (c <= 32) {
            throw new IllegalArgumentException(
              'Bad character in input for forced code set B: ASCII value=' +
                /*(int)*/ c
            );
          }
          break;
        case Code128Writer.CODE_CODE_C:
          // allows only numbers and no FNC 2/3/4
          if (
            c < 48 ||
            (c > 57 && c <= 127) ||
            c == Code128Writer.ESCAPE_FNC_2.charCodeAt(0) ||
            c == Code128Writer.ESCAPE_FNC_3.charCodeAt(0) ||
            c == Code128Writer.ESCAPE_FNC_4.charCodeAt(0)
          ) {
            throw new IllegalArgumentException(
              'Bad character in input for forced code set C: ASCII value=' +
                /*(int)*/ c
            );
          }
          break;
      }
    }
    return forcedCodeSet;
  }

  private static encodeFast(
    contents: string,
    /*int*/ forcedCodeSet: number
  ): boolean[] {
    const /*int*/ length = contents.length;

    const /*Collection<int[]>*/ patterns = new Array<number[]>(); // temporary storage for patterns
    let /*int*/ checkSum = 0;
    let /*int*/ checkWeight = 1;
    let /*int*/ codeSet = 0; // selected code (CODE_CODE_B or CODE_CODE_C)
    let /*int*/ position = 0; // position in contents

    while (position < length) {
      //Select code to use
      let /*int*/ newCodeSet;
      if (forcedCodeSet == -1) {
        newCodeSet = this.chooseCode(contents, position, codeSet);
      } else {
        newCodeSet = forcedCodeSet;
      }

      //Get the pattern index
      let /*int*/ patternIndex;
      if (newCodeSet == codeSet) {
        // Encode the current character
        // First handle escapes
        switch (contents.charAt(position)) {
          case Code128Writer.ESCAPE_FNC_1:
            patternIndex = Code128Writer.CODE_FNC_1;
            break;
          case Code128Writer.ESCAPE_FNC_2:
            patternIndex = Code128Writer.CODE_FNC_2;
            break;
          case Code128Writer.ESCAPE_FNC_3:
            patternIndex = Code128Writer.CODE_FNC_3;
            break;
          case Code128Writer.ESCAPE_FNC_4:
            if (codeSet == Code128Writer.CODE_CODE_A) {
              patternIndex = Code128Writer.CODE_FNC_4_A;
            } else {
              patternIndex = Code128Writer.CODE_FNC_4_B;
            }
            break;
          default:
            // Then handle normal characters otherwise
            switch (codeSet) {
              case Code128Writer.CODE_CODE_A:
                patternIndex =
                  contents.charAt(position).charCodeAt(0) - ' '.charCodeAt(0);
                if (patternIndex < 0) {
                  // everything below a space character comes behind the underscore in the code patterns table
                  patternIndex += '`';
                }
                break;
              case Code128Writer.CODE_CODE_B:
                patternIndex =
                  contents.charAt(position).charCodeAt(0) - ' '.charCodeAt(0);
                break;
              default: // Also incremented below
                // CODE_CODE_C
                if (position + 1 == length) {
                  // this is the last character, but the encoding is C, which always encodes two characers
                  throw new IllegalArgumentException(
                    'Bad number of characters for digit only encoding.'
                  );
                }
                patternIndex = Integer.parseInt(
                  contents.substring(position, position + 2)
                );
                position++;
                break;
            }
        }
        position++;
      } else {
        // Should we change the current code?
        // Do we have a code set?
        if (codeSet == 0) {
          // No, we don't have a code set
          switch (newCodeSet) {
            case Code128Writer.CODE_CODE_A:
              patternIndex = Code128Writer.CODE_START_A;
              break;
            case Code128Writer.CODE_CODE_B:
              patternIndex = Code128Writer.CODE_START_B;
              break;
            default:
              patternIndex = Code128Writer.CODE_START_C;
              break;
          }
        } else {
          // Yes, we have a code set
          patternIndex = newCodeSet;
        }
        codeSet = newCodeSet;
      }

      // Get the pattern
      patterns.push([...Code128Reader.CODE_PATTERNS[patternIndex]]);

      // Compute checksum
      checkSum += patternIndex * checkWeight;
      if (position != 0) {
        checkWeight++;
      }
    }
    return this.produceResult(patterns, checkSum);
  }

  static produceResult(
    /*Collection<int[]>*/ patterns: Array<number[]>,
    /*int*/ checkSum: number
  ): boolean[] {
    // Compute and append checksum
    checkSum %= 103;
    patterns.push([...Code128Reader.CODE_PATTERNS[checkSum]]);

    // Append stop code
    patterns.push([...Code128Reader.CODE_PATTERNS[Code128Writer.CODE_STOP]]);

    // Compute code width
    let codeWidth = 0;
    for (let /*int[]*/ pattern of patterns) {
      for (let width of pattern) {
        codeWidth += width;
      }
    }

    // Compute result
    const result = new Array<boolean>(codeWidth);
    let pos = 0;
    for (let pattern of patterns) {
      pos += this.appendPattern(result, pos, pattern, true);
    }

    return result;
  }

  private static findCType(
    /*CharSequence*/ value: string,
    /*int*/ start: number
  ): CType {
    const /*int*/ last = value.length;
    if (start >= last) {
      return CType.UNCODABLE;
    }
    let c = value.charAt(start).charCodeAt(0);
    if (c == Code128Writer.ESCAPE_FNC_1.charCodeAt(0)) {
      return CType.FNC_1;
    }
    if (c < '0'.charCodeAt(0) || c > '9'.charCodeAt(0)) {
      return CType.UNCODABLE;
    }
    if (start + 1 >= last) {
      return CType.ONE_DIGIT;
    }
    c = value.charAt(start + 1).charCodeAt(0);
    if (c < '0'.charCodeAt(0) || c > '9'.charCodeAt(0)) {
      return CType.ONE_DIGIT;
    }
    return CType.TWO_DIGITS;
  }

  private static /*int*/ chooseCode(
    /*CharSequence*/ value: string,
    /*int*/ start: number,
    /*int*/ oldCode: number
  ) {
    let lookahead = this.findCType(value, start);
    if (lookahead == CType.ONE_DIGIT) {
      if (oldCode == Code128Writer.CODE_CODE_A) {
        return Code128Writer.CODE_CODE_A;
      }
      return Code128Writer.CODE_CODE_B;
    }
    if (lookahead == CType.UNCODABLE) {
      if (start < value.length) {
        const c = value.charAt(start).charCodeAt(0);
        if (
          c < ' '.charCodeAt(0) ||
          (oldCode == Code128Writer.CODE_CODE_A &&
            (c < '`'.charCodeAt(0) ||
              (c >= Code128Writer.ESCAPE_FNC_1.charCodeAt(0) &&
                c <= Code128Writer.ESCAPE_FNC_4.charCodeAt(0))))
        ) {
          // can continue in code A, encodes ASCII 0 to 95 or FNC1 to FNC4
          return Code128Writer.CODE_CODE_A;
        }
      }
      return Code128Writer.CODE_CODE_B; // no choice
    }
    if (oldCode == Code128Writer.CODE_CODE_A && lookahead == CType.FNC_1) {
      return Code128Writer.CODE_CODE_A;
    }
    if (oldCode == Code128Writer.CODE_CODE_C) {
      // can continue in code C
      return Code128Writer.CODE_CODE_C;
    }
    if (oldCode == Code128Writer.CODE_CODE_B) {
      if (lookahead == CType.FNC_1) {
        return Code128Writer.CODE_CODE_B; // can continue in code B
      }
      // Seen two consecutive digits, see what follows
      lookahead = this.findCType(value, start + 2);
      if (lookahead == CType.UNCODABLE || lookahead == CType.ONE_DIGIT) {
        return Code128Writer.CODE_CODE_B; // not worth switching now
      }
      if (lookahead == CType.FNC_1) {
        // two digits, then FNC_1...
        lookahead = this.findCType(value, start + 3);
        if (lookahead == CType.TWO_DIGITS) {
          // then two more digits, switch
          return Code128Writer.CODE_CODE_C;
        } else {
          return Code128Writer.CODE_CODE_B; // otherwise not worth switching
        }
      }
      // At this point, there are at least 4 consecutive digits.
      // Look ahead to choose whether to switch now or on the next round.
      let index = start + 4;
      while ((lookahead = this.findCType(value, index)) == CType.TWO_DIGITS) {
        index += 2;
      }
      if (lookahead == CType.ONE_DIGIT) {
        // odd number of digits, switch later
        return Code128Writer.CODE_CODE_B;
      }
      return Code128Writer.CODE_CODE_C; // even number of digits, switch now
    }
    // Here oldCode == 0, which means we are choosing the initial code
    if (lookahead == CType.FNC_1) {
      // ignore FNC_1
      lookahead = this.findCType(value, start + 1);
    }
    if (lookahead == CType.TWO_DIGITS) {
      // at least two digits, start in code C
      return Code128Writer.CODE_CODE_C;
    }
    return Code128Writer.CODE_CODE_B;
  }
}

/*private*/ enum Charset {
  A,
  B,
  C,
  NONE,
}
/*private*/ enum Latch {
  A,
  B,
  C,
  SHIFT,
  NONE,
}

const getOrdinal = (enm: Object, value: unknown): number => {
  return Object.keys(enm).indexOf(value.toString());
};

/**
 * Encodes minimally using Divide-And-Conquer with Memoization
 **/
/*private static final*/ class MinimalEncoder {
  static /*final*/ A =
    ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_\u0000\u0001\u0002' +
    '\u0003\u0004\u0005\u0006\u0007\u0008\u0009\n\u000B\u000C\r\u000E\u000F\u0010\u0011' +
    '\u0012\u0013\u0014\u0015\u0016\u0017\u0018\u0019\u001A\u001B\u001C\u001D\u001E\u001F' +
    '\u00FF';
  static /*final*/ B =
    ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqr' +
    'stuvwxyz{|}~\u007F\u00FF';

  private static /*final int*/ CODE_SHIFT = 98;

  private /*int[][]*/ memoizedCost: Array<number[]>;
  private minPath: Array<Latch[]>;

  encode(contents: string): boolean[] {
    this.memoizedCost = new Array<number[]>(4); //new int[4][contents.length];
    for (let i = 0; i < 4; i++) {
      this.memoizedCost[i] = new Array<number>(contents.length);
    }

    this.minPath = new Array<Latch[]>(4); //new Latch[4][contents.length];
    for (let i = 0; i < 4; i++) {
      this.minPath[i] = new Array<Latch>(contents.length);
    }

    this.encodeContents(contents, Charset.NONE, 0);

    const /*Collection<int[]>*/ patterns = new Array<number[]>();
    const /*int[]*/ checkSum = [0]; //new int[] {0};
    const /*int[]*/ checkWeight = [1]; //new int[] {1};
    const /*int*/ length = contents.length;
    let charset = Charset.NONE;
    for (let i = 0; i < length; i++) {
      const latch = this.minPath[getOrdinal(Charset, charset)][i]; //charset.ordinal()
      switch (latch) {
        case Latch.A:
          charset = Charset.A;
          MinimalEncoder.addPattern(
            patterns,
            i == 0 ? Code128Writer.CODE_START_A : Code128Writer.CODE_CODE_A,
            checkSum,
            checkWeight,
            i
          );
          break;
        case Latch.B:
          charset = Charset.B;
          MinimalEncoder.addPattern(
            patterns,
            i == 0 ? Code128Writer.CODE_START_B : Code128Writer.CODE_CODE_B,
            checkSum,
            checkWeight,
            i
          );
          break;
        case Latch.C:
          charset = Charset.C;
          MinimalEncoder.addPattern(
            patterns,
            i == 0 ? Code128Writer.CODE_START_C : Code128Writer.CODE_CODE_C,
            checkSum,
            checkWeight,
            i
          );
          break;
        case Latch.SHIFT:
          MinimalEncoder.addPattern(
            patterns,
            MinimalEncoder.CODE_SHIFT,
            checkSum,
            checkWeight,
            i
          );
          break;
      }
      if (charset == Charset.C) {
        if (
          contents.charAt(i).charCodeAt(0) ==
          Code128Writer.ESCAPE_FNC_1.charCodeAt(0)
        ) {
          MinimalEncoder.addPattern(
            patterns,
            Code128Writer.CODE_FNC_1,
            checkSum,
            checkWeight,
            i
          );
        } else {
          MinimalEncoder.addPattern(
            patterns,
            Integer.parseInt(contents.substring(i, i + 2)),
            checkSum,
            checkWeight,
            i
          );

          if (!(i + 1 < length)) {
            //assert i + 1 < length; //the algorithm never leads to a single trailing digit in character set C
            throw new Error();
          }

          if (i + 1 < length) {
            i++;
          }
        }
      } else {
        // charset A or B
        let patternIndex;
        switch (contents.charAt(i).charCodeAt(0)) {
          case Code128Writer.ESCAPE_FNC_1.charCodeAt(0):
            patternIndex = Code128Writer.CODE_FNC_1;
            break;
          case Code128Writer.ESCAPE_FNC_2.charCodeAt(0):
            patternIndex = Code128Writer.CODE_FNC_2;
            break;
          case Code128Writer.ESCAPE_FNC_3.charCodeAt(0):
            patternIndex = Code128Writer.CODE_FNC_3;
            break;
          case Code128Writer.ESCAPE_FNC_4.charCodeAt(0):
            if (
              (charset == Charset.A && latch != Latch.SHIFT) ||
              (charset == Charset.B && latch == Latch.SHIFT)
            ) {
              patternIndex = Code128Writer.CODE_FNC_4_A;
            } else {
              patternIndex = Code128Writer.CODE_FNC_4_B;
            }
            break;
          default:
            patternIndex = contents.charAt(i).charCodeAt(0) - ' '.charCodeAt(0);
        }
        if (
          ((charset == Charset.A && latch != Latch.SHIFT) ||
            (charset == Charset.B && latch == Latch.SHIFT)) &&
          patternIndex < 0
        ) {
          patternIndex += '`';
        }
        MinimalEncoder.addPattern(
          patterns,
          patternIndex,
          checkSum,
          checkWeight,
          i
        );
      }
    }
    this.memoizedCost = null;
    this.minPath = null;
    return Code128Writer.produceResult(patterns, checkSum[0]);
  }

  private static /*void*/ addPattern(
    /*Collection<int[]>*/ patterns: Array<number[]>,
    /*int*/ patternIndex: number,
    /*int[]*/ checkSum: number[],
    /*int[]*/ checkWeight: number[],
    /*int*/ position: number
  ) {
    patterns.push([...Code128Reader.CODE_PATTERNS[patternIndex]]);
    if (position != 0) {
      checkWeight[0]++;
    }
    checkSum[0] += patternIndex * checkWeight[0];
  }

  private /*static boolean*/ isDigit(c: char) {
    return c >= '0'.charCodeAt(0) && c <= '9'.charCodeAt(0);
  }

  private /*boolean*/ canEncode(
    /*CharSequence*/ contents: string,
    /*Charset*/ charset: Charset,
    /*int*/ position: number
  ) {
    const c = contents.charAt(position).charCodeAt(0);
    switch (charset) {
      case Charset.A:
        return (
          c == Code128Writer.ESCAPE_FNC_1.charCodeAt(0) ||
          c == Code128Writer.ESCAPE_FNC_2.charCodeAt(0) ||
          c == Code128Writer.ESCAPE_FNC_3.charCodeAt(0) ||
          c == Code128Writer.ESCAPE_FNC_4.charCodeAt(0) ||
          getOrdinal(Charset, c) >= 0
        ); //A.indexOf(c) >= 0
      case Charset.B:
        return (
          c == Code128Writer.ESCAPE_FNC_1.charCodeAt(0) ||
          c == Code128Writer.ESCAPE_FNC_2.charCodeAt(0) ||
          c == Code128Writer.ESCAPE_FNC_3.charCodeAt(0) ||
          c == Code128Writer.ESCAPE_FNC_4.charCodeAt(0) ||
          getOrdinal(Charset, c) >= 0
        ); //B.indexOf(c) >= 0;
      case Charset.C:
        return (
          c == Code128Writer.ESCAPE_FNC_1.charCodeAt(0) ||
          (position + 1 < contents.length &&
            this.isDigit(c) &&
            this.isDigit(contents.charAt(position + 1).charCodeAt(0)))
        );
      default:
        return false;
    }
  }

  /**
   * Encode the string starting at position position starting with the character set charset
   **/
  private /*int*/ encodeContents(
    /*CharSequence*/ contents: string,
    charset: Charset,
    /*int*/ position: number
  ): number {
    if (position > contents.length) {
      //assert position < contents.length();
      throw new Error();
    }

    const /*int*/ mCost =
        this.memoizedCost[getOrdinal(Charset, charset)][position]; //charset.ordinal()
    if (mCost > 0) {
      return mCost;
    }

    let /*int*/ minCost = Integer.MAX_VALUE;
    let minLatch = Latch.NONE;
    const atEnd = position + 1 >= contents.length;

    const sets = [Charset.A, Charset.B];
    for (let i = 0; i <= 1; i++) {
      if (this.canEncode(contents, sets[i], position)) {
        let cost = 1;
        let latch = Latch.NONE;
        if (charset != sets[i]) {
          cost++;
          latch = sets[i].toString() as unknown as Latch;
        }
        if (!atEnd) {
          cost += this.encodeContents(contents, sets[i], position + 1);
        }
        if (cost < minCost) {
          minCost = cost;
          minLatch = latch;
        }
        cost = 1;
        if (charset == sets[(i + 1) % 2]) {
          cost++;
          latch = Latch.SHIFT;
          if (!atEnd) {
            cost += this.encodeContents(contents, charset, position + 1);
          }
          if (cost < minCost) {
            minCost = cost;
            minLatch = latch;
          }
        }
      }
    }
    if (this.canEncode(contents, Charset.C, position)) {
      let /*int*/ cost = 1;
      let latch = Latch.NONE;
      if (charset != Charset.C) {
        cost++;
        latch = Latch.C;
      }
      let /*int*/ advance =
          contents.charAt(position).charCodeAt(0) ==
          Code128Writer.ESCAPE_FNC_1.charCodeAt(0)
            ? 1
            : 2;
      if (position + advance < contents.length) {
        cost += this.encodeContents(contents, Charset.C, position + advance);
      }
      if (cost < minCost) {
        minCost = cost;
        minLatch = latch;
      }
    }
    if (minCost == Integer.MAX_VALUE) {
      throw new IllegalArgumentException(
        'Bad character in input: ASCII value=' +
          /*(int)*/ contents.charAt(position)
      );
    }
    this.memoizedCost[getOrdinal(Charset, charset)][position] = minCost;
    this.minPath[getOrdinal(Charset, charset)][position] = minLatch;
    return minCost;
  }
}
