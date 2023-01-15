/*
 * Copyright 2006 Jeremias Maerki in part, and ZXing Authors in part
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import CharacterSetECI from '../../common/CharacterSetECI';
import ECIInput from '../../common/ECIInput';
import { MinimalECIInput } from '../../common/MinimalECIInput';
import Charset from '../../util/Charset';
import StringBuilder from '../../util/StringBuilder';
import WriterException from '../../WriterException';
import Arrays from '../../util/Arrays';
import StandardCharsets from '../../util/StandardCharsets';
import Compaction from './Compaction';
import { char } from '../../../customTypings';
import { CharsetEncoder } from '../../common/ECIEncoderSet';
import StringUtils from '../../common/StringUtils';

/*
 * This file has been modified from its original form in Barcode4J.
 */

/**
 * PDF417 high-level encoder following the algorithm described in ISO/IEC 15438:2001(E) in
 * annex P.
 */
export default /*final*/ class PDF417HighLevelEncoder {
  /**
   * code for Text compaction
   */
  private static /*final int*/ TEXT_COMPACTION = 0;

  /**
   * code for Byte compaction
   */
  private static /*final int*/ BYTE_COMPACTION = 1;

  /**
   * code for Numeric compaction
   */
  private static /*final int*/ NUMERIC_COMPACTION = 2;

  /**
   * Text compaction submode Alpha
   */
  private static /*final int*/ SUBMODE_ALPHA = 0;

  /**
   * Text compaction submode Lower
   */
  private static /*final int*/ SUBMODE_LOWER = 1;

  /**
   * Text compaction submode Mixed
   */
  private static /*final int*/ SUBMODE_MIXED = 2;

  /**
   * Text compaction submode Punctuation
   */
  private static /*final int*/ SUBMODE_PUNCTUATION = 3;

  /**
   * mode latch to Text Compaction mode
   */
  private static /*final int*/ LATCH_TO_TEXT = 900;

  /**
   * mode latch to Byte Compaction mode (number of characters NOT a multiple of 6)
   */
  private static /*final int*/ LATCH_TO_BYTE_PADDED = 901;

  /**
   * mode latch to Numeric Compaction mode
   */
  private static /*final int*/ LATCH_TO_NUMERIC = 902;

  /**
   * mode shift to Byte Compaction mode
   */
  private static /*final int*/ SHIFT_TO_BYTE = 913;

  /**
   * mode latch to Byte Compaction mode (number of characters a multiple of 6)
   */
  private static /*final int*/ LATCH_TO_BYTE = 924;

  /**
   * identifier for a user defined Extended Channel Interpretation (ECI)
   */
  private static /*final int*/ ECI_USER_DEFINED = 925;

  /**
   * identifier for a general purpose ECO format
   */
  private static /*final int*/ ECI_GENERAL_PURPOSE = 926;

  /**
   * identifier for an ECI of a character set of code page
   */
  private static /*final int*/ ECI_CHARSET = 927;

  /**
   * Raw code table for text compaction Mixed sub-mode
   */
  private static /*final byte[]*/ TEXT_MIXED_RAW = new Uint8Array([
    48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 38, 13, 9, 44, 58, 35, 45, 46, 36,
    47, 43, 37, 42, 61, 94, 0, 32, 0, 0, 0,
  ]);

  /**
   * Raw code table for text compaction: Punctuation sub-mode
   */
  private static /*final byte[]*/ TEXT_PUNCTUATION_RAW = new Uint8Array([
    59, 60, 62, 64, 91, 92, 93, 95, 96, 126, 33, 13, 9, 44, 58, 10, 45, 46, 36,
    47, 34, 124, 42, 40, 41, 63, 123, 125, 39, 0,
  ]);

  private static /*final byte[]*/ MIXED = new Uint8Array(128);
  private static /*final byte[]*/ PUNCTUATION = new Uint8Array(128);

  private static /*final Charset*/ DEFAULT_ENCODING =
    StandardCharsets.ISO_8859_1;

  static {
    //Construct inverse lookups
    Arrays.fill(PDF417HighLevelEncoder.MIXED, /*(byte)*/ -1);
    for (let i = 0; i < PDF417HighLevelEncoder.TEXT_MIXED_RAW.length; i++) {
      const b = PDF417HighLevelEncoder.TEXT_MIXED_RAW[i];
      if (b > 0) {
        PDF417HighLevelEncoder.MIXED[b] = /*(byte)*/ i;
      }
    }
    Arrays.fill(PDF417HighLevelEncoder.PUNCTUATION, /*(byte)*/ -1);
    for (
      let i = 0;
      i < PDF417HighLevelEncoder.TEXT_PUNCTUATION_RAW.length;
      i++
    ) {
      const b = PDF417HighLevelEncoder.TEXT_PUNCTUATION_RAW[i];
      if (b > 0) {
        PDF417HighLevelEncoder.PUNCTUATION[b] = /*(byte)*/ i;
      }
    }
  }

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
  static /*String*/ encodeHighLevel(
    msg: string,
    compaction: Compaction,
    encoding: CharacterSetECI,
    autoECI: boolean
  ) /*throws WriterException*/ {
    if (!msg) {
      //msg.isEmpty()
      throw new WriterException('Empty message not allowed');
    }

    if (encoding == null && !autoECI) {
      for (let i = 0; i < msg.length; i++) {
        if (msg.charAt(i).charCodeAt(0) > 255) {
          throw new WriterException(
            'Non-encodable character detected: ' +
              msg.charAt(i) +
              ' (Unicode: ' +
              /*(int)*/ msg.charAt(i).charCodeAt(0) +
              '). Consider specifying EncodeHintType.PDF417_AUTO_ECI and/or EncodeTypeHint.CHARACTER_SET.'
          );
        }
      }
    }
    //the codewords 0..928 are encoded as Unicode characters
    const sb = new StringBuilder();

    let input: ECIInput;
    if (autoECI) {
      input = new MinimalECIInput(msg, encoding, -1);
    } else {
      input = new NoECIInput(msg);
      if (encoding == null) {
        encoding = PDF417HighLevelEncoder.DEFAULT_ENCODING;
      } else if (!PDF417HighLevelEncoder.DEFAULT_ENCODING.equals(encoding)) {
        const eci = encoding;
        if (eci != null) {
          this.encodingECI(eci.getValue(), sb);
        }
      }
    }

    const len = input.length();
    let p = 0;
    let textSubMode = PDF417HighLevelEncoder.SUBMODE_ALPHA;

    // User selected encoding mode
    switch (compaction) {
      case Compaction.TEXT:
        this.encodeText(input, p, len, sb, textSubMode);
        break;
      case Compaction.BYTE:
        if (autoECI) {
          this.encodeMultiECIBinary(
            input,
            0,
            input.length(),
            PDF417HighLevelEncoder.TEXT_COMPACTION,
            sb
          );
        } else {
          const /*byte[]*/ msgBytes = StringUtils.getBytes(
              input.toString(),
              encoding
            );
          this.encodeBinary(
            msgBytes,
            p,
            msgBytes.length,
            PDF417HighLevelEncoder.BYTE_COMPACTION,
            sb
          );
        }
        break;
      case Compaction.NUMERIC:
        sb.append(/*(char)*/ PDF417HighLevelEncoder.LATCH_TO_NUMERIC);
        this.encodeNumeric(input, p, len, sb);
        break;
      default: //Default mode, see 4.4.2.1
        let encodingMode = PDF417HighLevelEncoder.TEXT_COMPACTION;
        while (p < len) {
          while (p < len && input.isECI(p)) {
            this.encodingECI(input.getECIValue(p), sb);
            p++;
          }
          if (p >= len) {
            break;
          }
          const /*int*/ n = this.determineConsecutiveDigitCount(input, p);
          if (n >= 13) {
            sb.append(/*(char)*/ PDF417HighLevelEncoder.LATCH_TO_NUMERIC);
            encodingMode = PDF417HighLevelEncoder.NUMERIC_COMPACTION;
            textSubMode = PDF417HighLevelEncoder.SUBMODE_ALPHA; //Reset after latch
            this.encodeNumeric(input, p, n, sb);
            p += n;
          } else {
            const /*int*/ t = this.determineConsecutiveTextCount(input, p);
            if (t >= 5 || n == len) {
              if (encodingMode != PDF417HighLevelEncoder.TEXT_COMPACTION) {
                sb.append(/*(char)*/ PDF417HighLevelEncoder.LATCH_TO_TEXT);
                encodingMode = PDF417HighLevelEncoder.TEXT_COMPACTION;
                textSubMode = PDF417HighLevelEncoder.SUBMODE_ALPHA; //start with submode alpha after latch
              }
              textSubMode = this.encodeText(input, p, t, sb, textSubMode);
              p += t;
            } else {
              let /*int*/ b = this.determineConsecutiveBinaryCount(
                  input,
                  p,
                  autoECI ? null : encoding
                );
              if (b == 0) {
                b = 1;
              }
              const /*byte[]*/ bytes = autoECI
                  ? null
                  : StringUtils.getBytes(
                      input.subSequence(p, p + b).toString(),
                      encoding
                    );
              if (
                ((bytes == null && b == 1) ||
                  (bytes != null && bytes.length == 1)) &&
                encodingMode == PDF417HighLevelEncoder.TEXT_COMPACTION
              ) {
                //Switch for one byte (instead of latch)
                if (autoECI) {
                  this.encodeMultiECIBinary(
                    input,
                    p,
                    1,
                    PDF417HighLevelEncoder.TEXT_COMPACTION,
                    sb
                  );
                } else {
                  this.encodeBinary(
                    bytes,
                    0,
                    1,
                    PDF417HighLevelEncoder.TEXT_COMPACTION,
                    sb
                  );
                }
              } else {
                //Mode latch performed by encodeBinary()
                if (autoECI) {
                  this.encodeMultiECIBinary(input, p, p + b, encodingMode, sb);
                } else {
                  this.encodeBinary(bytes, 0, bytes.length, encodingMode, sb);
                }
                encodingMode = PDF417HighLevelEncoder.BYTE_COMPACTION;
                textSubMode = PDF417HighLevelEncoder.SUBMODE_ALPHA; //Reset after latch
              }
              p += b;
            }
          }
        }
        break;
    }

    return sb.toString();
  }

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
  private static /*int*/ encodeText(
    input: ECIInput,
    /*int*/ startpos: number,
    /*int*/ count: number,
    sb: StringBuilder,
    /*int*/ initialSubmode: number
  ) /*throws WriterException*/ {
    const tmp = new StringBuilder();
    let submode = initialSubmode;
    let idx = 0;
    while (true) {
      if (input.isECI(startpos + idx)) {
        this.encodingECI(input.getECIValue(startpos + idx), sb);
        idx++;
      } else {
        const ch: char = input.charAt(startpos + idx);
        switch (submode) {
          case PDF417HighLevelEncoder.SUBMODE_ALPHA:
            if (this.isAlphaUpper(ch)) {
              if (ch === ' '.charCodeAt(0)) {
                tmp.append(/*(char)*/ 26); //space
              } else {
                tmp.append(/*(char)*/ ch - 65);
              }
            } else {
              if (this.isAlphaLower(ch)) {
                submode = PDF417HighLevelEncoder.SUBMODE_LOWER;
                tmp.append(/*(char)*/ 27); //ll
                continue;
              } else if (this.isMixed(ch)) {
                submode = PDF417HighLevelEncoder.SUBMODE_MIXED;
                tmp.append(/*(char)*/ 28); //ml
                continue;
              } else {
                tmp.append(/*(char)*/ 29); //ps
                tmp.append(/*(char)*/ PDF417HighLevelEncoder.PUNCTUATION[ch]);
                break;
              }
            }
            break;
          case PDF417HighLevelEncoder.SUBMODE_LOWER:
            if (this.isAlphaLower(ch)) {
              if (ch === ' '.charCodeAt(0)) {
                tmp.append(/*(char)*/ 26); //space
              } else {
                tmp.append(/*(char)*/ ch - 97);
              }
            } else {
              if (this.isAlphaUpper(ch)) {
                tmp.append(/*(char)*/ 27); //as
                tmp.append(/*(char)*/ ch - 65);
                //space cannot happen here, it is also in "Lower"
                break;
              } else if (this.isMixed(ch)) {
                submode = PDF417HighLevelEncoder.SUBMODE_MIXED;
                tmp.append(/*(char)*/ 28); //ml
                continue;
              } else {
                tmp.append(/*(char)*/ 29); //ps
                tmp.append(/*(char)*/ PDF417HighLevelEncoder.PUNCTUATION[ch]);
                break;
              }
            }
            break;
          case PDF417HighLevelEncoder.SUBMODE_MIXED:
            if (this.isMixed(ch)) {
              tmp.append(/*(char)*/ PDF417HighLevelEncoder.MIXED[ch]);
            } else {
              if (this.isAlphaUpper(ch)) {
                submode = PDF417HighLevelEncoder.SUBMODE_ALPHA;
                tmp.append(/*(char)*/ 28); //al
                continue;
              } else if (this.isAlphaLower(ch)) {
                submode = PDF417HighLevelEncoder.SUBMODE_LOWER;
                tmp.append(/*(char)*/ 27); //ll
                continue;
              } else {
                if (
                  startpos + idx + 1 < count &&
                  !input.isECI(startpos + idx + 1) &&
                  this.isPunctuation(input.charAt(startpos + idx + 1))
                ) {
                  submode = PDF417HighLevelEncoder.SUBMODE_PUNCTUATION;
                  tmp.append(/*(char)*/ 25); //pl
                  continue;
                }
                tmp.append(/*(char)*/ 29); //ps
                tmp.append(/*(char)*/ PDF417HighLevelEncoder.PUNCTUATION[ch]);
              }
            }
            break;
          default: //SUBMODE_PUNCTUATION
            if (this.isPunctuation(ch)) {
              tmp.append(/*(char)*/ PDF417HighLevelEncoder.PUNCTUATION[ch]);
            } else {
              submode = PDF417HighLevelEncoder.SUBMODE_ALPHA;
              tmp.append(/*(char)*/ 29); //al
              continue;
            }
        }
        idx++;
        if (idx >= count) {
          break;
        }
      }
    }
    let h: char = 0;
    const len = tmp.length();
    for (let i = 0; i < len; i++) {
      const odd = i % 2 != 0;
      if (odd) {
        h = /*(char)*/ h * 30 + tmp.charAt(i).charCodeAt(0);
        sb.append(h);
      } else {
        h = tmp.charAt(i).charCodeAt(0);
      }
    }
    if (len % 2 != 0) {
      sb.append(/*(char)*/ h * 30 + 29); //ps
    }
    return submode;
  }

  /**
   * Encode all of the message using Byte Compaction as described in ISO/IEC 15438:2001(E)
   *
   * @param input     the input
   * @param startpos  the start position within the message
   * @param count     the number of bytes to encode
   * @param startmode the mode from which this method starts
   * @param sb        receives the encoded codewords
   */
  private static /*void*/ encodeMultiECIBinary(
    input: ECIInput,
    /*int*/ startpos: number,
    /*int*/ count: number,
    /*int*/ startmode: number,
    sb: StringBuilder
  ) /*throws WriterException*/ {
    const /*final int*/ end = Math.min(startpos + count, input.length());
    let localStart = startpos;
    while (true) {
      //encode all leading ECIs and advance localStart
      while (localStart < end && input.isECI(localStart)) {
        this.encodingECI(input.getECIValue(localStart), sb);
        localStart++;
      }
      let localEnd = localStart;
      //advance end until before the next ECI
      while (localEnd < end && !input.isECI(localEnd)) {
        localEnd++;
      }

      const /*final int*/ localCount = localEnd - localStart;
      if (localCount <= 0) {
        //done
        break;
      } else {
        //encode the segment
        this.encodeBinary(
          this.subBytes(input, localStart, localEnd),
          0,
          localCount,
          localStart == startpos
            ? startmode
            : PDF417HighLevelEncoder.BYTE_COMPACTION,
          sb
        );
        localStart = localEnd;
      }
    }
  }

  static /*byte[]*/ subBytes(
    input: ECIInput,
    /*int*/ start: number,
    /*int*/ end: number
  ) {
    const /*final int*/ count = end - start;
    const /*byte[]*/ result = new Uint8Array(count);
    for (let i = start; i < end; i++) {
      result[i - start] = /*(byte)*/ input.charAt(i) & 0xff;
    }
    return result;
  }

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
  private static /*void*/ encodeBinary(
    /*byte[]*/ bytes: Uint8Array,
    /*int*/ startpos: number,
    /*int*/ count: number,
    /*int*/ startmode: number,
    sb: StringBuilder
  ) {
    if (count == 1 && startmode == PDF417HighLevelEncoder.TEXT_COMPACTION) {
      sb.append(/*(char)*/ PDF417HighLevelEncoder.SHIFT_TO_BYTE);
    } else {
      if (count % 6 == 0) {
        sb.append(/*(char)*/ PDF417HighLevelEncoder.LATCH_TO_BYTE);
      } else {
        sb.append(/*(char)*/ PDF417HighLevelEncoder.LATCH_TO_BYTE_PADDED);
      }
    }

    let idx = startpos;
    // Encode sixpacks
    if (count >= 6) {
      const chars = new Array<char>(5);
      while (startpos + count - idx >= 6) {
        let /*long*/ t = 0;
        for (let i = 0; i < 6; i++) {
          t <<= 8;
          t += bytes[idx + i] & 0xff;
        }
        for (let i = 0; i < 5; i++) {
          chars[i] = /*(char)*/ t % 900;
          t /= 900;
        }
        for (let i = chars.length - 1; i >= 0; i--) {
          sb.append(chars[i]);
        }
        idx += 6;
      }
    }
    //Encode rest (remaining n<5 bytes if any)
    for (let i = idx; i < startpos + count; i++) {
      const ch = bytes[i] & 0xff;
      sb.append(/*(char)*/ ch);
    }
  }

  private static /*void*/ encodeNumeric(
    input: ECIInput,
    /*int*/ startpos: number,
    /*int*/ count: number,
    sb: StringBuilder
  ) {
    let idx = 0;
    const tmp = new StringBuilder();

    const num900 = BigInt(900); //BigInteger.valueOf(900);
    const num0 = BigInt(0); //BigInteger.valueOf(0);
    while (idx < count) {
      tmp.setLengthToZero();
      const len = Math.min(44, count - idx);
      const part =
        '1' + input.subSequence(startpos + idx, startpos + idx + len);
      let bigint = BigInt(part);
      do {
        tmp.append(/*(char)*/ Number(bigint % num900));
        bigint = bigint / num900;
      } while (bigint != num0);

      //Reverse temporary string
      for (let i = tmp.length() - 1; i >= 0; i--) {
        sb.append(tmp.charAt(i));
      }
      idx += len;
    }
  }

  private static /*boolean*/ isDigit(ch: char) {
    return ch >= '0'.charCodeAt(0) && ch <= '9'.charCodeAt(0);
  }

  private static /*boolean*/ isAlphaUpper(ch: char) {
    return (
      ch === ' '.charCodeAt(0) ||
      (ch >= 'A'.charCodeAt(0) && ch <= 'Z'.charCodeAt(0))
    );
  }

  private static /*boolean*/ isAlphaLower(ch: char) {
    return (
      ch === ' '.charCodeAt(0) ||
      (ch >= 'a'.charCodeAt(0) && ch <= 'z'.charCodeAt(0))
    );
  }

  private static /*boolean*/ isMixed(ch: char) {
    return PDF417HighLevelEncoder.MIXED[ch] != -1;
  }

  private static /*boolean*/ isPunctuation(ch: char) {
    return PDF417HighLevelEncoder.PUNCTUATION[ch] != -1;
  }

  private static /*boolean*/ isText(ch: char) {
    return (
      ch === '\t'.charCodeAt(0) ||
      ch === '\n'.charCodeAt(0) ||
      ch === '\r'.charCodeAt(0) ||
      (ch >= 32 && ch <= 126)
    );
  }

  /**
   * Determines the number of consecutive characters that are encodable using numeric compaction.
   *
   * @param input      the input
   * @param startpos the start position within the input
   * @return the requested character count
   */
  private static /*int*/ determineConsecutiveDigitCount(
    input: ECIInput,
    /*int*/ startpos: number
  ) {
    let count = 0;
    const /*final int*/ len = input.length();
    let idx = startpos;
    if (idx < len) {
      while (
        idx < len &&
        !input.isECI(idx) &&
        this.isDigit(input.charAt(idx))
      ) {
        count++;
        idx++;
      }
    }
    return count;
  }

  /**
   * Determines the number of consecutive characters that are encodable using text compaction.
   *
   * @param input      the input
   * @param startpos the start position within the input
   * @return the requested character count
   */
  private static /*int*/ determineConsecutiveTextCount(
    input: ECIInput,
    /*int*/ startpos: number
  ) {
    const /*final int*/ len = input.length();
    let idx = startpos;
    while (idx < len) {
      let numericCount = 0;
      while (
        numericCount < 13 &&
        idx < len &&
        !input.isECI(idx) &&
        this.isDigit(input.charAt(idx))
      ) {
        numericCount++;
        idx++;
      }
      if (numericCount >= 13) {
        return idx - startpos - numericCount;
      }
      if (numericCount > 0) {
        //Heuristic: All text-encodable chars or digits are binary encodable
        continue;
      }

      //Check if character is encodable
      if (input.isECI(idx) || !this.isText(input.charAt(idx))) {
        break;
      }
      idx++;
    }
    return idx - startpos;
  }

  /**
   * Determines the number of consecutive characters that are encodable using binary compaction.
   *
   * @param input    the input
   * @param startpos the start position within the message
   * @param encoding the charset used to convert the message to a byte array
   * @return the requested character count
   */
  private static /*int*/ determineConsecutiveBinaryCount(
    input: ECIInput,
    /*int*/ startpos: number,
    encoding: Charset
  ) /*throws WriterException*/ {
    const /*CharsetEncoder*/ encoder: CharsetEncoder =
        encoding === null ? null : new CharsetEncoder(encoding);
    const len = input.length();
    let idx = startpos;
    while (idx < len) {
      let numericCount = 0;

      let i = idx;
      while (
        numericCount < 13 &&
        !input.isECI(i) &&
        this.isDigit(input.charAt(i))
      ) {
        numericCount++;
        //textCount++;
        i = idx + numericCount;
        if (i >= len) {
          break;
        }
      }
      if (numericCount >= 13) {
        return idx - startpos;
      }

      if (
        encoder != null &&
        !encoder.canEncode(StringUtils.getCharAt(input.charAt(idx)))
      ) {
        //assert input instanceof NoECIInput;
        if (!(input instanceof NoECIInput)) throw new Error('AssertionError');

        const ch: char = input.charAt(idx);
        throw new WriterException(
          'Non-encodable character detected: ' +
            ch +
            ' (Unicode: ' +
            /*(int)*/ ch +
            ')'
        );
      }
      idx++;
    }
    return idx - startpos;
  }

  private static /*void*/ encodingECI(
    /*int*/ eci: number,
    sb: StringBuilder
  ) /*throws WriterException*/ {
    if (eci >= 0 && eci < 900) {
      sb.append(/*(char)*/ PDF417HighLevelEncoder.ECI_CHARSET);
      sb.append(/*(char)*/ eci);
    } else if (eci < 810900) {
      sb.append(/*(char)*/ PDF417HighLevelEncoder.ECI_GENERAL_PURPOSE);
      sb.append(/*(char)*/ Math.floor(eci / 900 - 1));
      sb.append(/*(char)*/ eci % 900);
    } else if (eci < 811800) {
      sb.append(/*(char)*/ PDF417HighLevelEncoder.ECI_USER_DEFINED);
      sb.append(/*(char)*/ 810900 - eci);
    } else {
      throw new WriterException(
        'ECI number not in valid range from 0..811799, but was ' + eci
      );
    }
  }
}

class /*final*/ NoECIInput implements ECIInput {
  input: string;

  constructor(input: string) {
    this.input = input;
  }

  public /*int*/ length() {
    return this.input.length;
  }

  public /*char*/ charAt(/*int*/ index: number): char {
    return this.input.charAt(index).charCodeAt(0);
  }

  public /*boolean*/ isECI(/*int*/ index: number) {
    return false;
  }

  public /*int*/ getECIValue(/*int*/ index: number) {
    return -1;
  }

  public /*boolean*/ haveNCharacters(/*int*/ index: number, /*int*/ n: number) {
    return index + n <= this.input.length;
  }

  public /*CharSequence*/ subSequence(
    /*int*/ start: number,
    /*int*/ end: number
  ) {
    return this.input.substring(start, end);
  }

  public /*String*/ toString() {
    return this.input;
  }
}
