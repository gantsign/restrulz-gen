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
import {
  BodyParamRefJs,
  ClassTypeJs,
  HttpMethodHandlerJs,
  IntegerTypeJs,
  MappingJs,
  ParamRefJs,
  PathElementJs,
  PathParamJs,
  PathParamRefJs,
  PathScopeJs,
  PropertyJs,
  ResponseJs,
  SimpleTypeJs,
  SpecificationJs,
  StaticPathElementJs,
  StringTypeJs,
  SubPathScopeJs
} from './schema';

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

export abstract class PathScope {
  parent: PathScope | null;
  path: PathElement[];
  mappings: Mapping[];

  getPathParameter(name: string): PathParameter {
    const param = this.path.find(element => {
      if (!(element instanceof PathParameter)) {
        return false;
      }
      return element.name === name;
    });
    if (param && param instanceof PathParameter) {
      return param;
    }
    if (this.parent) {
      return this.parent.getPathParameter(name);
    }
    throw new Error(`Path parameter not found: ${name}`);
  };

  getPathAsString(): string {
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

export class RootPathScope extends PathScope {
  name: string;
}

export class SubPathScope extends PathScope { }

export class Specification {
  name: string;

  title: string;

  description: string;

  version: string;

  simpleTypes: SimpleType[];

  classTypes: ClassType[];

  responses: Response[];

  pathScopes: RootPathScope[];

  getSimpleType(name: string): SimpleType {
    if (name === 'boolean') {
      return BOOLEAN_TYPE;
    }
    const type = this.simpleTypes.find(value => value.name === name);
    if (type) {
      return type;
    }
    throw new Error(`Type not found: ${name}`);
  };

  getClassType(name: string): ClassType {
    const type = this.classTypes.find(value => value.name === name);
    if (type) {
      return type;
    }
    throw new Error(`Class not found: ${name}`);
  };

  getType(name: string): Type {
    if (name === 'boolean') {
      return BOOLEAN_TYPE;
    }
    let type: Type | undefined = this.simpleTypes.find(value => value.name === name);
    if (type) {
      return type;
    }
    type = this.classTypes.find(value => value.name === name);
    if (type) {
      return type;
    }
    throw new Error(`Type not found: ${name}`);
  };

  getResponse(name: string): Response {
    const response = this.responses.find(value => value.name === name);
    if (response) {
      return response;
    }
    throw new Error(`Response not found: ${name}`);
  };

  constructor() {
    this.getSimpleType = this.getSimpleType.bind(this);
    this.getClassType = this.getClassType.bind(this);
    this.getType = this.getType.bind(this);
    this.getResponse = this.getResponse.bind(this);
  }
}

//noinspection UnterminatedStatementJS
export class SpecificationBuilder extends Specification {

  deferredTyping: (() => void)[] = [];

  //noinspection JSMethodCanBeStatic
  toStringType(stringTypeJs: StringTypeJs): StringType {
    const {name, pattern, minLength, maxLength} = stringTypeJs;

    const stringType = new StringType();
    stringType.name = name;
    stringType.pattern = pattern;
    stringType.minLength = minLength;
    stringType.maxLength = maxLength;
    return stringType;
  }

  //noinspection JSMethodCanBeStatic
  toIntegerType(integerTypeJs: IntegerTypeJs): IntegerType {
    const {name, minimum, maximum} = integerTypeJs;

    const integerType = new IntegerType();
    integerType.name = name;
    integerType.minimum = minimum;
    integerType.maximum = maximum;
    return integerType;
  }

  toSimpleType(simpleTypeJs: SimpleTypeJs): SimpleType {
    const {kind} = simpleTypeJs;

    switch (kind) {
      case 'string':
        return this.toStringType(simpleTypeJs as StringTypeJs);
      case 'integer':
        return this.toIntegerType(simpleTypeJs as IntegerTypeJs);
      default:
        throw Error(`Unexpected simpleType: ${kind}`);
    }
  };

  toProperty(propertyJs: PropertyJs): Property {
    const {name, typeRef, allowEmpty, allowNull, array} = propertyJs;

    const property = new Property();
    property.name = name;
    this.deferredTyping.push(() =>
      property.type = this.getType(typeRef));
    property.allowEmpty = allowEmpty === true;
    property.allowNull = allowNull === true;
    property.isArray = array === true;
    return property;
  };

  toClassType(classTypeJs: ClassTypeJs): ClassType {
    const {name, properties} = classTypeJs;

    const classType = new ClassType();
    classType.name = name;
    classType.properties = properties.map(this.toProperty);
    return classType;
  };

  toResponse(responseJs: ResponseJs): Response {
    const {name, status, bodyTypeRef, array} = responseJs;

    const response = new Response();
    response.name = name;
    response.status = status;
    response.bodyTypeRef = this.getClassType(bodyTypeRef);
    response.isArray = array;
    return response;
  };

  //noinspection JSMethodCanBeStatic
  toStaticPathElement(pathElementJs: StaticPathElementJs): StaticPathElement {
    const {value} = pathElementJs;

    const pathElement = new StaticPathElement();
    pathElement.value = value;
    return pathElement;
  }

  toPathParameter(pathParamJs: PathParamJs): PathParameter {
    const {name, typeRef} = pathParamJs;

    const pathParameter = new PathParameter();
    pathParameter.name = name;
    pathParameter.typeRef = this.getSimpleType(typeRef);
    return pathParameter;
  };

  toPathElement(pathElementJs: PathElementJs): PathElement {
    const {kind} = pathElementJs;

    switch (pathElementJs.kind) {
      case 'static':
        return this.toStaticPathElement(pathElementJs);
      case 'path-param':
        return this.toPathParameter(pathElementJs);
      default:
        throw new Error(`Unsupported path element type: ${kind}`);
    }
  };

  //noinspection JSMethodCanBeStatic
  toPathParameterReference(pathParamRefJs: PathParamRefJs,
                           pathScope: PathScope): PathParameterReference {

    const {name, valueRef} = pathParamRefJs;

    const pathParameterReference = new PathParameterReference();
    pathParameterReference.name = name;
    pathParameterReference.value = pathScope.getPathParameter(valueRef);
    return pathParameterReference;
  }

  toBodyParameterReference(bodyParamRefJs: BodyParamRefJs): BodyParameterReference {
    const {name, typeRef} = bodyParamRefJs;

    const bodyParameterReference = new BodyParameterReference();
    bodyParameterReference.name = name;
    bodyParameterReference.typeRef = this.getClassType(typeRef);
    return bodyParameterReference;
  };

  toParameter(paramRefJs: ParamRefJs, pathScope: PathScope): HandlerParameter {
    const {kind} = paramRefJs;

    switch (paramRefJs.kind) {
      case 'path-param-ref':
        return this.toPathParameterReference(paramRefJs, pathScope);
      case 'body-param-ref':
        return this.toBodyParameterReference(paramRefJs);
      default:
        throw new Error(`Unsupported parameter type: ${kind}`);
    }
  };

  toHttpMethodHandler(httpMethodHandlerJs: HttpMethodHandlerJs,
                      pathScope: PathScope): HttpMethodHandler {

    const {name, method, parameters, responseRefs} = httpMethodHandlerJs;

    const handler = new HttpMethodHandler();
    handler.name = name;
    handler.method = getHttpMethod(method);
    handler.parameters = parameters
        .map(parameter => this.toParameter(parameter, pathScope));
    handler.responseRefs = responseRefs
        .map(this.getResponse);
    return handler;
  };

  toSubPathScope(subPathScope: SubPathScopeJs): SubPathScope {
    const {path, mappings} = subPathScope;

    const dest = new SubPathScope();
    dest.path = path
        .map(this.toPathElement);
    dest.mappings = mappings
        .map(mapping => this.toMapping(mapping, dest));
    return dest;
  };

  toMapping(mappingJs: MappingJs, pathScope: PathScope): Mapping {
    const {kind} = mappingJs;

    switch (mappingJs.kind) {
      case 'http-method':
        return this.toHttpMethodHandler(mappingJs, pathScope);
      case 'path':
        return this.toSubPathScope(mappingJs);
      default:
        throw Error(`Unsupported mapping: ${kind}`);
    }
  };

  toPathScope(pathScopeJs: PathScopeJs): RootPathScope {
    const {name, path, mappings} = pathScopeJs;

    const pathScope = new RootPathScope();
    pathScope.name = name;
    pathScope.path = path
        .map(this.toPathElement);
    pathScope.mappings = mappings
        .map(mapping => this.toMapping(mapping, pathScope));
    return pathScope;
  };

  toSpecification(): Specification {
    const {
        name, title, description, version, simpleTypes, classTypes, responses, pathScopes
    } = this;

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

  buildSpecification(specificationJs: SpecificationJs): Specification {
    const {
        name, title, description, version, simpleTypes, classTypes, responses, pathScopes
    } = specificationJs;

    this.name = name;
    this.title = title;
    this.description = description;
    this.version = version;

    this.simpleTypes = simpleTypes.map(this.toSimpleType);

    this.classTypes = classTypes.map(this.toClassType);
    this.deferredTyping.forEach(callback => callback());

    this.responses = responses.map(this.toResponse);
    this.pathScopes = pathScopes.map(this.toPathScope);

    return this.toSpecification();
  }

  constructor() {
    super();

    this.toStringType = this.toStringType.bind(this);
    this.toIntegerType = this.toIntegerType.bind(this);
    this.toSimpleType = this.toSimpleType.bind(this);
    this.toProperty = this.toProperty.bind(this);
    this.toClassType = this.toClassType.bind(this);
    this.toResponse = this.toResponse.bind(this);
    this.toStaticPathElement = this.toStaticPathElement.bind(this);
    this.toPathParameter = this.toPathParameter.bind(this);
    this.toPathElement = this.toPathElement.bind(this);
    this.toPathParameterReference = this.toPathParameterReference.bind(this);
    this.toBodyParameterReference = this.toBodyParameterReference.bind(this);
    this.toParameter = this.toParameter.bind(this);
    this.toHttpMethodHandler = this.toHttpMethodHandler.bind(this);
    this.toMapping = this.toMapping.bind(this);
    this.toPathScope = this.toPathScope.bind(this);
    this.toSpecification = this.toSpecification.bind(this);
    this.buildSpecification = this.buildSpecification.bind(this);
  }
}

export function parseSpecification(filePath: string): Specification {
  const json = fs.readFileSync(filePath, 'utf8');
  const specificationJs: SpecificationJs = JSON.parse(json, kebabToCamelReviver);
  return new SpecificationBuilder().buildSpecification(specificationJs);
}
