/*
 * Copyright 2017 GantSign Ltd. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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
import {
  BooleanType,
  ClassType,
  IntegerType,
  Property,
  Specification,
  StringType
} from '../../restrulz/model';
import {Generator, GeneratorContext} from '../../generator';
import {
  BodyKt,
  FileKt,
  ObjectKt,
  VisibilityKt,
  WhenKt
} from '../lang';
import {KotlinGenerator} from '../generator';
import {kebabToCamel} from '../../util/kebab';

export class KotlinJsonReaderGenerator extends KotlinGenerator {

  //noinspection JSUnusedGlobalSymbols
  'classes:restrulz.kotlin.KotlinJsonReaderGenerator' = true;

  public static assignableFrom(
      generator: Generator): generator is KotlinJsonReaderGenerator {

    return 'classes:restrulz.kotlin.KotlinJsonReaderGenerator' in generator;
  }

  public getReaderPackageName(spec: Specification): string {

    return this.packageMapping[`${spec.name}.model.json.reader.impl`]
        || `${this.getModelPackageName(spec)}.json.reader.impl`;
  }

  //noinspection JSMethodCanBeStatic
  public getReaderClassName(classType: ClassType): string {

    return `${this.toKotlinClassName(classType.name)}Reader`;
  }

  public getQualifiedReaderClass(spec: Specification, classType: ClassType): string {

    const packageName = this.getReaderPackageName(spec);
    const className = this.getReaderClassName(classType);
    return `${packageName}.${className}`;
  }

  public getFactoryPackageName(spec: Specification): string {

    return `${this.getModelPackageName(spec)}.json.reader`;
  }

  //noinspection JSMethodCanBeStatic
  public getFactoryClassName(classType: ClassType): string {

    return `${this.toKotlinClassName(classType.name)}ReaderFactory`;
  }

  public getStringForPropertiesWithDefaultValues(spec: Specification,
                                                 fileKt: FileKt,
                                                 property: Property): string {

    const {name, type, isArray} = property;
    let result = `var ${kebabToCamel(name)}Value: `;
    const kotlinType = fileKt.tryImport(this.toKotlinType(spec, type));
    if (isArray) {
      const list = fileKt.tryImport('kotlin.collections.List');
      result += `${list}<${kotlinType}>?`;
    } else {
      result += kotlinType;
    }
    if (isArray) {
      const listOf = fileKt.tryImport('kotlin.collections.listOf');
      result += ' = listOf()';
    } else if (type instanceof StringType) {
      result += ' = ""';
    } else {
      result += '? = null';
    }
    result += '\n';
    return result;
  }

  //noinspection JSMethodCanBeStatic,JSUnusedLocalSymbols
  public getStringForValidateProperty(
      spec: Specification, fileKt: FileKt, property: Property): string {

    return '';
  }

  public writeParseStringField(bodyKt: BodyKt,
                               spec: Specification,
                               fileKt: FileKt,
                               property: Property): void {

    const {name, allowEmpty} = property;
    const propertyName = kebabToCamel(name);
    const jsonToken = fileKt.tryImport('com.fasterxml.jackson.core.JsonToken');
    const validateProperty = this.getStringForValidateProperty(spec, fileKt, property);
    const indent = this.indent;

    bodyKt.writeWhen('token', whenKt => {

      if (allowEmpty) {
        whenKt.addCase(() => `${jsonToken}.VALUE_NULL`, caseBodyKt => {

          caseBodyKt.writeLn('// be lenient about null instead of empty');
          caseBodyKt.writeLn(`${propertyName}Value = ""`);
        });
      }

      whenKt.addCase(() => `${jsonToken}.VALUE_STRING`, caseBodyKt => {

        caseBodyKt.writeLn('val value = parser.text');
        caseBodyKt.writeIf(
            () => '!value.isEmpty() && value.isBlank()',
            ifBodyKt => {

          if (allowEmpty) {

            ifBodyKt.writeLn('// be lenient about blank instead of empty');
            ifBodyKt.writeLn(`${propertyName}Value = ""`);

          } else {

            ifBodyKt.writeLn('parser.handleValidationFailure(');
            ifBodyKt.writeLn(indent(indent('"Value must not be blank string: \'$value\'")')));
          }

        }).setElse(elseBodyKt => {

          if (validateProperty === '') {

            elseBodyKt.writeLn(`${propertyName}Value = value`);

          } else {

            elseBodyKt.writeIf(() => validateProperty, ifBodyKt => {
              ifBodyKt.writeLn(`${propertyName}Value = value`);
            });
          }
        });
      });

      whenKt.setElse(elseBodyKt => {

        elseBodyKt.writeLn('parser.handleValidationFailure(');
        elseBodyKt.writeLn(indent(indent(
            `"Expected \${${jsonToken}.VALUE_STRING} but was $token")`)));
      })
    });
  }

  public writeParseIntegerField(bodyKt: BodyKt,
                                spec: Specification,
                                fileKt: FileKt,
                                property: Property): void {

    const {name, allowNull} = property;
    const propertyName = kebabToCamel(name);
    const jsonToken = fileKt.tryImport('com.fasterxml.jackson.core.JsonToken');
    const validateProperty = this.getStringForValidateProperty(spec, fileKt, property);
    const kotlinType = this.toKotlinIntegerType(property.type as IntegerType);
    const jacksonProperty = `${kotlinType.substring('kotlin.'.length).toLowerCase()}Value`;
    const indent = this.indent;

    bodyKt.writeWhen('token', whenKt => {

      if (allowNull) {

        whenKt.addCase(() => `${jsonToken}.VALUE_NULL`, caseBodyKt => {

          caseBodyKt.writeLn(`${propertyName}Value = null`);
        });
      }

      whenKt.addCase(() => `${jsonToken}.VALUE_NUMBER_INT`, caseBodyKt => {

        caseBodyKt.writeTry(tryBodyKt => {

          if (validateProperty === '') {

            tryBodyKt.writeLn(`${propertyName}Value = parser.${jacksonProperty}`);

          } else {

            tryBodyKt.writeLn(`val value = parser.${jacksonProperty}`);
            tryBodyKt.writeIf(() => validateProperty, ifBlockKt => {
              ifBlockKt.writeLn(`${propertyName}Value = value`);
            });
          }
        }).setCatch('e', 'com.fasterxml.jackson.core.JsonParseException', catchBodyKt => {

          catchBodyKt.writeLn('parser.handleValidationFailure(e.message!!)');
        });
      });

      whenKt.setElse(elseBodyKt => {

        elseBodyKt.writeLn('parser.handleValidationFailure(');
        elseBodyKt.write(indent(indent(`"Expected \${${jsonToken}.VALUE_NUMBER_INT} `)));

        if (allowNull) {
          elseBodyKt.write(`or \${${jsonToken}.VALUE_NULL} `);
        }
        elseBodyKt.writeLn('but was $token")');
      });
    });
  }

  //noinspection JSUnusedLocalSymbols
  public writeParseBooleanField(bodyKt: BodyKt,
                                spec: Specification,
                                fileKt: FileKt,
                                property: Property): void {

    const {name, allowNull} = property;
    const propertyName = kebabToCamel(name);
    const jsonToken = fileKt.tryImport('com.fasterxml.jackson.core.JsonToken');
    const indent = this.indent;

    bodyKt.writeWhen('token', whenKt => {

      if (allowNull) {
        whenKt.addCase(() => `${jsonToken}.VALUE_NULL`, caseBodyKt => {

          caseBodyKt.writeLn(`${propertyName}Value = null`);
        });
      }

      whenKt.addCase(() => `${jsonToken}.VALUE_TRUE`, caseBodyKt => {

        caseBodyKt.writeLn(`${propertyName}Value = true`);
      });

      whenKt.addCase(() => `${jsonToken}.VALUE_FALSE`, caseBodyKt => {

        caseBodyKt.writeLn(`${propertyName}Value = false`);
      });

      whenKt.setElse(elseBodyKt => {

        elseBodyKt.writeLn('parser.handleValidationFailure(');
        elseBodyKt.write(indent(indent(
            `"Expected \${${jsonToken}.VALUE_TRUE}, \${${jsonToken}.VALUE_FALSE} `)));

        if (allowNull) {
          elseBodyKt.write(`or \${${jsonToken}.VALUE_NULL} `);
        }
        elseBodyKt.writeLn('but was $token")')
      });

    });
  }

  public writeParseClassField(bodyKt: BodyKt,
                              spec: Specification,
                              fileKt: FileKt,
                              property: Property): void {

    const {name, type, isArray, allowNull} = property;
    const propertyName = kebabToCamel(name);
    const readerClass = fileKt.tryImport(this.getQualifiedReaderClass(spec, type as ClassType));

    const requiredPrefix = allowNull ? 'Optional' : 'Required';
    const valueType = isArray ? 'Array' : 'Object';
    const methodName = `read${requiredPrefix}${valueType}`;

    bodyKt.writeLn(`${propertyName}Value = ${readerClass}.${methodName}(parser)`);
  }

  public writeParseField(bodyKt: BodyKt,
                         spec: Specification,
                         fileKt: FileKt,
                         property: Property): void {

    const {type} = property;

    if (type instanceof StringType) {

      this.writeParseStringField(bodyKt, spec, fileKt, property);

    } else if (type instanceof IntegerType) {

      this.writeParseIntegerField(bodyKt, spec, fileKt, property);

    } else if (type instanceof BooleanType) {

      this.writeParseBooleanField(bodyKt, spec, fileKt, property);

    } else if (type instanceof ClassType) {

      this.writeParseClassField(bodyKt, spec, fileKt, property);

    } else {

      throw new Error(`Unsupported type: ${type.constructor.name}`);
    }
  }

  public addCaseForProperty(whenKt: WhenKt,
                            spec: Specification,
                            fileKt: FileKt,
                            property: Property): void {

    const {name} = property;
    const fieldName = name;
    const propertyName = kebabToCamel(name);

    whenKt.addCase(() => this.toKotlinString(fieldName), bodyKt => {

      bodyKt.writeIf(() => `fieldNamesPresent.get(${propertyName}Index)`, ifBodyKt => {

        ifBodyKt.writeLn('parser.handleValidationFailure("Repeated field name: $fieldName")');
      });
      bodyKt.writeLn(`fieldNamesPresent.set(${propertyName}Index)`);
      bodyKt.writeLn('');
      this.writeParseField(bodyKt, spec, fileKt, property);
    });
  }

  public writeWhenOverFields(bodyKt: BodyKt,
                             spec: Specification,
                             fileKt: FileKt,
                             classType: ClassType): void {

    const {properties} = classType;
    const indent = this.indent;

    bodyKt.writeWhen('fieldName', whenKt => {
      properties.forEach(prop => this.addCaseForProperty(whenKt, spec, fileKt, prop));

      whenKt.setElse(elseBodyKt => {

        elseBodyKt.writeIf(() => 'log.isTraceEnabled', ifBlockKt => {

          ifBlockKt.writeLn('val location = parser.tokenLocation');
          ifBlockKt.writeLn(`log.trace("[{}:{}] Ignoring unexpected field-name: {}",`);
          ifBlockKt.writeLn(indent(indent('location.lineNr, location.columnNr, fieldName)')));
        });
      });
    });
  }

  //noinspection JSUnusedLocalSymbols
  public writeCheckForMissingField(bodyKt: BodyKt,
                                   spec: Specification,
                                   property: Property): void {

    const {name, allowNull, allowEmpty} = property;
    const fieldName = name;
    const propertyName = kebabToCamel(name);
    const indent = this.indent;

    bodyKt.writeIf(() => `!fieldNamesPresent.get(${propertyName}Index)`, ifBodyKt => {

      if (allowNull || allowEmpty) {

        ifBodyKt.writeIf(() => 'log.isTraceEnabled', logBodyKt => {

          logBodyKt.writeLn('val location = parser.tokenLocation');
          logBodyKt.writeLn(`log.trace("[{}:{}] Missing field: ${fieldName}",`);
          logBodyKt.writeLn(indent(indent('location.lineNr, location.columnNr)')));

        });
      } else {

        ifBodyKt.writeLn(`parser.handleValidationFailure("Expected field name: ${fieldName}")`);
      }
    });
  }

  public getStringForNewInstance(spec: Specification,
                                 fileKt: FileKt,
                                 classType: ClassType): string {

    const {properties} = classType;
    const className = this.getQualifiedModelClass(spec, classType);
    const shortClassName = fileKt.tryImport(className);
    const indent = this.indent;
    const listOf = fileKt.tryImport('kotlin.collections.listOf');

    let result = `return ${shortClassName}(\n`;
    result += indent(indent(properties
        .map(prop => {
          const {name, type, allowNull, isArray} = prop;
          const propertyName = kebabToCamel(name);

          let propString = `${propertyName} = ${propertyName}Value`;
          if (isArray) {
            propString += ` ?: ${listOf}()`;
          } else if (!((type instanceof StringType) || allowNull)) {
            propString += '!!'
          }
          return propString;
        })
        .join(',\n')));
    result += ')\n';
    return result;
  }

  public addLoggerProperty(objectKt: ObjectKt, classType: ClassType): void {

    const readerClassName = this.getReaderClassName(classType);

    objectKt.addProperty('log', 'org.slf4j.Logger', propertyKt => {

      propertyKt.visibility = VisibilityKt.Private;

      propertyKt.setDefaultValue(fileKt => {

        const shortLoggerFactory = fileKt.tryImport('org.slf4j.LoggerFactory');
        return `${shortLoggerFactory}.getLogger(${readerClassName}::class.java)`;
      })
    });
  }

  //noinspection JSMethodCanBeStatic
  public addFieldIndexProperties(objectKt: ObjectKt, classType: ClassType): void {

    const {properties} = classType;

    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      const propertyName = `${kebabToCamel(property.name)}Index`;
      const index = i;

      objectKt.addProperty(propertyName, 'kotlin.Int', propertyKt => {

        propertyKt.visibility = VisibilityKt.Private;

        propertyKt.setSimpleDefaultValue(index.toString());
      });
    }
  }

  public addReaderKotlinObject(fileKt: FileKt, spec: Specification, classType: ClassType): void {

    const readerClassName = this.getReaderClassName(classType);
    const indent = this.indent;

    fileKt.addObject(readerClassName, objectKt => {
      const modelClass = this.getQualifiedModelClass(spec, classType);

      objectKt.extendsClass(
          'com.gantsign.restrulz.jackson.reader.JacksonObjectReader',
          (extendsKt, typeSignatureKt) => {

        typeSignatureKt.addGenericParameter(modelClass);
      });

      this.addLoggerProperty(objectKt, classType);

      this.addFieldIndexProperties(objectKt, classType);

      objectKt.addFunction('readRequiredObject', (bodyKt, functionKt) => {

        functionKt.overrides = true;
        functionKt.addParameter(
            'parser',
            'com.gantsign.restrulz.jackson.reader.ValidationHandlingJsonParser');
        functionKt.setReturnTypeNullable(modelClass);

        bodyKt.writeLn('');

        bodyKt.writeLn('val startObject = parser.currentToken()');

        bodyKt.writeLn('');

        const jsonToken = fileKt.tryImport('com.fasterxml.jackson.core.JsonToken');

        bodyKt.writeIf(() => `startObject != ${jsonToken}.START_OBJECT`, whenBodyKt => {
          whenBodyKt.writeLn('parser.handleValidationFailure(');
          whenBodyKt.writeLn(indent(indent(
              `"Expected \${${jsonToken}.START_OBJECT} but was $startObject")`)));
          whenBodyKt.writeLn('return null');
        });

        bodyKt.writeLn('');

        bodyKt.writeLn(`val fieldNamesPresent = ${fileKt.tryImport('java.util.BitSet')}()`);
        bodyKt.writeLn('');
        bodyKt.write(classType.properties
            .map(prop => this.getStringForPropertiesWithDefaultValues(spec, fileKt, prop))
            .join(''));
        bodyKt.writeLn('');

        bodyKt.writeLn('// Iterate over object fields');
        bodyKt.writeWhile(() => `parser.nextToken() !== ${jsonToken}.END_OBJECT`, whileBodyKt => {
          whileBodyKt.writeLn('');
          whileBodyKt.writeLn('val fieldName = parser.currentName');
          whileBodyKt.writeLn('');
          whileBodyKt.writeLn('// Move to value');
          whileBodyKt.writeLn('val token = parser.nextToken()');
          whileBodyKt.writeLn('');
          this.writeWhenOverFields(whileBodyKt, spec, fileKt, classType);
        });

        classType.properties
            .forEach(prop => this.writeCheckForMissingField(bodyKt, spec, prop));

        bodyKt.writeLn('');

        bodyKt.writeIf(() => 'parser.hasValidationFailures', ifBodyKt => {
          ifBodyKt.writeLn('return null')
        });

        bodyKt.write(this.getStringForNewInstance(spec, fileKt, classType));
      });
    });
  }

  public addFactoryKotlinObject(fileKt: FileKt, spec: Specification, classType: ClassType): void {

    fileKt.addObject(this.getFactoryClassName(classType), objectKt => {

      const modelClass = this.getQualifiedModelClass(spec, classType);
      objectKt.implementsInterface(
          'com.gantsign.restrulz.json.reader.JsonObjectReaderFactory',
          typeSignatureKt => {

        typeSignatureKt.addGenericParameter(modelClass);
      });

      objectKt.addProperty(
          'jsonReader',
          'com.gantsign.restrulz.json.reader.JsonObjectReader',
          (propertyKt, typeSignatureKt) => {

        propertyKt.overrides = true;

        typeSignatureKt.addGenericParameter(modelClass);

        propertyKt.setGetter(propBodyKt => {
          const readerClass = this.getQualifiedReaderClass(spec, classType);
          const shortReaderClass = fileKt.tryImport(readerClass);

          propBodyKt.writeLn(`return ${shortReaderClass}`);
        });
      });

    });
  }

  public toReaderKotlinFile(spec: Specification, classType: ClassType): FileKt {

    const className = this.getReaderClassName(classType);
    const fileKt = this.createKotlinFile(this.getReaderPackageName(spec), className);

    this.addReaderKotlinObject(fileKt, spec, classType);
    return fileKt;
  }

  public toFactoryKotlinFile(spec: Specification, classType: ClassType): FileKt {

    const className = this.getFactoryClassName(classType);
    const fileKt = this.createKotlinFile(this.getFactoryPackageName(spec), className);

    this.addFactoryKotlinObject(fileKt, spec, classType);
    return fileKt;
  }

  public generateReaderFiles(spec: Specification, context: GeneratorContext): void {

    spec.classTypes.forEach(classType =>
        this.writeFile(context, this.toReaderKotlinFile(spec, classType)));
  }

  public generateFactoryFiles(spec: Specification, context: GeneratorContext): void {

    spec.classTypes.forEach(classType =>
        this.writeFile(context, this.toFactoryKotlinFile(spec, classType)));
  }

  generateFiles(spec: Specification, context: GeneratorContext): void {

    this.generateReaderFiles(spec, context);
    this.generateFactoryFiles(spec, context);
  }
}
