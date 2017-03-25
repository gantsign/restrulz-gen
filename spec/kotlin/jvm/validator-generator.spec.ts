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
/// <reference path="../../../typings/globals/jasmine/index.d.ts" />

import {
  BodyParameterReference,
  BooleanType,
  ClassType,
  IntegerType,
  PathParameter,
  PathParameterReference,
  Property,
  Specification,
  StringType
} from '../../../src/restrulz/model';
import {ExtendsKt, FileKt, ObjectKt} from '../../../src/kotlin/lang';
import {GeneratorContext} from '../../../src/generator';
import {KotlinValidatorGenerator} from '../../../src/kotlin/jvm/validator-generator';
import {KotlinModelGenerator} from '../../../src/kotlin/model-generator';
import {KotlinJsonReaderGenerator} from '../../../src/kotlin/jvm/json-reader-generator';
import {KotlinSpringMvcGenerator} from '../../../src/kotlin/jvm/spring-mvc-generator';

describe('KotlinValidatorGenerator', () => {

  const generator = new KotlinValidatorGenerator();
  const spec = new Specification();
  spec.name = 'testing';

  describe('getValidatorPackageName()', () => {

    it('should derive default package name from specification', () => {

      expect(generator.getValidatorPackageName(spec)).toBe('testing.validator');
    });

    it('should support package name mapping', () => {
      const generatorWithMapping = new KotlinValidatorGenerator();
      generatorWithMapping.packageMapping['testing.validator'] = 'com.example.package.val';

      expect(generatorWithMapping.getValidatorPackageName(spec)).toBe('com.example.package.val');
    });
  });

  describe('getValidatorClassName()', () => {
    const stringType = new StringType();
    stringType.name = 'international-phone-number';

    it('should convert kebab case to capitalized camel case', () => {
      expect(generator.getValidatorClassName(stringType)).toBe('InternationalPhoneNumberValidator');
    });
  });

  describe('getQualifiedValidatorClass()', () => {
    const stringType = new StringType();
    stringType.name = 'international-phone-number';

    it('should derive default package from specification', () => {
      expect(generator.getQualifiedValidatorClass(spec, stringType))
          .toBe('testing.validator.InternationalPhoneNumberValidator');
    });

    it('should support package mapping', () => {
      const generatorWithMapping = new KotlinValidatorGenerator();
      generatorWithMapping.packageMapping['testing.validator'] = 'com.example.package.val';

      expect(generatorWithMapping.getQualifiedValidatorClass(spec, stringType))
          .toBe('com.example.package.val.InternationalPhoneNumberValidator');
    });
  });

  describe('addIntegerValidator()', () => {

    it('should support values smaller than long', () => {
      const integerType = new IntegerType();
      integerType.name = 'person-age';
      integerType.minimum = 0;
      integerType.maximum = 150;

      const fileKt = new FileKt('com.example.package', 'PersonAgeValidator');

      generator.addIntegerValidator(fileKt, spec, integerType);

      expect(fileKt.members.length).toBe(1);
      const objectKt = fileKt.members[0];
      if (!(objectKt instanceof ObjectKt)) {
        fail(`Expected ObjectKt but was ${objectKt.constructor.name}`);
        return;
      }
      expect(objectKt.name).toBe('PersonAgeValidator');

      expect(objectKt.extendsClasses.length).toBe(1);

      const extendsKt = objectKt.extendsClasses[0];
      if (!(extendsKt instanceof ExtendsKt)) {
        fail(`Expected ExtendsKt but was ${extendsKt.constructor.name}`);
        return;
      }
      expect(extendsKt.type.className)
          .toBe('com.gantsign.restrulz.validation.ShortValidator');

      expect(extendsKt.arguments.length).toBe(2);
      const arg1 = extendsKt.arguments[0];
      expect(arg1.name).toBe('minimumValue');
      expect(arg1.valueFactory(fileKt)).toBe('0');

      const arg2 = extendsKt.arguments[1];
      expect(arg2.name).toBe('maximumValue');
      expect(arg2.valueFactory(fileKt)).toBe('150');
    });

    it('should support long', () => {
      const integerType = new IntegerType();
      integerType.name = 'money';
      integerType.minimum = 0;
      integerType.maximum = 2147483648;

      const fileKt = new FileKt('com.example.package', 'MoneyValidator');

      generator.addIntegerValidator(fileKt, spec, integerType);

      expect(fileKt.members.length).toBe(1);
      const objectKt = fileKt.members[0];
      if (!(objectKt instanceof ObjectKt)) {
        fail(`Expected ObjectKt but was ${objectKt.constructor.name}`);
        return;
      }
      expect(objectKt.name).toBe('MoneyValidator');

      expect(objectKt.extendsClasses.length).toBe(1);

      const extendsKt = objectKt.extendsClasses[0];
      if (!(extendsKt instanceof ExtendsKt)) {
        fail(`Expected ExtendsKt but was ${extendsKt.constructor.name}`);
        return;
      }
      expect(extendsKt.type.className)
          .toBe('com.gantsign.restrulz.validation.LongValidator');

      expect(extendsKt.arguments.length).toBe(2);
      const arg1 = extendsKt.arguments[0];
      expect(arg1.name).toBe('minimumValue');
      expect(arg1.valueFactory(fileKt)).toBe('0L');

      const arg2 = extendsKt.arguments[1];
      expect(arg2.name).toBe('maximumValue');
      expect(arg2.valueFactory(fileKt)).toBe('2147483648L');
    });
  });

  describe('addStringValidator()', () => {

    it('should add validator object', () => {
      const stringType = new StringType();
      stringType.name = 'org-name';
      stringType.minLength = 1;
      stringType.maxLength = 100;
      stringType.pattern = '[a-zA-Z]+';

      const fileKt = new FileKt('com.example.package', 'OrgNameValidator');

      generator.addStringValidator(fileKt, spec, stringType);

      expect(fileKt.members.length).toBe(1);
      const objectKt = fileKt.members[0];
      if (!(objectKt instanceof ObjectKt)) {
        fail(`Expected ObjectKt but was ${objectKt.constructor.name}`);
        return;
      }
      expect(objectKt.name).toBe('OrgNameValidator');

      expect(objectKt.extendsClasses.length).toBe(1);

      const extendsKt = objectKt.extendsClasses[0];
      if (!(extendsKt instanceof ExtendsKt)) {
        fail(`Expected ExtendsKt but was ${extendsKt.constructor.name}`);
        return;
      }
      expect(extendsKt.type.className)
          .toBe('com.gantsign.restrulz.validation.StringValidator');

      expect(extendsKt.arguments.length).toBe(3);
      const arg1 = extendsKt.arguments[0];
      expect(arg1.name).toBe('minimumLength');
      expect(arg1.valueFactory(fileKt)).toBe('1');

      const arg2 = extendsKt.arguments[1];
      expect(arg2.name).toBe('maximumLength');
      expect(arg2.valueFactory(fileKt)).toBe('100');

      const arg3 = extendsKt.arguments[2];
      expect(arg3.name).toBe('pattern');
      expect(arg3.valueFactory(fileKt)).toBe('"[a-zA-Z]+"');
    });

  });

  describe('addValidatorKotlinObject()', () => {

    it('should support integers', () => {
      const integerType = new IntegerType();
      integerType.name = 'person-age';
      integerType.minimum = 0;
      integerType.maximum = 150;

      const fileKt = new FileKt('com.example.package', 'PersonAgeValidator');

      generator.addValidatorKotlinObject(fileKt, spec, integerType);

      expect(fileKt.members.length).toBe(1);
      const objectKt = fileKt.members[0];
      if (!(objectKt instanceof ObjectKt)) {
        fail(`Expected ObjectKt but was ${objectKt.constructor.name}`);
        return;
      }
      expect(objectKt.name).toBe('PersonAgeValidator');

      expect(objectKt.extendsClasses.length).toBe(1);

      const extendsKt = objectKt.extendsClasses[0];
      if (!(extendsKt instanceof ExtendsKt)) {
        fail(`Expected ExtendsKt but was ${extendsKt.constructor.name}`);
        return;
      }
      expect(extendsKt.type.className)
          .toBe('com.gantsign.restrulz.validation.ShortValidator');

      expect(extendsKt.arguments.length).toBe(2);
      const arg1 = extendsKt.arguments[0];
      expect(arg1.name).toBe('minimumValue');
      expect(arg1.valueFactory(fileKt)).toBe('0');

      const arg2 = extendsKt.arguments[1];
      expect(arg2.name).toBe('maximumValue');
      expect(arg2.valueFactory(fileKt)).toBe('150');
    });

    it('should support strings', () => {
      const stringType = new StringType();
      stringType.name = 'org-name';
      stringType.minLength = 1;
      stringType.maxLength = 100;
      stringType.pattern = '[a-zA-Z]+';

      const fileKt = new FileKt('com.example.package', 'OrgNameValidator');

      generator.addValidatorKotlinObject(fileKt, spec, stringType);

      expect(fileKt.members.length).toBe(1);
      const objectKt = fileKt.members[0];
      if (!(objectKt instanceof ObjectKt)) {
        fail(`Expected ObjectKt but was ${objectKt.constructor.name}`);
        return;
      }
      expect(objectKt.name).toBe('OrgNameValidator');

      expect(objectKt.extendsClasses.length).toBe(1);

      const extendsKt = objectKt.extendsClasses[0];
      if (!(extendsKt instanceof ExtendsKt)) {
        fail(`Expected ExtendsKt but was ${extendsKt.constructor.name}`);
        return;
      }
      expect(extendsKt.type.className)
          .toBe('com.gantsign.restrulz.validation.StringValidator');

      expect(extendsKt.arguments.length).toBe(3);
      const arg1 = extendsKt.arguments[0];
      expect(arg1.name).toBe('minimumLength');
      expect(arg1.valueFactory(fileKt)).toBe('1');

      const arg2 = extendsKt.arguments[1];
      expect(arg2.name).toBe('maximumLength');
      expect(arg2.valueFactory(fileKt)).toBe('100');

      const arg3 = extendsKt.arguments[2];
      expect(arg3.name).toBe('pattern');
      expect(arg3.valueFactory(fileKt)).toBe('"[a-zA-Z]+"');
    });

    it('should throw error for unsupported types', () => {
      class UnsupportedTypeTest {}

      const unsupportedType = new UnsupportedTypeTest();

      const fileKt = new FileKt('com.example.package', 'OrgNameValidator');

      expect(() => generator.addValidatorKotlinObject(fileKt, spec, <StringType>unsupportedType))
          .toThrowError('Unsupported SimpleType type: UnsupportedTypeTest');
    });
  });

  describe('toValidatorKotlinFile()', () => {

    it('should create Kotlin file with validator object', () => {
      const integerType = new IntegerType();
      integerType.name = 'person-age';
      integerType.minimum = 0;
      integerType.maximum = 150;

      const fileKt = generator.toValidatorKotlinFile(spec, integerType);
      expect(fileKt.packageName).toBe('testing.validator');
      expect(fileKt.fileName).toBe('PersonAgeValidator');

      expect(fileKt.members.length).toBe(1);
      const objectKt = fileKt.members[0];
      if (!(objectKt instanceof ObjectKt)) {
        fail(`Expected ObjectKt but was ${objectKt.constructor.name}`);
        return;
      }
      expect(objectKt.name).toBe('PersonAgeValidator');

      expect(objectKt.extendsClasses.length).toBe(1);

      const extendsKt = objectKt.extendsClasses[0];
      if (!(extendsKt instanceof ExtendsKt)) {
        fail(`Expected ExtendsKt but was ${extendsKt.constructor.name}`);
        return;
      }
      expect(extendsKt.type.className)
          .toBe('com.gantsign.restrulz.validation.ShortValidator');

      expect(extendsKt.arguments.length).toBe(2);
      const arg1 = extendsKt.arguments[0];
      expect(arg1.name).toBe('minimumValue');
      expect(arg1.valueFactory(fileKt)).toBe('0');

      const arg2 = extendsKt.arguments[1];
      expect(arg2.name).toBe('maximumValue');
      expect(arg2.valueFactory(fileKt)).toBe('150');
    });

  });

  class MockGeneratorContext implements GeneratorContext {
    outputPaths: String[] = [];
    contents: String[] = [];

    writeJsonToFile(filePath: string, data: any): void {
    }

    writeYamlToFile(filePath: string, data: any): void {
    }

    writeStringToFile(filePath: string, data: any): void {
      this.outputPaths.push(filePath);
      this.contents.push(data);
    }
  }

  describe('generateValidatorFile()', () => {
    it('should write validator file', () => {
      const testContext = new MockGeneratorContext();

      const integerType = new IntegerType();
      integerType.name = 'person-age';
      integerType.minimum = 0;
      integerType.maximum = 150;

      generator.generateValidatorFile(spec, integerType, testContext);
      expect(testContext.outputPaths.length).toBe(1);
      expect(testContext.outputPaths[0]).toBe('testing/validator/PersonAgeValidator.kt');
      expect(testContext.contents[0]).toBe(`\
package testing.validator

import com.gantsign.restrulz.validation.ShortValidator

object PersonAgeValidator : ShortValidator(
        minimumValue = 0,
        maximumValue = 150)
`);
    });

  });

  describe('supportsValidation()', () => {
    it('should return true for string', () => {
      expect(generator.supportsValidation(new StringType())).toBeTruthy();
    });

    it('should return true for integer', () => {
      expect(generator.supportsValidation(new IntegerType())).toBeTruthy();
    });

    it('should return false for boolean', () => {
      expect(generator.supportsValidation(new BooleanType())).toBeFalsy();
    });

    it('should return false for classes', () => {
      expect(generator.supportsValidation(new ClassType())).toBeFalsy();
    });

    it('should throw errors for unsupported types', () => {
      class UnsupportedTypeTest {}

      const unsupportedType = new UnsupportedTypeTest();
      expect(() => generator.supportsValidation(<StringType>unsupportedType))
          .toThrowError('Unsupported SimpleType type: UnsupportedTypeTest');
    });
  });

  describe('generateValidatorFiles()', () => {

    it('should filter out non-validating types', () => {
      const testContext = new MockGeneratorContext();

      const nonValidatingSpec = new Specification();
      nonValidatingSpec.name = 'testing';

      const booleanType = new BooleanType();
      booleanType.name = 'agreed';

      nonValidatingSpec.simpleTypes = [booleanType];

      generator.generateValidatorFiles(nonValidatingSpec, testContext);
      expect(testContext.outputPaths.length).toBe(0);
    });

    it('should support multiple validators', () => {
      const testContext = new MockGeneratorContext();

      const validatingSpec = new Specification();
      validatingSpec.name = 'testing';

      const integerType = new IntegerType();
      integerType.name = 'person-age';
      integerType.minimum = 0;
      integerType.maximum = 150;

      const stringType = new StringType();
      stringType.name = 'org-name';
      stringType.minLength = 1;
      stringType.maxLength = 100;
      stringType.pattern = '[a-zA-Z]+';

      validatingSpec.simpleTypes = [integerType, stringType];

      generator.generateValidatorFiles(validatingSpec, testContext);

      expect(testContext.outputPaths.length).toBe(2);

      expect(testContext.outputPaths[0]).toBe('testing/validator/PersonAgeValidator.kt');
      expect(testContext.contents[0]).toBe(`\
package testing.validator

import com.gantsign.restrulz.validation.ShortValidator

object PersonAgeValidator : ShortValidator(
        minimumValue = 0,
        maximumValue = 150)
`);

      expect(testContext.outputPaths[1]).toBe('testing/validator/OrgNameValidator.kt');
      expect(testContext.contents[1]).toBe(`\
package testing.validator

import com.gantsign.restrulz.validation.StringValidator

object OrgNameValidator : StringValidator(
        minimumLength = 1,
        maximumLength = 100,
        pattern = "[a-zA-Z]+")
`);
    });

  });

  describe('needsProcessing()', () => {

    it('should return true if model requires processing', () => {

      expect(generator.needsProcessing(new BooleanType(), () => true)).toBeTruthy();
    });

    it('should return true if supports validation', () => {

      expect(generator.needsProcessing(new IntegerType(), () => false)).toBeTruthy();
    });

    it('should return false if not requires processing and not supports validation', () => {

      expect(generator.needsProcessing(new BooleanType(), () => false)).toBeFalsy();
    });

  });

  describe('generatePropertyAssignmentValue()', () => {

    it('should support strings', () => {

      const property = new Property();
      property.name = 'test-property';

      const stringType = new StringType();
      stringType.name = 'org-name';
      property.type = stringType;

      const fileKt = new FileKt('com.example.package', 'TestValidator');

      expect(generator.generatePropertyAssignmentValue(
          fileKt, spec, property, () => 'testProperty')
      ).toBe('OrgNameValidator.requireValidValue("testProperty", testProperty)');
    });

    it('should support empty strings', () => {

      const property = new Property();
      property.name = 'test-property';
      property.allowEmpty = true;

      const stringType = new StringType();
      stringType.name = 'org-name';
      property.type = stringType;

      const fileKt = new FileKt('com.example.package', 'TestValidator');

      expect(generator.generatePropertyAssignmentValue(
          fileKt, spec, property, () => 'testProperty')
      ).toBe('OrgNameValidator.requireValidValueOrEmpty("testProperty", testProperty)');
    });

    it('should support integers', () => {

      const property = new Property();
      property.name = 'test-property';

      const integerType = new IntegerType();
      integerType.name = 'person-age';
      property.type = integerType;

      const fileKt = new FileKt('com.example.package', 'TestValidator');

      expect(generator.generatePropertyAssignmentValue(
          fileKt, spec, property, () => 'testProperty')
      ).toBe('PersonAgeValidator.requireValidValue("testProperty", testProperty)');
    });

    it('should support nullable integers', () => {

      const property = new Property();
      property.name = 'test-property';
      property.allowNull = true;

      const integerType = new IntegerType();
      integerType.name = 'person-age';
      property.type = integerType;

      const fileKt = new FileKt('com.example.package', 'TestValidator');

      expect(generator.generatePropertyAssignmentValue(
          fileKt, spec, property, () => 'testProperty')
      ).toBe('PersonAgeValidator.requireValidValueOrNull("testProperty", testProperty)');
    });

    it('should support booleans', () => {

      const property = new Property();
      property.name = 'test-property';
      property.allowNull = true;

      const booleanType = new BooleanType();
      booleanType.name = 'terms-agreed';
      property.type = booleanType;

      const fileKt = new FileKt('com.example.package', 'TestValidator');

      expect(generator.generatePropertyAssignmentValue(
          fileKt, spec, property, () => 'testProperty')
      ).toBe('testProperty');

    });

    it('should support classes', () => {

      const property = new Property();
      property.name = 'test-property';
      property.allowNull = true;

      const classType = new ClassType();
      classType.name = 'work-address';
      property.type = classType;

      const fileKt = new FileKt('com.example.package', 'TestValidator');

      expect(generator.generatePropertyAssignmentValue(
          fileKt, spec, property, () => 'testProperty')
      ).toBe('testProperty');

    });

    it('should throw errors for unsupported types', () => {
      class UnsupportedTypeTest {}

      const property = new Property();
      property.name = 'test-property';
      property.allowNull = true;

      const unsupportedType = new UnsupportedTypeTest();
      property.type = <StringType>unsupportedType;

      const fileKt = new FileKt('com.example.package', 'TestValidator');

      expect(() => generator.generatePropertyAssignmentValue(
          fileKt, spec, property, () => 'testProperty')
      ).toThrowError('Unsupported type: UnsupportedTypeTest');
    });

  });

  describe('getStringForValidateProperty()', () => {

    it('should support simple strings', () => {

      const property = new Property();
      property.name = 'test-property';

      const stringType = new StringType();
      stringType.name = 'string-type';
      property.type = stringType;

      const fileKt = new FileKt('com.example.package', 'TestValidator');

      expect(generator.getStringForValidateProperty(spec, fileKt, property))
          .toBe('StringTypeValidator.validateValue(value, parser)');
    });

    it('should support empty strings', () => {

      const property = new Property();
      property.name = 'test-property';

      const stringType = new StringType();
      stringType.name = 'string-type';
      property.type = stringType;
      property.allowEmpty = true;

      const fileKt = new FileKt('com.example.package', 'TestValidator');

      expect(generator.getStringForValidateProperty(spec, fileKt, property))
          .toBe('StringTypeValidator.validateValueOrEmpty(value, parser)');
    });

    it('should support simple integers', () => {

      const property = new Property();
      property.name = 'test-property';

      const integerType = new IntegerType();
      integerType.name = 'integer-type';
      property.type = integerType;

      const fileKt = new FileKt('com.example.package', 'TestValidator');

      expect(generator.getStringForValidateProperty(spec, fileKt, property))
          .toBe('IntegerTypeValidator.validateValue(value, parser)');
    });

    it('should support nullable integers', () => {

      const property = new Property();
      property.name = 'test-property';

      const integerType = new IntegerType();
      integerType.name = 'integer-type';
      property.type = integerType;
      property.allowNull = true;

      const fileKt = new FileKt('com.example.package', 'TestValidator');

      expect(generator.getStringForValidateProperty(spec, fileKt, property))
          .toBe('IntegerTypeValidator.validateValueOrNull(value, parser)');
    });

    it('should support boolean', () => {

      const property = new Property();
      property.name = 'test-property';

      const booleanType = new BooleanType();
      booleanType.name = 'boolean-type';
      property.type = booleanType;

      const fileKt = new FileKt('com.example.package', 'TestValidator');

      expect(generator.getStringForValidateProperty(spec, fileKt, property))
          .toBe('');
    });

    it('should support classes', () => {

      const property = new Property();
      property.name = 'test-property';

      const classType = new ClassType();
      classType.name = 'class-type';
      property.type = classType;

      const fileKt = new FileKt('com.example.package', 'TestValidator');

      expect(generator.getStringForValidateProperty(spec, fileKt, property))
          .toBe('');
    });

    it('should throw error for unsupported type', () => {

      class UnsupportedTypeTest {}
      const unsupportedType = new UnsupportedTypeTest();

      const property = new Property();
      property.name = 'test-property';
      property.type = <StringType>unsupportedType;

      const fileKt = new FileKt('com.example.package', 'TestValidator');

      expect(() => generator.getStringForValidateProperty(spec, fileKt, property))
          .toThrowError('Unsupported type: UnsupportedTypeTest');
    });
  });

  describe('generateRequestPropertyAssignmentValue()', () => {

    it('should support strings', () => {
      const stringType = new StringType();
      stringType.name = 'org-name';

      const pathParameter = new PathParameter();
      pathParameter.typeRef = stringType;

      const parameterReference = new PathParameterReference();
      parameterReference.name = 'test-param';
      parameterReference.value = pathParameter;

      const fileKt = new FileKt('com.example.package', 'TestValidator');

      expect(generator.generateRequestPropertyAssignmentValue(
          fileKt, spec, parameterReference, () => 'testParam')
      ).toBe('OrgNameValidator.requireValidValue("testParam", testParam)');
    });

    it('should support integers', () => {

      const integerType = new IntegerType();
      integerType.name = 'person-age';

      const pathParameter = new PathParameter();
      pathParameter.typeRef = integerType;

      const parameterReference = new PathParameterReference();
      parameterReference.name = 'test-param';
      parameterReference.value = pathParameter;

      const fileKt = new FileKt('com.example.package', 'TestValidator');

      expect(generator.generateRequestPropertyAssignmentValue(
          fileKt, spec, parameterReference, () => 'testParam')
      ).toBe('PersonAgeValidator.requireValidValue("testParam", testParam)');
    });

    it('should support booleans', () => {

      const booleanType = new BooleanType();
      booleanType.name = 'terms-agreed';

      const pathParameter = new PathParameter();
      pathParameter.typeRef = booleanType;

      const parameterReference = new PathParameterReference();
      parameterReference.name = 'test-param';
      parameterReference.value = pathParameter;

      const fileKt = new FileKt('com.example.package', 'TestValidator');

      expect(generator.generateRequestPropertyAssignmentValue(
          fileKt, spec, parameterReference, () => 'testParam')
      ).toBe('testParam');

    });

    it('should support classes', () => {

      const classType = new ClassType();
      classType.name = 'work-address';

      const pathParameter = new PathParameter();
      pathParameter.typeRef = classType;

      const parameterReference = new PathParameterReference();
      parameterReference.name = 'test-param';
      parameterReference.value = pathParameter;

      const fileKt = new FileKt('com.example.package', 'TestValidator');

      expect(generator.generateRequestPropertyAssignmentValue(
          fileKt, spec, parameterReference, () => 'testParam')
      ).toBe('testParam');

    });

    it('should throw errors for unsupported types', () => {
      class UnsupportedTypeTest {}

      const unsupportedType = new UnsupportedTypeTest();

      const pathParameter = new PathParameter();
      pathParameter.typeRef = <StringType>unsupportedType;

      const parameterReference = new PathParameterReference();
      parameterReference.name = 'test-param';
      parameterReference.value = pathParameter;

      const fileKt = new FileKt('com.example.package', 'TestValidator');

      expect(() => generator.generateRequestPropertyAssignmentValue(
          fileKt, spec, parameterReference, () => 'testParam')
      ).toThrowError('Unsupported type: UnsupportedTypeTest');
    });

    it('should support body reference parameters', () => {
      const classType = new ClassType();
      classType.name = 'work-address';

      const parameterReference = new BodyParameterReference();
      parameterReference.name = 'test-param';
      parameterReference.typeRef = classType;

      const fileKt = new FileKt('com.example.package', 'TestValidator');

      expect(generator.generateRequestPropertyAssignmentValue(
          fileKt, spec, parameterReference, () => 'testParam')
      ).toBe('testParam');
    });

  });

  describe('init()', () => {

    it('should modify KotlinModelGenerator', () => {

      const modelGenerator = new KotlinModelGenerator();
      const modelNeedsProcessing = modelGenerator.needsProcessing;
      const modelGeneratePropertyAssignmentValue = modelGenerator.generatePropertyAssignmentValue;

      generator.init([modelGenerator]);

      // tslint:disable-next-line:triple-equals
      expect(modelNeedsProcessing != modelGenerator.needsProcessing)
          .toBeTruthy();

      // tslint:disable-next-line:triple-equals
      expect(modelGeneratePropertyAssignmentValue != modelGenerator.generatePropertyAssignmentValue)
          .toBeTruthy();
    });

    it('should enhance needsProcessing', () => {

      const modelGenerator = new KotlinModelGenerator();

      generator.init([modelGenerator]);

      expect(modelGenerator.needsProcessing(new IntegerType())).toBeTruthy();
    });

    it('should enhance generatePropertyAssignmentValue', () => {

      const modelGenerator = new KotlinModelGenerator();

      generator.init([modelGenerator]);

      const integerProperty = new Property();
      integerProperty.name = 'age';
      const integerType = new IntegerType();
      integerType.name = 'person-age';
      integerProperty.type = integerType;

      const fileKt = new FileKt('com.example.package', 'TestValidator');

      expect(modelGenerator.generatePropertyAssignmentValue(fileKt, spec, integerProperty))
          .toBe('PersonAgeValidator.requireValidValue("age", age)');
    });

    it('should modify KotlinJsonReaderGenerator', () => {

      const readerGenerator = new KotlinJsonReaderGenerator();
      const readerGetStringForValidateProperty = readerGenerator.getStringForValidateProperty;

      generator.init([readerGenerator]);

      // tslint:disable-next-line:triple-equals
      expect(readerGetStringForValidateProperty != readerGenerator.getStringForValidateProperty)
          .toBeTruthy();
    });

    it('should modify KotlinSpringMvcGenerator', () => {

      const mvcGenerator = new KotlinSpringMvcGenerator();

      const mvcNeedsProcessing = mvcGenerator.needsProcessing;
      const mvcGenerateParameterAssignmentValue
          = mvcGenerator.generateRequestPropertyAssignmentValue;

      generator.init([mvcGenerator]);

      // tslint:disable-next-line:triple-equals
      expect(mvcNeedsProcessing != mvcGenerator.needsProcessing)
          .toBeTruthy();

      // tslint:disable-next-line:triple-equals
      expect(mvcGenerateParameterAssignmentValue != mvcGenerator.generateRequestPropertyAssignmentValue)
          .toBeTruthy();
    });

    it('should enhance needsProcessing', () => {

      const mvcGenerator = new KotlinSpringMvcGenerator();

      generator.init([mvcGenerator]);

      expect(mvcGenerator.needsProcessing(new IntegerType())).toBeTruthy();
    });

    it('should enhance generateRequestPropertyAssignmentValue', () => {

      const mvcGenerator = new KotlinSpringMvcGenerator();

      generator.init([mvcGenerator]);

      const stringType = new StringType();
      stringType.name = 'org-name';

      const pathParameter = new PathParameter();
      pathParameter.typeRef = stringType;

      const parameterReference = new PathParameterReference();
      parameterReference.name = 'test-param';
      parameterReference.value = pathParameter;

      const fileKt = new FileKt('com.example.package', 'TestValidator');

      expect(mvcGenerator.generateRequestPropertyAssignmentValue(fileKt, spec, parameterReference))
          .toBe('OrgNameValidator.requireValidValue("testParam", testParam.blankOrNullToEmpty())');
    });

    it('should ignore other generators', () => {

      const validatorGenerator = new KotlinValidatorGenerator();

      generator.init([validatorGenerator]);
    });

  });

  describe('generateFiles()', () => {

    it('should filter out non-validating types', () => {
      const testContext = new MockGeneratorContext();

      const nonValidatingSpec = new Specification();
      nonValidatingSpec.name = 'testing';

      const booleanType = new BooleanType();
      booleanType.name = 'agreed';

      nonValidatingSpec.simpleTypes = [booleanType];

      generator.generateFiles(nonValidatingSpec, testContext);
      expect(testContext.outputPaths.length).toBe(0);
    });

    it('should support multiple validators', () => {
      const testContext = new MockGeneratorContext();

      const validatingSpec = new Specification();
      validatingSpec.name = 'testing';

      const integerType = new IntegerType();
      integerType.name = 'person-age';
      integerType.minimum = 0;
      integerType.maximum = 150;

      const stringType = new StringType();
      stringType.name = 'org-name';
      stringType.minLength = 1;
      stringType.maxLength = 100;
      stringType.pattern = '[a-zA-Z]+';

      validatingSpec.simpleTypes = [integerType, stringType];

      generator.generateFiles(validatingSpec, testContext);

      expect(testContext.outputPaths.length).toBe(2);

      expect(testContext.outputPaths[0]).toBe('testing/validator/PersonAgeValidator.kt');
      expect(testContext.contents[0]).toBe(`\
package testing.validator

import com.gantsign.restrulz.validation.ShortValidator

object PersonAgeValidator : ShortValidator(
        minimumValue = 0,
        maximumValue = 150)
`);

      expect(testContext.outputPaths[1]).toBe('testing/validator/OrgNameValidator.kt');
      expect(testContext.contents[1]).toBe(`\
package testing.validator

import com.gantsign.restrulz.validation.StringValidator

object OrgNameValidator : StringValidator(
        minimumLength = 1,
        maximumLength = 100,
        pattern = "[a-zA-Z]+")
`);
    });

  });

});
