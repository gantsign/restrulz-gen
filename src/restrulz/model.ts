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
/// <reference path="../../typings/globals/node/index.d.ts" />
import * as fs from 'fs';
import {kebabToCamelReviver} from '../util/kebab';
import * as schema from './schema';

export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  PARTIAL_CONTENT = 206,
  MOVED_PERMANENTLY = 301,
  SEE_OTHER = 303,
  NOT_MODIFIED = 304,
  TEMPORARY_REDIRECT = 307,
  PERMANENT_REDIRECT = 308,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  NOT_ACCEPTABLE = 406,
  CONFLICT = 409,
  GONE = 410,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIME_OUT = 504
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

export class IntegerType implements SimpleType {
  name: string;
  minimum: number;
  maximum: number;
}

export class BooleanType implements SimpleType {
  name = 'boolean'
}

const BOOLEAN_TYPE = new BooleanType();

export class ClassType implements Type {
  name: string;
  properties: Property[];
}

export class Property {
  name: string;
  type: Type;
  allowEmpty = false;
  allowNull = false;
  isArray = false;
}

export class Response {
  name: string;
  status: HttpStatus;
  bodyTypeRef: ClassType;
  isArray = false;
}

export class StaticPathElement {
  value: string;
}

export class PathParameter {
  name: string;
  typeRef: SimpleType;
}

export type PathElement = StaticPathElement | PathParameter;

export interface HandlerParameter {
  name: string;
}

export class PathParameterReference implements HandlerParameter {
  name: string;
  value: PathParameter;
}

export class BodyParameterReference implements HandlerParameter {
  name: string;
  typeRef: ClassType;
}

export interface Mapping {
}

export class HttpMethodHandler implements Mapping {
  method: HttpMethod;
  name: string;
  parameters: HandlerParameter[];
  responseRefs: Response[];
}

export class PathScope {
  name: string;
  path: PathElement[];
  mappings: Mapping[];

  getPathParameter = (name: string): PathParameter => {
    const param = this.path.find((element) => {
      if (!(element instanceof PathParameter)) {
        return false;
      }
      return element.name === name;
    });
    if (param && param instanceof PathParameter) {
      return param;
    }
    throw new Error(`Path parameter not found: ${name}`);
  };

  getPathAsString = (): string => {
    let pathString = '';
    for (let pathElement of <any>this.path) {
      if (pathElement instanceof StaticPathElement) {
        pathString += `/${pathElement.value}`;
      } else if (pathElement instanceof PathParameter) {
        pathString += `/{${pathElement.name}}`;
      } else {
        throw new Error(`Unsupported PathElement type: ${pathElement.constructor.name}`);
      }
    }
    return pathString;
  }
}

export class Specification {
  name: string;

  title: string;

  description: string;

  version: string;

  simpleTypes: SimpleType[];

  classTypes: ClassType[];

  responses: Response[];

  pathScopes: PathScope[];

