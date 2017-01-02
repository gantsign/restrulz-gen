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
import {Generator, GeneratorContext, SchemaProcessor} from '../src/index'
import {Specification} from '../src/restrulz/model';

class TestGenerator implements Generator {
  spec: Specification | null;
  context: GeneratorContext | null;

  generateFiles(spec: Specification, context: GeneratorContext): void {
    this.spec = spec;
    this.context = context;
  }

  constructor() {
    this.generateFiles = this.generateFiles.bind(this);
  }
}

const processor = new SchemaProcessor();
processor.schemaFile = 'spec/data/schema.json';
processor.outputDirectory = 'tmp/output';

const generator1 = new TestGenerator();
processor.generators.push(generator1);

const generator2 = new TestGenerator();
processor.generators.push(generator2);

processor.execute();

const {spec: spec1, context: context1} = generator1;
const {spec: spec2, context: context2} = generator2;

describe('SchemaProcessor', () => {

  it('should call all generators with a valid specification', () => {
    expect(spec1).toBeDefined();
    expect(spec2).toBeDefined();

    if (spec1 != null) {
      expect(spec1.name).toEqual('people');
    }
    if (spec2 != null) {
      expect(spec2.name).toEqual('people');
    }
  });

  it('should write a generator context', () => {
    expect(context1).toBeDefined();
    expect(context2).toBeDefined();
  });
});
