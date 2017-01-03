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
  BodyParameterReference,
  BooleanType,
  ClassType,
  HandlerParameter,
  HttpMethod,
  HttpMethodHandler,
  IntegerType,
  PathElement,
  PathParameter,
  PathParameterReference,
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
function toSwaggerInfo(spec: Specification): SwaggerInfo {
  const {name, title, description, version} = spec;
  const dest = new SwaggerInfo();

  dest.title = title !== '' ? title : name;
  if (description !== '') {
    dest.description = description;
  }
  dest.version = version !== '' ? version : '0.0.0';
  return dest
}

function toSwaggerSchema(classType: ClassType): SwaggerSchema {
  const dest = new SwaggerSchema();
  dest.$ref = `#/definitions/${classType.name}`;
  return dest;
}

function toSwaggerParameter(handlerParam: HandlerParameter): SwaggerParameter {
  if (handlerParam instanceof PathParameterReference) {
    const {value: param} = handlerParam;
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
      throw new Error(`Unsupported parameter type: ${typeof handlerParam.value.typeRef}`);
    }
    return dest;

  } else if (handlerParam instanceof BodyParameterReference) {
    const {typeRef: paramType} = handlerParam;
    const dest = new SwaggerBodyParameter();
    dest.name = paramType.name;
    dest.in = 'body';
    dest.required = true;
    dest.schema = toSwaggerSchema(paramType);
    return dest;

  } else {
    throw new Error(`Unsupported parameter type: ${typeof handlerParam}`);
  }
}

function toSwaggerResponse(response: Response): SwaggerResponse {
  const dest = new SwaggerResponse();
  dest.description = response.name;
  if (response.isArray) {
    const schema = new SwaggerSchema();
    schema.type = 'array';
    schema.items = toSwaggerSchema(response.bodyTypeRef);
    dest.schema = schema;

  } else {
    dest.schema = toSwaggerSchema(response.bodyTypeRef);
  }
  return dest;
}

function toSwaggerResponses(responses: Response[]): {[statusCode: string]: SwaggerResponse} {
  const dest: {[statusCode: string]: SwaggerResponse} = {};
  responses.forEach((response) => {
    dest[response.status] = toSwaggerResponse(response);
  });
  return dest;
}

function toSwaggerOperation(handler: HttpMethodHandler): SwaggerOperation {
  const dest = new SwaggerOperation();
  dest.operationId = handler.name;
  dest.parameters = handler.parameters.map(toSwaggerParameter);
  dest.responses = toSwaggerResponses([handler.responseRef]);
  return dest;
}

function toPathString(pathElements: PathElement[]): string {
  let path = '';
  pathElements.forEach((pathElement) => {
    if (pathElement instanceof StaticPathElement) {
      path += `/${pathElement.value}`;
    } else if (pathElement instanceof PathParameter) {
      path += `/{${pathElement.name}}`
    } else {
      throw new Error(`Unsupported path element: ${typeof pathElement}`);
    }
  });
  return path;
}

function toSwaggerPaths(pathScopes: PathScope[]): {[path: string]: SwaggerPath} {
  const dest: {[path: string]: SwaggerPath} = {};
  pathScopes.forEach((pathScope) => {
    const location = toPathString(pathScope.path);
    const path = new SwaggerPath();
    pathScope.mappings.forEach((mapping) => {
      if (mapping instanceof HttpMethodHandler) {
        const operation = toSwaggerOperation(mapping);

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

function setSwaggerSchemaProperties(swaggerSchema: SwaggerSchema, property: Property) {
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

function toSwaggerProperties(properties: Property[]): {[propertyName: string]: SwaggerSchema} {
  const dest: {[propertyName: string]: SwaggerSchema} = {};
  properties.forEach((property) => {
    const {name} = property;
    const swaggerProperty = new SwaggerSchema();
    if (property.isArray) {
      swaggerProperty.type = 'array';
      const items = new SwaggerSchema();
      setSwaggerSchemaProperties(items, property);
      swaggerProperty.items = items;

    } else {
      setSwaggerSchemaProperties(swaggerProperty, property);
    }
    dest[name] = swaggerProperty;
  });

  return dest;
}

function getRequiredProperties(properties: Property[]): string[] {
  return properties
      .filter(property => !(property.allowEmpty || property.allowNull))
      .map(property => property.name)
}

function toSwaggerDefinitions(classTypes: ClassType[]): {[definitionsName: string]: SwaggerSchema} {
  const dest: {[definitionsName: string]: SwaggerSchema} = {};
  classTypes.forEach((classType) => {
    const {name, properties} = classType;
    const definition = new SwaggerSchema();
    definition.type = 'object';
    definition.properties = toSwaggerProperties(properties);
    definition.required = getRequiredProperties(properties);

    dest[name] = definition;
  });
  return dest;
}

function toSwaggerSpecification(spec: Specification): SwaggerSpecification {
  const {pathScopes, classTypes} = spec;

  const dest = new SwaggerSpecification();
  dest.swagger = '2.0';
  dest.info = toSwaggerInfo(spec);
  dest.paths = toSwaggerPaths(pathScopes);
  dest.definitions = toSwaggerDefinitions(classTypes);
  return dest;
}

export class SwaggerGenerator implements Generator {
  outputFile: string = 'swagger.yml';

  generateFiles(spec: Specification, context: GeneratorContext): void {
    const swaggerModel = toSwaggerSpecification(spec);
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

