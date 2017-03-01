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
import {KotlinGenerator} from '../../src/kotlin/generator';
import {
  BooleanType,
  ClassType,
  IntegerType,
  Specification,
  StringType,
  Type
} from '../../src/restrulz/model';
import {GeneratorContext} from '../../src/generator';
import {KotlinSerializer} from '../../src/kotlin/serializer';

class TestKotlinGenerator extends KotlinGenerator {

  generateFiles(spec: Specification, context: GeneratorContext): void {
    // do nothing
  }
}

describe('KotlinGenerator', () => {

  describe('toKotlinClassName()', () => {
    const generator = new TestKotlinGenerator();

    it('should convert kebab case to capitalized camel case', () => {
      expect(generator.toKotlinClassName('test-class')).toBe('TestClass');
    });
  });

  describe('getPackageName()', () => {

    it('should derive default package name from specification', () => {
      const generator = new TestKotlinGenerator();
      const specification = new Specification();
      specification.name = 'testing';

      expect(generator.getPackageName(specification)).toBe('testing');
    });

    it('should support package name mapping', () => {
      const generator = new TestKotlinGenerator();
      generator.packageMapping['testing'] = 'com.example.package';
      const specification = new Specification();
      specification.name = 'testing';

      expect(generator.getPackageName(specification)).toBe('com.example.package');
    });
  });

  describe('getModelPackageName()', () => {

    it('should derive default package name from specification', () => {
      const generator = new TestKotlinGenerator();
      const specification = new Specification();
      specification.name = 'testing';

      expect(generator.getModelPackageName(specification)).toBe('testing.model');
    });

    it('should support package name mapping', () => {
      const generator = new TestKotlinGenerator();
      generator.packageMapping['testing.model'] = 'com.example.package.om';
      const specification = new Specification();
      specification.name = 'testing';

      expect(generator.getModelPackageName(specification)).toBe('com.example.package.om');
    });
  });

  describe('getModelClassName()', () => {
    const generator = new TestKotlinGenerator();
    const classType = new ClassType();
    classType.name = 'test-class';

    it('should convert kebab case to capitalized camel case', () => {
      expect(generator.getModelClassName(classType)).toBe('TestClass');
    });
  });

  describe('getQualifiedModelClass()', () => {
    const specification = new Specification();
    specification.name = 'testing';
    const classType = new ClassType();
    classType.name = 'test-class';

    it('should derive default package from specification', () => {
      const generator = new TestKotlinGenerator();

      expect(generator.getQualifiedModelClass(specification, classType))
          .toBe('testing.model.TestClass');
    });

    it('should support package mapping', () => {
      const generator = new TestKotlinGenerator();
      generator.packageMapping['testing.model'] = 'com.example.package.om';

      expect(generator.getQualifiedModelClass(specification, classType))
          .toBe('com.example.package.om.TestClass');
    });
  });

  describe('getKotlinSerializer()', () => {

    it('should return valid instance', () => {
      const generator = new TestKotlinGenerator();

      expect(KotlinSerializer.assignableFrom(generator.getKotlinSerializer()))
          .toBeTruthy()
    });

    it('should return singleton', () => {
      const generator = new TestKotlinGenerator();

      const kotlinSerializer = generator.getKotlinSerializer();
      const kotlinSerializer2 = generator.getKotlinSerializer();
      // tslint:disable-next-line:triple-equals
      expect(kotlinSerializer == kotlinSerializer2)
          .toBeTruthy();

      const kotlinSerializer3 = new KotlinSerializer();
      // tslint:disable-next-line:triple-equals
      expect(kotlinSerializer == kotlinSerializer3)
          .toBeFalsy();
    });
  });

  describe('indent()', () => {

    it('should return indented value', () => {
      const generator = new TestKotlinGenerator();

      expect(generator.indent('test1'))
          .toBe('    test1')
    });

  });

  describe('writeFile()', () => {

    it('should write file', () => {
      class TestGeneratorContext implements GeneratorContext {
        outputPath = '';
        content = '';

        writeJsonToFile(filePath: string, data: any): void {
          throw new Error('Method not implemented.');
        }

        writeYamlToFile(filePath: string, data: any): void {
          throw new Error('Method not implemented.');
        }

        writeStringToFile(filePath: string, data: any): void {
          this.outputPath = filePath;
          this.content = data;
        }
      }

      const generator = new TestKotlinGenerator();
      const fileKt = new FileKt('com.example.package', 'TestClass');
      fileKt.addClass('TestClass', () => {});

      const context = new TestGeneratorContext();

      generator.writeFile(context, fileKt);

      expect(context.outputPath).toBe('com/example/package/TestClass.kt');
      expect(context.content).toBe(`\
package com.example.package

class TestClass
`);
    });

  });

  describe('createKotlinFile()', () => {

    it('should set required properties', () => {
      const generator = new TestKotlinGenerator();
      const fileKt = generator.createKotlinFile('com.example.package', 'TestClass');

      expect(fileKt.packageName).toBe('com.example.package');
      expect(fileKt.fileName).toBe('TestClass');
    });

  });

  describe('toKotlinIntegerType()', () => {
    const generator = new TestKotlinGenerator();

    it('should support long minimum', () => {
      const intergerType = new IntegerType();
      intergerType.minimum = -2147483649;
      intergerType.maximum = 0;

      expect(generator.toKotlinIntegerType(intergerType)).toBe('kotlin.Long');
    });

    it('should support int minimum', () => {
      const intergerType = new IntegerType();
      intergerType.minimum = -32769;
      intergerType.maximum = 0;

      expect(generator.toKotlinIntegerType(intergerType)).toBe('kotlin.Int');
    });

    it('should support short minimum', () => {
      const intergerType = new IntegerType();
      intergerType.minimum = -129;
      intergerType.maximum = 0;

      expect(generator.toKotlinIntegerType(intergerType)).toBe('kotlin.Short');
    });

    it('should support byte minimum', () => {
      const intergerType = new IntegerType();
      intergerType.minimum = -128;
      intergerType.maximum = 0;

      expect(generator.toKotlinIntegerType(intergerType)).toBe('kotlin.Byte');
    });

    it('should support long maximum', () => {
      const intergerType = new IntegerType();
      intergerType.minimum = 0;
      intergerType.maximum = 2147483648;

      expect(generator.toKotlinIntegerType(intergerType)).toBe('kotlin.Long');
    });

    it('should support int maximum', () => {
      const intergerType = new IntegerType();
      intergerType.minimum = 0;
      intergerType.maximum = 32768;

      expect(generator.toKotlinIntegerType(intergerType)).toBe('kotlin.Int');
    });

    it('should support short maximum', () => {
      const intergerType = new IntegerType();
      intergerType.minimum = 0;
      intergerType.maximum = 128;

      expect(generator.toKotlinIntegerType(intergerType)).toBe('kotlin.Short');
    });

    it('should support byte maximum', () => {
      const intergerType = new IntegerType();
      intergerType.minimum = 0;
      intergerType.maximum = 127;

      expect(generator.toKotlinIntegerType(intergerType)).toBe('kotlin.Byte');
    });
  });

  describe('toKotlinType()', () => {
    const specification = new Specification();
    specification.name = 'testing';
    const generator = new TestKotlinGenerator();

    it('should support string', () => {
      const stringType = new StringType();

      expect(generator.toKotlinType(specification, stringType))
          .toBe('kotlin.String');
    });

    it('should support integer type long minimum', () => {
      const intergerType = new IntegerType();
      intergerType.minimum = -2147483649;
      intergerType.maximum = 0;

      expect(generator.toKotlinType(specification, intergerType))
          .toBe('kotlin.Long');
    });

    it('should support integer type int minimum', () => {
      const intergerType = new IntegerType();
      intergerType.minimum = -32769;
      intergerType.maximum = 0;

      expect(generator.toKotlinType(specification, intergerType))
          .toBe('kotlin.Int');
    });

    it('should support integer type short minimum', () => {
      const intergerType = new IntegerType();
      intergerType.minimum = -129;
      intergerType.maximum = 0;

      expect(generator.toKotlinType(specification, intergerType))
          .toBe('kotlin.Short');
    });

    it('should support integer type byte minimum', () => {
      const intergerType = new IntegerType();
      intergerType.minimum = -128;
      intergerType.maximum = 0;

      expect(generator.toKotlinType(specification, intergerType))
          .toBe('kotlin.Byte');
    });

    it('should support integer type long maximum', () => {
      const intergerType = new IntegerType();
      intergerType.minimum = 0;
      intergerType.maximum = 2147483648;

      expect(generator.toKotlinType(specification, intergerType))
          .toBe('kotlin.Long');
    });

    it('should support integer type int maximum', () => {
      const intergerType = new IntegerType();
      intergerType.minimum = 0;
      intergerType.maximum = 32768;

      expect(generator.toKotlinType(specification, intergerType))
          .toBe('kotlin.Int');
    });

    it('should support integer type short maximum', () => {
      const intergerType = new IntegerType();
      intergerType.minimum = 0;
      intergerType.maximum = 128;

      expect(generator.toKotlinType(specification, intergerType))
          .toBe('kotlin.Short');
    });

    it('should support integer type byte maximum', () => {
      const intergerType = new IntegerType();
      intergerType.minimum = 0;
      intergerType.maximum = 127;

      expect(generator.toKotlinType(specification, intergerType))
          .toBe('kotlin.Byte');
    });

    it('should support boolean type', () => {
      const booleanType = new BooleanType();

      expect(generator.toKotlinType(specification, booleanType))
          .toBe('kotlin.Boolean');
    });

    it('should support class type', () => {
      const classType = new ClassType();
      classType.name = 'test-class';

      expect(generator.toKotlinType(specification, classType))
          .toBe('testing.model.TestClass');
    });

    it('should throw error for unsupported type', () => {
      class UnsupportedTypeTest implements Type {
        name: string;
      }

      const unsupportedType = new UnsupportedTypeTest();


      expect(() => generator.toKotlinType(specification, unsupportedType))
          .toThrowError('Unsupported type: UnsupportedTypeTest');
    });
  });

  describe('toKotlinString()', () => {
    const generator = new TestKotlinGenerator();

    it('should support plain strings', () => {
      expect(generator.toKotlinString('test1'))
          .toBe('"test1"');
    });

    it('should support strings with double quotes', () => {
      expect(generator.toKotlinString('te"st1"'))
          .toBe('"te\\"st1\\""');
    });

    it('should support strings with back slashes', () => {
      expect(generator.toKotlinString('te\\st1\\'))
          .toBe('"te\\\\st1\\\\"');
    });

    it('should support strings with back slashes and double quotes', () => {
      expect(generator.toKotlinString('te"\\st1"\\'))
          .toBe('"te\\"\\\\st1\\"\\\\"');
    });
  });

  describe('init()', () => {
    const generator = new TestKotlinGenerator();

    it('should run without error', () => {
      generator.init([]);
    });

    it('should support strings with double quotes', () => {
      expect(generator.toKotlinString('te"st1"'))
          .toBe('"te\\"st1\\""');
    });

    it('should support strings with back slashes', () => {
      expect(generator.toKotlinString('te\\st1\\'))
          .toBe('"te\\\\st1\\\\"');
    });

    it('should support strings with back slashes and double quotes', () => {
      expect(generator.toKotlinString('te"\\st1"\\'))
          .toBe('"te\\"\\\\st1\\"\\\\"');
    });
  });

});
