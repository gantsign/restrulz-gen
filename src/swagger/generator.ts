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

export enum SwaggerFormat {
  YAML,
  JSON
}

export class SwaggerGenerator implements Generator {
  licenseHeader = '';
  format = SwaggerFormat.YAML;

  //noinspection JSUnusedLocalSymbols,JSMethodCanBeStatic
  protected toSwaggerInfo(spec: Specification): SwaggerInfo {
    const {name, title, description, version} = spec;
    const dest = new SwaggerInfo();

    dest.title = title !== '' ? title : name;
    if (description !== '') {
      dest.description = description;
    }
    dest.version = version !== '' ? version : '0.0.0';
    return dest
  }

  //noinspection JSMethodCanBeStatic
  protected toSwaggerSchema(classType: ClassType): SwaggerSchema {
    const dest = new SwaggerSchema();
    dest.$ref = `#/definitions/${classType.name}`;
    return dest;
  }

  protected toSwaggerParameter(handlerParam: HandlerParameter): SwaggerParameter {
    if (handlerParam instanceof PathParameterReference) {
      const {name, value: param} = handlerParam;
      const dest = new SwaggerPathParameter();
      dest.name = name;
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
      const {name, typeRef: paramType} = handlerParam;
      const dest = new SwaggerBodyParameter();
      dest.name = name;
      dest.in = 'body';
      dest.required = true;
      dest.schema = this.toSwaggerSchema(paramType);
      return dest;

    } else {
      throw new Error(`Unsupported parameter type: ${typeof handlerParam}`);
    }
  }

  protected toSwaggerResponse(response: Response): SwaggerResponse {
    const dest = new SwaggerResponse();
    dest.description = response.name;
    if (response.isArray) {
      const schema = new SwaggerSchema();
      schema.type = 'array';
      schema.items = this.toSwaggerSchema(response.bodyTypeRef);
      dest.schema = schema;

    } else {
      dest.schema = this.toSwaggerSchema(response.bodyTypeRef);
    }
    return dest;
  }

  protected toSwaggerResponses(responses: Response[]): {[statusCode: string]: SwaggerResponse} {
    const dest: {[statusCode: string]: SwaggerResponse} = {};
    responses.forEach((response) => {
      dest[response.status] = this.toSwaggerResponse(response);
    });
    return dest;
  }

  protected toSwaggerOperation(handler: HttpMethodHandler): SwaggerOperation {
    const dest = new SwaggerOperation();
    dest.operationId = handler.name;
    dest.parameters = handler.parameters.map(this.toSwaggerParameter);
    dest.responses = this.toSwaggerResponses(handler.responseRefs);
    return dest;
  }

  protected toPathString(pathElements: PathElement[]): string {
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

  protected toSwaggerPaths(pathScopes: PathScope[]): {[path: string]: SwaggerPath} {
    const dest: {[path: string]: SwaggerPath} = {};
    pathScopes.forEach((pathScope) => {
      const location = this.toPathString(pathScope.path);
      const path = new SwaggerPath();
      pathScope.mappings.forEach((mapping) => {
        if (mapping instanceof HttpMethodHandler) {
          const operation = this.toSwaggerOperation(mapping);

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

  //noinspection JSMethodCanBeStatic
  protected setSwaggerSchemaProperties(swaggerSchema: SwaggerSchema, property: Property): void {
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

  protected toSwaggerProperties(properties: Property[]): {[propertyName: string]: SwaggerSchema} {
    const dest: {[propertyName: string]: SwaggerSchema} = {};
    properties.forEach((property) => {
      const {name} = property;
      const swaggerProperty = new SwaggerSchema();
      if (property.isArray) {
        swaggerProperty.type = 'array';
        const items = new SwaggerSchema();
        this.setSwaggerSchemaProperties(items, property);
        swaggerProperty.items = items;

      } else {
        this.setSwaggerSchemaProperties(swaggerProperty, property);
      }
      dest[name] = swaggerProperty;
    });

    return dest;
  }

  //noinspection JSMethodCanBeStatic
  protected getRequiredProperties(properties: Property[]): string[] {
    return properties
        .filter(property => !(property.allowEmpty || property.allowNull))
        .map(property => property.name)
  }

  protected toSwaggerDefinitions(classTypes: ClassType[]): {[definitionsName: string]: SwaggerSchema} {
    const dest: {[definitionsName: string]: SwaggerSchema} = {};
    classTypes.forEach((classType) => {
      const {name, properties} = classType;
      const definition = new SwaggerSchema();
      definition.type = 'object';
      definition.properties = this.toSwaggerProperties(properties);
      definition.required = this.getRequiredProperties(properties);

      dest[name] = definition;
    });
    return dest;
  }

  protected toSwaggerSpecification(spec: Specification): SwaggerSpecification {
    const {pathScopes, classTypes} = spec;

    const dest = new SwaggerSpecification();
    dest.swagger = '2.0';
    dest.info = this.toSwaggerInfo(spec);
    dest.paths = this.toSwaggerPaths(pathScopes);
    dest.definitions = this.toSwaggerDefinitions(classTypes);
    return dest;
  }

  //noinspection JSMethodCanBeStatic
  protected getSwaggerOutputPath(spec: Specification): string {
    const extension = this.format === SwaggerFormat.JSON ? 'json' : 'yml';
    return `${spec.name}.swagger.${extension}`;
  }

  init(generators: Generator[]): void {
    // do nothing
  }

  generateFiles(spec: Specification, context: GeneratorContext): void {
    const swaggerModel = this.toSwaggerSpecification(spec);
    const outputPath = this.getSwaggerOutputPath(spec);
    if (outputPath.toLowerCase().endsWith('.json')) {
      context.writeJsonToFile(outputPath, swaggerModel);
      return;
    }
    context.writeYamlToFile(outputPath, swaggerModel);
  }

  constructor() {
    this.generateFiles = this.generateFiles.bind(this);
    this.toSwaggerParameter = this.toSwaggerParameter.bind(this);
  }
}

