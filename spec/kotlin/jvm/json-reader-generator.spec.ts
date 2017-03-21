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
  ClassType,
  IntegerType,
  Property,
  Specification,
  StringType,
  BooleanType
} from '../../../src/restrulz/model';
import {
  BodyKt,
  FileKt,
  ImplementsKt,
  ObjectKt,
  PropertyKt,
  WhenKt
} from '../../../src/kotlin/lang';
import {GeneratorContext} from '../../../src/generator';
import {KotlinJsonReaderGenerator} from '../../../src/kotlin/jvm/json-reader-generator';
import {KotlinSerializer} from '../../../src/kotlin/serializer';

describe('KotlinJsonReaderGenerator', () => {

  const generator = new KotlinJsonReaderGenerator();
  const serializer = new KotlinSerializer();

  const spec = new Specification();
  spec.name = 'testing';

  const validatingGenerator = new KotlinJsonReaderGenerator();
  validatingGenerator.getStringForValidateProperty = () => 'true';


  describe('getReaderPackageName()', () => {

    it('should derive default package name from specification', () => {

      expect(generator.getReaderPackageName(spec))
          .toBe('testing.model.json.reader.impl');
    });

    it('should support model package name mapping', () => {
      const generatorWithMapping = new KotlinJsonReaderGenerator();
      generatorWithMapping.packageMapping['testing.model'] = 'com.example.om';

      expect(generatorWithMapping.getReaderPackageName(spec))
          .toBe('com.example.om.json.reader.impl');
    });

    it('should support package name mapping', () => {
      const generatorWithMapping = new KotlinJsonReaderGenerator();
      generatorWithMapping.packageMapping['testing.model.json.reader.impl'] = 'com.example.jsw';

      expect(generatorWithMapping.getReaderPackageName(spec))
          .toBe('com.example.jsw');
    });
  });

  describe('getReaderClassName()', () => {
    const classType = new ClassType();
    classType.name = 'delivery-address';

    it('should convert kebab case to capitalized camel case', () => {
      expect(generator.getReaderClassName(classType))
          .toBe('DeliveryAddressReader');
    });
  });

  describe('getQualifiedReaderClass()', () => {
    const classType = new ClassType();
    classType.name = 'delivery-address';

    it('should derive default package from specification', () => {
      expect(generator.getQualifiedReaderClass(spec, classType))
          .toBe('testing.model.json.reader.impl.DeliveryAddressReader');
    });

    it('should support model package mapping', () => {
      const generatorWithMapping = new KotlinJsonReaderGenerator();
      generatorWithMapping.packageMapping['testing.model'] = 'com.example.om';

      expect(generatorWithMapping.getQualifiedReaderClass(spec, classType))
          .toBe('com.example.om.json.reader.impl.DeliveryAddressReader');
    });

    it('should support package mapping', () => {
      const generatorWithMapping = new KotlinJsonReaderGenerator();
      generatorWithMapping.packageMapping['testing.model.json.reader.impl'] = 'com.example.jsw';

      expect(generatorWithMapping.getQualifiedReaderClass(spec, classType))
          .toBe('com.example.jsw.DeliveryAddressReader');
    });
  });

  describe('getFactoryPackageName()', () => {

    it('should derive default package name from specification', () => {

      expect(generator.getFactoryPackageName(spec))
          .toBe('testing.model.json.reader');
    });

    it('should support model package name mapping', () => {
      const generatorWithMapping = new KotlinJsonReaderGenerator();
      generatorWithMapping.packageMapping['testing.model'] = 'com.example.om';

      expect(generatorWithMapping.getFactoryPackageName(spec))
          .toBe('com.example.om.json.reader');
    });
  });

  describe('getFactoryClassName()', () => {
    const classType = new ClassType();
    classType.name = 'delivery-address';

    it('should convert kebab case to capitalized camel case', () => {
      expect(generator.getFactoryClassName(classType))
          .toBe('DeliveryAddressReaderFactory');
    });
  });

  describe('getStringForPropertiesWithDefaultValues()', () => {
    const fileKt = new FileKt('com.example.package', 'AddressReader');

    it('should support simple strings', () => {
      const property = new Property();
      property.name = 'address-line1';
      property.type = new StringType();

      expect(generator.getStringForPropertiesWithDefaultValues(spec, fileKt, property))
          .toBe('var addressLine1Value: String = ""\n');
    });

    it('should support empty strings', () => {
      const property = new Property();
      property.name = 'address-line1';
      property.type = new StringType();
      property.allowEmpty = true;

      expect(generator.getStringForPropertiesWithDefaultValues(spec, fileKt, property))
          .toBe('var addressLine1Value: String = ""\n');
    });

    it('should support string arrays', () => {
      const property = new Property();
      property.name = 'address-line1';
      property.type = new StringType();
      property.isArray = true;

      expect(generator.getStringForPropertiesWithDefaultValues(spec, fileKt, property))
          .toBe('var addressLine1Value: List\<String>? = listOf()\n');
    });

    it('should support simple boolean', () => {
      const property = new Property();
      property.name = 'twenty-four-hour';
      property.type = new BooleanType();

      expect(generator.getStringForPropertiesWithDefaultValues(spec, fileKt, property))
          .toBe('var twentyFourHourValue: Boolean? = null\n');
    });

    it('should support simple boolean', () => {
      const property = new Property();
      property.name = 'delivery-slot-available';
      property.type = new BooleanType();
      property.isArray = true;

      expect(generator.getStringForPropertiesWithDefaultValues(spec, fileKt, property))
          .toBe('var deliverySlotAvailableValue: List\<Boolean>? = listOf()\n');
    });
  });

  describe('getStringForValidateProperty()', () => {
    it('should support simple strings', () => {
      const fileKt = new FileKt('com.example.package', 'AddressReader');

      const property = new Property();
      property.name = 'address-line1';
      property.type = new StringType();

      expect(generator.getStringForValidateProperty(spec, fileKt, property))
          .toBe('');
    });
  });

  describe('writeParseStringField()', () => {

    it('should support simple strings', () => {
      const fileKt = new FileKt('com.example.package', 'AddressReader');

      const property = new Property();
      property.name = 'address-line1';
      property.type = new StringType();

      const bodyKt = new BodyKt();

      generator.writeParseStringField(bodyKt, spec, fileKt, property);

      expect(serializer.serializeBody(fileKt, bodyKt))
          .toBe(`\
when (token) {

    JsonToken.VALUE_STRING -> {
        val value = parser.text
        if (!value.isEmpty() && value.isBlank()) {
            parser.handleValidationFailure(
                    "Value must not be blank string: '$value'")
        } else {
            addressLine1Value = value
        }
    }
    else -> {
        parser.handleValidationFailure(
                "Expected \${JsonToken.VALUE_STRING} but was $token")
    }
}
`);
    });

    it('should support empty strings', () => {
      const fileKt = new FileKt('com.example.package', 'AddressReader');

      const property = new Property();
      property.name = 'address-line1';
      property.type = new StringType();
      property.allowEmpty = true;

      const bodyKt = new BodyKt();

      generator.writeParseStringField(bodyKt, spec, fileKt, property);

      expect(serializer.serializeBody(fileKt, bodyKt))
          .toBe(`\
when (token) {

    JsonToken.VALUE_NULL -> {
        // be lenient about null instead of empty
        addressLine1Value = ""
    }
    JsonToken.VALUE_STRING -> {
        val value = parser.text
        if (!value.isEmpty() && value.isBlank()) {
            // be lenient about blank instead of empty
            addressLine1Value = ""
        } else {
            addressLine1Value = value
        }
    }
    else -> {
        parser.handleValidationFailure(
                "Expected \${JsonToken.VALUE_STRING} but was $token")
    }
}
`);
    });

    it('should support validation for strings', () => {
      const fileKt = new FileKt('com.example.package', 'AddressReader');

      const property = new Property();
      property.name = 'address-line1';
      property.type = new StringType();

      const bodyKt = new BodyKt();

      validatingGenerator.writeParseStringField(bodyKt, spec, fileKt, property);

      expect(serializer.serializeBody(fileKt, bodyKt))
          .toBe(`\
when (token) {

    JsonToken.VALUE_STRING -> {
        val value = parser.text
        if (!value.isEmpty() && value.isBlank()) {
            parser.handleValidationFailure(
                    "Value must not be blank string: '$value'")
        } else {
            if (true) {
                addressLine1Value = value
            }
        }
    }
    else -> {
        parser.handleValidationFailure(
                "Expected \${JsonToken.VALUE_STRING} but was $token")
    }
}
`);
    });
  });

  describe('writeParseIntegerField()', () => {

    it('should support simple integers', () => {
      const fileKt = new FileKt('com.example.package', 'AddressReader');

      const property = new Property();
      property.name = 'zip-code';
      property.type = new IntegerType();

      const bodyKt = new BodyKt();

      generator.writeParseIntegerField(bodyKt, spec, fileKt, property);

      expect(serializer.serializeBody(fileKt, bodyKt))
          .toBe(`\
when (token) {

    JsonToken.VALUE_NUMBER_INT -> {
        try {
            zipCodeValue = parser.longValue
        } catch (e: JsonParseException) {
            parser.handleValidationFailure(e.message!!)
        }
    }
    else -> {
        parser.handleValidationFailure(
                "Expected \${JsonToken.VALUE_NUMBER_INT} but was $token")
    }
}
`);
    });

    it('should support null integers', () => {
      const fileKt = new FileKt('com.example.package', 'AddressReader');

      const property = new Property();
      property.name = 'zip-code';
      property.type = new IntegerType();
      property.allowNull = true;

      const bodyKt = new BodyKt();

      generator.writeParseIntegerField(bodyKt, spec, fileKt, property);

      expect(serializer.serializeBody(fileKt, bodyKt))
          .toBe(`\
when (token) {

    JsonToken.VALUE_NULL -> {
        zipCodeValue = null
    }
    JsonToken.VALUE_NUMBER_INT -> {
        try {
            zipCodeValue = parser.longValue
        } catch (e: JsonParseException) {
            parser.handleValidationFailure(e.message!!)
        }
    }
    else -> {
        parser.handleValidationFailure(
                "Expected \${JsonToken.VALUE_NUMBER_INT} or \${JsonToken.VALUE_NULL} but was $token")
    }
}
`);
    });

    it('should support validation for integers', () => {
      const fileKt = new FileKt('com.example.package', 'AddressReader');

      const property = new Property();
      property.name = 'zip-code';
      property.type = new IntegerType();

      const bodyKt = new BodyKt();

      validatingGenerator.writeParseIntegerField(bodyKt, spec, fileKt, property);

      expect(serializer.serializeBody(fileKt, bodyKt))
          .toBe(`\
when (token) {

    JsonToken.VALUE_NUMBER_INT -> {
        try {
            val value = parser.longValue
            if (true) {
                zipCodeValue = value
            }
        } catch (e: JsonParseException) {
            parser.handleValidationFailure(e.message!!)
        }
    }
    else -> {
        parser.handleValidationFailure(
                "Expected \${JsonToken.VALUE_NUMBER_INT} but was $token")
    }
}
`);
    });
  });

  describe('writeParseBooleanField()', () => {

    it('should support simple booleans', () => {
      const fileKt = new FileKt('com.example.package', 'AddressReader');

      const property = new Property();
      property.name = 'drop-box';
      property.type = new BooleanType();

      const bodyKt = new BodyKt();

      generator.writeParseBooleanField(bodyKt, spec, fileKt, property);

      expect(serializer.serializeBody(fileKt, bodyKt))
          .toBe(`\
when (token) {

    JsonToken.VALUE_TRUE -> {
        dropBoxValue = true
    }
    JsonToken.VALUE_FALSE -> {
        dropBoxValue = false
    }
    else -> {
        parser.handleValidationFailure(
                "Expected \${JsonToken.VALUE_TRUE}, \${JsonToken.VALUE_FALSE} but was $token")
    }
}
`);
    });

    it('should support null booleans', () => {
      const fileKt = new FileKt('com.example.package', 'AddressReader');

      const property = new Property();
      property.name = 'drop-box';
      property.type = new BooleanType();
      property.allowNull = true;

      const bodyKt = new BodyKt();

      generator.writeParseBooleanField(bodyKt, spec, fileKt, property);

      expect(serializer.serializeBody(fileKt, bodyKt))
          .toBe(`\
when (token) {

    JsonToken.VALUE_NULL -> {
        dropBoxValue = null
    }
    JsonToken.VALUE_TRUE -> {
        dropBoxValue = true
    }
    JsonToken.VALUE_FALSE -> {
        dropBoxValue = false
    }
    else -> {
        parser.handleValidationFailure(
                "Expected \${JsonToken.VALUE_TRUE}, \${JsonToken.VALUE_FALSE} or \${JsonToken.VALUE_NULL} but was $token")
    }
}
`);
    });
  });

  describe('writeParseClassField()', () => {

    it('should support simple classes', () => {
      const fileKt = new FileKt('com.example.package', 'AddressReader');

      const classType = new ClassType();
      classType.name = 'delivery-record';

      const property = new Property();
      property.name = 'delivery-history';
      property.type = classType;

      const bodyKt = new BodyKt();

      generator.writeParseClassField(bodyKt, spec, fileKt, property);

      expect(serializer.serializeBody(fileKt, bodyKt))
          .toBe('deliveryHistoryValue = DeliveryRecordReader.readRequiredObject(parser)\n');
    });

    it('should support nullable classes', () => {
      const fileKt = new FileKt('com.example.package', 'AddressReader');

      const classType = new ClassType();
      classType.name = 'delivery-record';

      const property = new Property();
      property.name = 'delivery-history';
      property.type = classType;
      property.allowNull = true;

      const bodyKt = new BodyKt();

      generator.writeParseClassField(bodyKt, spec, fileKt, property);

      expect(serializer.serializeBody(fileKt, bodyKt))
          .toBe('deliveryHistoryValue = DeliveryRecordReader.readOptionalObject(parser)\n');
    });

    it('should support class arrays', () => {
      const fileKt = new FileKt('com.example.package', 'AddressReader');

      const classType = new ClassType();
      classType.name = 'delivery-record';

      const property = new Property();
      property.name = 'delivery-history';
      property.type = classType;
      property.isArray = true;

      const bodyKt = new BodyKt();

      generator.writeParseClassField(bodyKt, spec, fileKt, property);

      expect(serializer.serializeBody(fileKt, bodyKt))
          .toBe('deliveryHistoryValue = DeliveryRecordReader.readRequiredArray(parser)\n');
    });
  });

  describe('writeParseField()', () => {

    it('should support strings', () => {
      const fileKt = new FileKt('com.example.package', 'AddressReader');

      const property = new Property();
      property.name = 'address-line1';
      property.type = new StringType();

      const bodyKt = new BodyKt();

      generator.writeParseField(bodyKt, spec, fileKt, property);

      expect(serializer.serializeBody(fileKt, bodyKt))
          .toBe(`\
when (token) {

    JsonToken.VALUE_STRING -> {
        val value = parser.text
        if (!value.isEmpty() && value.isBlank()) {
            parser.handleValidationFailure(
                    "Value must not be blank string: '$value'")
        } else {
            addressLine1Value = value
        }
    }
    else -> {
        parser.handleValidationFailure(
                "Expected \${JsonToken.VALUE_STRING} but was $token")
    }
}
`);
    });

    it('should support integers', () => {
      const fileKt = new FileKt('com.example.package', 'AddressReader');

      const property = new Property();
      property.name = 'zip-code';
      property.type = new IntegerType();

      const bodyKt = new BodyKt();

      generator.writeParseField(bodyKt, spec, fileKt, property);

      expect(serializer.serializeBody(fileKt, bodyKt))
          .toBe(`\
when (token) {

    JsonToken.VALUE_NUMBER_INT -> {
        try {
            zipCodeValue = parser.longValue
        } catch (e: JsonParseException) {
            parser.handleValidationFailure(e.message!!)
        }
    }
    else -> {
        parser.handleValidationFailure(
                "Expected \${JsonToken.VALUE_NUMBER_INT} but was $token")
    }
}
`);
    });

    it('should support booleans', () => {
      const fileKt = new FileKt('com.example.package', 'AddressReader');

      const property = new Property();
      property.name = 'drop-box';
      property.type = new BooleanType();

      const bodyKt = new BodyKt();

      generator.writeParseField(bodyKt, spec, fileKt, property);

      expect(serializer.serializeBody(fileKt, bodyKt))
          .toBe(`\
when (token) {

    JsonToken.VALUE_TRUE -> {
        dropBoxValue = true
    }
    JsonToken.VALUE_FALSE -> {
        dropBoxValue = false
    }
    else -> {
        parser.handleValidationFailure(
                "Expected \${JsonToken.VALUE_TRUE}, \${JsonToken.VALUE_FALSE} but was $token")
    }
}
`);
    });

    it('should support classes', () => {
      const fileKt = new FileKt('com.example.package', 'AddressReader');

      const property = new Property();
      property.name = 'delivery-history';
      const classType = new ClassType();
      classType.name = 'delivery-record';
      property.type = classType;

      const bodyKt = new BodyKt();

      generator.writeParseField(bodyKt, spec, fileKt, property);

      expect(serializer.serializeBody(fileKt, bodyKt))
          .toBe('deliveryHistoryValue = DeliveryRecordReader.readRequiredObject(parser)\n');
    });

    it('should throw error for unsupported type', () => {
      class UnsupportedTypeTest {}
      const fileKt = new FileKt('com.example.package', 'AddressReader');

      const property = new Property();
      property.name = 'unsupported';
      const unsupportedType = new UnsupportedTypeTest();
      const classType = new ClassType();
      classType.name = 'unsupported';
      property.type = <StringType>unsupportedType;

      const bodyKt = new BodyKt();

      expect(() => generator.writeParseField(bodyKt, spec, fileKt, property))
          .toThrowError('Unsupported type: UnsupportedTypeTest');
    });
  });

  describe('addCaseForProperty()', () => {

    it('should support strings', () => {
      const fileKt = new FileKt('com.example.package', 'AddressReader');

      const property = new Property();
      property.name = 'address-line1';
      property.type = new StringType();

      const whenKt = new WhenKt('test1');

      generator.addCaseForProperty(whenKt, spec, fileKt, property);

      expect(serializer.serializeWhen(fileKt, whenKt))
          .toBe(`\
when (test1) {

    "address-line1" -> {
        if (fieldNamesPresent.get(addressLine1Index)) {
            parser.handleValidationFailure("Repeated field name: $fieldName")
        }
        fieldNamesPresent.set(addressLine1Index)

        when (token) {

            JsonToken.VALUE_STRING -> {
                val value = parser.text
                if (!value.isEmpty() && value.isBlank()) {
                    parser.handleValidationFailure(
                            "Value must not be blank string: '$value'")
                } else {
                    addressLine1Value = value
                }
            }
            else -> {
                parser.handleValidationFailure(
                        "Expected \${JsonToken.VALUE_STRING} but was $token")
            }
        }
    }
}
`);
    });
  });

  describe('writeWhenOverFields()', () => {

    it('should support strings', () => {
      const fileKt = new FileKt('com.example.package', 'AddressReader');

      const property1 = new Property();
      property1.name = 'address-line1';
      property1.type = new StringType();

      const property2 = new Property();
      property2.name = 'address-line2';
      property2.type = new StringType();

      const classType = new ClassType();
      classType.name = 'delivery-address';
      classType.properties = [property1, property2];

      const bodyKt = new BodyKt();

      generator.writeWhenOverFields(bodyKt, spec, fileKt, classType);

      expect(serializer.serializeBody(fileKt, bodyKt))
          .toBe(`\
when (fieldName) {

    "address-line1" -> {
        if (fieldNamesPresent.get(addressLine1Index)) {
            parser.handleValidationFailure("Repeated field name: $fieldName")
        }
        fieldNamesPresent.set(addressLine1Index)

        when (token) {

            JsonToken.VALUE_STRING -> {
                val value = parser.text
                if (!value.isEmpty() && value.isBlank()) {
                    parser.handleValidationFailure(
                            "Value must not be blank string: '$value'")
                } else {
                    addressLine1Value = value
                }
            }
            else -> {
                parser.handleValidationFailure(
                        "Expected \${JsonToken.VALUE_STRING} but was $token")
            }
        }
    }
    "address-line2" -> {
        if (fieldNamesPresent.get(addressLine2Index)) {
            parser.handleValidationFailure("Repeated field name: $fieldName")
        }
        fieldNamesPresent.set(addressLine2Index)

        when (token) {

            JsonToken.VALUE_STRING -> {
                val value = parser.text
                if (!value.isEmpty() && value.isBlank()) {
                    parser.handleValidationFailure(
                            "Value must not be blank string: '$value'")
                } else {
                    addressLine2Value = value
                }
            }
            else -> {
                parser.handleValidationFailure(
                        "Expected \${JsonToken.VALUE_STRING} but was $token")
            }
        }
    }
    else -> {
        if (log.isTraceEnabled) {
            val location = parser.tokenLocation
            log.trace("[{}:{}] Ignoring unexpected field-name: {}",
                    location.lineNr, location.columnNr, fieldName)
        }
    }
}
`);
    });
  });

  describe('writeCheckForMissingField()', () => {

    it('should support required values', () => {
      const fileKt = new FileKt('com.example.package', 'AddressReader');

      const property1 = new Property();
      property1.name = 'address-line1';
      property1.type = new StringType();

      const bodyKt = new BodyKt();

      generator.writeCheckForMissingField(bodyKt, spec, property1);

      expect(serializer.serializeBody(fileKt, bodyKt))
          .toBe(`\
if (!fieldNamesPresent.get(addressLine1Index)) {
    parser.handleValidationFailure("Expected field name: address-line1")
}
`);
    });

    it('should support empty string', () => {
      const fileKt = new FileKt('com.example.package', 'AddressReader');

      const property1 = new Property();
      property1.name = 'address-line1';
      property1.type = new StringType();
      property1.allowEmpty = true;

      const bodyKt = new BodyKt();

      generator.writeCheckForMissingField(bodyKt, spec, property1);

      expect(serializer.serializeBody(fileKt, bodyKt))
          .toBe(`\
if (!fieldNamesPresent.get(addressLine1Index)) {
    if (log.isTraceEnabled) {
        val location = parser.tokenLocation
        log.trace("[{}:{}] Missing field: address-line1",
                location.lineNr, location.columnNr)
    }
}
`);
    });

    it('should support null values', () => {
      const fileKt = new FileKt('com.example.package', 'AddressReader');

      const property1 = new Property();
      property1.name = 'zip-code';
      property1.type = new IntegerType();
      property1.allowNull = true;

      const bodyKt = new BodyKt();

      generator.writeCheckForMissingField(bodyKt, spec, property1);

      expect(serializer.serializeBody(fileKt, bodyKt))
          .toBe(`\
if (!fieldNamesPresent.get(zipCodeIndex)) {
    if (log.isTraceEnabled) {
        val location = parser.tokenLocation
        log.trace("[{}:{}] Missing field: zip-code",
                location.lineNr, location.columnNr)
    }
}
`);
    });
  });

  describe('getStringForNewInstance()', () => {

    it('should support string values', () => {
      const fileKt = new FileKt('com.example.package', 'AddressReader');

      const property1 = new Property();
      property1.name = 'address-line1';
      property1.type = new StringType();

      const classType = new ClassType();
      classType.name = 'delivery-address';
      classType.properties = [property1];

      expect(generator.getStringForNewInstance(spec, fileKt, classType))
          .toBe(`\
return DeliveryAddress(
        addressLine1 = addressLine1Value)
`);
    });

    it('should support integer values', () => {
      const fileKt = new FileKt('com.example.package', 'AddressReader');

      const property1 = new Property();
      property1.name = 'zip-code';
      property1.type = new IntegerType();

      const classType = new ClassType();
      classType.name = 'delivery-address';
      classType.properties = [property1];

      expect(generator.getStringForNewInstance(spec, fileKt, classType))
          .toBe(`\
return DeliveryAddress(
        zipCode = zipCodeValue!!)
`);
    });

    it('should support nullable integer values', () => {
      const fileKt = new FileKt('com.example.package', 'AddressReader');

      const property1 = new Property();
      property1.name = 'zip-code-extra';
      property1.type = new IntegerType();
      property1.allowNull = true;

      const classType = new ClassType();
      classType.name = 'delivery-address';
      classType.properties = [property1];

      expect(generator.getStringForNewInstance(spec, fileKt, classType))
          .toBe(`\
return DeliveryAddress(
        zipCodeExtra = zipCodeExtraValue)
`);
    });

    it('should support string arrays', () => {
      const fileKt = new FileKt('com.example.package', 'AddressReader');

      const property1 = new Property();
      property1.name = 'address-lines';
      property1.type = new StringType();
      property1.isArray = true;

      const classType = new ClassType();
      classType.name = 'delivery-address';
      classType.properties = [property1];

      expect(generator.getStringForNewInstance(spec, fileKt, classType))
          .toBe(`\
return DeliveryAddress(
        addressLines = addressLinesValue ?: listOf())
`);
    });

    it('should support multiple properties', () => {
      const fileKt = new FileKt('com.example.package', 'AddressReader');

      const property1 = new Property();
      property1.name = 'address-line1';
      property1.type = new StringType();

      const property2 = new Property();
      property2.name = 'zip-code';
      property2.type = new IntegerType();

      const property3 = new Property();
      property3.name = 'zip-code-extra';
      property3.type = new IntegerType();
      property3.allowNull = true;

      const classType = new ClassType();
      classType.name = 'delivery-address';
      classType.properties = [property1, property2, property3];

      expect(generator.getStringForNewInstance(spec, fileKt, classType))
          .toBe(`\
return DeliveryAddress(
        addressLine1 = addressLine1Value,
        zipCode = zipCodeValue!!,
        zipCodeExtra = zipCodeExtraValue)
`);
    });

  });

  describe('addLoggerProperty()', () => {

    it('should add logger', () => {
      const fileKt = new FileKt('com.example.package', 'DeliveryAddressReader');

      const property1 = new Property();
      property1.name = 'address-line1';
      property1.type = new StringType();

      const classType = new ClassType();
      classType.name = 'delivery-address';
      classType.properties = [property1];

      const objectKt = new ObjectKt('DeliveryAddressReader');

      generator.addLoggerProperty(objectKt, classType);

      expect(objectKt.members.length).toBe(1);

      const propertyKt = objectKt.members[0];
      if (!(propertyKt instanceof PropertyKt)) {
        fail(`Expected PropertyKt but was ${propertyKt.constructor.name}`);
        return;
      }

      expect(propertyKt.name)
          .toBe('log');
      expect(propertyKt.type.className)
          .toBe('org.slf4j.Logger');
      expect(propertyKt.defaultValueFactory(fileKt))
          .toBe('LoggerFactory.getLogger(DeliveryAddressReader::class.java)');
    });
  });

  describe('addFieldIndexProperties()', () => {

    it('should add index field', () => {
      const fileKt = new FileKt('com.example.package', 'DeliveryAddressReader');

      const property1 = new Property();
      property1.name = 'address-line1';
      property1.type = new StringType();

      const property2 = new Property();
      property2.name = 'address-line2';
      property2.type = new StringType();

      const classType = new ClassType();
      classType.name = 'delivery-address';
      classType.properties = [property1, property2];

      const objectKt = new ObjectKt('DeliveryAddressReader');

      generator.addFieldIndexProperties(objectKt, classType);

      expect(objectKt.members.length).toBe(2);

      const property1Kt = objectKt.members[0];
      if (!(property1Kt instanceof PropertyKt)) {
        fail(`Expected PropertyKt but was ${property1Kt.constructor.name}`);
        return;
      }

      expect(property1Kt.name)
          .toBe('addressLine1Index');

      expect(property1Kt.type.className)
          .toBe('kotlin.Int');

      expect(property1Kt.defaultValueFactory(fileKt))
          .toBe('0');

      const property2Kt = objectKt.members[1];
      if (!(property2Kt instanceof PropertyKt)) {
        fail(`Expected PropertyKt but was ${property2Kt.constructor.name}`);
        return;
      }

      expect(property2Kt.name)
          .toBe('addressLine2Index');

      expect(property2Kt.type.className)
          .toBe('kotlin.Int');

      expect(property2Kt.defaultValueFactory(fileKt))
          .toBe('1');
    });
  });

  describe('addReaderKotlinObject()', () => {

    it('should add logger', () => {
      const fileKt = new FileKt('com.example.package', 'DeliveryAddressReader');

      const property1 = new Property();
      property1.name = 'address-line1';
      property1.type = new StringType();

      const property2 = new Property();
      property2.name = 'address-line2';
      property2.type = new StringType();

      const classType = new ClassType();
      classType.name = 'delivery-address';
      classType.properties = [property1, property2];

      generator.addReaderKotlinObject(fileKt, spec, classType);

      expect(serializer.serializeFile(fileKt))
          .toBe(`\
package com.example.package

import com.fasterxml.jackson.core.JsonToken
import com.gantsign.restrulz.jackson.reader.JacksonObjectReader
import com.gantsign.restrulz.jackson.reader.ValidationHandlingJsonParser
import java.util.BitSet
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import testing.model.DeliveryAddress

object DeliveryAddressReader : JacksonObjectReader<DeliveryAddress>() {

    private val log: Logger = LoggerFactory.getLogger(DeliveryAddressReader::class.java)
    private val addressLine1Index: Int = 0
    private val addressLine2Index: Int = 1

    override fun readRequiredObject(parser: ValidationHandlingJsonParser): DeliveryAddress? {

        val startObject = parser.currentToken()

        if (startObject != JsonToken.START_OBJECT) {
            parser.handleValidationFailure(
                    "Expected \${JsonToken.START_OBJECT} but was $startObject")
            return null
        }

        val fieldNamesPresent = BitSet()

        var addressLine1Value: String = ""
        var addressLine2Value: String = ""

        // Iterate over object fields
        while (parser.nextToken() !== JsonToken.END_OBJECT) {

            val fieldName = parser.currentName

            // Move to value
            val token = parser.nextToken()

            when (fieldName) {

                "address-line1" -> {
                    if (fieldNamesPresent.get(addressLine1Index)) {
                        parser.handleValidationFailure("Repeated field name: $fieldName")
                    }
                    fieldNamesPresent.set(addressLine1Index)

                    when (token) {

                        JsonToken.VALUE_STRING -> {
                            val value = parser.text
                            if (!value.isEmpty() && value.isBlank()) {
                                parser.handleValidationFailure(
                                        "Value must not be blank string: '$value'")
                            } else {
                                addressLine1Value = value
                            }
                        }
                        else -> {
                            parser.handleValidationFailure(
                                    "Expected \${JsonToken.VALUE_STRING} but was $token")
                        }
                    }
                }
                "address-line2" -> {
                    if (fieldNamesPresent.get(addressLine2Index)) {
                        parser.handleValidationFailure("Repeated field name: $fieldName")
                    }
                    fieldNamesPresent.set(addressLine2Index)

                    when (token) {

                        JsonToken.VALUE_STRING -> {
                            val value = parser.text
                            if (!value.isEmpty() && value.isBlank()) {
                                parser.handleValidationFailure(
                                        "Value must not be blank string: '$value'")
                            } else {
                                addressLine2Value = value
                            }
                        }
                        else -> {
                            parser.handleValidationFailure(
                                    "Expected \${JsonToken.VALUE_STRING} but was $token")
                        }
                    }
                }
                else -> {
                    if (log.isTraceEnabled) {
                        val location = parser.tokenLocation
                        log.trace("[{}:{}] Ignoring unexpected field-name: {}",
                                location.lineNr, location.columnNr, fieldName)
                    }
                }
            }
        }
        if (!fieldNamesPresent.get(addressLine1Index)) {
            parser.handleValidationFailure("Expected field name: address-line1")
        }
        if (!fieldNamesPresent.get(addressLine2Index)) {
            parser.handleValidationFailure("Expected field name: address-line2")
        }

        if (parser.hasValidationFailures) {
            return null
        }
        return DeliveryAddress(
                addressLine1 = addressLine1Value,
                addressLine2 = addressLine2Value)
    }
}
`);
    });
  });

  describe('addFactoryKotlinObject()', () => {

    it('should convert kebab case to capitalized camel case', () => {
      const fileKt = new FileKt('com.example.package', 'DeliveryAddressReader');

      const classType = new ClassType();
      classType.name = 'delivery-address';

      generator.addFactoryKotlinObject(fileKt, spec, classType);

      expect(fileKt.members.length).toBe(1);

      const objectKt = fileKt.members[0];
      if (!(objectKt instanceof ObjectKt)) {
        fail(`Expected ObjectKt but was ${objectKt.constructor.name}`);
        return;
      }

      expect(objectKt.name).toBe('DeliveryAddressReaderFactory');

      expect(objectKt.extendsClasses.length).toBe(1);
      const implementsKt = objectKt.extendsClasses[0];
      if (!(implementsKt instanceof ImplementsKt)) {
        fail(`Expected ImplementsKt but was ${implementsKt.constructor.name}`);
        return;
      }

      const implementsType = implementsKt.type;

      expect(implementsType.className)
          .toBe('com.gantsign.restrulz.json.reader.JsonObjectReaderFactory');

      expect(implementsType.genericParameters.length)
          .toBe(1);

      expect(implementsType.genericParameters[0].className)
          .toBe('testing.model.DeliveryAddress');

      expect(objectKt.members.length).toBe(1);
      const propertyKt = objectKt.members[0];
      if (!(propertyKt instanceof PropertyKt)) {
        fail(`Expected PropertyKt but was ${propertyKt.constructor.name}`);
        return;
      }

      expect(propertyKt.name).toBe('jsonReader');
      expect(propertyKt.overrides).toBeTruthy();

      const propertyType = propertyKt.type;

      expect(propertyType.className)
          .toBe('com.gantsign.restrulz.json.reader.JsonObjectReader');

      expect(propertyType.genericParameters.length)
          .toBe(1);

      expect(propertyType.genericParameters[0].className)
          .toBe('testing.model.DeliveryAddress');

      expect(serializer.serializeBody(fileKt, propertyKt.getterBody))
          .toBe('return DeliveryAddressReader\n');
    });
  });

  describe('toReaderKotlinFile()', () => {

    it('should create reader', () => {
      const property1 = new Property();
      property1.name = 'address-line1';
      property1.type = new StringType();

      const property2 = new Property();
      property2.name = 'address-line2';
      property2.type = new StringType();

      const classType = new ClassType();
      classType.name = 'delivery-address';
      classType.properties = [property1, property2];

      const fileKt = generator.toReaderKotlinFile(spec, classType);

      expect(fileKt.packageName)
          .toBe('testing.model.json.reader.impl');

      expect(fileKt.fileName)
          .toBe('DeliveryAddressReader');

      expect(serializer.serializeFile(fileKt))
          .toBe(`\
package testing.model.json.reader.impl

import com.fasterxml.jackson.core.JsonToken
import com.gantsign.restrulz.jackson.reader.JacksonObjectReader
import com.gantsign.restrulz.jackson.reader.ValidationHandlingJsonParser
import java.util.BitSet
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import testing.model.DeliveryAddress

object DeliveryAddressReader : JacksonObjectReader<DeliveryAddress>() {

    private val log: Logger = LoggerFactory.getLogger(DeliveryAddressReader::class.java)
    private val addressLine1Index: Int = 0
    private val addressLine2Index: Int = 1

    override fun readRequiredObject(parser: ValidationHandlingJsonParser): DeliveryAddress? {

        val startObject = parser.currentToken()

        if (startObject != JsonToken.START_OBJECT) {
            parser.handleValidationFailure(
                    "Expected \${JsonToken.START_OBJECT} but was $startObject")
            return null
        }

        val fieldNamesPresent = BitSet()

        var addressLine1Value: String = ""
        var addressLine2Value: String = ""

        // Iterate over object fields
        while (parser.nextToken() !== JsonToken.END_OBJECT) {

            val fieldName = parser.currentName

            // Move to value
            val token = parser.nextToken()

            when (fieldName) {

                "address-line1" -> {
                    if (fieldNamesPresent.get(addressLine1Index)) {
                        parser.handleValidationFailure("Repeated field name: $fieldName")
                    }
                    fieldNamesPresent.set(addressLine1Index)

                    when (token) {

                        JsonToken.VALUE_STRING -> {
                            val value = parser.text
                            if (!value.isEmpty() && value.isBlank()) {
                                parser.handleValidationFailure(
                                        "Value must not be blank string: '$value'")
                            } else {
                                addressLine1Value = value
                            }
                        }
                        else -> {
                            parser.handleValidationFailure(
                                    "Expected \${JsonToken.VALUE_STRING} but was $token")
                        }
                    }
                }
                "address-line2" -> {
                    if (fieldNamesPresent.get(addressLine2Index)) {
                        parser.handleValidationFailure("Repeated field name: $fieldName")
                    }
                    fieldNamesPresent.set(addressLine2Index)

                    when (token) {

                        JsonToken.VALUE_STRING -> {
                            val value = parser.text
                            if (!value.isEmpty() && value.isBlank()) {
                                parser.handleValidationFailure(
                                        "Value must not be blank string: '$value'")
                            } else {
                                addressLine2Value = value
                            }
                        }
                        else -> {
                            parser.handleValidationFailure(
                                    "Expected \${JsonToken.VALUE_STRING} but was $token")
                        }
                    }
                }
                else -> {
                    if (log.isTraceEnabled) {
                        val location = parser.tokenLocation
                        log.trace("[{}:{}] Ignoring unexpected field-name: {}",
                                location.lineNr, location.columnNr, fieldName)
                    }
                }
            }
        }
        if (!fieldNamesPresent.get(addressLine1Index)) {
            parser.handleValidationFailure("Expected field name: address-line1")
        }
        if (!fieldNamesPresent.get(addressLine2Index)) {
            parser.handleValidationFailure("Expected field name: address-line2")
        }

        if (parser.hasValidationFailures) {
            return null
        }
        return DeliveryAddress(
                addressLine1 = addressLine1Value,
                addressLine2 = addressLine2Value)
    }
}
`);
    });

  });

  describe('toFactoryKotlinFile()', () => {

    it('should create factory', () => {

      const classType = new ClassType();
      classType.name = 'delivery-address';

      const fileKt = generator.toFactoryKotlinFile(spec, classType);

      expect(fileKt.packageName)
          .toBe('testing.model.json.reader');

      expect(fileKt.fileName)
          .toBe('DeliveryAddressReaderFactory');

      expect(fileKt.members.length).toBe(1);

      const objectKt = fileKt.members[0];
      if (!(objectKt instanceof ObjectKt)) {
        fail(`Expected ObjectKt but was ${objectKt.constructor.name}`);
        return;
      }

      expect(objectKt.name)
          .toBe('DeliveryAddressReaderFactory');

      expect(objectKt.extendsClasses.length).toBe(1);
      const implementsKt = objectKt.extendsClasses[0];
      if (!(implementsKt instanceof ImplementsKt)) {
        fail(`Expected ImplementsKt but was ${implementsKt.constructor.name}`);
        return;
      }

      const implementsType = implementsKt.type;

      expect(implementsType.className)
          .toBe('com.gantsign.restrulz.json.reader.JsonObjectReaderFactory');

      expect(implementsType.genericParameters.length)
          .toBe(1);

      expect(implementsType.genericParameters[0].className)
          .toBe('testing.model.DeliveryAddress');

      expect(objectKt.members.length).toBe(1);
      const propertyKt = objectKt.members[0];
      if (!(propertyKt instanceof PropertyKt)) {
        fail(`Expected PropertyKt but was ${propertyKt.constructor.name}`);
        return;
      }

      expect(propertyKt.name).toBe('jsonReader');
      expect(propertyKt.overrides).toBeTruthy();

      const propertyType = propertyKt.type;

      expect(propertyType.className)
          .toBe('com.gantsign.restrulz.json.reader.JsonObjectReader');

      expect(propertyType.genericParameters.length)
          .toBe(1);

      expect(propertyType.genericParameters[0].className)
          .toBe('testing.model.DeliveryAddress');

      expect(serializer.serializeBody(fileKt, propertyKt.getterBody))
          .toBe('return DeliveryAddressReader\n');
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

  describe('generateReaderFiles()', () => {

    it('should generate reader files', () => {
      const property1 = new Property();
      property1.name = 'address-line1';
      property1.type = new StringType();

      const property2 = new Property();
      property2.name = 'address-line2';
      property2.type = new StringType();

      const classType1 = new ClassType();
      classType1.name = 'delivery-address';
      classType1.properties = [property1, property2];

      const classType2 = new ClassType();
      classType2.name = 'postal-address';
      classType2.properties = [property1];

      const fullSpec = new Specification();
      fullSpec.name = 'testing';
      fullSpec.classTypes = [classType1, classType2];

      const context = new MockGeneratorContext();

      generator.generateReaderFiles(fullSpec, context);

      expect(context.outputPaths.length).toBe(2);

      expect(context.outputPaths[0])
          .toBe('testing/model/json/reader/impl/DeliveryAddressReader.kt');

      expect(context.contents[0])
          .toBe(`\
package testing.model.json.reader.impl

import com.fasterxml.jackson.core.JsonToken
import com.gantsign.restrulz.jackson.reader.JacksonObjectReader
import com.gantsign.restrulz.jackson.reader.ValidationHandlingJsonParser
import java.util.BitSet
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import testing.model.DeliveryAddress

object DeliveryAddressReader : JacksonObjectReader\<DeliveryAddress>() {

    private val log: Logger = LoggerFactory.getLogger(DeliveryAddressReader::class.java)
    private val addressLine1Index: Int = 0
    private val addressLine2Index: Int = 1

    override fun readRequiredObject(parser: ValidationHandlingJsonParser): DeliveryAddress? {

        val startObject = parser.currentToken()

        if (startObject != JsonToken.START_OBJECT) {
            parser.handleValidationFailure(
                    "Expected \${JsonToken.START_OBJECT} but was $startObject")
            return null
        }

        val fieldNamesPresent = BitSet()

        var addressLine1Value: String = ""
        var addressLine2Value: String = ""

        // Iterate over object fields
        while (parser.nextToken() !== JsonToken.END_OBJECT) {

            val fieldName = parser.currentName

            // Move to value
            val token = parser.nextToken()

            when (fieldName) {

                "address-line1" -> {
                    if (fieldNamesPresent.get(addressLine1Index)) {
                        parser.handleValidationFailure("Repeated field name: $fieldName")
                    }
                    fieldNamesPresent.set(addressLine1Index)

                    when (token) {

                        JsonToken.VALUE_STRING -> {
                            val value = parser.text
                            if (!value.isEmpty() && value.isBlank()) {
                                parser.handleValidationFailure(
                                        "Value must not be blank string: '$value'")
                            } else {
                                addressLine1Value = value
                            }
                        }
                        else -> {
                            parser.handleValidationFailure(
                                    "Expected \${JsonToken.VALUE_STRING} but was $token")
                        }
                    }
                }
                "address-line2" -> {
                    if (fieldNamesPresent.get(addressLine2Index)) {
                        parser.handleValidationFailure("Repeated field name: $fieldName")
                    }
                    fieldNamesPresent.set(addressLine2Index)

                    when (token) {

                        JsonToken.VALUE_STRING -> {
                            val value = parser.text
                            if (!value.isEmpty() && value.isBlank()) {
                                parser.handleValidationFailure(
                                        "Value must not be blank string: '$value'")
                            } else {
                                addressLine2Value = value
                            }
                        }
                        else -> {
                            parser.handleValidationFailure(
                                    "Expected \${JsonToken.VALUE_STRING} but was $token")
                        }
                    }
                }
                else -> {
                    if (log.isTraceEnabled) {
                        val location = parser.tokenLocation
                        log.trace("[{}:{}] Ignoring unexpected field-name: {}",
                                location.lineNr, location.columnNr, fieldName)
                    }
                }
            }
        }
        if (!fieldNamesPresent.get(addressLine1Index)) {
            parser.handleValidationFailure("Expected field name: address-line1")
        }
        if (!fieldNamesPresent.get(addressLine2Index)) {
            parser.handleValidationFailure("Expected field name: address-line2")
        }

        if (parser.hasValidationFailures) {
            return null
        }
        return DeliveryAddress(
                addressLine1 = addressLine1Value,
                addressLine2 = addressLine2Value)
    }
}
`);

      expect(context.outputPaths[1])
          .toBe('testing/model/json/reader/impl/PostalAddressReader.kt');

      expect(context.contents[1])
          .toBe(`\
package testing.model.json.reader.impl

import com.fasterxml.jackson.core.JsonToken
import com.gantsign.restrulz.jackson.reader.JacksonObjectReader
import com.gantsign.restrulz.jackson.reader.ValidationHandlingJsonParser
import java.util.BitSet
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import testing.model.PostalAddress

object PostalAddressReader : JacksonObjectReader\<PostalAddress>() {

    private val log: Logger = LoggerFactory.getLogger(PostalAddressReader::class.java)
    private val addressLine1Index: Int = 0

    override fun readRequiredObject(parser: ValidationHandlingJsonParser): PostalAddress? {

        val startObject = parser.currentToken()

        if (startObject != JsonToken.START_OBJECT) {
            parser.handleValidationFailure(
                    "Expected \${JsonToken.START_OBJECT} but was $startObject")
            return null
        }

        val fieldNamesPresent = BitSet()

        var addressLine1Value: String = ""

        // Iterate over object fields
        while (parser.nextToken() !== JsonToken.END_OBJECT) {

            val fieldName = parser.currentName

            // Move to value
            val token = parser.nextToken()

            when (fieldName) {

                "address-line1" -> {
                    if (fieldNamesPresent.get(addressLine1Index)) {
                        parser.handleValidationFailure("Repeated field name: $fieldName")
                    }
                    fieldNamesPresent.set(addressLine1Index)

                    when (token) {

                        JsonToken.VALUE_STRING -> {
                            val value = parser.text
                            if (!value.isEmpty() && value.isBlank()) {
                                parser.handleValidationFailure(
                                        "Value must not be blank string: '$value'")
                            } else {
                                addressLine1Value = value
                            }
                        }
                        else -> {
                            parser.handleValidationFailure(
                                    "Expected \${JsonToken.VALUE_STRING} but was $token")
                        }
                    }
                }
                else -> {
                    if (log.isTraceEnabled) {
                        val location = parser.tokenLocation
                        log.trace("[{}:{}] Ignoring unexpected field-name: {}",
                                location.lineNr, location.columnNr, fieldName)
                    }
                }
            }
        }
        if (!fieldNamesPresent.get(addressLine1Index)) {
            parser.handleValidationFailure("Expected field name: address-line1")
        }

        if (parser.hasValidationFailures) {
            return null
        }
        return PostalAddress(
                addressLine1 = addressLine1Value)
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
          .toBe('testing/model/json/reader/DeliveryAddressReaderFactory.kt');

      expect(context.contents[0]).toBe(`\
package testing.model.json.reader

import com.gantsign.restrulz.json.reader.JsonObjectReader
import com.gantsign.restrulz.json.reader.JsonObjectReaderFactory
import testing.model.DeliveryAddress
import testing.model.json.reader.impl.DeliveryAddressReader

object DeliveryAddressReaderFactory : JsonObjectReaderFactory\<DeliveryAddress> {

    override val jsonReader: JsonObjectReader\<DeliveryAddress>
        get() {
            return DeliveryAddressReader
        }
}
`);

      expect(context.outputPaths[1])
          .toBe('testing/model/json/reader/DeliveryCustomerReaderFactory.kt');

      expect(context.contents[1]).toBe(`\
package testing.model.json.reader

import com.gantsign.restrulz.json.reader.JsonObjectReader
import com.gantsign.restrulz.json.reader.JsonObjectReaderFactory
import testing.model.DeliveryCustomer
import testing.model.json.reader.impl.DeliveryCustomerReader

object DeliveryCustomerReaderFactory : JsonObjectReaderFactory\<DeliveryCustomer> {

    override val jsonReader: JsonObjectReader\<DeliveryCustomer>
        get() {
            return DeliveryCustomerReader
        }
}
`);
    });

  });

  describe('generateFiles()', () => {

    it('should generate reader and factory files', () => {
      const property1 = new Property();
      property1.name = 'address-line1';
      property1.type = new StringType();

      const classType1 = new ClassType();
      classType1.name = 'delivery-address';
      classType1.properties = [property1];

      const fullSpec = new Specification();
      fullSpec.name = 'testing';
      fullSpec.classTypes = [classType1];

      const context = new MockGeneratorContext();

      generator.generateFiles(fullSpec, context);

      expect(context.outputPaths.length).toBe(2);

      expect(context.outputPaths[0])
          .toBe('testing/model/json/reader/impl/DeliveryAddressReader.kt');

      expect(context.contents[0])
          .toBe(`\
package testing.model.json.reader.impl

import com.fasterxml.jackson.core.JsonToken
import com.gantsign.restrulz.jackson.reader.JacksonObjectReader
import com.gantsign.restrulz.jackson.reader.ValidationHandlingJsonParser
import java.util.BitSet
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import testing.model.DeliveryAddress

object DeliveryAddressReader : JacksonObjectReader\<DeliveryAddress>() {

    private val log: Logger = LoggerFactory.getLogger(DeliveryAddressReader::class.java)
    private val addressLine1Index: Int = 0

    override fun readRequiredObject(parser: ValidationHandlingJsonParser): DeliveryAddress? {

        val startObject = parser.currentToken()

        if (startObject != JsonToken.START_OBJECT) {
            parser.handleValidationFailure(
                    "Expected \${JsonToken.START_OBJECT} but was $startObject")
            return null
        }

        val fieldNamesPresent = BitSet()

        var addressLine1Value: String = ""

        // Iterate over object fields
        while (parser.nextToken() !== JsonToken.END_OBJECT) {

            val fieldName = parser.currentName

            // Move to value
            val token = parser.nextToken()

            when (fieldName) {

                "address-line1" -> {
                    if (fieldNamesPresent.get(addressLine1Index)) {
                        parser.handleValidationFailure("Repeated field name: $fieldName")
                    }
                    fieldNamesPresent.set(addressLine1Index)

                    when (token) {

                        JsonToken.VALUE_STRING -> {
                            val value = parser.text
                            if (!value.isEmpty() && value.isBlank()) {
                                parser.handleValidationFailure(
                                        "Value must not be blank string: '$value'")
                            } else {
                                addressLine1Value = value
                            }
                        }
                        else -> {
                            parser.handleValidationFailure(
                                    "Expected \${JsonToken.VALUE_STRING} but was $token")
                        }
                    }
                }
                else -> {
                    if (log.isTraceEnabled) {
                        val location = parser.tokenLocation
                        log.trace("[{}:{}] Ignoring unexpected field-name: {}",
                                location.lineNr, location.columnNr, fieldName)
                    }
                }
            }
        }
        if (!fieldNamesPresent.get(addressLine1Index)) {
            parser.handleValidationFailure("Expected field name: address-line1")
        }

        if (parser.hasValidationFailures) {
            return null
        }
        return DeliveryAddress(
                addressLine1 = addressLine1Value)
    }
}
`);

      expect(context.outputPaths[1])
          .toBe('testing/model/json/reader/DeliveryAddressReaderFactory.kt');

      expect(context.contents[1])
          .toBe(`\
package testing.model.json.reader

import com.gantsign.restrulz.json.reader.JsonObjectReader
import com.gantsign.restrulz.json.reader.JsonObjectReaderFactory
import testing.model.DeliveryAddress
import testing.model.json.reader.impl.DeliveryAddressReader

object DeliveryAddressReaderFactory : JsonObjectReaderFactory<DeliveryAddress> {

    override val jsonReader: JsonObjectReader<DeliveryAddress>
        get() {
            return DeliveryAddressReader
        }
}
`);
    });

  });

});
