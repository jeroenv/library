import {
  BarcodeFormat,
  BitArray,
  BitMatrix,
  Code128Reader,
  EncodeHintType,
  Code128Writer,
  ZXingStringBuilder as StringBuilder,
} from '@zxing/library';
import { assertEquals, assertNotNull } from '../util/AssertUtils';

const matrixToString = (result: BitMatrix): string => {
  assertEquals(1, result.getHeight());
  const builder = new StringBuilder();
  for (let i = 0; i < result.getWidth(); i++) {
    builder.append(result.get(i, 0) ? '1' : '0');
  }
  return builder.toString();
};

const FNC1 = '11110101110';
const FNC2 = '11110101000';
const FNC3 = '10111100010';
const FNC4A = '11101011110';
const FNC4B = '10111101110';
const START_CODE_A = '11010000100';
const START_CODE_B = '11010010000';
const START_CODE_C = '11010011100';
const SWITCH_CODE_A = '11101011110';
const SWITCH_CODE_B = '10111101110';
const QUIET_SPACE = '00000';
const STOP = '1100011101011';
const LF = '10000110010';

describe('Code128Writer', () => {
  let writer: Code128Writer;
  let reader: Code128Reader;
  beforeEach(() => {
    writer = new Code128Writer();
    reader = new Code128Reader();
  });

  const encode = (
    toEncode: string,
    compact: boolean,
    expectedLoopback: string
  ): BitMatrix => {
    const hints = new Map<EncodeHintType, unknown>();
    if (compact) {
      hints.set(EncodeHintType.CODE128_COMPACT, true);
    }
    const encResult = writer.encode(
      toEncode,
      BarcodeFormat.CODE_128,
      0,
      0,
      hints
    );
    if (expectedLoopback != null) {
      const row = encResult.getRow(0, null) as unknown as BitArray;
      const rtResult = reader.decodeRow(0, row, null);
      const actual = rtResult.getText();
      assertEquals(expectedLoopback, actual);
    }
    if (compact) {
      //check that what is encoded compactly yields the same on loopback as what was encoded fast.
      let row = encResult.getRow(0, null) as unknown as BitArray;
      let rtResult = reader.decodeRow(0, row, null);
      const actual = rtResult.getText();
      const encResultFast = writer.encode(
        toEncode,
        BarcodeFormat.CODE_128,
        0,
        0
      );
      row = encResultFast.getRow(0, null) as unknown as BitArray;
      rtResult = reader.decodeRow(0, row, null);
      assertEquals(rtResult.getText(), actual);
    }
    return encResult as unknown as BitMatrix;
  };

  /*it('testCompaction2', () => {
    //compare fast to compact
    const toEncode = 'AAAAAAAAAAA1212aaaaaaaaa';
    let result = encode(toEncode, false, toEncode);

    const width = result.getWidth();
    result = encode(toEncode, true, toEncode);

    //very good, no difference
    assertEquals(width, result.getWidth());
  });

  it('testEncodeWithFunc3', () => {
    const toEncode = '\u00f3' + '123';
    const expected =
      QUIET_SPACE +
      START_CODE_B +
      FNC3 +
      // "1"            "2"             "3"            check digit 51
      '10011100110' +
      '11001110010' +
      '11001011100' +
      '11101000110' +
      STOP +
      QUIET_SPACE;

    let result = encode(toEncode, false, '123');

    const actual = matrixToString(result);
    assertEquals(expected, actual);

    const width = result.getWidth();
    result = encode(toEncode, true, '123');

    assertEquals(width, result.getWidth());
  });*/

  it('test', () => {
    const input = writer.encode('test', BarcodeFormat.CODE_128, 0, 1);
    assertNotNull(input);
    const expected =
      'X X   X     X         X     X X X X   X     X   X X     X         X   X X X X     X     X     X X X X   X     X X X X     X   X     X X       X X X   X   X X';
    assertEquals(expected, input.toString().trim());
  });

  it('123456', () => {
    const input = writer.encode('123456', BarcodeFormat.CODE_128, 0, 1);
    assertNotNull(input);
    const expected =
      'X X   X     X X X     X   X X     X X X     X       X   X X       X X X       X   X X   X       X X   X X X   X X       X X X   X   X X';
    assertEquals(expected, input.toString().trim());
  });

  it('testLongCompact', () => {
    const input = writer.encode(
      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      BarcodeFormat.CODE_128,
      0,
      1
    );
    assertNotNull(input);
    const expected =
      'X X   X     X         X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X     X X       X     X X       X X X   X   X X';
    assertEquals(expected, input.toString().trim());
  });

  it('testDigitMixCompaction', () => {
    const input = writer.encode(
      'A1A12A123A1234A12345AA1AA12AA123AA1234AA1235',
      BarcodeFormat.CODE_128,
      0,
      1
    );
    assertNotNull(input);
    const expected =
      'X X   X     X         X   X       X X       X     X X X     X X   X   X       X X       X     X X X     X X   X X     X X X     X   X   X       X X       X     X X X     X X   X X     X X X     X   X X     X   X X X     X   X       X X       X   X X X   X X X X   X   X X     X X X     X       X   X X       X   X X X X   X X X   X   X       X X       X     X X X     X X   X   X X X   X X X X   X X X   X X   X X X   X   X X X   X X       X   X X X X   X X X   X   X       X X       X   X       X X       X     X X X     X X   X   X       X X       X   X       X X       X     X X X     X X   X X     X X X     X   X   X       X X       X   X       X X       X     X X X     X X   X X     X X X     X   X X     X   X X X     X   X       X X       X   X       X X       X   X X X   X X X X   X   X X     X X X     X       X   X X       X   X X X X   X X X   X   X       X X       X   X       X X       X   X X X   X X X X   X   X X     X X X     X       X       X X   X   X       X X       X X       X X X   X   X X';
    assertEquals(expected, input.toString().trim());
  });

  it('testCompaction1', () => {
    const input = writer.encode(
      'AAAAAAAAAAA12AAAAAAAAA',
      BarcodeFormat.CODE_128,
      0,
      1
    );
    assertNotNull(input);
    const expected =
      'X X   X     X         X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X     X X X     X X   X X     X X X     X   X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X X       X X   X X   X X       X X X   X   X X';
    assertEquals(expected, input.toString().trim());
  });

  it('testCompaction2', () => {
    const input = writer.encode(
      'AAAAAAAAAAA1212aaaaaaaaa',
      BarcodeFormat.CODE_128,
      0,
      1
    );
    assertNotNull(input);
    const expected =
      'X X   X     X         X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X       X X       X   X X X   X X X X   X   X X     X X X     X   X X     X X X     X   X X X X   X X X   X     X   X X         X     X   X X         X     X   X X         X     X   X X         X     X   X X         X     X   X X         X     X   X X         X     X   X X         X     X   X X         X X X X   X   X X X   X X       X X X   X   X X';
    assertEquals(expected, input.toString().trim());
  });
});
