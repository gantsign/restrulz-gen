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
  SimpleType,
  Specification,
  StringType
} from '../restrulz/model';
import {Generator, GeneratorContext} from '../generator';
import {FileKt} from './lang';
import {KotlinGenerator} from './generator';
import {KotlinModelGenerator} from './model-generator';
import {kebabToCamel} from '../util/kebab';

export class KotlinValidatorGenerator extends KotlinGenerator {

  public getValidatorPackageName(spec: Specification): string {
    return this.packageMapping[`${spec.name}.validator`]
        || `${this.getPackageName(spec)}.validator`;
  }

  //noinspection JSMethodCanBeStatic
  public getValidatorClassName(simpleType: SimpleType): string {
    return `${this.toKotlinClassName(simpleType.name)}Validator`;
  }

  public getQualifiedValidatorClass(spec: Specification, simpleType: SimpleType): string {
    const packageName = this.getValidatorPackageName(spec);
    const className = this.getValidatorClassName(simpleType);
    return `${packageName}.${className}`;
  }

  //noinspection JSUnusedLocalSymbols
  public addIntegerValidator(fileKt: FileKt, spec: Specification, integerType: IntegerType): void {
    const {minimum, maximum} = integerType;

    fileKt.addObject(this.getValidatorClassName(integerType), objectKt => {

      const kotlinType = this.toKotlinIntegerType(integerType);
      const valueSuffix = kotlinType === 'kotlin.Long' ? 'L' : '';
      const typeName = kotlinType.substring('kotlin.'.length);
      const validatorClass = `com.gantsign.restrulz.validation.${typeName}Validator`;

      objectKt.extendsClass(validatorClass, extendsKt => {

        extendsKt.addArgument('minimumValue', `${minimum.toString()}${valueSuffix}`);
        extendsKt.addArgument('maximumValue', `${maximum.toString()}${valueSuffix}`);
        extendsKt.wrapArguments = true;
      });
    });
  }

  //noinspection JSUnusedLocalSymbols
  public addStringValidator(fileKt: FileKt, spec: Specification, stringType: StringType): void {
    const {minLength, maxLength, pattern} = stringType;

    fileKt.addObject(this.getValidatorClassName(stringType), objectKt => {

      objectKt.extendsClass('com.gantsign.restrulz.validation.StringValidator', extendsKt => {

        extendsKt.addArgument('minimumLength', minLength.toString());
        extendsKt.addArgument('maximumLength', maxLength.toString());
        extendsKt.addArgument('pattern', this.toKotlinString(pattern));
        extendsKt.wrapArguments = true;
      });
    });
  }

  public addValidatorKotlinObject(fileKt: FileKt, spec: Specification,
                                  simpleType: SimpleType): void {

    if (simpleType instanceof StringType) {
      this.addStringValidator(fileKt, spec, simpleType);
    } else if (simpleType instanceof IntegerType) {
      this.addIntegerValidator(fileKt, spec, simpleType);
    } else {
      throw new Error(`Unsupported SimpleType type: ${simpleType.constructor.name}`);
    }
  }

  public toValidatorKotlinFile(spec: Specification, simpleType: SimpleType): FileKt {

    const className = this.getValidatorClassName(simpleType);
    const fileKt = this.createKotlinFile(this.getValidatorPackageName(spec), className);

    this.addValidatorKotlinObject(fileKt, spec, simpleType);
    return fileKt;
  }

  public generateValidatorFile(spec: Specification,
                               simpleType: SimpleType,
                               context: GeneratorContext): void {

    this.writeFile(context, this.toValidatorKotlinFile(spec, simpleType));
  }

  //noinspection JSMethodCanBeStatic
  public supportsValidation(type: SimpleType): boolean {
    if (type instanceof StringType || type instanceof IntegerType) {
      return true;
    } else if (type instanceof BooleanType || type instanceof ClassType) {
      return false;
    } else {
      throw new Error(`Unsupported SimpleType type: ${type.constructor.name}`);
    }
  }

  public generateValidatorFiles(spec: Specification, context: GeneratorContext): void {
    spec.simpleTypes
        .filter(simpleType => this.supportsValidation(simpleType))
        .forEach(simpleType => this.generateValidatorFile(spec, simpleType, context));
  }

  //noinspection JSMethodCanBeStatic
  public needsProcessing(property: Property,
                         modelNeedsProcessing: (property: Property) => boolean): boolean {

    return modelNeedsProcessing(property) || this.supportsValidation(property.type);
  }

  public generatePropertyAssignmentValue(
      fileKt: FileKt,
      spec: Specification,
      property: Property,
      modelGeneratePropertyAssignmentValue: (fileKt: FileKt,
                                             spec: Specification,
                                             property: Property) => string): string {

    const {type, allowEmpty, allowNull} = property;
    const expression = modelGeneratePropertyAssignmentValue(fileKt, spec, property);

    if (type instanceof StringType || type instanceof IntegerType) {
      const validatorType = fileKt.tryImport(this.getQualifiedValidatorClass(spec, type));

      let result = `${validatorType}.`;
      if (allowEmpty) {
        result += 'requireValidValueOrEmpty';
      } else if (allowNull) {
        result += 'requireValidValueOrNull';
      } else {
        result += 'requireValidValue';
      }
      result += `(${this.toKotlinString(kebabToCamel(property.name))}, ${expression})`;
      return result;
    } else if (type instanceof BooleanType || type instanceof ClassType) {
      return expression;
    } else {
      throw new Error(`Unsupported type: ${type.constructor.name}`);
    }
  }

  init(generators: Generator[]): void {
    generators.forEach(generator => {

      if (KotlinModelGenerator.assignableFrom(generator)) {

        const modelNeedsProcessing = generator.needsProcessing.bind(generator);

        generator.needsProcessing = (property: Property) =>
            this.needsProcessing(property, modelNeedsProcessing);

        const modelGeneratePropertyAssignmentValue =
            generator.generatePropertyAssignmentValue.bind(generator);

        generator.generatePropertyAssignmentValue = (fileKt: FileKt,
                                                     spec: Specification,
                                                     property: Property) =>
            this.generatePropertyAssignmentValue(
                fileKt, spec, property, modelGeneratePropertyAssignmentValue);
      }
    })
  }

  generateFiles(spec: Specification, context: GeneratorContext): void {
    this.generateValidatorFiles(spec, context);
  }

  constructor() {
    super();
    this.needsProcessing = this.needsProcessing.bind(this);
    this.generatePropertyAssignmentValue = this.generatePropertyAssignmentValue.bind(this);
  }
}