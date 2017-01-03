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
import {
  BodyParamRef,
  BooleanType,
  ClassType,
  HttpMethod,
  HttpMethodHandler,
  IntegerType,
  ParamRef,
  PathElement,
  PathParam,
  PathParamRef,
  PathScope,
  Property,
  Response,
  Specification,
  StaticPathElement,
  StringType
} from '../restrulz/model';
import {
  SwaggerBodyParameter,
  SwaggerInfo,
  SwaggerOperation,
  SwaggerParameter,
  SwaggerPath,
  SwaggerPathParameter,
  SwaggerSchema,
  SwaggerSpecification,
  SwaggerResponse
} from './schema';
import {Generator, GeneratorContext} from '../generator';

//noinspection JSUnusedLocalSymbols
function toInfo(spec: Specification): SwaggerInfo {
  const {name, title, description, version} = spec;
  const dest = new SwaggerInfo();

  dest.title = title !== '' ? title : name;
  if (description !== '') {
    dest.description = description;
  }
  dest.version = version !== '' ? version : '0.0.0';
  return dest
}

function toSchema(classType: ClassType): SwaggerSchema {
  const dest = new SwaggerSchema();
  dest.$ref = `#/definitions/${classType.name}`;
  return dest;
}

function toParameter(paramRef: ParamRef): SwaggerParameter {
  if (paramRef instanceof PathParamRef) {
    const {value: param} = paramRef;
    const dest = new SwaggerPathParameter();
    dest.name = param.name;
    dest.in = 'path';
    dest.required = true;
    const {typeRef: paramType} = param;
    if (paramType instanceof StringType) {
      const {pattern, minLength, maxLength} = paramType;
      dest.type = 'string';
      dest.pattern = pattern;
      dest.minLength = minLength;
      dest.maxLength = maxLength;

    } else if (paramType instanceof IntegerType) {
      const {minimum, maximum} = paramType;
      dest.type = 'integer';
      dest.minimum = minimum;
      dest.maximum = maximum;

    } else if (paramType instanceof BooleanType) {
      dest.type = 'boolean';

    } else {
      throw new Error(`Unsupported parameter type: ${typeof paramRef.value.typeRef}`);
    }
    return dest;

  } else if (paramRef instanceof BodyParamRef) {
    const {typeRef: paramType} = paramRef;
    const dest = new SwaggerBodyParameter();
    dest.name = paramType.name;
    dest.in = 'body';
    dest.required = true;
    dest.schema = toSchema(paramType);
    return dest;

  } else {
    throw new Error(`Unsupported parameter type: ${typeof paramRef}`);
  }
}

function toResponse(response: Response): SwaggerResponse {
  const dest = new SwaggerResponse();
  dest.description = response.name;
  if (response.isArray) {
    const schema = new SwaggerSchema();
    schema.type = 'array';
    schema.items = toSchema(response.bodyTypeRef);
    dest.schema = schema;

  } else {
    dest.schema = toSchema(response.bodyTypeRef);
  }
  return dest;
}

function toResponses(responses: Response[]): {[statusCode: string]: SwaggerResponse} {
  const dest: {[statusCode: string]: SwaggerResponse} = {};
  responses.forEach((response) => {
    dest[response.status] = toResponse(response);
  });
  return dest;
}

function toOperation(handler: HttpMethodHandler): SwaggerOperation {
  const dest = new SwaggerOperation();
  dest.operationId = handler.name;
  dest.parameters = handler.parameters.map(toParameter);
  dest.responses = toResponses([handler.responseRef]);
  return dest;
}

function toPathString(pathElements: PathElement[]): string {
  let path = '';
  pathElements.forEach((pathElement) => {
    if (pathElement instanceof StaticPathElement) {
      path += `/${pathElement.value}`;
    } else if (pathElement instanceof PathParam) {
      path += `/{${pathElement.name}}`
    } else {
      throw new Error(`Unsupported path element: ${typeof pathElement}`);
    }
  });
  return path;
}

