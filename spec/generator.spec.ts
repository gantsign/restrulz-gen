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
/// <reference path="../typings/globals/jasmine/index.d.ts" />
/// <reference path="../typings/globals/node/index.d.ts" />
/// <reference path="../typings/globals/fs-extra/index.d.ts" />
import * as fs from 'fs';
import * as fsx from 'fs-extra';
import {SchemaProcessor} from '../src/processor'
import {Generator, GeneratorContext} from '../src/generator'
import {Specification} from '../src/restrulz/model';
const jsyaml: any = require('js-yaml');

class TestGenerator implements Generator {
  context: GeneratorContext;

  generateFiles(spec: Specification, context: GeneratorContext): void {
    this.context = context;
  }

  constructor() {
    this.generateFiles = this.generateFiles.bind(this);
  }
}

describe('GeneratorContext', () => {

  fsx.removeSync('tmp/output');
  fsx.removeSync('tmp/abs');

  const processor = new SchemaProcessor();
  processor.schemaFile = 'spec/data/schema.json';
  processor.outputDirectory = 'tmp/output';
  const generator = new TestGenerator();
  processor.generators.push(generator);
  processor.execute();

  const {context} = generator;
  describe('writeJsonToFile', () => {
    it('should write file with relative path', () => {
      context.writeJsonToFile('test1.json', {test: 'test1'});

      const contents = JSON.parse(fs.readFileSync('tmp/output/test1.json', 'utf8'));

      expect(contents).toEqual({test: 'test1'});
    });

    it('should write file with absolute path', () => {
      context.writeJsonToFile('/tmp/abs/test2.json', {test: 'test2'});

      const contents = JSON.parse(fs.readFileSync('tmp/abs/test2.json', 'utf8'));

      expect(contents).toEqual({test: 'test2'});
    });
  });
  describe('writeYamlToFile', () => {
    it('should write file with relative path', () => {
      context.writeYamlToFile('test3.yml', {test: 'test3'});

      const contents = jsyaml.safeLoad(fs.readFileSync('tmp/output/test3.yml', 'utf8'));

      expect(contents).toEqual({test: 'test3'});
    });

    it('should write file with absolute path', () => {
      context.writeYamlToFile('/tmp/abs/test4.yml', {test: 'test4'});

      const contents = jsyaml.safeLoad(fs.readFileSync('tmp/abs/test4.yml', 'utf8'));

      expect(contents).toEqual({test: 'test4'});
    });
  });
  describe('writeStringToFile', () => {
    it('should write file with relative path', () => {
      context.writeYamlToFile('test5.txt', 'test5');

      const contents = fs.readFileSync('tmp/output/test5.txt', 'utf8');

      expect(contents).toEqual('test5\n');
    });

    it('should write file with absolute path', () => {
      context.writeYamlToFile('/tmp/abs/test6.txt', 'test6');

      const contents = fs.readFileSync('tmp/abs/test6.txt', 'utf8');

      expect(contents).toEqual('test6\n');
    });
  });
});
