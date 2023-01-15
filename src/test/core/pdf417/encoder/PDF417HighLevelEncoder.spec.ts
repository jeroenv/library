/*
 * Copyright (C) 2014 ZXing authors
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

import Compaction from '../../../../core/pdf417/encoder/Compaction';
import StandardCharsets from '../../../../core/util/StandardCharsets';
import PDF417HighLevelEncoder from '../../../../core/pdf417/encoder/PDF417HighLevelEncoder';
import { assertEquals, assertThrow } from '../../util/AssertUtils';
import { WriterException } from '@zxing/library';

describe('PDF417HighLevelEncoder', () => {
  it('testEncodeAuto', () => {
    const encoded = PDF417HighLevelEncoder.encodeHighLevel(
      'ABCD',
      Compaction.AUTO,
      StandardCharsets.UTF_8,
      false
    );
    assertEquals('\u039f\u001A\u0385ABCD', encoded);
  });

  it('testEncodeAutoWithSpecialChars', () => {
    // Just check if this does not throw an exception
    PDF417HighLevelEncoder.encodeHighLevel(
      '1%§s ?aG$',
      Compaction.AUTO,
      StandardCharsets.UTF_8,
      false
    );
  });

  it('testEncodeIso88591WithSpecialChars', () => {
    // Just check if this does not throw an exception
    PDF417HighLevelEncoder.encodeHighLevel(
      'asdfg§asd',
      Compaction.AUTO,
      StandardCharsets.ISO_8859_1,
      false
    );
  });

  it('testEncodeText', () => {
    const encoded = PDF417HighLevelEncoder.encodeHighLevel(
      'ABCD',
      Compaction.TEXT,
      StandardCharsets.UTF_8,
      false
    );
    assertEquals('Ο\u001A\u0001?', encoded);
  });

  it('testEncodeNumeric', () => {
    const encoded = PDF417HighLevelEncoder.encodeHighLevel(
      '1234',
      Compaction.NUMERIC,
      StandardCharsets.UTF_8,
      false
    );
    assertEquals('\u039f\u001A\u0386\f\u01b2', encoded);
  });

  it('testEncodeByte', () => {
    const encoded = PDF417HighLevelEncoder.encodeHighLevel(
      'abcd',
      Compaction.BYTE,
      StandardCharsets.UTF_8,
      false
    );
    assertEquals('\u039f\u001A\u0385abcd', encoded);
  });

  it('testEncodeEmptyString', () => {
    assertThrow(
      () =>
        PDF417HighLevelEncoder.encodeHighLevel(
          '',
          Compaction.AUTO,
          null,
          false
        ),
      new WriterException('Empty message not allowed')
    );
  });
});