  getSimpleType = (name: string): SimpleType => {
    if (name === 'boolean') {
      return BOOLEAN_TYPE;
    }
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
    if (name === 'boolean') {
      return BOOLEAN_TYPE;
    }
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
class SpecificationBuilder extends Specification {

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

  //noinspection JSMethodCanBeStatic
  toIntegerType(integerType: schema.IntegerType): IntegerType {
    const {name, minimum, maximum} = integerType;

    const dest = new IntegerType();
    dest.name = name;
    dest.minimum = minimum;
    dest.maximum = maximum;
    return dest;
  }

  toSimpleType = (simpleType: schema.SimpleType): SimpleType => {
    const {kind} = simpleType;

    switch (kind) {
      case 'string':
        return this.toStringType(simpleType as schema.StringType);
      case 'integer':
        return this.toIntegerType(simpleType as schema.IntegerType);
      default:
        throw Error(`Unexpected simpleType: ${kind}`);
    }
  };

  toProperty = (property: schema.Property): Property => {
    const {name, typeRef, allowEmpty, allowNull, array} = property;

    const dest = new Property();
    dest.name = name;
    this.deferredTyping.push(() => {
      dest.type = this.getType(typeRef);
    });
    dest.allowEmpty = allowEmpty === true;
    dest.allowNull = allowNull === true;
    dest.isArray = array === true;
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
    const {name, status, bodyTypeRef, array} = response;

    const dest = new Response();
    dest.name = name;
    dest.status = status;
    dest.bodyTypeRef = this.getClassType(bodyTypeRef);
    dest.isArray = array;
    return dest;
  };

  //noinspection JSMethodCanBeStatic
  toStaticPathElement(pathElement: schema.StaticPathElement): StaticPathElement {
    const {value} = pathElement;

    const dest = new StaticPathElement();
    dest.value = value;
    return dest;
  }

  toPathParameter = (pathParam: schema.PathParam): PathParameter => {
    const {name, typeRef} = pathParam;

    const dest = new PathParameter();
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
        return this.toPathParameter(pathElement);
      default:
        throw new Error(`Unsupported path element type: ${kind}`);
    }
  };

  //noinspection JSMethodCanBeStatic
  toPathParameterReference(pathParamRef: schema.PathParamRef, pathScope: PathScope): PathParameterReference {
    const {name, valueRef} = pathParamRef;

    const dest = new PathParameterReference();
    dest.name = name;
    dest.value = pathScope.getPathParameter(valueRef);
    return dest;
  }

  toBodyParameterReference = (bodyParamRef: schema.BodyParamRef): BodyParameterReference => {
    const {name, typeRef} = bodyParamRef;

    const dest = new BodyParameterReference();
    dest.name = name;
    dest.typeRef = this.getClassType(typeRef);
    return dest;
  };

  toParameter = (parameter: schema.ParamRef, pathScope: PathScope): HandlerParameter => {
    const {kind} = parameter;

    switch (parameter.kind) {
      case 'path-param-ref':
        return this.toPathParameterReference(parameter, pathScope);
      case 'body-param-ref':
        return this.toBodyParameterReference(parameter);
      default:
        throw new Error(`Unsupported parameter type: ${kind}`);
    }
  };

  toHttpMethodHandler = (httpMethodHandler: schema.HttpMethodHandler, pathScope: PathScope): HttpMethodHandler => {
    const {name, method, parameters, responseRefs} = httpMethodHandler;

    const dest = new HttpMethodHandler();
    dest.name = name;
    dest.method = getHttpMethod(method);
    dest.parameters = parameters
        .map(parameter => this.toParameter(parameter, pathScope));
    dest.responseRefs = responseRefs
        .map(responseRef => this.getResponse(responseRef));
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

  toSpecification = () => {
    const {name, title, description, version, simpleTypes, classTypes, responses, pathScopes} = this;

    const spec = new Specification();
    spec.name = name;
    spec.title = title;
    spec.description = description;
    spec.version = version;
    spec.simpleTypes = simpleTypes;
    spec.classTypes = classTypes;
    spec.responses = responses;
    spec.pathScopes = pathScopes;
    return spec;
  };

  buildSpecification = (schema: schema.Specification): Specification => {
    const {name, title, description, version, simpleTypes, classTypes, responses, pathScopes} = schema;

    this.name = name;
    this.title = title;
    this.description = description;
    this.version = version;

    this.simpleTypes = simpleTypes.map(this.toSimpleType);

    this.classTypes = classTypes.map(this.toClassType);
    this.deferredTyping.forEach((callback) => callback());

    this.responses = responses.map(this.toResponse);
    this.pathScopes = pathScopes.map(this.toPathScope);

    return this.toSpecification();
  }
}

export function parseSpecification(filePath: string): Specification {
  const json = fs.readFileSync(filePath, 'utf8');
  const jsonSchema: schema.Specification = JSON.parse(json, kebabToCamelReviver);
  return new SpecificationBuilder().buildSpecification(jsonSchema);
}
