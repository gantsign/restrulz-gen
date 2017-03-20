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
import {KotlinGenerator} from '../../src/kotlin/generator';
import {Specification} from '../../src/restrulz/model';
import {GeneratorContext, Generator} from '../../src/generator';
import {CompositeKotlinGenerator} from '../../src/kotlin/composite-generator';

class TestKotlinGenerator extends KotlinGenerator {
  initCalled = false;
  generateFilesCalled = false;

  init(generators: Generator[]): void {
    this.initCalled = true;
  }

  generateFiles(spec: Specification, context: GeneratorContext): void {
    this.generateFilesCalled = true;
  }
}

describe('CompositeKotlinGenerator', () => {

  describe('init()', () => {

    it('should copy licence', () => {
      const generator = new CompositeKotlinGenerator();
      const testKotlinGenerator = new TestKotlinGenerator();
      generator.licenseHeader = '/* test1 */';
      generator.children.push(testKotlinGenerator);
      generator.init([generator]);

      expect(testKotlinGenerator.licenseHeader).toBe('/* test1 */');
    });

    it('should not overwrite licence', () => {
      const generator = new CompositeKotlinGenerator();
      const testKotlinGenerator = new TestKotlinGenerator();
      testKotlinGenerator.licenseHeader = '/* test1 */';
      generator.licenseHeader = '/* test2 */';
      generator.children.push(testKotlinGenerator);
      generator.init([generator]);

      expect(testKotlinGenerator.licenseHeader).toBe('/* test1 */');
    });

    it('should copy package mapping', () => {
      const generator = new CompositeKotlinGenerator();
      const testKotlinGenerator = new TestKotlinGenerator();
      generator.packageMapping['com.example'] = 'com.example.mapped';
      generator.children.push(testKotlinGenerator);
      generator.init([generator]);

      expect(testKotlinGenerator.packageMapping['com.example']).toBe('com.example.mapped');
    });

    it('should not overwrite package mapping', () => {
      const generator = new CompositeKotlinGenerator();
      const testKotlinGenerator = new TestKotlinGenerator();
      testKotlinGenerator.packageMapping['com.example'] = 'com.example.mapped';
      generator.packageMapping['com.example'] = 'com.example.remapped';
      generator.children.push(testKotlinGenerator);
      generator.init([generator]);

      expect(testKotlinGenerator.packageMapping['com.example']).toBe('com.example.mapped');
    });

    it('should call child init()', () => {
      const generator = new CompositeKotlinGenerator();
      const testKotlinGenerator = new TestKotlinGenerator();
      generator.children.push(testKotlinGenerator);
      generator.init([generator]);

      expect(testKotlinGenerator.initCalled).toBeTruthy();
    });
  });

  describe('generateFiles()', () => {

    it('should call child generateFiles()', () => {
      const generator = new CompositeKotlinGenerator();
      const testKotlinGenerator = new TestKotlinGenerator();
      generator.children.push(testKotlinGenerator);

      const spec = new Specification();
      const context = <GeneratorContext>{};
      generator.generateFiles(spec, context);

      expect(testKotlinGenerator.generateFilesCalled).toBeTruthy();
    });
  });
});
