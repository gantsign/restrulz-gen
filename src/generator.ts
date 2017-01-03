/*
 * Copyright 2016 GantSign Ltd. All Rights Reserved.
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
/// <reference path="../typings/globals/node/index.d.ts" />
/// <reference path="../typings/globals/fs-extra/index.d.ts" />
import {Specification, parseSpecification} from './restrulz/model';
import * as fs from 'fs'
import * as path from 'path'
import * as fsx from 'fs-extra'
const jsyaml: any = require('js-yaml');

export interface GeneratorContext {
  writeJsonToFile(filePath: string, data: any): void;

  writeYamlToFile(filePath: string, data: any): void;

  writeStringToFile(filePath: string, data: any): void;
}

export interface Generator {
  generateFiles(spec: Specification, context: GeneratorContext): void;
}

class GeneratorContextImpl implements GeneratorContext {
  schemaFile: string;
  outputDirectory: string;
  generators: Generator[] = [];
  specification: Specification;

  resolvePath(filePath: string): string {
    if (filePath.startsWith('/') || filePath.startsWith('\\')) {
      // relative to project root
      return filePath.slice(1);
    } else {
      // relative to output dir
      return path.resolve(this.outputDirectory, filePath);
    }
  }

  writeJsonToFile(filePath: string, data: any): void {
    const relativeFilePath = this.resolvePath(filePath);
    fsx.mkdirpSync(path.dirname(relativeFilePath));

    const json = JSON.stringify(data, null, 2);
    fs.writeFileSync(relativeFilePath, json, 'utf8');
  }

  writeYamlToFile(filePath: string, data: any): void {
    const relativeFilePath = this.resolvePath(filePath);
    fsx.mkdirpSync(path.dirname(relativeFilePath));

    const yaml = jsyaml.safeDump(data);
    fs.writeFileSync(relativeFilePath, yaml, 'utf8');
  }

  writeStringToFile(filePath: string, text: string): void {
    const relativeFilePath = this.resolvePath(filePath);
    fsx.mkdirpSync(path.dirname(relativeFilePath));

    fs.writeFileSync(relativeFilePath, text, 'utf8');
  }

  constructor() {
    this.writeJsonToFile = this.writeJsonToFile.bind(this);
    this.writeYamlToFile = this.writeYamlToFile.bind(this);
    this.writeStringToFile = this.writeStringToFile.bind(this);
  }
}

export class SchemaProcessor {
  schemaFile: string;
  outputDirectory: string;
  generators: Generator[] = [];

  execute(): void {
    const context = new GeneratorContextImpl();
    context.schemaFile = this.schemaFile;
    context.outputDirectory = this.outputDirectory;
    context.generators = this.generators;
    context.specification = parseSpecification(this.schemaFile);

    this.generators.forEach((generator) => generator.generateFiles(context.specification, context));
  }

  constructor() {
    this.execute = this.execute.bind(this);
  }
}
