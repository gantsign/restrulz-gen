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
import {GeneratorContext} from '../../generator';
import {FileKt} from '../lang';
import {KotlinGenerator} from '../generator';
import {kebabToCamel} from '../../util/kebab';

export class KotlinJsonWriterGenerator extends KotlinGenerator {

  public getWriterPackageName(spec: Specification): string {
    return this.packageMapping[`${spec.name}.model.json.writer.impl`]
        || `${this.getModelPackageName(spec)}.json.writer.impl`;
  }

  //noinspection JSMethodCanBeStatic
  public getWriterClassName(classType: ClassType): string {
    return `${this.toKotlinClassName(classType.name)}Writer`;
  }

  public getQualifiedWriterClass(spec: Specification, classType: ClassType): string {
    const packageName = this.getWriterPackageName(spec);
    const className = this.getWriterClassName(classType);
    return `${packageName}.${className}`;
  }

  public getFactoryPackageName(spec: Specification): string {
    return `${this.getModelPackageName(spec)}.json.writer`;
  }

  //noinspection JSMethodCanBeStatic
  public getFactoryClassName(classType: ClassType): string {
    return `${this.toKotlinClassName(classType.name)}WriterFactory`;
  }

  public jacksonMethodForProperty(spec: Specification, fileKt: FileKt, prop: Property): string {
    const type = prop.type;
    const fieldName = prop.name;
    const propertyName = kebabToCamel(prop.name);

    if (type instanceof ClassType) {
      const valueType = prop.isArray ? 'Array' : 'Object';
      const writerClass = this.getQualifiedWriterClass(spec, type);
      const shortWriterClass = fileKt.tryImport(writerClass);
      return `${shortWriterClass}.write${valueType}Field(` +
          `generator, ${this.toKotlinString(fieldName)}, value.${propertyName})`;
    }

    let jacksonType = '';
    if (type instanceof StringType) {
      jacksonType = 'String';
    } else if (type instanceof IntegerType) {
      jacksonType = 'Number';
    } else if (type instanceof BooleanType) {
      jacksonType = 'Boolean';
    } else {
      throw new Error(`Unexpected type: ${type.constructor.name}`);
    }

    if (prop.isArray) {
      if (type instanceof IntegerType) {
        const kotlinType = this.toKotlinIntegerType(type);
        jacksonType = kotlinType.substring('kotlin.'.length);
      }
      jacksonType += 'Array'
    }

    return `generator.write${jacksonType}Field(` +
        `${this.toKotlinString(fieldName)}, value.${propertyName})`;
  }

  public addWriterKotlinObject(fileKt: FileKt, spec: Specification, classType: ClassType): void {
    fileKt.addObject(this.getWriterClassName(classType), objectKt => {
      const modelClass = this.getQualifiedModelClass(spec, classType);

      objectKt.extendsClass(
          'com.gantsign.restrulz.jackson.writer.JacksonObjectWriter',
          (extendsKt, typeSignatureKt) => {

        typeSignatureKt.addGenericParameter(modelClass);
      });

      objectKt.addFunction('writeObject', (bodyKt, functionKt) => {
        functionKt.overrides = true;
        functionKt.addParameter('generator', 'com.fasterxml.jackson.core.JsonGenerator');
        functionKt.addParameterNullable('value', modelClass);

        const indent = this.indent;
        bodyKt.writeLn('');
        bodyKt.writeIf(() => 'value === null', ifBodyKt => {
          ifBodyKt.writeLn('generator.writeNull()');
          ifBodyKt.writeLn('return');
        });
        bodyKt.writeLn('');
        bodyKt.writeLn('generator.writeStartObject()');
        bodyKt.writeDynamicLn(() =>
            classType.properties
                .map(prop => this.jacksonMethodForProperty(spec, fileKt, prop))
                .join('\n'));
        bodyKt.writeLn('generator.writeEndObject()');
      });
    });
  }

  public addFactoryKotlinObject(fileKt: FileKt, spec: Specification, classType: ClassType): void {

    fileKt.addObject(this.getFactoryClassName(classType), objectKt => {

      const modelClass = this.getQualifiedModelClass(spec, classType);

      objectKt.implementsInterface(
          'com.gantsign.restrulz.json.writer.JsonObjectWriterFactory',
          typeSignatureKt => {

        typeSignatureKt.addGenericParameter(modelClass);
      });

      objectKt.addProperty(
          'jsonWriter',
          'com.gantsign.restrulz.json.writer.JsonObjectWriter',
          (propertyKt, typeSignatureKt) => {

        propertyKt.overrides = true;

        typeSignatureKt.addGenericParameter(modelClass);

        propertyKt.setGetter(bodyKt => {
          const writerClass = this.getQualifiedWriterClass(spec, classType);
          const shortWriterClass = fileKt.tryImport(writerClass);

          bodyKt.writeLn(`return ${shortWriterClass}`);
        });
      });
    });
  }

  public toWriterKotlinFile(spec: Specification, classType: ClassType): FileKt {
    const className = this.getWriterClassName(classType);
    const fileKt = this.createKotlinFile(this.getWriterPackageName(spec), className);

    this.addWriterKotlinObject(fileKt, spec, classType);
    return fileKt;
  }

  public toFactoryKotlinFile(spec: Specification, classType: ClassType): FileKt {
    const className = this.getFactoryClassName(classType);
    const fileKt = this.createKotlinFile(this.getFactoryPackageName(spec), className);

    this.addFactoryKotlinObject(fileKt, spec, classType);
    return fileKt;
  }

  public generateWriterFiles(spec: Specification, context: GeneratorContext): void {
    spec.classTypes.forEach(classType =>
        this.writeFile(context, this.toWriterKotlinFile(spec, classType)));
  }

  public generateFactoryFiles(spec: Specification, context: GeneratorContext): void {
    spec.classTypes.forEach(classType =>
        this.writeFile(context, this.toFactoryKotlinFile(spec, classType)));
  }

  generateFiles(spec: Specification, context: GeneratorContext): void {
    this.generateWriterFiles(spec, context);
    this.generateFactoryFiles(spec, context);
  }
}
