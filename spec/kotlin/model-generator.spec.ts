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

import {KotlinModelGenerator} from '../../src/kotlin/model-generator';
import {
  ClassType,
  IntegerType,
  Property,
  Specification,
  StringType
} from '../../src/restrulz/model';
import {
  ClassKt,
  ConstructorPropertyKt,
  ExtensionFunctionKt,
  FileKt,
  FunctionKt,
  ParameterKt,
  PrimaryConstructorKt,
  PropertyKt,
  VisibilityKt
} from '../../src/kotlin/lang';
import {GeneratorContext} from '../../src/generator';
import {KotlinSerializer} from '../../src/kotlin/serializer';

describe('KotlinModelGenerator', () => {
  const generator = new KotlinModelGenerator();
  const serializer = new KotlinSerializer();
  const spec = new Specification();
  spec.name = 'testing';

  describe('assignableFrom()', () => {

    it('should support exact class', () => {
      expect(KotlinModelGenerator.assignableFrom(new KotlinModelGenerator()))
          .toBeTruthy()
    });

    it('should support sub-classes', () => {
      class TestGenerator extends KotlinModelGenerator {}

      expect(KotlinModelGenerator.assignableFrom(new TestGenerator()))
          .toBeTruthy()
    });

    it('should return false for non-matches', () => {

      expect(KotlinModelGenerator.assignableFrom(<KotlinModelGenerator>{}))
          .toBeFalsy()
    });
  });

  describe('needsProcessing()', () => {
    it('should return true for string', () => {

      expect(generator.needsProcessing(new StringType()))
          .toBeTruthy();
    });

    it('should return false for integer', () => {

      expect(generator.needsProcessing(new IntegerType()))
          .toBeFalsy();
    });
  });

  describe('addConstructorParameter()', () => {

    it('should support simple property without processing', () => {
      const constructorKt = new PrimaryConstructorKt();

      const integerType = new IntegerType();
      integerType.minimum = 0;
      integerType.maximum = 100;

      const property = new Property();
      property.name = 'test-property';
      property.type = integerType;

      generator.addConstructorParameter(constructorKt, spec, property);

      expect(constructorKt.parameters.length).toBe(1);
      const propertyKt = constructorKt.parameters[0];
      if (!(propertyKt instanceof ConstructorPropertyKt)) {
        fail(`Expected ConstructorPropertyKt but was ${propertyKt.constructor.name}`);
        return;
      }

      const {name, type} = propertyKt;

      expect(name).toBe('testProperty');
      expect(type.className).toBe('kotlin.Byte');
    });

    it('should support array property without processing', () => {
      const constructorKt = new PrimaryConstructorKt();

      const integerType = new IntegerType();
      integerType.minimum = 0;
      integerType.maximum = 100;

      const property = new Property();
      property.name = 'test-property';
      property.type = integerType;
      property.isArray = true;

      generator.addConstructorParameter(constructorKt, spec, property);

      expect(constructorKt.parameters.length).toBe(1);
      const propertyKt = constructorKt.parameters[0];
      if (!(propertyKt instanceof ConstructorPropertyKt)) {
        fail(`Expected ConstructorPropertyKt but was ${propertyKt.constructor.name}`);
        return;
      }

      const {name, type} = propertyKt;

      expect(name).toBe('testProperty');
      expect(type.className).toBe('kotlin.collections.List');
      expect(type.genericParameters.length).toBe(1);

      const genericType = type.genericParameters[0];
      expect(genericType.className).toBe('kotlin.Byte');
    });

    it('should support simple property with processing', () => {
      const constructorKt = new PrimaryConstructorKt();

      const stringType = new StringType();

      const property = new Property();
      property.name = 'test-property';
      property.type = stringType;

      generator.addConstructorParameter(constructorKt, spec, property);

      expect(constructorKt.parameters.length).toBe(1);
      const parameterKt = constructorKt.parameters[0];
      if (!(<any>parameterKt instanceof ParameterKt)) {
        fail(`Expected ParameterKt but was ${parameterKt.constructor.name}`);
        return;
      }

      const {name, type} = parameterKt;

      expect(name).toBe('testProperty');
      expect(type.className).toBe('kotlin.String');
    });

    it('should support array property with processing', () => {
      const constructorKt = new PrimaryConstructorKt();

      const stringType = new StringType();

      const property = new Property();
      property.name = 'test-property';
      property.type = stringType;
      property.isArray = true;

      generator.addConstructorParameter(constructorKt, spec, property);

      expect(constructorKt.parameters.length).toBe(1);
      const parameterKt = constructorKt.parameters[0];
      if (!(<any>parameterKt instanceof ParameterKt)) {
        fail(`Expected ParameterKt but was ${parameterKt.constructor.name}`);
        return;
      }

      const {name, type} = parameterKt;

      expect(name).toBe('testProperty');
      expect(type.className).toBe('kotlin.collections.List');
      expect(type.genericParameters.length).toBe(1);

      const genericType = type.genericParameters[0];
      expect(genericType.className).toBe('kotlin.String');
    });

  });


  describe('setConstructorParameters()', () => {

    it('should support multiple properties', () => {
      const classKt = new ClassKt('TestClass');

      const integerType = new IntegerType();
      integerType.minimum = 0;
      integerType.maximum = 100;

      const property1 = new Property();
      property1.name = 'test-property1';
      property1.type = integerType;

      const stringType = new StringType();

      const property2 = new Property();
      property2.name = 'test-property2';
      property2.type = stringType;

      generator.setConstructorParameters(classKt, spec, [property1, property2]);

      const {primaryConstructor} = classKt;

      expect(primaryConstructor.parameters.length).toBe(2);
      const propertyKt = primaryConstructor.parameters[0];
      const parameterKt = primaryConstructor.parameters[1];

      if (!(propertyKt instanceof ConstructorPropertyKt)) {
        fail(`Expected ConstructorPropertyKt but was ${propertyKt.constructor.name}`);
        return;
      }

      expect(propertyKt.name).toBe('testProperty1');
      expect(propertyKt.type.className).toBe('kotlin.Byte');

      if (!(<any>parameterKt instanceof ParameterKt)) {
        fail(`Expected ParameterKt but was ${parameterKt.constructor.name}`);
        return;
      }

      expect(parameterKt.name).toBe('testProperty2');
      expect(parameterKt.type.className).toBe('kotlin.String');
    });

  });

  describe('generatePropertyAssignmentValue()', () => {

    it('should support simple assignment', () => {
      const fileKt = new FileKt('com.example.package', 'TestClass');

      const integerType = new IntegerType();
      integerType.minimum = 0;
      integerType.maximum = 100;

      const property = new Property();
      property.name = 'test-property';
      property.type = integerType;

      expect(generator.generatePropertyAssignmentValue(fileKt, spec, property))
          .toBe('testProperty')
    });

    it('should support blank string processing', () => {
      const fileKt = new FileKt('com.example.package', 'TestClass');

      const stringType = new StringType();

      const property = new Property();
      property.name = 'test-property';
      property.type = stringType;

      expect(generator.generatePropertyAssignmentValue(fileKt, spec, property))
          .toBe('testProperty.blankOrNullToEmpty()')
    });
  });

  describe('addModelProperty()', () => {

    it('should support simple properties', () => {
      const classKt = new ClassKt('TestClass');
      const fileKt = new FileKt('com.example.package', 'TestClass');

      const stringType = new StringType();

      const property = new Property();
      property.name = 'test-property';
      property.type = stringType;

      generator.addModelProperty(classKt, spec, property);

      expect(classKt.members.length).toBe(1);

      const propertyKt = classKt.members[0];
      if (!(propertyKt instanceof PropertyKt)) {
        fail(`Expected ParameterKt but was ${propertyKt.constructor.name}`);
        return;
      }

      const {name, type, defaultValueFactory} = propertyKt;
      expect(name).toBe('testProperty');
      expect(type.className).toBe('kotlin.String');
      expect(defaultValueFactory(fileKt)).toBe('testProperty.blankOrNullToEmpty()')
    });

    it('should support array properties', () => {
      const classKt = new ClassKt('TestClass');
      const fileKt = new FileKt('com.example.package', 'TestClass');

      const stringType = new StringType();

      const property = new Property();
      property.name = 'test-property';
      property.type = stringType;
      property.isArray = true;

      generator.addModelProperty(classKt, spec, property);

      expect(classKt.members.length).toBe(1);

      const propertyKt = classKt.members[0];
      if (!(propertyKt instanceof PropertyKt)) {
        fail(`Expected ParameterKt but was ${propertyKt.constructor.name}`);
        return;
      }

      const {name, type, defaultValueFactory} = propertyKt;
      expect(name).toBe('testProperty');
      expect(type.className).toBe('kotlin.collections.List');
      expect(type.genericParameters.length).toBe(1);
      const genericType = type.genericParameters[0];
      expect(genericType.className).toBe('kotlin.String');
      expect(defaultValueFactory(fileKt)).toBe('testProperty.blankOrNullToEmpty()')
    });

  });

  describe('addModelProperties()', () => {

    it('should support multiple properties', () => {
      const classKt = new ClassKt('TestClass');
      const fileKt = new FileKt('com.example.package', 'TestClass');

      const stringType = new StringType();

      const property1 = new Property();
      property1.name = 'test-property1';
      property1.type = stringType;

      const property2 = new Property();
      property2.name = 'test-property2';
      property2.type = stringType;

      generator.addModelProperties(classKt, spec, [property1, property2]);

      expect(classKt.members.length).toBe(2);

      const propertyKt1 = classKt.members[0];
      if (!(propertyKt1 instanceof PropertyKt)) {
        fail(`Expected ParameterKt but was ${propertyKt1.constructor.name}`);
        return;
      }

      expect(propertyKt1.name).toBe('testProperty1');
      expect(propertyKt1.type.className).toBe('kotlin.String');
      expect(propertyKt1.defaultValueFactory(fileKt)).toBe('testProperty1.blankOrNullToEmpty()');

      const propertyKt2 = classKt.members[1];
      if (!(propertyKt2 instanceof PropertyKt)) {
        fail(`Expected ParameterKt but was ${propertyKt2.constructor.name}`);
        return;
      }

      expect(propertyKt2.name).toBe('testProperty2');
      expect(propertyKt2.type.className).toBe('kotlin.String');
      expect(propertyKt2.defaultValueFactory(fileKt)).toBe('testProperty2.blankOrNullToEmpty()');
    });

  });

  it('should filter non-string properties', () => {
    const classKt = new ClassKt('TestClass');
    const fileKt = new FileKt('com.example.package', 'TestClass');

    const integerType = new IntegerType();

    const property1 = new Property();
    property1.name = 'test-property1';
    property1.type = integerType;

    generator.addModelProperties(classKt, spec, [property1]);

    expect(classKt.members.length).toBe(0);
  });

  describe('addCopyFunctionParameter()', () => {

    it('should support simple property', () => {
      const functionKt = new FunctionKt('copy');

      const stringType = new StringType();

      const property1 = new Property();
      property1.name = 'test-property1';
      property1.type = stringType;

      generator.addCopyFunctionParameter(functionKt, spec, property1);

      expect(functionKt.parameters.length).toBe(1);

      const parameterKt = functionKt.parameters[0];
      const {name, type, defaultValue} = parameterKt;
      expect(name).toBe('testProperty1');
      expect(type.className).toBe('kotlin.String');
      expect(defaultValue).toBe('this.testProperty1');
    });

    it('should support array property', () => {
      const functionKt = new FunctionKt('copy');

      const stringType = new StringType();

      const property1 = new Property();
      property1.name = 'test-property1';
      property1.type = stringType;
      property1.isArray = true;

      generator.addCopyFunctionParameter(functionKt, spec, property1);

      expect(functionKt.parameters.length).toBe(1);

      const parameterKt = functionKt.parameters[0];
      const {name, type, defaultValue} = parameterKt;
      expect(name).toBe('testProperty1');
      expect(type.className).toBe('kotlin.collections.List');
      expect(type.genericParameters.length).toBe(1);
      const genericType = type.genericParameters[0];
      expect(genericType.className).toBe('kotlin.String');
      expect(defaultValue).toBe('this.testProperty1');
    });
  });

  describe('addCopyFunction()', () => {

    it('should support single property', () => {

      const fileKt = new FileKt('com.example.package', 'TestClass');
      const classKt = new ClassKt('TestClass');

      const stringType = new StringType();

      const property1 = new Property();
      property1.name = 'test-property1';
      property1.type = stringType;

      const classType = new ClassType();
      classType.name = 'test-class';

      generator.addCopyFunction(classKt, spec, classType, [property1]);

      expect(classKt.members.length).toBe(1);
      const functionKt = classKt.members[0];
      if (!FunctionKt.assignableFrom(functionKt)) {
        fail(`Expected FunctionKt but was ${functionKt.constructor.name}`);
        return;
      }

      expect(functionKt.parameters.length).toBe(1);

      const parameterKt1 = functionKt.parameters[0];
      expect(parameterKt1.name).toBe('testProperty1');
      expect(parameterKt1.type.className).toBe('kotlin.String');
      expect(parameterKt1.defaultValue).toBe('this.testProperty1');

      expect(serializer.serializeBody(fileKt, functionKt.body))
          .toBe('\nreturn TestClass(testProperty1 = testProperty1)\n');
    });

    it('should support multiple properties', () => {

      const fileKt = new FileKt('com.example.package', 'TestClass');
      const classKt = new ClassKt('TestClass');

      const stringType = new StringType();

      const property1 = new Property();
      property1.name = 'test-property1';
      property1.type = stringType;

      const property2 = new Property();
      property2.name = 'test-property2';
      property2.type = stringType;

      const classType = new ClassType();
      classType.name = 'test-class';

      generator.addCopyFunction(classKt, spec, classType, [property1, property2]);

      expect(classKt.members.length).toBe(1);
      const functionKt = classKt.members[0];
      if (!FunctionKt.assignableFrom(functionKt)) {
        fail(`Expected FunctionKt but was ${functionKt.constructor.name}`);
        return;
      }

      expect(functionKt.parameters.length).toBe(2);

      const parameterKt1 = functionKt.parameters[0];
      expect(parameterKt1.name).toBe('testProperty1');
      expect(parameterKt1.type.className).toBe('kotlin.String');
      expect(parameterKt1.defaultValue).toBe('this.testProperty1');

      const parameterKt2 = functionKt.parameters[1];
      expect(parameterKt2.name).toBe('testProperty2');
      expect(parameterKt2.type.className).toBe('kotlin.String');
      expect(parameterKt2.defaultValue).toBe('this.testProperty2');

      expect(serializer.serializeBody(fileKt, functionKt.body)).toBe(`
return TestClass(
        testProperty1 = testProperty1,
        testProperty2 = testProperty2)
`);
    });

    it('should support zero properties', () => {

      const fileKt = new FileKt('com.example.package', 'TestClass');
      const classKt = new ClassKt('TestClass');

      const classType = new ClassType();
      classType.name = 'test-class';

      generator.addCopyFunction(classKt, spec, classType, []);

      expect(classKt.members.length).toBe(1);
      const functionKt = classKt.members[0];
      if (!FunctionKt.assignableFrom(functionKt)) {
        fail(`Expected FunctionKt but was ${functionKt.constructor.name}`);
        return;
      }

      expect(functionKt.parameters.length).toBe(0);

      expect(serializer.serializeBody(fileKt, functionKt.body))
          .toBe('\nreturn TestClass()\n');
    });
  });

  describe('addModelClass()', () => {

    it('should support multiple properties', () => {

      const fileKt = new FileKt('com.example.package', 'TestClass');

      const stringType = new StringType();

      const property1 = new Property();
      property1.name = 'test-property1';
      property1.type = stringType;

      const property2 = new Property();
      property2.name = 'test-property2';
      property2.type = stringType;

      const classType = new ClassType();
      classType.name = 'test-class';
      classType.properties = [property1, property2];

      generator.addModelClass(fileKt, spec, classType);

      expect(fileKt.members.length).toBe(1);
      const classKt = fileKt.members[0];
      if (!(classKt instanceof ClassKt)) {
        fail(`Expected ClassKt but was ${classKt.constructor.name}`);
        return;
      }
      const {primaryConstructor} = classKt;

      expect(primaryConstructor.parameters.length).toBe(2);
      const constructorParamKt1 = primaryConstructor.parameters[0];
      const constructorParamKt2 = primaryConstructor.parameters[1];

      if (!(<any>constructorParamKt1 instanceof ParameterKt)) {
        fail(`Expected ParameterKt but was ${constructorParamKt1.constructor.name}`);
        return;
      }

      expect(constructorParamKt1.name).toBe('testProperty1');
      expect(constructorParamKt1.type.className).toBe('kotlin.String');

      if (!(<any>constructorParamKt2 instanceof ParameterKt)) {
        fail(`Expected ParameterKt but was ${constructorParamKt2.constructor.name}`);
        return;
      }

      expect(constructorParamKt2.name).toBe('testProperty2');
      expect(constructorParamKt2.type.className).toBe('kotlin.String');

      expect(classKt.members.length).toBe(3);

      const propertyKt1 = classKt.members[0];
      if (!(propertyKt1 instanceof PropertyKt)) {
        fail(`Expected ParameterKt but was ${propertyKt1.constructor.name}`);
        return;
      }

      expect(propertyKt1.name).toBe('testProperty1');
      expect(propertyKt1.type.className).toBe('kotlin.String');
      expect(propertyKt1.defaultValueFactory(fileKt)).toBe('testProperty1.blankOrNullToEmpty()');

      const propertyKt2 = classKt.members[1];
      if (!(propertyKt2 instanceof PropertyKt)) {
        fail(`Expected ParameterKt but was ${propertyKt2.constructor.name}`);
        return;
      }

      expect(propertyKt2.name).toBe('testProperty2');
      expect(propertyKt2.type.className).toBe('kotlin.String');
      expect(propertyKt2.defaultValueFactory(fileKt)).toBe('testProperty2.blankOrNullToEmpty()');

      const functionKt = classKt.members[2];
      if (!FunctionKt.assignableFrom(functionKt)) {
        fail(`Expected FunctionKt but was ${functionKt.constructor.name}`);
        return;
      }

      expect(functionKt.parameters.length).toBe(2);

      const parameterKt1 = functionKt.parameters[0];
      expect(parameterKt1.name).toBe('testProperty1');
      expect(parameterKt1.type.className).toBe('kotlin.String');
      expect(parameterKt1.defaultValue).toBe('this.testProperty1');

      const parameterKt2 = functionKt.parameters[1];
      expect(parameterKt2.name).toBe('testProperty2');
      expect(parameterKt2.type.className).toBe('kotlin.String');
      expect(parameterKt2.defaultValue).toBe('this.testProperty2');

      expect(serializer.serializeBody(fileKt, functionKt.body)).toBe(`
return TestClass(
        testProperty1 = testProperty1,
        testProperty2 = testProperty2)
`);
    });

    it('should support zero properties', () => {

      const fileKt = new FileKt('com.example.package', 'TestClass');

      const classType = new ClassType();
      classType.name = 'test-class';
      classType.properties = [];

      generator.addModelClass(fileKt, spec, classType);

      expect(fileKt.members.length).toBe(1);
      const classKt = fileKt.members[0];
      if (!(classKt instanceof ClassKt)) {
        fail(`Expected ClassKt but was ${classKt.constructor.name}`);
        return;
      }
      const {primaryConstructor} = classKt;

      expect(primaryConstructor).toBeUndefined();

      expect(classKt.members.length).toBe(1);

      const functionKt = classKt.members[0];
      if (!FunctionKt.assignableFrom(functionKt)) {
        fail(`Expected FunctionKt but was ${functionKt.constructor.name}`);
        return;
      }

      expect(functionKt.parameters.length).toBe(0);

      expect(serializer.serializeBody(fileKt, functionKt.body))
          .toBe('\nreturn TestClass()\n');
    });
  });

  describe('toModelFile()', () => {

    it('should support multiple properties', () => {

      const stringType = new StringType();

      const property1 = new Property();
      property1.name = 'test-property1';
      property1.type = stringType;

      const property2 = new Property();
      property2.name = 'test-property2';
      property2.type = stringType;

      const classType = new ClassType();
      classType.name = 'test-class';
      classType.properties = [property1, property2];

      const fileKt = generator.toModelFile(spec, classType);

      expect(fileKt.packageName).toBe('testing.model');
      expect(fileKt.fileName).toBe('TestClass');

      expect(fileKt.members.length).toBe(1);
      const classKt = fileKt.members[0];
      if (!(classKt instanceof ClassKt)) {
        fail(`Expected ClassKt but was ${classKt.constructor.name}`);
        return;
      }
      const {primaryConstructor} = classKt;

      expect(primaryConstructor.parameters.length).toBe(2);
      const constructorParamKt1 = primaryConstructor.parameters[0];
      const constructorParamKt2 = primaryConstructor.parameters[1];

      if (!(<any>constructorParamKt1 instanceof ParameterKt)) {
        fail(`Expected ParameterKt but was ${constructorParamKt1.constructor.name}`);
        return;
      }

      expect(constructorParamKt1.name).toBe('testProperty1');
      expect(constructorParamKt1.type.className).toBe('kotlin.String');

      if (!(<any>constructorParamKt2 instanceof ParameterKt)) {
        fail(`Expected ParameterKt but was ${constructorParamKt2.constructor.name}`);
        return;
      }

      expect(constructorParamKt2.name).toBe('testProperty2');
      expect(constructorParamKt2.type.className).toBe('kotlin.String');

      expect(classKt.members.length).toBe(3);

      const propertyKt1 = classKt.members[0];
      if (!(propertyKt1 instanceof PropertyKt)) {
        fail(`Expected ParameterKt but was ${propertyKt1.constructor.name}`);
        return;
      }

      expect(propertyKt1.name).toBe('testProperty1');
      expect(propertyKt1.type.className).toBe('kotlin.String');
      expect(propertyKt1.defaultValueFactory(fileKt)).toBe('testProperty1.blankOrNullToEmpty()');

      const propertyKt2 = classKt.members[1];
      if (!(propertyKt2 instanceof PropertyKt)) {
        fail(`Expected ParameterKt but was ${propertyKt2.constructor.name}`);
        return;
      }

      expect(propertyKt2.name).toBe('testProperty2');
      expect(propertyKt2.type.className).toBe('kotlin.String');
      expect(propertyKt2.defaultValueFactory(fileKt)).toBe('testProperty2.blankOrNullToEmpty()');

      const functionKt = classKt.members[2];
      if (!FunctionKt.assignableFrom(functionKt)) {
        fail(`Expected FunctionKt but was ${functionKt.constructor.name}`);
        return;
      }

      expect(functionKt.parameters.length).toBe(2);

      const parameterKt1 = functionKt.parameters[0];
      expect(parameterKt1.name).toBe('testProperty1');
      expect(parameterKt1.type.className).toBe('kotlin.String');
      expect(parameterKt1.defaultValue).toBe('this.testProperty1');

      const parameterKt2 = functionKt.parameters[1];
      expect(parameterKt2.name).toBe('testProperty2');
      expect(parameterKt2.type.className).toBe('kotlin.String');
      expect(parameterKt2.defaultValue).toBe('this.testProperty2');

      expect(serializer.serializeBody(fileKt, functionKt.body)).toBe(`
return TestClass(
        testProperty1 = testProperty1,
        testProperty2 = testProperty2)
`);
    });

  });

  class MockGeneratorContext implements GeneratorContext {
    outputPaths: string[] = [];
    contents: string[] = [];

    writeJsonToFile(filePath: string, data: any): void {
      throw new Error('Method not implemented.');
    }

    writeYamlToFile(filePath: string, data: any): void {
      throw new Error('Method not implemented.');
    }

    writeStringToFile(filePath: string, data: any): void {
      this.outputPaths.push(filePath);
      this.contents.push(data);
    }
  }

  describe('generateModelFiles()', () => {

    it('should support multiple properties', () => {

      const stringType = new StringType();

      const property1 = new Property();
      property1.name = 'test-property1';
      property1.type = stringType;

      const property2 = new Property();
      property2.name = 'test-property2';
      property2.type = stringType;

      const classType = new ClassType();
      classType.name = 'test-class';
      classType.properties = [property1, property2];

      const completeSpec = new Specification();
      completeSpec.name = 'testing';
      completeSpec.classTypes = [classType];

      const context = new MockGeneratorContext();

      generator.generateModelFiles(completeSpec, context);

      expect(context.outputPaths[0]).toBe('testing/model/TestClass.kt');
      expect(context.contents[0]).toBe(`\
package testing.model

import com.gantsign.restrulz.util.string.blankOrNullToEmpty

class TestClass(
        testProperty1: String,
        testProperty2: String) {

    val testProperty1: String
            = testProperty1.blankOrNullToEmpty()
    val testProperty2: String
            = testProperty2.blankOrNullToEmpty()

    fun copy(
            testProperty1: String = this.testProperty1,
            testProperty2: String = this.testProperty2): TestClass {

        return TestClass(
                testProperty1 = testProperty1,
                testProperty2 = testProperty2)
    }
}
`);
    });

  });

  describe('generateFiles()', () => {

    it('should support multiple properties', () => {

      const stringType = new StringType();

      const property1 = new Property();
      property1.name = 'test-property1';
      property1.type = stringType;

      const property2 = new Property();
      property2.name = 'test-property2';
      property2.type = stringType;

      const classType = new ClassType();
      classType.name = 'test-class';
      classType.properties = [property1, property2];

      const completeSpec = new Specification();
      completeSpec.name = 'testing';
      completeSpec.classTypes = [classType];

      const context = new MockGeneratorContext();

      generator.generateFiles(completeSpec, context);

      expect(context.outputPaths[0]).toBe('testing/model/TestClass.kt');
      expect(context.contents[0]).toBe(`\
package testing.model

import com.gantsign.restrulz.util.string.blankOrNullToEmpty

class TestClass(
        testProperty1: String,
        testProperty2: String) {

    val testProperty1: String
            = testProperty1.blankOrNullToEmpty()
    val testProperty2: String
            = testProperty2.blankOrNullToEmpty()

    fun copy(
            testProperty1: String = this.testProperty1,
            testProperty2: String = this.testProperty2): TestClass {

        return TestClass(
                testProperty1 = testProperty1,
                testProperty2 = testProperty2)
    }
}
`);
    });

  });
});
