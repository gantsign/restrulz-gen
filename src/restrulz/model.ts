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
/// <reference path="../../typings/globals/node/index.d.ts" />
import * as fs from 'fs';
import {kebabToCamelReviver} from '../util/kebab';
import * as schema from './schema';

export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  PARTIAL_CONTENT = 206
}

export function getHttpStatus(code: number): HttpStatus {
  switch (code) {
    case HttpStatus.OK:
      return code;
    case HttpStatus.CREATED:
      return code;
    case HttpStatus.ACCEPTED:
      return code;
    case HttpStatus.PARTIAL_CONTENT:
      return code;
    default:
      throw Error(`Unsupported HTTP status: ${code}`);
  }
}

export enum HttpMethod {
  GET,
  PUT,
  POST,
  DELETE
}

export function getHttpMethod(name: string): HttpMethod {
  switch (name) {
    case 'GET':
      return HttpMethod.GET;
    case 'PUT':
      return HttpMethod.PUT;
    case 'POST':
      return HttpMethod.POST;
    case 'DELETE':
      return HttpMethod.DELETE;
    default:
      throw Error(`Unsupported HTTP method: ${name}`);
  }
}

export interface Type {
  name: string;
}

export interface SimpleType extends Type {
}

export class StringType implements SimpleType {
  name: string;
  pattern: string;
  minLength: number;
  maxLength: number;
}

export class ClassType implements Type {
  name: string;
  properties: Property[];
}

export class Property {
  name: string;
  type: Type;
}

export class Response {
  name: string;
  status: HttpStatus;
  bodyTypeRef: ClassType;
}

export class StaticPathElement {
  value: string;
}

export class PathParam {
  name: string;
  typeRef: SimpleType;
}

export type PathElement = StaticPathElement | PathParam;

export interface ParamRef {
}

export class PathParamRef implements ParamRef {
  value: PathParam;
}

export class BodyParamRef implements ParamRef {
  typeRef: ClassType;
}

export interface Mapping {
}

export class HttpMethodHandler implements Mapping {
  method: HttpMethod;
  name: string;
  parameters: ParamRef[];
  responseRef: Response;
}

export class PathScope {
  name: string;
  path: PathElement[];
  mappings: Mapping[];

  getPathParam = (name: string): PathParam => {
    const param = this.path.find((element) => {
      if (!(element instanceof PathParam)) {
        return false;
      }
      return element.name === name;
    });
    if (param && param instanceof PathParam) {
      return param;
    }
    throw new Error(`Path parameter not found: ${name}`);
  }
}

export class Model {
  simpleTypes: SimpleType[];

  classTypes: ClassType[];

  responses: Response[];

  pathScopes: PathScope[];

  getSimpleType = (name: string): SimpleType => {
    const type = this.simpleTypes.find((value) => value.name === name);
    if (type) {
      return type;
    }
    throw new Error(`Type not found: ${name}`);
  };

  getClassType = (name: string): ClassType => {
    const type = this.classTypes.find((value) => value.name === name);
    if (type) {
      return type;
    }
    throw new Error(`Class not found: ${name}`);
  };

  getType = (name: string): Type => {
    let type: Type | undefined = this.simpleTypes.find((value) => value.name === name);
    if (type) {
      return type;
    }
    type = this.classTypes.find((value) => value.name === name);
    if (type) {
      return type;
    }
    throw new Error(`Type not found: ${name}`);
  };

  getResponse = (name: string): Response => {
    const response = this.responses.find((value) => value.name === name);
    if (response) {
      return response;
    }
    throw new Error(`Response not found: ${name}`);
  };

}

//noinspection UnterminatedStatementJS
class ModelBuilder extends Model {

  deferredTyping: (() => void)[] = [];

  //noinspection JSMethodCanBeStatic
  toStringType(stringType: schema.StringType): StringType {
    const {name, pattern, minLength, maxLength} = stringType;

    const dest = new StringType();
    dest.name = name;
    dest.pattern = pattern;
    dest.minLength = minLength;
    dest.maxLength = maxLength;
    return dest;
  }

  toSimpleType = (simpleType: schema.SimpleType): SimpleType => {
    const {kind} = simpleType;

    switch (kind) {
      case 'string':
        return this.toStringType(simpleType);
      default:
        throw Error(`Unexpected simpleType: ${kind}`);
    }
  };

  toProperty = (property: schema.Property): Property => {
    const {name, typeRef} = property;

    const dest = new Property();
    dest.name = name;
    this.deferredTyping.push(() => {
      dest.type = this.getType(typeRef);
    });
    return dest;
  };

