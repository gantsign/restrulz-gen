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
import {ClassType, Property, Specification, StringType} from '../restrulz/model';
import {Generator, GeneratorContext} from '../generator';
import {ClassKt, FileKt, FunctionKt, PrimaryConstructorKt} from './lang';
import {KotlinGenerator} from './generator';
import {kebabToCamel} from '../util/kebab';

export class KotlinModelGenerator extends KotlinGenerator {

  //noinspection JSUnusedGlobalSymbols
  'classes:restrulz.kotlin.KotlinModelGenerator' = true;

  public static assignableFrom(
      generator: Generator): generator is KotlinModelGenerator {

    return 'classes:restrulz.kotlin.KotlinModelGenerator' in generator;
  }

  //noinspection JSMethodCanBeStatic,JSUnusedLocalSymbols
  public needsProcessing(property: Property): Boolean {
    const {type} = property;
    return type instanceof StringType;
  }

  public addConstructorParameter(constructorKt: PrimaryConstructorKt,
                                 spec: Specification,
                                 property: Property): void {

    const {name, type, isArray, allowNull} = property;

    const entityClass = this.toKotlinType(spec, type);
    const paramName = kebabToCamel(name);
    const paramType = isArray ? 'kotlin.collections.List' : entityClass;

    if (this.needsProcessing(property)) {
      constructorKt.addParameter(paramName, paramType, typeSignatureKt => {

        if (isArray) {
          typeSignatureKt.addGenericParameter(entityClass);
        }
        typeSignatureKt.isNullable = allowNull;

      });
    } else {
      constructorKt.addProperty(paramName, paramType, (propertyKt, typeSignatureKt) => {

        if (isArray) {
          typeSignatureKt.addGenericParameter(entityClass);
        }
        typeSignatureKt.isNullable = allowNull;

      });
    }
  }

  public setConstructorParameters(classKt: ClassKt,
                                  spec: Specification,
                                  properties: Property[]): void {

    classKt.setPrimaryConstructor(constructorKt => {

      properties.forEach(prop => this.addConstructorParameter(constructorKt, spec, prop));
    });
  }

  //noinspection JSMethodCanBeStatic,JSUnusedLocalSymbols
  public generatePropertyAssignmentValue(fileKt: FileKt,
                                         spec: Specification,
                                         prop: Property): string {

    let value = kebabToCamel(prop.name);
    if (prop.type instanceof StringType) {

      value += `.${fileKt.tryImport('com.gantsign.restrulz.util.string.blankOrNullToEmpty')}()`;
    }
    return value;
  }

  public addModelProperty(classKt: ClassKt, spec: Specification, property: Property): void {

    const {name, type, isArray, allowNull} = property;

    const entityClass = this.toKotlinType(spec, type);
    const propertyName = kebabToCamel(name);
    const propertyType = isArray ? 'kotlin.collections.List' : entityClass;

    classKt.addProperty(propertyName, propertyType, (param, typeSignatureKt) => {

      if (isArray) {
        typeSignatureKt.addGenericParameter(entityClass);
      }
      typeSignatureKt.isNullable = allowNull;

      param.setDefaultValue(fileKt => this.generatePropertyAssignmentValue(fileKt, spec, property));
      param.wrapAssignment = true;
    });
  }

  public addModelProperties(classKt: ClassKt, spec: Specification, properties: Property[]): void {

    properties
        .filter(prop => this.needsProcessing(prop))
        .forEach(prop => this.addModelProperty(classKt, spec, prop));
  }

  public addCopyFunctionParameter(functionKt: FunctionKt,
                                  spec: Specification,
                                  property: Property): void {

    const {name, type, isArray, allowNull} = property;

    const entityClass = this.toKotlinType(spec, type);
    const paramName = kebabToCamel(name);
    const paramType = isArray ? 'kotlin.collections.List' : entityClass;

    functionKt.addParameter(paramName, paramType, (parameterKt, typeSignatureKt) => {

      if (isArray) {
        typeSignatureKt.addGenericParameter(entityClass);
      }
      typeSignatureKt.isNullable = allowNull;

      parameterKt.defaultValue = `this.${paramName}`;

    });
  }

  public addCopyFunction(classKt: ClassKt,
                         spec: Specification,
                         classType: ClassType,
                         properties: Property[]): void {

    classKt.addFunction('copy', (bodyKt, functionKt) => {

      const className = this.toKotlinClassName(classType.name);
      properties.forEach(prop => this.addCopyFunctionParameter(functionKt, spec, prop));
      functionKt.setReturnType(this.getQualifiedModelClass(spec, classType));

      const indent = this.indent;

      bodyKt.writeLn('');
      bodyKt.write(`return ${className}(`);
      if (properties.length > 0) {
        const args = properties
            .map(prop => kebabToCamel(prop.name))
            .map(propName => `${propName} = ${propName}`)
            .join(',\n');
        if (properties.length > 1) {
          bodyKt.writeLn('');
          bodyKt.write(indent(indent(args)));
        } else {
          bodyKt.write(args);
        }
      }
      bodyKt.writeLn(')');
    });
  }

  public addModelClass(fileKt: FileKt, spec: Specification, classType: ClassType): void {

    const {properties} = classType;

    fileKt.addClass(this.getModelClassName(classType), classKt => {

      if (properties.length > 0) {
        this.setConstructorParameters(classKt, spec, properties);

        this.addModelProperties(classKt, spec, properties);
      }
      this.addCopyFunction(classKt, spec, classType, properties);

    });
  }

  public toModelFile(spec: Specification, classType: ClassType): FileKt {

    const className = this.getModelClassName(classType);
    const fileKt = this.createKotlinFile(this.getModelPackageName(spec), className);

    this.addModelClass(fileKt, spec, classType);
    return fileKt;
  }

  public generateModelFiles(spec: Specification, context: GeneratorContext): void {

    spec.classTypes.forEach(classType =>
        this.writeFile(context, this.toModelFile(spec, classType)));
  }

  generateFiles(spec: Specification, context: GeneratorContext): void {

    this.generateModelFiles(spec, context);
  }

}
