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

import {KotlinSerializer} from '../../src/kotlin/serializer';
import {
  AnnotationKt,
  BodyKt,
  ClassKt,
  ClassMemberKt,
  ConstructorPropertyKt,
  CompanionObjectKt,
  DynamicLineKt,
  ExtendsKt,
  ExtensionFunctionKt,
  FileKt,
  FileMemberKt,
  FunctionCallKt,
  FunctionKt,
  FunctionSignatureKt,
  IfBlockKt,
  InitBlockKt,
  InterfaceKt,
  ImplementsKt,
  LineKt,
  ObjectKt,
  ParameterKt,
  PrimaryConstructorKt,
  PropertyKt,
  TextKt,
  TryBlockKt,
  TypeSignatureKt,
  VisibilityKt,
  WhenCaseKt,
  WhenKt,
  WhileBlockKt
} from '../../src/kotlin/lang';

function createFile() {
  return new FileKt('com.example.package', 'Test');
}

describe('KotlinSerializer', () => {

  const serializer = new KotlinSerializer();

  describe('indent()', () => {
    it('should indent multiple line', () => {
      expect(serializer.indent('a\nb\n')).toBe('    a\n    b\n')
    });
    it('should not indent empty lines', () => {
      expect(serializer.indent('a\n\nb\n')).toBe('    a\n\n    b\n')
    });
  });

  describe('getVisibilityPrefix()', () => {
    it('should return empty string for public visibility', () => {
      expect(serializer.getVisibilityPrefix(VisibilityKt.Public)).toBe('');
    });
    it('should return the correct prefix for private visibility', () => {
      expect(serializer.getVisibilityPrefix(VisibilityKt.Private)).toBe('private ');
    });
    it('should return the correct prefix for protected visibility', () => {
      expect(serializer.getVisibilityPrefix(VisibilityKt.Protected)).toBe('protected ');
    });
    it('should return the correct prefix for protected internal', () => {
      expect(serializer.getVisibilityPrefix(VisibilityKt.Internal)).toBe('internal ');
    });
    it('should throw an error for unsupported visibility values', () => {
      expect(() => serializer.getVisibilityPrefix(-1))
          .toThrowError('Unexpected visibility value: -1');
    });
  });

  describe('serializeTypeSignature()', () => {
    it('should support simple types', () => {
      const fileKt = createFile();
      const typeSignatureKt = new TypeSignatureKt('com.example.Type');

      expect(serializer.serializeTypeSignature(fileKt, typeSignatureKt)).toBe('Type');
      expect(fileKt.importMapping['com.example.Type']).toBe('Type');
    });

    it('should support fully qualified types', () => {
      const fileKt = createFile();
      fileKt.tryImport('com.example.other.Type');
      const typeSignatureKt = new TypeSignatureKt('com.example.Type');

      expect(serializer.serializeTypeSignature(fileKt, typeSignatureKt)).toBe('com.example.Type');
      expect(fileKt.importMapping['com.example.Type']).toBeUndefined();
    });

    it('should support nullable types', () => {
      const fileKt = createFile();
      const typeSignatureKt = new TypeSignatureKt('com.example.Type');
      typeSignatureKt.isNullable = true;

      expect(serializer.serializeTypeSignature(fileKt, typeSignatureKt)).toBe('Type?');
      expect(fileKt.importMapping['com.example.Type']).toBe('Type');
    });

    it('should support generic types', () => {
      const fileKt = createFile();
      const typeSignatureKt = new TypeSignatureKt('java.util.Map');
      typeSignatureKt.addGenericParameter('java.lang.String');
      typeSignatureKt.addGenericParameterNullable('java.lang.Integer');

      expect(serializer.serializeTypeSignature(fileKt, typeSignatureKt)).toBe('Map\<String, Integer?>');
      expect(fileKt.importMapping['java.util.Map']).toBe('Map');
      expect(fileKt.importMapping['java.lang.String']).toBe('String');
      expect(fileKt.importMapping['java.lang.Integer']).toBe('Integer');
    });

    it('should support nested generic types', () => {
      const fileKt = createFile();
      const nestedSignatureKt = new TypeSignatureKt('java.util.Map');
      nestedSignatureKt.addGenericParameter('java.lang.String');
      nestedSignatureKt.addGenericParameterNullable('java.lang.Integer');

      const typeSignatureKt = new TypeSignatureKt('java.util.List');
      typeSignatureKt.genericParameters.push(nestedSignatureKt);

      expect(serializer.serializeTypeSignature(fileKt, typeSignatureKt)).toBe('List\<Map\<String, Integer?>>');
      expect(fileKt.importMapping['java.util.List']).toBe('List');
      expect(fileKt.importMapping['java.util.Map']).toBe('Map');
      expect(fileKt.importMapping['java.lang.String']).toBe('String');
      expect(fileKt.importMapping['java.lang.Integer']).toBe('Integer');
    });
  });

  describe('serializeAnnotationParameter()', () => {
    it('should support default parameter', () => {
      const fileKt = createFile();
      const annotationKt = new AnnotationKt('com.example.Ann1');
      annotationKt.addSimpleParameter('value', '"test1"');
      const parameterKt = annotationKt.parameters[0];

      expect(serializer.serializeAnnotationParameter(fileKt, annotationKt, parameterKt))
          .toBe('"test1"');
    });

    it('should support explicit parameter', () => {
      const fileKt = createFile();
      const annotationKt = new AnnotationKt('com.example.Ann1');
      annotationKt.addSimpleParameter('param1', '"test1"');
      const parameterKt = annotationKt.parameters[0];

      expect(serializer.serializeAnnotationParameter(fileKt, annotationKt, parameterKt))
          .toBe('param1 = "test1"');
    });

    it('should support multiple parameters', () => {
      const fileKt = createFile();
      const annotationKt = new AnnotationKt('com.example.Ann1');
      annotationKt.addSimpleParameter('value', '"test1"');
      annotationKt.addSimpleParameter('param2', '"test2"');
      const parameterKt1 = annotationKt.parameters[0];
      const parameterKt2 = annotationKt.parameters[1];

      expect(serializer.serializeAnnotationParameter(fileKt, annotationKt, parameterKt1))
          .toBe('value = "test1"');
      expect(serializer.serializeAnnotationParameter(fileKt, annotationKt, parameterKt2))
          .toBe('param2 = "test2"');
    });
  });

  describe('serializeAnnotation()', () => {
    it('should support annotation without parameters', () => {
      const fileKt = createFile();
      const annotationKt = new AnnotationKt('com.example.Ann1');

      expect(serializer.serializeAnnotation(fileKt, annotationKt)).toBe('@Ann1');
    });

    it('should support fully qualified annotation', () => {
      const fileKt = createFile();
      fileKt.importMapping['com.example.other.Ann1'] = 'Ann1';
      const annotationKt = new AnnotationKt('com.example.Ann1');

      expect(serializer.serializeAnnotation(fileKt, annotationKt)).toBe('@com.example.Ann1');
    });

    it('should support parameters', () => {
      const fileKt = createFile();
      const annotationKt = new AnnotationKt('com.example.Ann1');
      annotationKt.addSimpleParameter('value', '"test1"');
      annotationKt.addSimpleParameter('param2', '"test2"');

      expect(serializer.serializeAnnotation(fileKt, annotationKt))
          .toBe('@Ann1(value = "test1", param2 = "test2")');
    });
  });

  describe('serializeParameterKt()', () => {
    it('should support simple parameters', () => {
      const fileKt = createFile();
      const parameterKt = new ParameterKt('param1');
      parameterKt.type = new TypeSignatureKt('kotlin.String');

      expect(serializer.serializeParameterKt(fileKt, parameterKt))
          .toBe('param1: String');
    });

    it('should support annotated parameters', () => {
      const fileKt = createFile();
      const parameterKt = new ParameterKt('param1');
      parameterKt.addAnnotation('com.example.Ann1');
      parameterKt.addAnnotation('com.example.Ann2', annotation => {
        annotation.addSimpleParameter('value', '"test1"');
      });
      parameterKt.type = new TypeSignatureKt('kotlin.String');

      expect(serializer.serializeParameterKt(fileKt, parameterKt))
          .toBe('@Ann1 @Ann2("test1") param1: String');
    });

    it('should support defaultValues', () => {
      const fileKt = createFile();
      const parameterKt = new ParameterKt('param1');
      parameterKt.type = new TypeSignatureKt('kotlin.String');
      parameterKt.defaultValue = '"test1"';

      expect(serializer.serializeParameterKt(fileKt, parameterKt))
          .toBe('param1: String = "test1"');
    });

    it('should support immutable properties', () => {
      const fileKt = createFile();
      const propertyKt = new ConstructorPropertyKt('param1');
      propertyKt.type = new TypeSignatureKt('kotlin.String');

      expect(serializer.serializeParameterKt(fileKt, propertyKt))
          .toBe('val param1: String');
    });

    it('should support mutable properties', () => {
      const fileKt = createFile();
      const propertyKt = new ConstructorPropertyKt('param1');
      propertyKt.isMutable = true;
      propertyKt.type = new TypeSignatureKt('kotlin.String');

      expect(serializer.serializeParameterKt(fileKt, propertyKt))
          .toBe('var param1: String');
    });

    it('should support propertyKt visibility', () => {
      const fileKt = createFile();
      const propertyKt = new ConstructorPropertyKt('param1');
      propertyKt.type = new TypeSignatureKt('kotlin.String');
      propertyKt.visibility = VisibilityKt.Private;

      expect(serializer.serializeParameterKt(fileKt, propertyKt))
          .toBe('private val param1: String');
    });
  });

  describe('serializeProperty()', () => {

    it('should support immutable properties', () => {
      const fileKt = createFile();
      const propertyKt = new PropertyKt('prop1');
      propertyKt.type = new TypeSignatureKt('kotlin.String');

      expect(serializer.serializeProperty(fileKt, propertyKt)).toBe('val prop1: String\n');
    });

    it('should support mutable properties', () => {
      const fileKt = createFile();
      const propertyKt = new PropertyKt('prop1');
      propertyKt.isMutable = true;
      propertyKt.type = new TypeSignatureKt('kotlin.String');

      expect(serializer.serializeProperty(fileKt, propertyKt)).toBe('var prop1: String\n');
    });

    it('should support overrides', () => {
      const fileKt = createFile();
      const propertyKt = new PropertyKt('prop1');
      propertyKt.overrides = true;
      propertyKt.type = new TypeSignatureKt('kotlin.String');

      expect(serializer.serializeProperty(fileKt, propertyKt)).toBe('override val prop1: String\n');
    });

    it('should support defaultValues', () => {
      const fileKt = createFile();
      const propertyKt = new PropertyKt('prop1');
      propertyKt.type = new TypeSignatureKt('kotlin.String');
      propertyKt.setSimpleDefaultValue('"test1"');

      expect(serializer.serializeProperty(fileKt, propertyKt))
          .toBe('val prop1: String = "test1"\n');
    });

    it('should support defaultValues with wrapped assignment', () => {
      const fileKt = createFile();
      const propertyKt = new PropertyKt('prop1');
      propertyKt.type = new TypeSignatureKt('kotlin.String');
      propertyKt.setSimpleDefaultValue('"test1"');
      propertyKt.wrapAssignment = true;

      expect(serializer.serializeProperty(fileKt, propertyKt))
          .toBe(`\
val prop1: String
        = "test1"
`);
    });

    it('should support propertyKt visibility', () => {
      const fileKt = createFile();
      const propertyKt = new PropertyKt('prop1');
      propertyKt.type = new TypeSignatureKt('kotlin.String');
      propertyKt.visibility = VisibilityKt.Private;

      expect(serializer.serializeProperty(fileKt, propertyKt)).toBe('private val prop1: String\n');
    });

    it('should support getters', () => {
      const fileKt = createFile();
      const propertyKt = new PropertyKt('prop1');
      propertyKt.type = new TypeSignatureKt('kotlin.String');
      propertyKt.setGetter(bodyKt => {
        bodyKt.writeLn('return "test1"');
      });

      expect(serializer.serializeProperty(fileKt, propertyKt))
          .toBe(`\
val prop1: String
    get() {
        return "test1"
    }
`);
    });
  });

  describe('serializeInitBlock()', () => {

    it('should support init block', () => {
      const fileKt = createFile();
      const bodyKt = new BodyKt();
      bodyKt.writeLn('throw RuntimeException()');
      const initBlockKt = new InitBlockKt(bodyKt);

      expect(serializer.serializeInitBlock(fileKt, initBlockKt))
          .toBe(`\
init {
    throw RuntimeException()
}
`);
    });
  });

  describe('serializeFunctionSignature()', () => {

    it('should support simple functions', () => {
      const fileKt = createFile();
      const functionKt = new FunctionSignatureKt('test1');

      expect(serializer.serializeFunctionSignature(fileKt, functionKt))
          .toBe(`\
fun test1()
`);
    });

    it('should support annotated functions', () => {
      const fileKt = createFile();
      const functionKt = new FunctionSignatureKt('test1');
      functionKt.addAnnotation('com.example.Ann1');
      functionKt.addAnnotation('com.example.Ann2', annotation => {
        annotation.addSimpleParameter('value', '"test1"');
      });

      expect(serializer.serializeFunctionSignature(fileKt, functionKt))
          .toBe(`\
@Ann1
@Ann2("test1")
fun test1()
`);
    });

    it('should support single parameter', () => {
      const fileKt = createFile();
      const functionKt = new FunctionSignatureKt('test1');
      functionKt.addParameter('param1', 'kotlin.String');

      expect(serializer.serializeFunctionSignature(fileKt, functionKt))
          .toBe('fun test1(param1: String)\n');
    });

    it('should support always wrap parameter', () => {
      const fileKt = createFile();
      const functionKt = new FunctionSignatureKt('test1');
      functionKt.alwaysWrapParameters = true;
      functionKt.addParameter('param1', 'kotlin.String');

      expect(serializer.serializeFunctionSignature(fileKt, functionKt))
          .toBe(`fun test1(
        param1: String)
`);
    });

    it('should support wrap after parameters', () => {
      const fileKt = createFile();
      const functionKt = new FunctionSignatureKt('test1');
      functionKt.wrapAfterParameters = true;
      functionKt.addParameter('param1', 'kotlin.String');

      expect(serializer.serializeFunctionSignature(fileKt, functionKt))
          .toBe('fun test1(param1: String\n)\n');
    });

    it('should support parameters', () => {
      const fileKt = createFile();
      const functionKt = new FunctionSignatureKt('test1');
      functionKt.addParameter('param1', 'kotlin.String');
      functionKt.addParameterNullable('param2', 'kotlin.String');
      functionKt.addParameter('param3', 'kotlin.String', (parameterKt, typeSignatureKt) => {
        parameterKt.defaultValue = '"test2"';
        typeSignatureKt.isNullable = true;
      });

      expect(serializer.serializeFunctionSignature(fileKt, functionKt))
          .toBe(`\
fun test1(
        param1: String,
        param2: String?,
        param3: String? = "test2")
`);
    });

    it('should return type', () => {
      const fileKt = createFile();
      const functionKt = new FunctionSignatureKt('test1');
      functionKt.setReturnTypeNullable('kotlin.String');

      expect(serializer.serializeFunctionSignature(fileKt, functionKt))
          .toBe(`\
fun test1(): String?
`);
    });
  });

  describe('serializeFunction()', () => {

    it('should support simple function', () => {
      const fileKt = createFile();
      const functionKt = new FunctionKt('test1');
      functionKt.body.writeLn('throw RuntimeException()');

      expect(serializer.serializeFunction(fileKt, functionKt))
          .toBe(`\
fun test1() {
    throw RuntimeException()
}
`);
    });

    it('should support annotated functions', () => {
      const fileKt = createFile();
      const functionKt = new FunctionKt('test1');
      functionKt.addAnnotation('com.example.Ann1');
      functionKt.addAnnotation('com.example.Ann2', annotation => {
        annotation.addSimpleParameter('value', '"test1"');
      });
      functionKt.body.writeLn('throw RuntimeException()');

      expect(serializer.serializeFunction(fileKt, functionKt))
          .toBe(`\
@Ann1
@Ann2("test1")
fun test1() {
    throw RuntimeException()
}
`);
    });

    it('should support overrides', () => {
      const fileKt = createFile();
      const functionKt = new FunctionKt('test1');
      functionKt.overrides = true;
      functionKt.body.writeLn('throw RuntimeException()');

      expect(serializer.serializeFunction(fileKt, functionKt))
          .toBe(`\
override fun test1() {
    throw RuntimeException()
}
`);
    });

    it('should support parameters', () => {
      const fileKt = createFile();
      const functionKt = new FunctionKt('test1');
      functionKt.addParameter('param1', 'kotlin.String');
      functionKt.addParameterNullable('param2', 'kotlin.String');
      functionKt.addParameter('param3', 'kotlin.String', (parameterKt, typeSignatureKt) => {
        parameterKt.defaultValue = '"test2"';
        typeSignatureKt.isNullable = true;
      });
      functionKt.body.writeLn('throw RuntimeException()');

      expect(serializer.serializeFunction(fileKt, functionKt))
          .toBe(`\
fun test1(
        param1: String,
        param2: String?,
        param3: String? = "test2") {
    throw RuntimeException()
}
`);
    });

    it('should return type', () => {
      const fileKt = createFile();
      const functionKt = new FunctionKt('test1');
      functionKt.setReturnTypeNullable('kotlin.String');
      functionKt.body.writeLn('throw RuntimeException()');

      expect(serializer.serializeFunction(fileKt, functionKt))
          .toBe(`\
fun test1(): String? {
    throw RuntimeException()
}
`);
    });
  });

  describe('serializeExtensionFunction()', () => {

    it('should support simple function', () => {
      const fileKt = createFile();
      const functionKt = new ExtensionFunctionKt('test1');
      functionKt.extendedType = new TypeSignatureKt('kotlin.String');
      functionKt.body.writeLn('throw RuntimeException()');

      expect(serializer.serializeExtensionFunction(fileKt, functionKt))
          .toBe(`\
fun String.test1() {
    throw RuntimeException()
}
`);
    });

    it('should support parameters', () => {
      const fileKt = createFile();
      const functionKt = new ExtensionFunctionKt('test1');
      functionKt.extendedType = new TypeSignatureKt('kotlin.String');
      functionKt.addParameter('param1', 'kotlin.String');
      functionKt.addParameterNullable('param2', 'kotlin.String');
      functionKt.addParameter('param3', 'kotlin.String', (parameterKt, typeSignatureKt) => {
        parameterKt.defaultValue = '"test2"';
        typeSignatureKt.isNullable = true;
      });
      functionKt.body.writeLn('throw RuntimeException()');

      expect(serializer.serializeExtensionFunction(fileKt, functionKt))
          .toBe(`\
fun String.test1(
        param1: String,
        param2: String?,
        param3: String? = "test2") {
    throw RuntimeException()
}
`);
    });

    it('should return type', () => {
      const fileKt = createFile();
      const functionKt = new ExtensionFunctionKt('test1');
      functionKt.extendedType = new TypeSignatureKt('kotlin.String');
      functionKt.setReturnTypeNullable('kotlin.String');
      functionKt.body.writeLn('throw RuntimeException()');

      expect(serializer.serializeExtensionFunction(fileKt, functionKt))
          .toBe(`\
fun String.test1(): String? {
    throw RuntimeException()
}
`);
    });
  });

  describe('serializeClassMember()', () => {

    it('should support properties', () => {
      const fileKt = createFile();
      const propertyKt = new PropertyKt('prop1');
      propertyKt.type = new TypeSignatureKt('kotlin.String');

      expect(serializer.serializeClassMember(fileKt, propertyKt)).toBe('val prop1: String\n');
    });

    it('should support init block', () => {
      const fileKt = createFile();
      const bodyKt = new BodyKt();
      bodyKt.writeLn('throw RuntimeException()');
      const initBlockKt = new InitBlockKt(bodyKt);

      expect(serializer.serializeClassMember(fileKt, initBlockKt))
          .toBe(`\
init {
    throw RuntimeException()
}
`);
    });

    it('should support functions', () => {
      const fileKt = createFile();
      const functionKt = new FunctionKt('test1');
      functionKt.body.writeLn('throw RuntimeException()');

      expect(serializer.serializeClassMember(fileKt, functionKt))
          .toBe(`\
fun test1() {
    throw RuntimeException()
}
`);
    });

    it('should throw error for unsupported type', () => {
      class ExampleUnsupportedType implements ClassMemberKt { }

      const fileKt = createFile();
      const unsupported = new ExampleUnsupportedType();

      expect(() => serializer.serializeClassMember(fileKt, unsupported))
          .toThrowError('Unexpected ClassMember type: ExampleUnsupportedType');
    });
  });

  describe('serializePrimaryConstructor()', () => {

    it('should return empty string for null constructor', () => {
      const fileKt = createFile();

      expect(serializer.serializePrimaryConstructor(fileKt, null)).toBe('');
    });

    it('should return empty string for empty public constructor', () => {
      const fileKt = createFile();
      const constructorKt = new PrimaryConstructorKt();

      expect(serializer.serializePrimaryConstructor(fileKt, constructorKt)).toBe('');
    });

    it('should support constructor visibility', () => {
      const fileKt = createFile();
      const constructorKt = new PrimaryConstructorKt();
      constructorKt.visibility = VisibilityKt.Private;

      expect(serializer.serializePrimaryConstructor(fileKt, constructorKt))
          .toBe(' private constructor()');
    });

    it('should support single constructor parameter', () => {
      const fileKt = createFile();
      const constructorKt = new PrimaryConstructorKt();
      constructorKt.addParameter('name1', 'kotlin.String');

      expect(serializer.serializePrimaryConstructor(fileKt, constructorKt))
          .toBe('(name1: String)');
    });

    it('should support always wrap parameter', () => {
      const fileKt = createFile();
      const constructorKt = new PrimaryConstructorKt();
      constructorKt.alwaysWrapParameters = true;
      constructorKt.addParameter('name1', 'kotlin.String');

      expect(serializer.serializePrimaryConstructor(fileKt, constructorKt))
          .toBe(`(
        name1: String)`);
    });

    it('should support constructor parameters', () => {
      const fileKt = createFile();
      const constructorKt = new PrimaryConstructorKt();
      constructorKt.addParameter('name1', 'kotlin.String');
      constructorKt.addParameter('name2', 'kotlin.String', typeSignatureKt => {
        typeSignatureKt.isNullable = true;
      });
      constructorKt.addProperty('name3', 'kotlin.String');
      constructorKt.addProperty('name4', 'kotlin.String', (constructorPropertyKt, typeSignatureKt) => {
        constructorPropertyKt.isMutable = true;
        typeSignatureKt.isNullable = true;
      });

      expect(serializer.serializePrimaryConstructor(fileKt, constructorKt))
          .toBe(`(
        name1: String,
        name2: String?,
        val name3: String,
        var name4: String?)`);
    });
  });

  describe('serializeCompanionObjectMember()', () => {

    it('should support functions', () => {
      const fileKt = createFile();
      const functionKt = new FunctionKt('test1');
      functionKt.body.writeLn('throw RuntimeException()');

      expect(serializer.serializeCompanionObjectMember(fileKt, functionKt))
          .toBe(`\
fun test1() {
    throw RuntimeException()
}
`);
    });

    it('should throw error for unsupported type', () => {
      class ExampleUnsupportedType implements ClassMemberKt { }

      const fileKt = createFile();
      const unsupported = new ExampleUnsupportedType();

      expect(() => serializer.serializeCompanionObjectMember(fileKt, unsupported))
          .toThrowError('Unexpected CompanionObjectMember type: ExampleUnsupportedType');
    });
  });

  describe('serializeCompanionObject()', () => {

    it('should support members', () => {
      const fileKt = createFile();
      const companionObjectKt = new CompanionObjectKt();
      companionObjectKt.addFunction('test1', bodyKt => {
        bodyKt.writeLn('throw RuntimeException()');
      });
      companionObjectKt.addFunction('test2', bodyKt => {
        bodyKt.writeLn('throw RuntimeException()');
      });

      expect(serializer.serializeCompanionObject(fileKt, companionObjectKt))
          .toBe(`\
companion object {

    fun test1() {
        throw RuntimeException()
    }

    fun test2() {
        throw RuntimeException()
    }
}
`);
    });
  });

  describe('serializeClassImplementsOrExtends()', () => {

    it('should support implements', () => {
      const fileKt = createFile();
      const implementsKt = new ImplementsKt(new TypeSignatureKt('com.example.TestInterface'));

      expect(serializer.serializeClassImplementsOrExtends(fileKt, implementsKt))
          .toBe('TestInterface');
    });

    it('should support extends', () => {
      const fileKt = createFile();
      const implementsKt = new ExtendsKt(new TypeSignatureKt('com.example.TestClass'));

      expect(serializer.serializeClassImplementsOrExtends(fileKt, implementsKt))
          .toBe('TestClass()');
    });

    it('should support extends with arguments', () => {
      const fileKt = createFile();
      const implementsKt = new ExtendsKt(new TypeSignatureKt('com.example.TestClass'));
      implementsKt.addSimpleArgument('test1', '"value1"');
      implementsKt.addSimpleArgument('test2', '"value2"');

      expect(serializer.serializeClassImplementsOrExtends(fileKt, implementsKt))
          .toBe('TestClass(test1 = "value1", test2 = "value2")');
    });

    it('should support extends with wrap arguments', () => {
      const fileKt = createFile();
      const implementsKt = new ExtendsKt(new TypeSignatureKt('com.example.TestClass'));
      implementsKt.addSimpleArgument('test1', '"value1"');
      implementsKt.addSimpleArgument('test2', '"value2"');
      implementsKt.wrapArguments = true;

      expect(serializer.serializeClassImplementsOrExtends(fileKt, implementsKt))
          .toBe(`TestClass(
        test1 = "value1",
        test2 = "value2")`);
    });
  });

  describe('serializeClass()', () => {

    it('should support empty classes', () => {
      const fileKt = createFile();
      const classKt = new ClassKt('TestClass');

      expect(serializer.serializeClass(fileKt, classKt))
          .toBe('class TestClass\n');
    });

    it('should support empty objects', () => {
      const fileKt = createFile();
      const classKt = new ObjectKt('TestObject');

      expect(serializer.serializeClass(fileKt, classKt))
          .toBe('object TestObject\n');
    });

    it('should support data classes', () => {
      const fileKt = createFile();
      const classKt = new ClassKt('TestClass');
      classKt.dataClass = true;
      classKt.setPrimaryConstructor(constructor => {
        constructor.addProperty('test1', 'kotlin.String');
      });

      expect(serializer.serializeClass(fileKt, classKt))
          .toBe(`\
data class TestClass(val test1: String)
`);
    });

    it('should support annotations', () => {
      const fileKt = createFile();
      const classKt = new ClassKt('TestClass');

      classKt.addAnnotation('com.example.Ann1');
      classKt.addAnnotation('com.example.Ann2', annotationKt => {
        annotationKt.addSimpleParameter('value', '"test1"');
      });

      expect(serializer.serializeClass(fileKt, classKt))
          .toBe(`\
@Ann1
@Ann2("test1")
class TestClass
`);
    });

    it('should support extends', () => {
      const fileKt = createFile();
      const classKt = new ClassKt('TestClass');
      classKt.extendsClass('com.example.TestClass2');
      classKt.extendsClass('com.example.TestClass3', (extendsKt, typeSignatureKt) => {
        extendsKt.addSimpleArgument('name1', '"value1"');
        typeSignatureKt.addGenericParameter('kotlin.String')
      });

      expect(serializer.serializeClass(fileKt, classKt))
          .toBe(`\
class TestClass : TestClass2(), TestClass3\<String>(name1 = "value1")
`);
    });

    it('should support implements', () => {
      const fileKt = createFile();
      const classKt = new ClassKt('TestClass');
      classKt.implementsInterface('com.example.TestInterface1');
      classKt.implementsInterface('com.example.TestInterface2', typeSignatureKt => {
        typeSignatureKt.addGenericParameter('kotlin.String')
      });

      expect(serializer.serializeClass(fileKt, classKt))
          .toBe(`\
class TestClass : TestInterface1, TestInterface2\<String>
`);
    });

    it('should support members of class', () => {
      const fileKt = createFile();
      const classKt = new ClassKt('TestClass');
      classKt.addProperty('prop1', 'kotlin.String', (propertyKt, typeSignatureKt) => {
        propertyKt.isMutable = true;
        typeSignatureKt.isNullable = true;
      });
      classKt.addProperty('prop2', 'kotlin.String', (propertyKt, typeSignatureKt) => {
        propertyKt.isMutable = true;
        typeSignatureKt.isNullable = true;
      });
      classKt.addInitBlock(bodyKt => {
        bodyKt.writeLn('throw RuntimeException()');
      });
      classKt.addFunction('test1', bodyKt => {
        bodyKt.writeLn('throw RuntimeException()');
      });
      classKt.addFunction('test2', bodyKt => {
        bodyKt.writeLn('throw RuntimeException()');
      });

      expect(serializer.serializeClass(fileKt, classKt))
          .toBe(`\
class TestClass {

    var prop1: String?
    var prop2: String?

    init {
        throw RuntimeException()
    }

    fun test1() {
        throw RuntimeException()
    }

    fun test2() {
        throw RuntimeException()
    }
}
`);
    });
    it('should support members of object', () => {
      const fileKt = createFile();
      const objectKt = new ObjectKt('TestClass');
      objectKt.addProperty('prop1', 'kotlin.String', (propertyKt, typeSignatureKt) => {
        propertyKt.isMutable = true;
        typeSignatureKt.isNullable = true;
      });
      objectKt.addProperty('prop2', 'kotlin.String', (propertyKt, typeSignatureKt) => {
        propertyKt.isMutable = true;
        typeSignatureKt.isNullable = true;
      });
      objectKt.addFunction('test1', bodyKt => {
        bodyKt.writeLn('throw RuntimeException()');
      });
      objectKt.addFunction('test2', bodyKt => {
        bodyKt.writeLn('throw RuntimeException()');
      });

      expect(serializer.serializeClass(fileKt, objectKt))
          .toBe(`\
object TestClass {

    var prop1: String?
    var prop2: String?

    fun test1() {
        throw RuntimeException()
    }

    fun test2() {
        throw RuntimeException()
    }
}
`);
    });
  });

  it('should support companion object', () => {
    const fileKt = createFile();
    const classKt = new ClassKt('TestClass');
    classKt.setCompanionObject(companionObjectKt => {
      companionObjectKt.addFunction('test1', bodyKt => {
        bodyKt.writeLn('throw RuntimeException()');
      });
      companionObjectKt.addFunction('test2', bodyKt => {
        bodyKt.writeLn('throw RuntimeException()');
      });
    });

    expect(classKt.companionObject).toBeDefined();

    expect(serializer.serializeClass(fileKt, classKt))
        .toBe(`\
class TestClass {

    companion object {

        fun test1() {
            throw RuntimeException()
        }

        fun test2() {
            throw RuntimeException()
        }
    }
}
`);
  });

  describe('serializeInterface()', () => {

    it('should support empty interfaces', () => {
      const fileKt = createFile();
      const classKt = new InterfaceKt('TestInterface');

      expect(serializer.serializeInterface(fileKt, classKt))
          .toBe('interface TestInterface\n');
    });

    it('should support annotations', () => {
      const fileKt = createFile();
      const interfaceKt = new InterfaceKt('TestInterface');
      interfaceKt.addAnnotation('com.example.Ann1');
      interfaceKt.addAnnotation('com.example.Ann2', annotationKt => {
        annotationKt.addSimpleParameter('value', '"test1"');
      });

      expect(serializer.serializeInterface(fileKt, interfaceKt))
          .toBe(`\
@Ann1
@Ann2("test1")
interface TestInterface
`);
    });

    it('should support function signatures', () => {
      const fileKt = createFile();
      const interfaceKt = new InterfaceKt('TestInterface');
      interfaceKt.addFunctionSignature('test1');
      interfaceKt.addFunctionSignature('test2', functionSignatureKt => {
        functionSignatureKt.setReturnType('kotlin.String');
      });

      expect(serializer.serializeInterface(fileKt, interfaceKt))
          .toBe(`\
interface TestInterface {

    fun test1()

    fun test2(): String
}
`);
    });

  });

  describe('serializeFileMember()', () => {

    it('should support classes', () => {
      const fileKt = createFile();
      const classKt = new ClassKt('TestClass');

      expect(serializer.serializeFileMember(fileKt, classKt))
          .toBe('class TestClass\n');
    });

    it('should support objects', () => {
      const fileKt = createFile();
      const objectKt = new ObjectKt('TestObject');

      expect(serializer.serializeFileMember(fileKt, objectKt))
          .toBe('object TestObject\n');
    });

    it('should support interfaces', () => {
      const fileKt = createFile();
      const interfaceKt = new InterfaceKt('TestInterface');

      expect(serializer.serializeFileMember(fileKt, interfaceKt))
          .toBe('interface TestInterface\n');
    });

    it('should support extension functions', () => {
      const fileKt = createFile();
      const functionKt = new ExtensionFunctionKt('test1');
      functionKt.extendedType = new TypeSignatureKt('kotlin.String');
      functionKt.body.writeLn('throw RuntimeException()');

      expect(serializer.serializeFileMember(fileKt, functionKt))
          .toBe(`\
fun String.test1() {
    throw RuntimeException()
}
`);
    });

    it('should support functions', () => {
      const fileKt = createFile();
      const functionKt = new FunctionKt('test1');
      functionKt.body.writeLn('throw RuntimeException()');

      expect(serializer.serializeFileMember(fileKt, functionKt))
          .toBe(`\
fun test1() {
    throw RuntimeException()
}
`);
    });

    it('should throw error for unsupported type', () => {
      class UnsupportedFileFileMemberTest implements FileMemberKt {
        name: string;
      }
      const fileKt = createFile();
      const unsupported = new UnsupportedFileFileMemberTest();

      expect(() => {serializer.serializeFileMember(fileKt, unsupported)})
          .toThrowError('Unexpected FileMember type: UnsupportedFileFileMemberTest');
    });

  });

  describe('serializeFileMember()', () => {

    it('should support many members', () => {
      const fileKt = createFile();
      fileKt.addClass('TestClass', classKt => {
        classKt.implementsInterface('com.example.Test1');
      });
      fileKt.addObject('TestObject', objectKt => {
        objectKt.implementsInterface('com.example.Test1');
      });
      fileKt.addInterface('TestInterface', interfaceKt => {
        interfaceKt.addAnnotation('com.example.Ann1');
      });
      fileKt.addFunction('test1', bodyKt => {
        bodyKt.writeLn('throw RuntimeException()')
      });
      fileKt.addExtensionFunction('test2', 'kotlin.String', bodyKt => {
        bodyKt.writeLn('throw RuntimeException()');
      });

      expect(serializer.serializeFileMembers(fileKt))
          .toBe(`\
class TestClass : Test1

object TestObject : Test1

@Ann1
interface TestInterface

fun test1() {
    throw RuntimeException()
}

fun String.test2() {
    throw RuntimeException()
}
`);
    });

  });

  describe('serializeImports()', () => {

    it('should support simple import', () => {
      const fileKt = createFile();
      fileKt.importMapping['com.example.TestClass'] = 'TestClass';

      expect(serializer.serializeImports(fileKt))
          .toBe('import com.example.TestClass\n');
    });

    it('should support default imports (kotlin)', () => {
      const fileKt = createFile();
      fileKt.importMapping['kotlin.String'] = 'String';

      expect(serializer.serializeImports(fileKt))
          .toBe('');
    });

    it('should support default imports (kotlin.collections.List)', () => {
      const fileKt = createFile();
      fileKt.importMapping['kotlin.collections.List'] = 'List';

      expect(serializer.serializeImports(fileKt))
          .toBe('');
    });

    it('should support aliases', () => {
      const fileKt = createFile();
      fileKt.importMapping['com.example.TestClass'] = 'TestClass2';

      expect(serializer.serializeImports(fileKt))
          .toBe('import com.example.TestClass as TestClass2\n');
    });

    it('should sort imports', () => {
      const fileKt = createFile();
      fileKt.importMapping['com.example.B'] = 'B';
      fileKt.importMapping['com.example.C'] = 'C';
      fileKt.importMapping['com.example.A'] = 'A';

      expect(serializer.serializeImports(fileKt))
          .toBe(`\
import com.example.A
import com.example.B
import com.example.C
`);
    });
  });

  describe('serializeIfBlock()', () => {

    it('should render if block', () => {
      const fileKt = createFile();
      const ifBlockKt = new IfBlockKt(() => 'true');
      ifBlockKt.body.writeLn('throw RuntimeException()');

      expect(serializer.serializeIfBlock(fileKt, ifBlockKt))
          .toBe(`\
if (true) {
    throw RuntimeException()
}
`);
    });

    it('should render if with else', () => {
      const fileKt = createFile();
      const ifBlockKt = new IfBlockKt(() => 'true');
      ifBlockKt.body.writeLn('throw RuntimeException()');
      ifBlockKt.setElse(elseBlockKt => {
        elseBlockKt.writeLn('return true');
      });

      expect(serializer.serializeIfBlock(fileKt, ifBlockKt))
          .toBe(`\
if (true) {
    throw RuntimeException()
} else {
    return true
}
`);
    });

  });

  describe('serializeWhileBlock()', () => {

    it('should render while block', () => {
      const fileKt = createFile();
      const whileBlockKt = new WhileBlockKt(() => 'true');
      whileBlockKt.body.writeLn('throw RuntimeException()');

      expect(serializer.serializeWhileBlock(fileKt, whileBlockKt))
          .toBe(`\
while (true) {
    throw RuntimeException()
}
`);
    });

  });

  describe('serializeWhen()', () => {

    it('should render when statement', () => {
      const fileKt = createFile();
      const whenKt = new WhenKt('test1');

      whenKt.addCase(() => '"test2"', caseBodyKt => {
        caseBodyKt.writeLn('return "test3"');
      });
      whenKt.addCase(() => '"test4"', caseBodyKt => {
        caseBodyKt.writeLn('return "test5"');
      });
      whenKt.setElse(elseBodyKt => {
        elseBodyKt.writeLn('throw RuntimeException()');
      });

      expect(serializer.serializeWhen(fileKt, whenKt))
          .toBe(`\
when (test1) {

    "test2" -> {
        return "test3"
    }
    "test4" -> {
        return "test5"
    }
    else -> {
        throw RuntimeException()
    }
}
`);
    });

    it('should render when without else', () => {
      const fileKt = createFile();
      const whenKt = new WhenKt('test1');

      whenKt.addCase(() => '"test2"', caseBodyKt => {
        caseBodyKt.writeLn('return "test3"');
      });
      whenKt.addCase(() => '"test4"', caseBodyKt => {
        caseBodyKt.writeLn('return "test5"');
      });

      expect(serializer.serializeWhen(fileKt, whenKt))
          .toBe(`\
when (test1) {

    "test2" -> {
        return "test3"
    }
    "test4" -> {
        return "test5"
    }
}
`);
    });

  });

  describe('serializeTryBlock()', () => {

    it('should render try-catch', () => {
      const fileKt = createFile();
      const tryBlockKt = new TryBlockKt();
      tryBlockKt.body.writeLn('return true');
      tryBlockKt.setCatch('e', 'kotlin.RuntimeException', catchBlockKt => {
        catchBlockKt.writeLn('return false')
      });

      expect(serializer.serializeTryBlock(fileKt, tryBlockKt))
          .toBe(`\
try {
    return true
} catch (e: RuntimeException) {
    return false
}
`);
    });

    it('should throw error without catch-block', () => {
      const fileKt = createFile();
      const tryBlockKt = new TryBlockKt();
      tryBlockKt.body.writeLn('return true');

      expect(() => serializer.serializeTryBlock(fileKt, tryBlockKt))
          .toThrowError('Catch block is required');
    });
  });

  describe('serializeFunctionCall()', () => {

    it('should support omitting optional variable name', () => {
      const fileKt = createFile();
      const functionCallKt = new FunctionCallKt('', 'test1');

      expect(serializer.serializeFunctionCall(fileKt, functionCallKt))
          .toBe('test1()\n');
    });

    it('should support including optional variable name', () => {
      const fileKt = createFile();
      const functionCallKt = new FunctionCallKt('var1', 'test1');

      expect(serializer.serializeFunctionCall(fileKt, functionCallKt))
          .toBe('var1.test1()\n');
    });

    it('should support single args', () => {
      const fileKt = createFile();
      const functionCallKt = new FunctionCallKt('', 'test1');
      functionCallKt.addSimpleArgument('arg1', 'arg1');

      expect(serializer.serializeFunctionCall(fileKt, functionCallKt))
          .toBe('test1(arg1 = arg1)\n');
    });

    it('should support multiple args', () => {
      const fileKt = createFile();
      const functionCallKt = new FunctionCallKt('', 'test1');
      functionCallKt.addSimpleArgument('arg1', 'arg1');
      functionCallKt.addSimpleArgument('arg2', 'arg2');

      expect(serializer.serializeFunctionCall(fileKt, functionCallKt))
          .toBe(`\
test1(
        arg1 = arg1,
        arg2 = arg2)
`);
    });
  });

  describe('serializeBodyContent()', () => {

    it('should render text', () => {
      const fileKt = createFile();
      const textKt = new TextKt('test1');

      expect(serializer.serializeBodyContent(fileKt, textKt))
          .toBe('test1');
    });

    it('should render line', () => {
      const fileKt = createFile();
      const lineKt = new LineKt('test1');

      expect(serializer.serializeBodyContent(fileKt, lineKt))
          .toBe('test1\n');
    });

    it('should render dynamic line', () => {
      const fileKt = createFile();
      const lineKt = new DynamicLineKt(nestedFileKt => nestedFileKt.tryImport('kotlin.String'));

      expect(serializer.serializeBodyContent(fileKt, lineKt))
          .toBe('String\n');
    });

    it('should render if block', () => {
      const fileKt = createFile();
      const ifBlockKt = new IfBlockKt(() => 'true');
      ifBlockKt.body.writeLn('throw RuntimeException()');

      expect(serializer.serializeBodyContent(fileKt, ifBlockKt))
          .toBe(`\
if (true) {
    throw RuntimeException()
}
`);
    });

    it('should render while block', () => {
      const fileKt = createFile();
      const whileBlockKt = new WhileBlockKt(() => 'true');
      whileBlockKt.body.writeLn('throw RuntimeException()');

      expect(serializer.serializeBodyContent(fileKt, whileBlockKt))
          .toBe(`\
while (true) {
    throw RuntimeException()
}
`);
    });

    it('should render when statement', () => {
      const fileKt = createFile();
      const whenKt = new WhenKt('test1');

      whenKt.addCase(() => '"test2"', caseBodyKt => {
        caseBodyKt.writeLn('return "test3"');
      });
      whenKt.addCase(() => '"test4"', caseBodyKt => {
        caseBodyKt.writeLn('return "test5"');
      });
      whenKt.setElse(elseBodyKt => {
        elseBodyKt.writeLn('throw RuntimeException()');
      });

      expect(serializer.serializeBodyContent(fileKt, whenKt))
          .toBe(`\
when (test1) {

    "test2" -> {
        return "test3"
    }
    "test4" -> {
        return "test5"
    }
    else -> {
        throw RuntimeException()
    }
}
`);
    });

    it('should render try-catch', () => {
      const fileKt = createFile();
      const tryBlockKt = new TryBlockKt();
      tryBlockKt.body.writeLn('return true');
      tryBlockKt.setCatch('e', 'kotlin.RuntimeException', catchBlockKt => {
        catchBlockKt.writeLn('return false')
      });

      expect(serializer.serializeBodyContent(fileKt, tryBlockKt))
          .toBe(`\
try {
    return true
} catch (e: RuntimeException) {
    return false
}
`);
    });

    it('should render function call', () => {
      const fileKt = createFile();
      const functionCallKt = new FunctionCallKt('var1', 'test1');
      functionCallKt.addSimpleArgument('arg1', 'arg1');
      functionCallKt.addSimpleArgument('arg2', 'arg2');

      expect(serializer.serializeBodyContent(fileKt, functionCallKt))
          .toBe(`\
var1.test1(
        arg1 = arg1,
        arg2 = arg2)
`);
    });

    it('should throw error for unsupported type', () => {
      const fileKt = createFile();

      class UnsupportedTypeTest { }
      const unsupportedType = new UnsupportedTypeTest();

      expect(() => serializer.serializeBodyContent(fileKt, unsupportedType))
          .toThrowError('Unsupported BodyContentKt type: UnsupportedTypeTest');
    });
  });

  describe('serializeBody()', () => {

    it('should render multiple items', () => {
      const fileKt = createFile();

      const bodyKt = new BodyKt();
      bodyKt.write('test1');
      bodyKt.writeLn('test2');

      expect(serializer.serializeBody(fileKt, bodyKt))
          .toBe('test1test2\n');
    });

  });

  describe('serializeFileBody()', () => {

    it('should support many members', () => {
      const fileKt = createFile();
      fileKt.addClass('TestClass', classKt => {
        classKt.implementsInterface('com.example.Test1');
      });
      fileKt.addObject('TestObject', objectKt => {
        objectKt.implementsInterface('com.example.Test1');
      });
      fileKt.addInterface('TestInterface', interfaceKt => {
        interfaceKt.addAnnotation('com.example.Ann1');
      });
      fileKt.addFunction('test1', bodyKt => {
        bodyKt.writeLn('throw RuntimeException()');
      });
      fileKt.addExtensionFunction('test2', 'kotlin.String', bodyKt => {
        bodyKt.writeLn('throw RuntimeException()');
      });

      expect(serializer.serializeFileBody(fileKt))
          .toBe(`\
class TestClass : Test1

object TestObject : Test1

@Ann1
interface TestInterface

fun test1() {
    throw RuntimeException()
}

fun String.test2() {
    throw RuntimeException()
}
`);
    });

  });

  describe('serializeFile()', () => {

    it('should support empty file', () => {
      const fileKt = createFile();

      expect(serializer.serializeFile(fileKt))
          .toBe(`\
package com.example.package
`);
    });

    it('should support license header', () => {
      const fileKt = createFile();
      fileKt.licenseHeader = `\
/*
 * Test1
 *
`;

      expect(serializer.serializeFile(fileKt))
          .toBe(`\
/*
 * Test1
 *
package com.example.package
`);
    });

    it('should support license header (add trailing new line)', () => {
      const fileKt = createFile();
      fileKt.licenseHeader = `\
/*
 * Test1
 *`;

      expect(serializer.serializeFile(fileKt))
          .toBe(`\
/*
 * Test1
 *
package com.example.package
`);
    });

    it('should support many members', () => {
      const fileKt = createFile();
      fileKt.addClass('TestClass', classKt => {
        classKt.implementsInterface('com.example.Test1');
      });
      fileKt.addObject('TestObject', objectKt => {
        objectKt.implementsInterface('com.example.Test1');
      });
      fileKt.addInterface('TestInterface', interfaceKt => {
        interfaceKt.addAnnotation('com.example.Ann1');
      });
      fileKt.addFunction('test1', bodyKt => {
        bodyKt.writeLn('throw RuntimeException()');
      });
      fileKt.addExtensionFunction('test2', 'kotlin.String', bodyKt => {
        bodyKt.writeLn('throw RuntimeException()');
      });

      expect(serializer.serializeFile(fileKt))
          .toBe(`\
package com.example.package

import com.example.Ann1
import com.example.Test1

class TestClass : Test1

object TestObject : Test1

@Ann1
interface TestInterface

fun test1() {
    throw RuntimeException()
}

fun String.test2() {
    throw RuntimeException()
}
`);
    });

  });
});
