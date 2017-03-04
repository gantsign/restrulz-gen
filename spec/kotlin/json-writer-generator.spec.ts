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
import {
  ClassType,
  IntegerType,
  Property,
  Specification,
  StringType,
  BooleanType
} from '../../src/restrulz/model';
import {
  FileKt,
  FunctionKt,
  PropertyKt,
  ObjectKt,
  ExtendsKt,
  ImplementsKt
} from '../../src/kotlin/lang';
import {GeneratorContext} from '../../src/generator';
import {KotlinJsonWriterGenerator} from '../../src/kotlin/json-writer-generator';

describe('KotlinJsonWriterGenerator', () => {

  const generator = new KotlinJsonWriterGenerator();
  const spec = new Specification();
  spec.name = 'testing';

  describe('getWriterPackageName()', () => {

    it('should derive default package name from specification', () => {

      expect(generator.getWriterPackageName(spec)).toBe('testing.model.json.writer.impl');
    });

    it('should support model package name mapping', () => {
      const generatorWithMapping = new KotlinJsonWriterGenerator();
      generatorWithMapping.packageMapping['testing.model'] = 'com.example.om';

      expect(generatorWithMapping.getWriterPackageName(spec)).toBe('com.example.om.json.writer.impl');
    });

    it('should support package name mapping', () => {
      const generatorWithMapping = new KotlinJsonWriterGenerator();
      generatorWithMapping.packageMapping['testing.model.json.writer.impl'] = 'com.example.jsw';

      expect(generatorWithMapping.getWriterPackageName(spec)).toBe('com.example.jsw');
    });
  });

  describe('getWriterClassName()', () => {
    const classType = new ClassType();
    classType.name = 'delivery-address';

    it('should convert kebab case to capitalized camel case', () => {
      expect(generator.getWriterClassName(classType)).toBe('DeliveryAddressWriter');
    });
  });

  describe('getQualifiedWriterClass()', () => {
    const classType = new ClassType();
    classType.name = 'delivery-address';

    it('should derive default package from specification', () => {
      expect(generator.getQualifiedWriterClass(spec, classType))
          .toBe('testing.model.json.writer.impl.DeliveryAddressWriter');
    });

    it('should support model package mapping', () => {
      const generatorWithMapping = new KotlinJsonWriterGenerator();
      generatorWithMapping.packageMapping['testing.model'] = 'com.example.om';

      expect(generatorWithMapping.getQualifiedWriterClass(spec, classType))
          .toBe('com.example.om.json.writer.impl.DeliveryAddressWriter');
    });

    it('should support package mapping', () => {
      const generatorWithMapping = new KotlinJsonWriterGenerator();
      generatorWithMapping.packageMapping['testing.model.json.writer.impl'] = 'com.example.jsw';

      expect(generatorWithMapping.getQualifiedWriterClass(spec, classType))
          .toBe('com.example.jsw.DeliveryAddressWriter');
    });
  });

  describe('getFactoryPackageName()', () => {

    it('should derive default package name from specification', () => {

      expect(generator.getFactoryPackageName(spec)).toBe('testing.model.json.writer');
    });

    it('should support model package name mapping', () => {
      const generatorWithMapping = new KotlinJsonWriterGenerator();
      generatorWithMapping.packageMapping['testing.model'] = 'com.example.om';

      expect(generatorWithMapping.getFactoryPackageName(spec)).toBe('com.example.om.json.writer');
    });
  });

  describe('getFactoryClassName()', () => {
    const classType = new ClassType();
    classType.name = 'delivery-address';

    it('should convert kebab case to capitalized camel case', () => {
      expect(generator.getFactoryClassName(classType)).toBe('DeliveryAddressWriterFactory');
    });
  });

  describe('jacksonMethodForProperty()', () => {
    const classType = new ClassType();
    classType.name = 'delivery-address';

    it('should support simple classes', () => {
      const fileKt = new FileKt('com.example.package', 'DeliveryAddressWriter');
      const property = new Property();
      property.name = 'primary-delivery-address';
      property.type = classType;

      expect(generator.jacksonMethodForProperty(spec, fileKt, property))
          .toBe('DeliveryAddressWriter.writeObjectField(' +
              'generator, "primary-delivery-address", value.primaryDeliveryAddress)');
    });

    it('should support class arrays', () => {
      const fileKt = new FileKt('com.example.package', 'DeliveryAddressWriter');
      const property = new Property();
      property.name = 'primary-delivery-addresses';
      property.type = classType;
      property.isArray = true;

      expect(generator.jacksonMethodForProperty(spec, fileKt, property))
          .toBe('DeliveryAddressWriter.writeArrayField(' +
              'generator, "primary-delivery-addresses", value.primaryDeliveryAddresses)');
    });

    const stringType = new StringType();
    stringType.name = 'address-line';

    it('should support simple strings', () => {
      const fileKt = new FileKt('com.example.package', 'DeliveryAddressWriter');
      const property = new Property();
      property.name = 'address-line1';
      property.type = stringType;

      expect(generator.jacksonMethodForProperty(spec, fileKt, property))
          .toBe('generator.writeStringField("address-line1", value.addressLine1)');
    });

    it('should support string arrays', () => {
      const fileKt = new FileKt('com.example.package', 'DeliveryAddressWriter');
      const property = new Property();
      property.name = 'address-lines';
      property.type = stringType;
      property.isArray = true;

      expect(generator.jacksonMethodForProperty(spec, fileKt, property))
          .toBe('generator.writeStringArrayField("address-lines", value.addressLines)');
    });

    it('should support simple integers', () => {
      const integerType = new IntegerType();
      integerType.name = 'zip-code';

      const fileKt = new FileKt('com.example.package', 'DeliveryAddressWriter');
      const property = new Property();
      property.name = 'zip-code';
      property.type = integerType;

      expect(generator.jacksonMethodForProperty(spec, fileKt, property))
          .toBe('generator.writeNumberField("zip-code", value.zipCode)');
    });

    it('should support long arrays', () => {
      const longType = new IntegerType();
      longType.name = 'long-number';
      longType.minimum = 0;
      longType.maximum = 2147483648;

      const fileKt = new FileKt('com.example.package', 'DeliveryAddressWriter');
      const property = new Property();
      property.name = 'long-numbers';
      property.type = longType;
      property.isArray = true;

      expect(generator.jacksonMethodForProperty(spec, fileKt, property))
          .toBe('generator.writeLongArrayField("long-numbers", value.longNumbers)');
    });

    it('should support int arrays', () => {
      const intType = new IntegerType();
      intType.name = 'int-number';
      intType.minimum = 0;
      intType.maximum = 32768;

      const fileKt = new FileKt('com.example.package', 'DeliveryAddressWriter');
      const property = new Property();
      property.name = 'int-numbers';
      property.type = intType;
      property.isArray = true;

      expect(generator.jacksonMethodForProperty(spec, fileKt, property))
          .toBe('generator.writeIntArrayField("int-numbers", value.intNumbers)');
    });

    it('should support short arrays', () => {
      const shortType = new IntegerType();
      shortType.name = 'short-number';
      shortType.minimum = 0;
      shortType.maximum = 128;

      const fileKt = new FileKt('com.example.package', 'DeliveryAddressWriter');
      const property = new Property();
      property.name = 'short-numbers';
      property.type = shortType;
      property.isArray = true;

      expect(generator.jacksonMethodForProperty(spec, fileKt, property))
          .toBe('generator.writeShortArrayField("short-numbers", value.shortNumbers)');
    });

    it('should support byte arrays', () => {
      const byteType = new IntegerType();
      byteType.name = 'byte-number';
      byteType.minimum = 0;
      byteType.maximum = 127;

      const fileKt = new FileKt('com.example.package', 'DeliveryAddressWriter');
      const property = new Property();
      property.name = 'byte-numbers';
      property.type = byteType;
      property.isArray = true;

      expect(generator.jacksonMethodForProperty(spec, fileKt, property))
          .toBe('generator.writeByteArrayField("byte-numbers", value.byteNumbers)');
    });

    const booleanType = new BooleanType();
    booleanType.name = 'boolean-flag';

    it('should support simple booleans', () => {
      const fileKt = new FileKt('com.example.package', 'DeliveryAddressWriter');
      const property = new Property();
      property.name = 'leave-with-neighbour';
      property.type = booleanType;

      expect(generator.jacksonMethodForProperty(spec, fileKt, property))
          .toBe('generator.writeBooleanField("leave-with-neighbour", value.leaveWithNeighbour)');
    });

    it('should support boolean arrays', () => {
      const fileKt = new FileKt('com.example.package', 'DeliveryAddressWriter');
      const property = new Property();
      property.name = 'left-with-neighbour';
      property.type = booleanType;
      property.isArray = true;

      expect(generator.jacksonMethodForProperty(spec, fileKt, property))
          .toBe('generator.writeBooleanArrayField("left-with-neighbour", value.leftWithNeighbour)');
    });

    it('should throw an error for unsupported types', () => {
      class UnsupportedTypeTest {}
      const unsupportedType = new UnsupportedTypeTest();

      const fileKt = new FileKt('com.example.package', 'DeliveryAddressWriter');
      const property = new Property();
      property.name = 'left-with-neighbour';
      property.type = <StringType>unsupportedType;
      property.isArray = true;

      expect(() => generator.jacksonMethodForProperty(spec, fileKt, property))
          .toThrowError('Unexpected type: UnsupportedTypeTest');
    });

  });

  describe('addWriterKotlinObject()', () => {

    it('should support simple classes', () => {
      const stringType = new StringType();

      const fileKt = new FileKt('com.example.package', 'DeliveryAddressWriter');
      const property1 = new Property();
      property1.name = 'address-line1';
      property1.type = stringType;

      const property2 = new Property();
      property2.name = 'address-line2';
      property2.type = stringType;

      const classType = new ClassType();
      classType.name = 'delivery-address';
      classType.properties = [property1, property2];

      generator.addWriterKotlinObject(fileKt, spec, classType);

      expect(fileKt.members.length).toBe(1);

      const objectKt = fileKt.members[0];
      if (!(objectKt instanceof ObjectKt)) {
        fail(`Expected ObjectKt but was ${objectKt.constructor.name}`);
        return;
      }

      expect(objectKt.name).toBe('DeliveryAddressWriter');

      expect(objectKt.extendsClasses.length).toBe(1);
      const extendsKt = objectKt.extendsClasses[0];
      if (!(extendsKt instanceof ExtendsKt)) {
        fail(`Expected ExtendsKt but was ${extendsKt.constructor.name}`);
        return;
      }

      const extendsType = extendsKt.type;
      expect(extendsType.name).toBe('com.gantsign.restrulz.jackson.writer.JacksonObjectWriter');
      expect(extendsType.genericParameters.length).toBe(1);
      expect(extendsType.genericParameters[0].name).toBe('testing.model.DeliveryAddress');

      expect(objectKt.members.length).toBe(1);
      const functionKt = objectKt.members[0];
      if (!(functionKt instanceof FunctionKt)) {
        fail(`Expected FunctionKt but was ${functionKt.constructor.name}`);
        return;
      }

      expect(functionKt.name).toBe('writeObject');
      expect(functionKt.overrides).toBeTruthy();

      expect(functionKt.parameters.length).toBe(2);
      const param1 = functionKt.parameters[0];
      expect(param1.name).toBe('generator');
      expect(param1.type.name).toBe('com.fasterxml.jackson.core.JsonGenerator');

      const param2 = functionKt.parameters[1];
      expect(param2.name).toBe('value');
      expect(param2.type.name).toBe('testing.model.DeliveryAddress');

      expect(functionKt.bodyFactory(fileKt)).toBe(`
if (value === null) {
    generator.writeNull()
    return
}

generator.writeStartObject()
generator.writeStringField("address-line1", value.addressLine1)
generator.writeStringField("address-line2", value.addressLine2)
generator.writeEndObject()
`);
    });

  });

  describe('addFactoryKotlinObject()', () => {

    it('should convert kebab case to capitalized camel case', () => {
      const fileKt = new FileKt('com.example.package', 'DeliveryAddressWriter');

      const classType = new ClassType();
      classType.name = 'delivery-address';

      generator.addFactoryKotlinObject(fileKt, spec, classType);

      expect(fileKt.members.length).toBe(1);

      const objectKt = fileKt.members[0];
      if (!(objectKt instanceof ObjectKt)) {
        fail(`Expected ObjectKt but was ${objectKt.constructor.name}`);
        return;
      }

      expect(objectKt.name).toBe('DeliveryAddressWriterFactory');

      expect(objectKt.extendsClasses.length).toBe(1);
      const implementsKt = objectKt.extendsClasses[0];
      if (!(implementsKt instanceof ImplementsKt)) {
        fail(`Expected ImplementsKt but was ${implementsKt.constructor.name}`);
        return;
      }

      const implementsType = implementsKt.type;
      expect(implementsType.name).toBe('com.gantsign.restrulz.json.writer.JsonObjectWriterFactory');
      expect(implementsType.genericParameters.length).toBe(1);
      expect(implementsType.genericParameters[0].name).toBe('testing.model.DeliveryAddress');

      expect(objectKt.members.length).toBe(1);
      const propertyKt = objectKt.members[0];
      if (!(propertyKt instanceof PropertyKt)) {
        fail(`Expected PropertyKt but was ${propertyKt.constructor.name}`);
        return;
      }

      expect(propertyKt.name).toBe('jsonWriter');
      expect(propertyKt.overrides).toBeTruthy();

      const propertyType = propertyKt.type;
      expect(propertyType.name).toBe('com.gantsign.restrulz.json.writer.JsonObjectWriter');
      expect(propertyType.genericParameters.length).toBe(1);
      expect(propertyType.genericParameters[0].name).toBe('testing.model.DeliveryAddress');

      expect(propertyKt.getterBodyFactory(fileKt)).toBe('return DeliveryAddressWriter\n');
    });
  });

  describe('toWriterKotlinFile()', () => {

    it('should create writer', () => {
      const stringType = new StringType();

      const property1 = new Property();
      property1.name = 'address-line1';
      property1.type = stringType;

      const property2 = new Property();
      property2.name = 'address-line2';
      property2.type = stringType;

      const classType = new ClassType();
      classType.name = 'delivery-address';
      classType.properties = [property1, property2];

      const fileKt = generator.toWriterKotlinFile(spec, classType);
      expect(fileKt.packageName).toBe('testing.model.json.writer.impl');
      expect(fileKt.fileName).toBe('DeliveryAddressWriter');

      expect(fileKt.members.length).toBe(1);

      const objectKt = fileKt.members[0];
      if (!(objectKt instanceof ObjectKt)) {
        fail(`Expected ObjectKt but was ${objectKt.constructor.name}`);
        return;
      }

      expect(objectKt.name).toBe('DeliveryAddressWriter');

      expect(objectKt.extendsClasses.length).toBe(1);
      const extendsKt = objectKt.extendsClasses[0];
      if (!(extendsKt instanceof ExtendsKt)) {
        fail(`Expected ExtendsKt but was ${extendsKt.constructor.name}`);
        return;
      }

      const extendsType = extendsKt.type;
      expect(extendsType.name).toBe('com.gantsign.restrulz.jackson.writer.JacksonObjectWriter');
      expect(extendsType.genericParameters.length).toBe(1);
      expect(extendsType.genericParameters[0].name).toBe('testing.model.DeliveryAddress');

      expect(objectKt.members.length).toBe(1);
      const functionKt = objectKt.members[0];
      if (!(functionKt instanceof FunctionKt)) {
        fail(`Expected FunctionKt but was ${functionKt.constructor.name}`);
        return;
      }

      expect(functionKt.name).toBe('writeObject');
      expect(functionKt.overrides).toBeTruthy();

      expect(functionKt.parameters.length).toBe(2);
      const param1 = functionKt.parameters[0];
      expect(param1.name).toBe('generator');
      expect(param1.type.name).toBe('com.fasterxml.jackson.core.JsonGenerator');

      const param2 = functionKt.parameters[1];
      expect(param2.name).toBe('value');
      expect(param2.type.name).toBe('testing.model.DeliveryAddress');

      expect(functionKt.bodyFactory(fileKt)).toBe(`
if (value === null) {
    generator.writeNull()
    return
}

generator.writeStartObject()
generator.writeStringField("address-line1", value.addressLine1)
generator.writeStringField("address-line2", value.addressLine2)
generator.writeEndObject()
`);
    });

  });

  describe('toFactoryKotlinFile()', () => {

    it('should create factory', () => {

      const classType = new ClassType();
      classType.name = 'delivery-address';

      const fileKt = generator.toFactoryKotlinFile(spec, classType);
      expect(fileKt.packageName).toBe('testing.model.json.writer');
      expect(fileKt.fileName).toBe('DeliveryAddressWriterFactory');

      expect(fileKt.members.length).toBe(1);

      const objectKt = fileKt.members[0];
      if (!(objectKt instanceof ObjectKt)) {
        fail(`Expected ObjectKt but was ${objectKt.constructor.name}`);
        return;
      }

      expect(objectKt.name).toBe('DeliveryAddressWriterFactory');

      expect(objectKt.extendsClasses.length).toBe(1);
      const implementsKt = objectKt.extendsClasses[0];
      if (!(implementsKt instanceof ImplementsKt)) {
        fail(`Expected ImplementsKt but was ${implementsKt.constructor.name}`);
        return;
      }

      const implementsType = implementsKt.type;
      expect(implementsType.name).toBe('com.gantsign.restrulz.json.writer.JsonObjectWriterFactory');
      expect(implementsType.genericParameters.length).toBe(1);
      expect(implementsType.genericParameters[0].name).toBe('testing.model.DeliveryAddress');

      expect(objectKt.members.length).toBe(1);
      const propertyKt = objectKt.members[0];
      if (!(propertyKt instanceof PropertyKt)) {
        fail(`Expected PropertyKt but was ${propertyKt.constructor.name}`);
        return;
      }

      expect(propertyKt.name).toBe('jsonWriter');
      expect(propertyKt.overrides).toBeTruthy();

      const propertyType = propertyKt.type;
      expect(propertyType.name).toBe('com.gantsign.restrulz.json.writer.JsonObjectWriter');
      expect(propertyType.genericParameters.length).toBe(1);
      expect(propertyType.genericParameters[0].name).toBe('testing.model.DeliveryAddress');

      expect(propertyKt.getterBodyFactory(fileKt)).toBe('return DeliveryAddressWriter\n');
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

  describe('generateWriterFiles()', () => {

    it('should generate writer files', () => {
      const stringType = new StringType();

      const property1 = new Property();
      property1.name = 'address-line1';
      property1.type = stringType;

      const property2 = new Property();
      property2.name = 'address-line2';
      property2.type = stringType;

      const classType1 = new ClassType();
      classType1.name = 'delivery-address';
      classType1.properties = [property1, property2];

      const property3 = new Property();
      property3.name = 'first-name';
      property3.type = stringType;

      const property4 = new Property();
      property4.name = 'last-name';
      property4.type = stringType;

      const classType2 = new ClassType();
      classType2.name = 'delivery-customer';
      classType2.properties = [property3, property3];

      const fullSpec = new Specification();
      fullSpec.name = 'testing';
      fullSpec.classTypes = [classType1, classType2];

      const context = new MockGeneratorContext();

      generator.generateWriterFiles(fullSpec, context);

      expect(context.outputPaths.length).toBe(2);

      expect(context.outputPaths[0])
          .toBe('testing/model/json/writer/impl/DeliveryAddressWriter.kt');

      expect(context.contents[0]).toBe(`\
package testing.model.json.writer.impl

import com.fasterxml.jackson.core.JsonGenerator
import com.gantsign.restrulz.jackson.writer.JacksonObjectWriter
import testing.model.DeliveryAddress

object DeliveryAddressWriter : JacksonObjectWriter\<DeliveryAddress>() {

    override fun writeObject(
            generator: JsonGenerator,
            value: DeliveryAddress?) {

        if (value === null) {
            generator.writeNull()
            return
        }

        generator.writeStartObject()
        generator.writeStringField("address-line1", value.addressLine1)
        generator.writeStringField("address-line2", value.addressLine2)
        generator.writeEndObject()
    }
}
`);

      expect(context.outputPaths[1])
          .toBe('testing/model/json/writer/impl/DeliveryCustomerWriter.kt');

      expect(context.contents[1]).toBe(`\
package testing.model.json.writer.impl

import com.fasterxml.jackson.core.JsonGenerator
import com.gantsign.restrulz.jackson.writer.JacksonObjectWriter
import testing.model.DeliveryCustomer

object DeliveryCustomerWriter : JacksonObjectWriter\<DeliveryCustomer>() {

    override fun writeObject(
            generator: JsonGenerator,
            value: DeliveryCustomer?) {

        if (value === null) {
            generator.writeNull()
            return
        }

        generator.writeStartObject()
        generator.writeStringField("first-name", value.firstName)
        generator.writeStringField("first-name", value.firstName)
        generator.writeEndObject()
    }
}
`);
    });

  });

  describe('generateFactoryFiles()', () => {

    it('should generate factory files', () => {
      const stringType = new StringType();

      const classType1 = new ClassType();
      classType1.name = 'delivery-address';

      const classType2 = new ClassType();
      classType2.name = 'delivery-customer';

      const fullSpec = new Specification();
      fullSpec.name = 'testing';
      fullSpec.classTypes = [classType1, classType2];

      const context = new MockGeneratorContext();

      generator.generateFactoryFiles(fullSpec, context);

      expect(context.outputPaths.length).toBe(2);

      expect(context.outputPaths[0])
          .toBe('testing/model/json/writer/DeliveryAddressWriterFactory.kt');

      expect(context.contents[0]).toBe(`\
package testing.model.json.writer

import com.gantsign.restrulz.json.writer.JsonObjectWriter
import com.gantsign.restrulz.json.writer.JsonObjectWriterFactory
import testing.model.DeliveryAddress
import testing.model.json.writer.impl.DeliveryAddressWriter

object DeliveryAddressWriterFactory : JsonObjectWriterFactory\<DeliveryAddress> {

    override val jsonWriter: JsonObjectWriter\<DeliveryAddress>
        get() {
            return DeliveryAddressWriter
        }
}
`);

      expect(context.outputPaths[1])
          .toBe('testing/model/json/writer/DeliveryCustomerWriterFactory.kt');

      expect(context.contents[1]).toBe(`\
package testing.model.json.writer

import com.gantsign.restrulz.json.writer.JsonObjectWriter
import com.gantsign.restrulz.json.writer.JsonObjectWriterFactory
import testing.model.DeliveryCustomer
import testing.model.json.writer.impl.DeliveryCustomerWriter

object DeliveryCustomerWriterFactory : JsonObjectWriterFactory\<DeliveryCustomer> {

    override val jsonWriter: JsonObjectWriter\<DeliveryCustomer>
        get() {
            return DeliveryCustomerWriter
        }
}
`);
    });

  });

  describe('generateFiles()', () => {

    it('should generate writer and factory files', () => {
      const stringType = new StringType();

      const property1 = new Property();
      property1.name = 'address-line1';
      property1.type = stringType;

      const property2 = new Property();
      property2.name = 'address-line2';
      property2.type = stringType;

      const classType1 = new ClassType();
      classType1.name = 'delivery-address';
      classType1.properties = [property1, property2];

      const property3 = new Property();
      property3.name = 'first-name';
      property3.type = stringType;

      const property4 = new Property();
      property4.name = 'last-name';
      property4.type = stringType;

      const classType2 = new ClassType();
      classType2.name = 'delivery-customer';
      classType2.properties = [property3, property3];

      const fullSpec = new Specification();
      fullSpec.name = 'testing';
      fullSpec.classTypes = [classType1, classType2];

      const context = new MockGeneratorContext();

      generator.generateFiles(fullSpec, context);

      expect(context.outputPaths.length).toBe(4);

      expect(context.outputPaths[0])
          .toBe('testing/model/json/writer/impl/DeliveryAddressWriter.kt');

      expect(context.contents[0]).toBe(`\
package testing.model.json.writer.impl

import com.fasterxml.jackson.core.JsonGenerator
import com.gantsign.restrulz.jackson.writer.JacksonObjectWriter
import testing.model.DeliveryAddress

object DeliveryAddressWriter : JacksonObjectWriter\<DeliveryAddress>() {

    override fun writeObject(
            generator: JsonGenerator,
            value: DeliveryAddress?) {

        if (value === null) {
            generator.writeNull()
            return
        }

        generator.writeStartObject()
        generator.writeStringField("address-line1", value.addressLine1)
        generator.writeStringField("address-line2", value.addressLine2)
        generator.writeEndObject()
    }
}
`);

      expect(context.outputPaths[1])
          .toBe('testing/model/json/writer/impl/DeliveryCustomerWriter.kt');

      expect(context.contents[1]).toBe(`\
package testing.model.json.writer.impl

import com.fasterxml.jackson.core.JsonGenerator
import com.gantsign.restrulz.jackson.writer.JacksonObjectWriter
import testing.model.DeliveryCustomer

object DeliveryCustomerWriter : JacksonObjectWriter\<DeliveryCustomer>() {

    override fun writeObject(
            generator: JsonGenerator,
            value: DeliveryCustomer?) {

        if (value === null) {
            generator.writeNull()
            return
        }

        generator.writeStartObject()
        generator.writeStringField("first-name", value.firstName)
        generator.writeStringField("first-name", value.firstName)
        generator.writeEndObject()
    }
}
`);

      expect(context.outputPaths[2])
          .toBe('testing/model/json/writer/DeliveryAddressWriterFactory.kt');

      expect(context.contents[2]).toBe(`\
package testing.model.json.writer

import com.gantsign.restrulz.json.writer.JsonObjectWriter
import com.gantsign.restrulz.json.writer.JsonObjectWriterFactory
import testing.model.DeliveryAddress
import testing.model.json.writer.impl.DeliveryAddressWriter

object DeliveryAddressWriterFactory : JsonObjectWriterFactory\<DeliveryAddress> {

    override val jsonWriter: JsonObjectWriter\<DeliveryAddress>
        get() {
            return DeliveryAddressWriter
        }
}
`);

      expect(context.outputPaths[3])
          .toBe('testing/model/json/writer/DeliveryCustomerWriterFactory.kt');

      expect(context.contents[3]).toBe(`\
package testing.model.json.writer

import com.gantsign.restrulz.json.writer.JsonObjectWriter
import com.gantsign.restrulz.json.writer.JsonObjectWriterFactory
import testing.model.DeliveryCustomer
import testing.model.json.writer.impl.DeliveryCustomerWriter

object DeliveryCustomerWriterFactory : JsonObjectWriterFactory\<DeliveryCustomer> {

    override val jsonWriter: JsonObjectWriter\<DeliveryCustomer>
        get() {
            return DeliveryCustomerWriter
        }
}
`);

    });

  });

});
