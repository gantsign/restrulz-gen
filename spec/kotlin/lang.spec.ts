/*
 * Copyright 2017 GantSign Ltd. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this fileKt except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/// <reference path="../../typings/globals/jasmine/index.d.ts" />

import {FileKt} from '../../src/kotlin/lang';

function createFile() {
  return new FileKt('com.example.package', 'Test');
}

describe('FileKt', () => {

  describe('tryImport()', () => {
    it('should support simple imports', () => {
      const fileKt = createFile();
      expect(fileKt.tryImport('com.example.TestClass')).toBe('TestClass');
      expect(fileKt.importMapping['com.example.TestClass']).toBe('TestClass');
    });
    it('should support aliases', () => {
      const fileKt = createFile();
      fileKt.importMapping['com.example.TestClass'] = 'TestClassAlias';

      expect(fileKt.tryImport('com.example.TestClass')).toBe('TestClassAlias');
      expect(fileKt.importMapping['com.example.TestClass']).toBe('TestClassAlias');
    });
    it('should avoid class name conflicts', () => {
      const fileKt = createFile();
      fileKt.importMapping['com.example.other.TestClass'] = 'TestClass';

      expect(fileKt.tryImport('com.example.TestClass')).toBe('com.example.TestClass');
      expect(Object.keys(fileKt.importMapping).length).toBe(1);
    });
    it('should avoid member name conflicts', () => {
      const fileKt = createFile();
      fileKt.addClass('TestClass', () => {});

      expect(fileKt.tryImport('com.example.TestClass')).toBe('com.example.TestClass');
      expect(Object.keys(fileKt.importMapping).length).toBe(0);
    });
    it('should shorten non-conflicting members', () => {
      const fileKt = createFile();
      fileKt.addClass('TestClass', () => {});

      expect(fileKt.tryImport('com.example.package.TestClass')).toBe('TestClass');
      expect(fileKt.importMapping['com.example.package.TestClass']).toBe('TestClass');
    });
  });

  describe('getOutputPath()', () => {
    it('should convert packageName and fileName to path', () => {
      const fileKt = createFile();
      expect(fileKt.getOutputPath()).toBe('com/example/package/Test.kt');
    });
  });
});