  toClassType = (classType: schema.ClassType): ClassType => {
    const {name, properties} = classType;

    const dest = new ClassType();
    dest.name = name;
    dest.properties = properties.map(this.toProperty);
    return dest;
  };

  toResponse = (response: schema.Response): Response => {
    const {name, status, bodyTypeRef} = response;

    const dest = new Response();
    dest.name = name;
    dest.status = getHttpStatus(status);
    dest.bodyTypeRef = this.getClassType(bodyTypeRef);
    return dest;
  };

  //noinspection JSMethodCanBeStatic
  toStaticPathElement(pathElement: schema.StaticPathElement): StaticPathElement {
    const {value} = pathElement;

    const dest = new StaticPathElement();
    dest.value = value;
    return dest;
  }

  toPathParam = (pathParam: schema.PathParam): PathParam => {
    const {name, typeRef} = pathParam;

    const dest = new PathParam();
    dest.name = name;
    dest.typeRef = this.getSimpleType(typeRef);
    return dest;
  };

  toPathElement = (pathElement: schema.PathElement): PathElement => {
    const {kind} = pathElement;

    switch (pathElement.kind) {
      case 'static':
        return this.toStaticPathElement(pathElement);
      case 'path-param':
        return this.toPathParam(pathElement);
      default:
        throw new Error(`Unsupported path element type: ${kind}`);
    }
  };

  //noinspection JSMethodCanBeStatic
  toPathParamRef(pathParamRef: schema.PathParamRef, pathScope: PathScope): PathParamRef {
    const {valueRef} = pathParamRef;

    const dest = new PathParamRef();
    dest.value = pathScope.getPathParam(valueRef);
    return dest;
  }

  toBodyParmRef = (bodyParamRef: schema.BodyParamRef): BodyParamRef => {
    const {typeRef} = bodyParamRef;

    const dest = new BodyParamRef();
    dest.typeRef = this.getClassType(typeRef);
    return dest;
  };

  toParameter = (parameter: schema.ParamRef, pathScope: PathScope): ParamRef => {
    const {kind} = parameter;

    switch (parameter.kind) {
      case 'path-param-ref':
        return this.toPathParamRef(parameter, pathScope);
      case 'body-param-ref':
        return this.toBodyParmRef(parameter);
      default:
        throw new Error(`Unsupported parameter type: ${kind}`);
    }
  };

  toHttpMethodHandler = (httpMethodHandler: schema.HttpMethodHandler, pathScope: PathScope): HttpMethodHandler => {
    const {name, method, parameters, responseRef} = httpMethodHandler;

    const dest = new HttpMethodHandler();
    dest.name = name;
    dest.method = getHttpMethod(method);
    dest.parameters = parameters
        .map((parameter) => this.toParameter(parameter, pathScope));
    dest.responseRef = this.getResponse(responseRef);
    return dest;
  };

  toMapping = (mapping: schema.Mapping, pathScope: PathScope): Mapping => {
    const {kind} = mapping;

    switch (mapping.kind) {
      case 'http-method':
        return this.toHttpMethodHandler(mapping, pathScope);
      default:
        throw Error(`Unsupported mapping: ${kind}`);
    }
  };

  toPathScope = (pathScope: schema.PathScope): PathScope => {
    const {name, path, mappings} = pathScope;

    const dest = new PathScope();
    dest.name = name;
    dest.path = path
        .map(this.toPathElement);
    dest.mappings = mappings
        .map((mapping) => this.toMapping(mapping, dest));
    return dest;
  };

  toModel = () => {
    const {simpleTypes, classTypes, responses, pathScopes} = this;

    const model = new Model();
    model.simpleTypes = simpleTypes;
    model.classTypes = classTypes;
    model.responses = responses;
    model.pathScopes = pathScopes;
    return model;
  };

  buildModel = (schema: schema.Schema): Model => {
    const {simpleTypes, classTypes, responses, pathScopes} = schema;

    this.simpleTypes = simpleTypes.map(this.toSimpleType);

    this.classTypes = classTypes.map(this.toClassType);
    this.deferredTyping.forEach((callback) => callback());

    this.responses = responses.map(this.toResponse);
    this.pathScopes = pathScopes.map(this.toPathScope);

    return this.toModel();
  }
}

export function parseModel(filePath: string): Model {
  const json = fs.readFileSync(filePath, 'utf8');
  const jsonSchema: schema.Schema = JSON.parse(json, kebabToCamelReviver);
  return new ModelBuilder().buildModel(jsonSchema);
}
