/*
 * Copyright 2016-2017 GantSign Ltd. All Rights Reserved.
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
/// <reference path="../../typings/modules/fs-extra/index.d.ts" />
/// <reference path="../../typings/globals/jasmine/index.d.ts" />
/// <reference path="../../typings/globals/node/index.d.ts" />

import {SchemaProcessor} from '../../src/generator';
import {SwaggerGenerator, SwaggerFormat} from '../../src/swagger/generator';
import {
  ClassType,
  HttpMethod,
  HttpMethodHandler,
  HttpStatus,
  Response,
  RootPathScope,
  Specification,
  StaticPathElement,
  SubPathScope
} from '../../src/restrulz/model';
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
      getSwaggerOutputPath(spec: Specification): string {
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

  describe('subPathToSwaggerPaths()', () => {

    it('should support GET', () => {
      const swaggerGenerator = new SwaggerGenerator();

      const staticPathElement = new StaticPathElement();
      staticPathElement.value = 'test2';

      const classType = new ClassType();
      classType.name = 'person';

      const response = new Response();
      response.name = 'get-person-success';
      response.status = HttpStatus.PARTIAL_CONTENT;
      response.bodyTypeRef = classType;

      const requestHandler = new HttpMethodHandler();
      requestHandler.method = HttpMethod.GET;
      requestHandler.name = 'get-person';
      requestHandler.parameters = [];
      requestHandler.responseRefs = [response];

      const subPathScope = new SubPathScope();
      subPathScope.mappings = [requestHandler];
      subPathScope.path = [staticPathElement];

      const swaggerPaths = swaggerGenerator.subPathToSwaggerPaths('/test1', subPathScope);

      const swaggerPath = swaggerPaths['/test1/test2'];
      if (!swaggerPath) {
        fail('Expected swaggerPaths to contain "/test1/test2".');
        return;
      }

      const operation = swaggerPath.get;
      if (!operation) {
        fail('Expected swaggerPath to contain "get".');
        return;
      }

      expect(operation.operationId).toBe('get-person');

      const swaggerResponse = operation.responses['206'];
      expect(swaggerResponse.description).toBe('get-person-success');

      const schema = swaggerResponse.schema;
      if (!schema) {
        fail('Expected swaggerResponse to contain "schema".');
        return;
      }
      expect(schema.$ref).toBe('#/definitions/person')
    });

    it('should support PUT', () => {
      const swaggerGenerator = new SwaggerGenerator();

      const staticPathElement = new StaticPathElement();
      staticPathElement.value = 'test2';

      const classType = new ClassType();
      classType.name = 'person';

      const response = new Response();
      response.name = 'get-person-success';
      response.status = HttpStatus.PARTIAL_CONTENT;
      response.bodyTypeRef = classType;

      const requestHandler = new HttpMethodHandler();
      requestHandler.method = HttpMethod.PUT;
      requestHandler.name = 'get-person';
      requestHandler.parameters = [];
      requestHandler.responseRefs = [response];

      const subPathScope = new SubPathScope();
      subPathScope.mappings = [requestHandler];
      subPathScope.path = [staticPathElement];

      const swaggerPaths = swaggerGenerator.subPathToSwaggerPaths('/test1', subPathScope);

      const swaggerPath = swaggerPaths['/test1/test2'];
      if (!swaggerPath) {
        fail('Expected swaggerPaths to contain "/test1/test2".');
        return;
      }

      const operation = swaggerPath.put;
      if (!operation) {
        fail('Expected swaggerPath to contain "put".');
        return;
      }

      expect(operation.operationId).toBe('get-person');

      const swaggerResponse = operation.responses['206'];
      expect(swaggerResponse.description).toBe('get-person-success');

      const schema = swaggerResponse.schema;
      if (!schema) {
        fail('Expected swaggerResponse to contain "schema".');
        return;
      }
      expect(schema.$ref).toBe('#/definitions/person')
    });

    it('should support POST', () => {
      const swaggerGenerator = new SwaggerGenerator();

      const staticPathElement = new StaticPathElement();
      staticPathElement.value = 'test2';

      const classType = new ClassType();
      classType.name = 'person';

      const response = new Response();
      response.name = 'get-person-success';
      response.status = HttpStatus.PARTIAL_CONTENT;
      response.bodyTypeRef = classType;

      const requestHandler = new HttpMethodHandler();
      requestHandler.method = HttpMethod.POST;
      requestHandler.name = 'get-person';
      requestHandler.parameters = [];
      requestHandler.responseRefs = [response];

      const subPathScope = new SubPathScope();
      subPathScope.mappings = [requestHandler];
      subPathScope.path = [staticPathElement];

      const swaggerPaths = swaggerGenerator.subPathToSwaggerPaths('/test1', subPathScope);

      const swaggerPath = swaggerPaths['/test1/test2'];
      if (!swaggerPath) {
        fail('Expected swaggerPaths to contain "/test1/test2".');
        return;
      }

      const operation = swaggerPath.post;
      if (!operation) {
        fail('Expected swaggerPath to contain "post".');
        return;
      }

      expect(operation.operationId).toBe('get-person');

      const swaggerResponse = operation.responses['206'];
      expect(swaggerResponse.description).toBe('get-person-success');

      const schema = swaggerResponse.schema;
      if (!schema) {
        fail('Expected swaggerResponse to contain "schema".');
        return;
      }
      expect(schema.$ref).toBe('#/definitions/person')
    });

    it('should support DELETE', () => {
      const swaggerGenerator = new SwaggerGenerator();

      const staticPathElement = new StaticPathElement();
      staticPathElement.value = 'test2';

      const classType = new ClassType();
      classType.name = 'person';

      const response = new Response();
      response.name = 'get-person-success';
      response.status = HttpStatus.PARTIAL_CONTENT;
      response.bodyTypeRef = classType;

      const requestHandler = new HttpMethodHandler();
      requestHandler.method = HttpMethod.DELETE;
      requestHandler.name = 'get-person';
      requestHandler.parameters = [];
      requestHandler.responseRefs = [response];

      const subPathScope = new SubPathScope();
      subPathScope.mappings = [requestHandler];
      subPathScope.path = [staticPathElement];

      const swaggerPaths = swaggerGenerator.subPathToSwaggerPaths('/test1', subPathScope);

      const swaggerPath = swaggerPaths['/test1/test2'];
      if (!swaggerPath) {
        fail('Expected swaggerPaths to contain "/test1/test2".');
        return;
      }

      const operation = swaggerPath.delete;
      if (!operation) {
        fail('Expected swaggerPath to contain "delete".');
        return;
      }

      expect(operation.operationId).toBe('get-person');

      const swaggerResponse = operation.responses['206'];
      expect(swaggerResponse.description).toBe('get-person-success');

      const schema = swaggerResponse.schema;
      if (!schema) {
        fail('Expected swaggerResponse to contain "schema".');
        return;
      }
      expect(schema.$ref).toBe('#/definitions/person')
    });

    it('should throw error for unsupported HTTP method', () => {
      const swaggerGenerator = new SwaggerGenerator();

      const staticPathElement = new StaticPathElement();
      staticPathElement.value = 'test2';

      const classType = new ClassType();
      classType.name = 'person';

      const response = new Response();
      response.name = 'get-person-success';
      response.status = HttpStatus.PARTIAL_CONTENT;
      response.bodyTypeRef = classType;

      const requestHandler = new HttpMethodHandler();
      requestHandler.method = -1;
      requestHandler.name = 'get-person';
      requestHandler.parameters = [];
      requestHandler.responseRefs = [response];

      const subPathScope = new SubPathScope();
      subPathScope.mappings = [requestHandler];
      subPathScope.path = [staticPathElement];

      expect(() => swaggerGenerator.subPathToSwaggerPaths('/test1', subPathScope))
          .toThrowError('Unsupported method: -1');
    });

    it('should support nested sub paths', () => {
      const swaggerGenerator = new SwaggerGenerator();

      const staticPathElement1 = new StaticPathElement();
      staticPathElement1.value = 'test2';

      const staticPathElement2 = new StaticPathElement();
      staticPathElement2.value = 'test3';

      const classType = new ClassType();
      classType.name = 'person';

      const response = new Response();
      response.name = 'get-person-success';
      response.status = HttpStatus.PARTIAL_CONTENT;
      response.bodyTypeRef = classType;

      const requestHandler = new HttpMethodHandler();
      requestHandler.method = HttpMethod.DELETE;
      requestHandler.name = 'get-person';
      requestHandler.parameters = [];
      requestHandler.responseRefs = [response];

      const nestedPathScope = new SubPathScope();
      nestedPathScope.mappings = [requestHandler];
      nestedPathScope.path = [staticPathElement2];

      const subPathScope = new SubPathScope();
      subPathScope.mappings = [nestedPathScope];
      subPathScope.path = [staticPathElement1];

      const swaggerPaths = swaggerGenerator.subPathToSwaggerPaths('/test1', subPathScope);

      const swaggerPath = swaggerPaths['/test1/test2/test3'];
      if (!swaggerPath) {
        fail('Expected swaggerPaths to contain "/test1/test2/test3".');
        return;
      }

      const operation = swaggerPath.delete;
      if (!operation) {
        fail('Expected swaggerPath to contain "delete".');
        return;
      }

      expect(operation.operationId).toBe('get-person');

      const swaggerResponse = operation.responses['206'];
      expect(swaggerResponse.description).toBe('get-person-success');

      const schema = swaggerResponse.schema;
      if (!schema) {
        fail('Expected swaggerResponse to contain "schema".');
        return;
      }
      expect(schema.$ref).toBe('#/definitions/person')
    });

    it('should throw error for unsupported mapping', () => {
      const swaggerGenerator = new SwaggerGenerator();

      const staticPathElement = new StaticPathElement();
      staticPathElement.value = 'test2';

      class UnsupportedTypeTest {}
      const unsupportedType = new UnsupportedTypeTest();

      const subPathScope = new SubPathScope();
      subPathScope.mappings = [unsupportedType];
      subPathScope.path = [staticPathElement];

      expect(() => swaggerGenerator.subPathToSwaggerPaths('/test1', subPathScope))
          .toThrowError('Unsupported mapping: UnsupportedTypeTest');
    });

  });

  describe('toSwaggerPaths()', () => {

    it('should support GET', () => {
      const swaggerGenerator = new SwaggerGenerator();

      const staticPathElement = new StaticPathElement();
      staticPathElement.value = 'test2';

      const classType = new ClassType();
      classType.name = 'person';

      const response = new Response();
      response.name = 'get-person-success';
      response.status = HttpStatus.PARTIAL_CONTENT;
      response.bodyTypeRef = classType;

      const requestHandler = new HttpMethodHandler();
      requestHandler.method = HttpMethod.GET;
      requestHandler.name = 'get-person';
      requestHandler.parameters = [];
      requestHandler.responseRefs = [response];

      const pathScope = new RootPathScope();
      pathScope.mappings = [requestHandler];
      pathScope.path = [staticPathElement];

      const swaggerPaths = swaggerGenerator.toSwaggerPaths([pathScope]);

      const swaggerPath = swaggerPaths['/test2'];
      if (!swaggerPath) {
        fail('Expected swaggerPaths to contain "/test2".');
        return;
      }

      const operation = swaggerPath.get;
      if (!operation) {
        fail('Expected swaggerPath to contain "get".');
        return;
      }

      expect(operation.operationId).toBe('get-person');

      const swaggerResponse = operation.responses['206'];
      expect(swaggerResponse.description).toBe('get-person-success');

      const schema = swaggerResponse.schema;
      if (!schema) {
        fail('Expected swaggerResponse to contain "schema".');
        return;
      }
      expect(schema.$ref).toBe('#/definitions/person')
    });

    it('should support PUT', () => {
      const swaggerGenerator = new SwaggerGenerator();

      const staticPathElement = new StaticPathElement();
      staticPathElement.value = 'test2';

      const classType = new ClassType();
      classType.name = 'person';

      const response = new Response();
      response.name = 'get-person-success';
      response.status = HttpStatus.PARTIAL_CONTENT;
      response.bodyTypeRef = classType;

      const requestHandler = new HttpMethodHandler();
      requestHandler.method = HttpMethod.PUT;
      requestHandler.name = 'get-person';
      requestHandler.parameters = [];
      requestHandler.responseRefs = [response];

      const pathScope = new RootPathScope();
      pathScope.mappings = [requestHandler];
      pathScope.path = [staticPathElement];

      const swaggerPaths = swaggerGenerator.toSwaggerPaths([pathScope]);

      const swaggerPath = swaggerPaths['/test2'];
      if (!swaggerPath) {
        fail('Expected swaggerPaths to contain "/test2".');
        return;
      }

      const operation = swaggerPath.put;
      if (!operation) {
        fail('Expected swaggerPath to contain "put".');
        return;
      }

      expect(operation.operationId).toBe('get-person');

      const swaggerResponse = operation.responses['206'];
      expect(swaggerResponse.description).toBe('get-person-success');

      const schema = swaggerResponse.schema;
      if (!schema) {
        fail('Expected swaggerResponse to contain "schema".');
        return;
      }
      expect(schema.$ref).toBe('#/definitions/person')
    });

    it('should support POST', () => {
      const swaggerGenerator = new SwaggerGenerator();

      const staticPathElement = new StaticPathElement();
      staticPathElement.value = 'test2';

      const classType = new ClassType();
      classType.name = 'person';

      const response = new Response();
      response.name = 'get-person-success';
      response.status = HttpStatus.PARTIAL_CONTENT;
      response.bodyTypeRef = classType;

      const requestHandler = new HttpMethodHandler();
      requestHandler.method = HttpMethod.POST;
      requestHandler.name = 'get-person';
      requestHandler.parameters = [];
      requestHandler.responseRefs = [response];

      const pathScope = new RootPathScope();
      pathScope.mappings = [requestHandler];
      pathScope.path = [staticPathElement];

      const swaggerPaths = swaggerGenerator.toSwaggerPaths([pathScope]);

      const swaggerPath = swaggerPaths['/test2'];
      if (!swaggerPath) {
        fail('Expected swaggerPaths to contain "/test2".');
        return;
      }

      const operation = swaggerPath.post;
      if (!operation) {
        fail('Expected swaggerPath to contain "post".');
        return;
      }

      expect(operation.operationId).toBe('get-person');

      const swaggerResponse = operation.responses['206'];
      expect(swaggerResponse.description).toBe('get-person-success');

      const schema = swaggerResponse.schema;
      if (!schema) {
        fail('Expected swaggerResponse to contain "schema".');
        return;
      }
      expect(schema.$ref).toBe('#/definitions/person')
    });

    it('should support DELETE', () => {
      const swaggerGenerator = new SwaggerGenerator();

      const staticPathElement = new StaticPathElement();
      staticPathElement.value = 'test2';

      const classType = new ClassType();
      classType.name = 'person';

      const response = new Response();
      response.name = 'get-person-success';
      response.status = HttpStatus.PARTIAL_CONTENT;
      response.bodyTypeRef = classType;

      const requestHandler = new HttpMethodHandler();
      requestHandler.method = HttpMethod.DELETE;
      requestHandler.name = 'get-person';
      requestHandler.parameters = [];
      requestHandler.responseRefs = [response];

      const pathScope = new RootPathScope();
      pathScope.mappings = [requestHandler];
      pathScope.path = [staticPathElement];

      const swaggerPaths = swaggerGenerator.toSwaggerPaths([pathScope]);

      const swaggerPath = swaggerPaths['/test2'];
      if (!swaggerPath) {
        fail('Expected swaggerPaths to contain "/test2".');
        return;
      }

      const operation = swaggerPath.delete;
      if (!operation) {
        fail('Expected swaggerPath to contain "delete".');
        return;
      }

      expect(operation.operationId).toBe('get-person');

      const swaggerResponse = operation.responses['206'];
      expect(swaggerResponse.description).toBe('get-person-success');

      const schema = swaggerResponse.schema;
      if (!schema) {
        fail('Expected swaggerResponse to contain "schema".');
        return;
      }
      expect(schema.$ref).toBe('#/definitions/person')
    });

    it('should throw error for unsupported HTTP method', () => {
      const swaggerGenerator = new SwaggerGenerator();

      const staticPathElement = new StaticPathElement();
      staticPathElement.value = 'test2';

      const classType = new ClassType();
      classType.name = 'person';

      const response = new Response();
      response.name = 'get-person-success';
      response.status = HttpStatus.PARTIAL_CONTENT;
      response.bodyTypeRef = classType;

      const requestHandler = new HttpMethodHandler();
      requestHandler.method = -1;
      requestHandler.name = 'get-person';
      requestHandler.parameters = [];
      requestHandler.responseRefs = [response];

      const pathScope = new RootPathScope();
      pathScope.mappings = [requestHandler];
      pathScope.path = [staticPathElement];

      expect(() => swaggerGenerator.toSwaggerPaths([pathScope]))
          .toThrowError('Unsupported method: -1');
    });

    it('should support nested sub paths', () => {
      const swaggerGenerator = new SwaggerGenerator();

      const staticPathElement1 = new StaticPathElement();
      staticPathElement1.value = 'test2';

      const staticPathElement2 = new StaticPathElement();
      staticPathElement2.value = 'test3';

      const classType = new ClassType();
      classType.name = 'person';

      const response = new Response();
      response.name = 'get-person-success';
      response.status = HttpStatus.PARTIAL_CONTENT;
      response.bodyTypeRef = classType;

      const requestHandler = new HttpMethodHandler();
      requestHandler.method = HttpMethod.DELETE;
      requestHandler.name = 'get-person';
      requestHandler.parameters = [];
      requestHandler.responseRefs = [response];

      const nestedPathScope = new SubPathScope();
      nestedPathScope.mappings = [requestHandler];
      nestedPathScope.path = [staticPathElement2];

      const pathScope = new RootPathScope();
      pathScope.mappings = [nestedPathScope];
      pathScope.path = [staticPathElement1];

      const swaggerPaths = swaggerGenerator.toSwaggerPaths([pathScope]);

      const swaggerPath = swaggerPaths['/test2/test3'];
      if (!swaggerPath) {
        fail('Expected swaggerPaths to contain "/test2/test3".');
        return;
      }

      const operation = swaggerPath.delete;
      if (!operation) {
        fail('Expected swaggerPath to contain "delete".');
        return;
      }

      expect(operation.operationId).toBe('get-person');

      const swaggerResponse = operation.responses['206'];
      expect(swaggerResponse.description).toBe('get-person-success');

      const schema = swaggerResponse.schema;
      if (!schema) {
        fail('Expected swaggerResponse to contain "schema".');
        return;
      }
      expect(schema.$ref).toBe('#/definitions/person')
    });

    it('should throw error for unsupported mapping', () => {
      const swaggerGenerator = new SwaggerGenerator();

      const staticPathElement = new StaticPathElement();
      staticPathElement.value = 'test2';

      class UnsupportedTypeTest {}
      const unsupportedType = new UnsupportedTypeTest();

      const pathScope = new RootPathScope();
      pathScope.mappings = [unsupportedType];
      pathScope.path = [staticPathElement];

      expect(() => swaggerGenerator.toSwaggerPaths([pathScope]))
          .toThrowError('Unsupported mapping: UnsupportedTypeTest');
    });

  });

});
