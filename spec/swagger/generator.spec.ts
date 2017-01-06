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
/// <reference path="../../typings/globals/fs-extra/index.d.ts" />
/// <reference path="../../typings/globals/jasmine/index.d.ts" />
/// <reference path="../../typings/globals/node/index.d.ts" />

import {SchemaProcessor} from '../../src/generator';
import {SwaggerGenerator, SwaggerFormat} from '../../src/swagger/generator';
import {Specification} from '../../src/restrulz/model';
import * as fs from 'fs';
import * as fsx from 'fs-extra';

describe('SwaggerGenerator', () => {

  describe('test with example file 1', () => {
    fsx.removeSync('tmp/people.swagger.yml');

    const swaggerGenerator = new SwaggerGenerator();

    const processor = new SchemaProcessor();
    processor.schemaFiles = ['spec/data/schema.json'];
    processor.outputDirectory = 'tmp';
    processor.generators.push(swaggerGenerator);
    processor.execute();

    it('should generate Swagger file matching expected', () => {
      const expected = fs.readFileSync('spec/data/people.swagger.yml');
      const actual = fs.readFileSync('tmp/people.swagger.yml');
      expect(actual).toEqual(expected);
    });
  });

  describe('test with example file 2', () => {
    fsx.removeSync('tmp/people.swagger2.yml');

    class FixedNameSwaggerGenerator extends SwaggerGenerator {
      //noinspection JSMethodCanBeStatic
      protected getSwaggerOutputPath(spec: Specification): string {
        return 'people.swagger2.yml';
      }
    }
    const swaggerGenerator = new FixedNameSwaggerGenerator();

    const processor = new SchemaProcessor();
    processor.schemaFiles = ['spec/data/schema2.json'];
    processor.outputDirectory = 'tmp';
    processor.generators.push(swaggerGenerator);
    processor.execute();

    it('should generate Swagger file matching expected', () => {
      const expected = fs.readFileSync('spec/data/people.swagger2.yml');
      const actual = fs.readFileSync('tmp/people.swagger2.yml');
      expect(actual).toEqual(expected);
    });
  });

  describe('test JSON output', () => {
    fsx.removeSync('tmp/people.swagger.json');

    const swaggerGenerator = new SwaggerGenerator();
    swaggerGenerator.format = SwaggerFormat.JSON;

    const processor = new SchemaProcessor();
    processor.schemaFiles = ['spec/data/schema.json'];
    processor.outputDirectory = 'tmp';
    processor.generators.push(swaggerGenerator);
    processor.execute();

    it('should generate Swagger file matching expected', () => {
      const expected = fs.readFileSync('spec/data/people.swagger.json');
      const actual = fs.readFileSync('tmp/people.swagger.json');
      expect(actual).toEqual(expected);
    });
  });
});