function toPaths(pathScopes: PathScope[]): {[path: string]: SwaggerPath} {
  const dest: {[path: string]: SwaggerPath} = {};
  pathScopes.forEach((pathScope) => {
    const location = toPathString(pathScope.path);
    const path = new SwaggerPath();
    pathScope.mappings.forEach((mapping) => {
      if (mapping instanceof HttpMethodHandler) {
        const operation = toOperation(mapping);

        switch (mapping.method) {
          case HttpMethod.GET:
            path.get = operation;
            break;
          case HttpMethod.PUT:
            path.put = operation;
            break;
          case HttpMethod.POST:
            path.post = operation;
            break;
          case HttpMethod.DELETE:
            path.delete = operation;
            break;
          default:
            throw new Error(`Unsupported methos: ${mapping.method}`);
        }
      } else {
        throw new Error(`Unsupported mapping: ${typeof mapping}`);
      }
    });
    dest[location] = path;
  });
  return dest;
}

function setSchemaProperties(swaggerSchema: SwaggerSchema, property: Property) {
  const {type} = property;
  if (type instanceof StringType) {
    const {pattern, minLength, maxLength} = type;
    swaggerSchema.type = 'string';
    if (property.allowEmpty) {
      swaggerSchema.pattern = `(${pattern}|^$)`;
      swaggerSchema.minLength = 0;
    } else {
      swaggerSchema.pattern = pattern;
      swaggerSchema.minLength = minLength;
    }
    swaggerSchema.maxLength = maxLength;

  } else if (type instanceof IntegerType) {
    const {minimum, maximum} = type;
    swaggerSchema.type = 'integer';
    swaggerSchema.minimum = minimum;
    swaggerSchema.maximum = maximum;

  } else if (type instanceof BooleanType) {
    swaggerSchema.type = 'boolean';

  } else if (type instanceof ClassType) {
    swaggerSchema.$ref = `#/definitions/${type.name}`;

  } else {
    throw new Error(`Unsupported property: ${typeof type}`);
  }
}

function toProperties(properties: Property[]): {[propertyName: string]: SwaggerSchema} {
  const dest: {[propertyName: string]: SwaggerSchema} = {};
  properties.forEach((property) => {
    const {name} = property;
    const swaggerProperty = new SwaggerSchema();
    if (property.isArray) {
      swaggerProperty.type = 'array';
      const items = new SwaggerSchema();
      setSchemaProperties(items, property);
      swaggerProperty.items = items;

    } else {
      setSchemaProperties(swaggerProperty, property);
    }
    dest[name] = swaggerProperty;
  });

  return dest;
}

function toRequiredProperties(properties: Property[]): string[] {
  return properties
      .filter(property => !(property.allowEmpty || property.allowNull))
      .map(property => property.name)
}

function toDefinitions(classTypes: ClassType[]): {[definitionsName: string]: SwaggerSchema} {
  const dest: {[definitionsName: string]: SwaggerSchema} = {};
  classTypes.forEach((classType) => {
    const {name, properties} = classType;
    const definition = new SwaggerSchema();
    definition.type = 'object';
    definition.properties = toProperties(properties);
    definition.required = toRequiredProperties(properties);

    dest[name] = definition;
  });
  return dest;
}

function toSwagger(spec: Specification): SwaggerSpecification {
  const {pathScopes, classTypes} = spec;

  const dest = new SwaggerSpecification();
  dest.swagger = '2.0';
  dest.info = toInfo(spec);
  dest.paths = toPaths(pathScopes);
  dest.definitions = toDefinitions(classTypes);
  return dest;
}

export class SwaggerGenerator implements Generator {
  outputFile: string = 'swagger.yml';

  generateFiles(spec: Specification, context: GeneratorContext): void {
    const swaggerModel = toSwagger(spec);
    if (this.outputFile.toLowerCase().endsWith('.json')) {
      context.writeJsonToFile(this.outputFile, swaggerModel);
      return;
    }
    context.writeYamlToFile(this.outputFile, swaggerModel);
  }

  constructor() {
    this.generateFiles = this.generateFiles.bind(this);
  }
}

