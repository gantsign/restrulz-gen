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
import {FileKt} from './lang';
import {
  BooleanType,
  ClassType,
  IntegerType,
  Specification,
  StringType,
  Type
} from '../restrulz/model';
import {kebabToCamel} from '../util/kebab';
import {firstCharToUppercase} from '../util/strings';
import {KotlinSerializer} from './serializer';
import {Generator, GeneratorContext} from '../generator';

export abstract class KotlinGenerator implements Generator {

  private kotlinSerializer: KotlinSerializer|null = null;
  licenseHeader = '';
  packageMapping: {[key: string]: string; } = {};

  //noinspection JSMethodCanBeStatic
  public toKotlinClassName(typeName: string) {

    let name = kebabToCamel(typeName);
    name = firstCharToUppercase(name);
    return name;
  }

  //noinspection JSMethodCanBeStatic
  public getPackageName(spec: Specification): string {

    return this.packageMapping[spec.name] || spec.name;
  }

  public getModelPackageName(spec: Specification): string {

    return this.packageMapping[`${spec.name}.model`]
        || `${this.getPackageName(spec)}.model`;
  }

  //noinspection JSMethodCanBeStatic
  public getModelClassName(classType: ClassType): string {

    return this.toKotlinClassName(classType.name);
  }

  public getQualifiedModelClass(spec: Specification, classType: ClassType): string {

    const packageName = this.getModelPackageName(spec);
    const className = this.getModelClassName(classType);
    return `${packageName}.${className}`;
  }

  //noinspection JSMethodCanBeStatic
  public createKotlinSerializer(): KotlinSerializer {
    return new KotlinSerializer();
  }

  public getKotlinSerializer(): KotlinSerializer {
    if (!this.kotlinSerializer) {
      this.kotlinSerializer = this.createKotlinSerializer();
    }
    return this.kotlinSerializer;
  }

  //noinspection JSMethodCanBeStatic
  public indent(value: string): string {
    return this.getKotlinSerializer().indent(value);
  }

  public writeFile(context: GeneratorContext, fileKt: FileKt) {

    const outputPath = fileKt.getOutputPath();
    const serializer = this.getKotlinSerializer();
    context.writeStringToFile(outputPath, serializer.serializeFile(fileKt));
  }

  public createKotlinFile(packageName: string, fileName: string) {

    const fileKt = new FileKt(packageName, fileName);
    fileKt.licenseHeader = this.licenseHeader;
    return fileKt;
  }

  //noinspection JSMethodCanBeStatic
  public toKotlinIntegerType(type: IntegerType): string {

    const {minimum, maximum} = type;
    if (minimum >= -128 && maximum <= 127) {
      return 'kotlin.Byte';
    } else if (minimum >= -32768 && maximum <= 32767) {
      return 'kotlin.Short';
    } else if (minimum >= -2147483648 && maximum <= 2147483647) {
      return 'kotlin.Int';
    } else {
      // TODO double doesn't support all values for long
      // TODO check bounds for long and use BigInteger if necessary
      return 'kotlin.Long';
    }
  }

  public toKotlinType(spec: Specification, type: Type): string {

    if (type instanceof StringType) {
      return 'kotlin.String';
    } else if (type instanceof IntegerType) {
      return this.toKotlinIntegerType(type);
    } else if (type instanceof BooleanType) {
      return 'kotlin.Boolean'
    } else if (type instanceof ClassType) {
      return this.getQualifiedModelClass(spec, type);
    } else {
      throw new Error(`Unsupported type: ${type.constructor.name}`);
    }
  }

  //noinspection JSMethodCanBeStatic
  public toKotlinString(value: string): string {

    return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }

  init(generators: Generator[]): void {
    // do nothing
  }

  abstract generateFiles(spec: Specification, context: GeneratorContext): void;

  constructor() {
    this.indent = this.indent.bind(this);
  }

}
