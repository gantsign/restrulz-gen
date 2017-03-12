/*
 * Copyright 2017 GantSign Ltd. All Rights Reserved.
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
  HandlerParameter,
  HttpMethod,
  HttpMethodHandler,
  HttpStatus,
  Mapping,
  PathParameterReference,
  Response,
  RootPathScope,
  Specification,
  SubPathScope
} from '../../restrulz/model';
import {GeneratorContext} from '../../generator';
import {
  CompanionObjectKt,
  FileKt,
  FunctionSignatureKt,
  InterfaceKt,
  VisibilityKt
} from '../lang';
import {KotlinGenerator} from '../generator';
import {kebabToCamel} from '../../util/kebab';

export class KotlinSpringMvcGenerator extends KotlinGenerator {

  public getControllerApiPackageName(spec: Specification): string {

    return this.packageMapping[`${spec.name}.ws.api`]
        || `${this.getPackageName(spec)}.ws.api`;
  }

  //noinspection JSMethodCanBeStatic
  public getControllerApiClassName(pathScope: RootPathScope): string {

    return `${this.toKotlinClassName(pathScope.name)}Api`;
  }

  public getResponsePackageName(spec: Specification, pathScope: RootPathScope): string {

    const responsePackageName = kebabToCamel(pathScope.name).toLowerCase();
    return `${this.getControllerApiPackageName(spec)}.${responsePackageName}`;
  }

  //noinspection JSMethodCanBeStatic
  public getResponseClassName(handler: HttpMethodHandler): string {

    return `${this.toKotlinClassName(handler.name)}Response`;
  }

  public getQualifiedResponseClass(spec: Specification,
                                   pathScope: RootPathScope,
                                   handler: HttpMethodHandler): string {

    const packageName = this.getResponsePackageName(spec, pathScope);
    const className = this.getResponseClassName(handler);
    return `${packageName}.${className}`;
  }

  //noinspection JSMethodCanBeStatic
  public getSpringHttpMethod(handler: HttpMethodHandler): string {

    const methodClass = 'org.springframework.web.bind.annotation.RequestMethod';

    switch (handler.method) {

      case HttpMethod.GET:
        return `${methodClass}.GET`;

      case HttpMethod.PUT:
        return `${methodClass}.PUT`;

      case HttpMethod.POST:
        return `${methodClass}.POST`;

      case HttpMethod.DELETE:
        return `${methodClass}.DELETE`;

      default:
        throw new Error(`Unsupported HTTP method: ${handler.method}`);
    }
  }

  public addPathParameter(functionSignature: FunctionSignatureKt,
                          spec: Specification,
                          parameter: PathParameterReference) {

    const {name, value} = parameter;
    const paramName = kebabToCamel(name);
    const paramType = this.toKotlinType(spec, value.typeRef);

    functionSignature.addParameter(paramName, paramType, parameterKt => {

      parameterKt.addAnnotation(
          'org.springframework.web.bind.annotation.PathVariable',
          annotationKt => {

            annotationKt.addSimpleParameter('value', this.toKotlinString(value.name));
          });
    });
  }

  public addBodyParameter(functionSignature: FunctionSignatureKt,
                          spec: Specification,
                          parameter: BodyParameterReference) {

    const paramName = kebabToCamel(parameter.name);
    const paramType = this.getQualifiedModelClass(spec, parameter.typeRef);

    functionSignature.addParameter(paramName, paramType, parameterKt => {

      parameterKt.addAnnotation('org.springframework.web.bind.annotation.RequestBody');
    });
  }

  public addFunctionSignatureParameter(functionSignature: FunctionSignatureKt,
                                       spec: Specification,
                                       parameter: HandlerParameter) {

    if (parameter instanceof PathParameterReference) {

      this.addPathParameter(functionSignature, spec, parameter);

    } else if (parameter instanceof BodyParameterReference) {

      this.addBodyParameter(functionSignature, spec, parameter);

    } else {
      throw new Error(`Unsupported HandlerParameter type: ${parameter.constructor.name}`);
    }
  }

  public addControllerApiHttpMethodHandlerFunction(interfaceKt: InterfaceKt,
                                                   spec: Specification,
                                                   path: string,
                                                   pathScope: RootPathScope,
                                                   handler: HttpMethodHandler) {

    const {parameters} = handler;

    interfaceKt.addFunctionSignature(kebabToCamel(handler.name), functionSignature => {

      functionSignature.addAnnotation(
          'org.springframework.web.bind.annotation.RequestMapping',
          annotationKt => {

            if (path !== '/' && path !== '') {
              annotationKt.addParameter('path', fileKt => {

                const arrayOf = fileKt.tryImport('kotlin.arrayOf');
                return `${arrayOf}(${this.toKotlinString(path)})`;
              });
            }

            annotationKt.addParameter('method', fileKt => {

              const arrayOf = fileKt.tryImport('kotlin.arrayOf');
              const method = fileKt.tryImport(this.getSpringHttpMethod(handler));
              return `${arrayOf}(${method})`;
            });
          });


      parameters.forEach(param =>
          this.addFunctionSignatureParameter(functionSignature, spec, param));

      functionSignature.alwaysWrapParameters = true;
      functionSignature.wrapAfterParameters = true;

      functionSignature.setReturnType('io.reactivex.Single', returnType => {

        returnType.addGenericParameter(this.getQualifiedResponseClass(spec, pathScope, handler));
      });
    });
  }

  //noinspection JSMethodCanBeStatic
  public toFactoryFunctionName(status: HttpStatus): string {

    switch (status) {

      case HttpStatus.OK:
        return 'ok';

      case HttpStatus.CREATED:
        return 'created';

      case HttpStatus.ACCEPTED:
        return 'accepted';

      case HttpStatus.NO_CONTENT:
        return 'noContent';

      case HttpStatus.PARTIAL_CONTENT:
        return 'partialContent';

      case HttpStatus.MOVED_PERMANENTLY:
        return 'movedPermanently';

      case HttpStatus.SEE_OTHER:
        return 'seeOther';

      case HttpStatus.NOT_MODIFIED:
        return 'notModified';

      case HttpStatus.TEMPORARY_REDIRECT:
        return 'temporaryRedirect';

      case HttpStatus.PERMANENT_REDIRECT:
        return 'permanentRedirect';

      case HttpStatus.BAD_REQUEST:
        return 'badRequest';

      case HttpStatus.UNAUTHORIZED:
        return 'unauthorized';

      case HttpStatus.FORBIDDEN:
        return 'forbidden';

      case HttpStatus.NOT_FOUND:
        return 'notFound';

      case HttpStatus.NOT_ACCEPTABLE:
        return 'notAcceptable';

      case HttpStatus.CONFLICT:
        return 'conflict';

      case HttpStatus.GONE:
        return 'gone';

      case HttpStatus.TOO_MANY_REQUESTS:
        return 'tooManyRequests';

      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 'internalServerError';

      case HttpStatus.NOT_IMPLEMENTED:
        return 'notImplemented';

      case HttpStatus.BAD_GATEWAY:
        return 'badGateway';

      case HttpStatus.SERVICE_UNAVAILABLE:
        return 'serviceUnavailable';

      case HttpStatus.GATEWAY_TIME_OUT:
        return 'gatewayTimeOut';

      default:
        throw new Error(`Unexpected HTTP status: ${status}`);
    }
  }

  //noinspection JSMethodCanBeStatic
  public toSpringHttpStatusValue(status: HttpStatus): string {

    switch (status) {

      case HttpStatus.OK:
        return 'OK';

      case HttpStatus.CREATED:
        return 'CREATED';

      case HttpStatus.ACCEPTED:
        return 'ACCEPTED';

      case HttpStatus.NO_CONTENT:
        return 'NO_CONTENT';

      case HttpStatus.PARTIAL_CONTENT:
        return 'PARTIAL_CONTENT';

      case HttpStatus.MOVED_PERMANENTLY:
        return 'MOVED_PERMANENTLY';

      case HttpStatus.SEE_OTHER:
        return 'SEE_OTHER';

      case HttpStatus.NOT_MODIFIED:
        return 'NOT_MODIFIED';

      case HttpStatus.TEMPORARY_REDIRECT:
        return 'TEMPORARY_REDIRECT';

      case HttpStatus.PERMANENT_REDIRECT:
        return 'PERMANENT_REDIRECT';

      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';

      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';

      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';

      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';

      case HttpStatus.NOT_ACCEPTABLE:
        return 'NOT_ACCEPTABLE';

      case HttpStatus.CONFLICT:
        return 'CONFLICT';

      case HttpStatus.GONE:
        return 'GONE';

      case HttpStatus.TOO_MANY_REQUESTS:
        return 'TOO_MANY_REQUESTS';

      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 'INTERNAL_SERVER_ERROR';

      case HttpStatus.NOT_IMPLEMENTED:
        return 'NOT_IMPLEMENTED';

      case HttpStatus.BAD_GATEWAY:
        return 'BAD_GATEWAY';

      case HttpStatus.SERVICE_UNAVAILABLE:
        return 'SERVICE_UNAVAILABLE';

      case HttpStatus.GATEWAY_TIME_OUT:
        return 'GATEWAY_TIME_OUT';

      default:
        throw new Error(`Unexpected HTTP status: ${status}`);
    }
  }

  public addFactoryFunctionForArray(companionObjectKt: CompanionObjectKt,
                                    spec: Specification,
                                    pathScope: RootPathScope,
                                    handler: HttpMethodHandler,
                                    response: Response) {

    const {status, bodyTypeRef} = response;

    const entityType = this.getQualifiedModelClass(spec, bodyTypeRef);
    const springHttpStatusValue = this.toSpringHttpStatusValue(status);
    const functionName = this.toFactoryFunctionName(status);

    companionObjectKt.addFunction(functionName, (bodyKt, functionKt) => {

      functionKt.addParameter('values', 'kotlin.collections.List', (parameterKt, paramType) => {
        paramType.addGenericParameter(entityType);
      });
      const responseClass = this.getQualifiedResponseClass(spec, pathScope, handler);
      functionKt.setReturnType(responseClass);

      const indent = this.indent;

      bodyKt.writeDynamicLn(fileKt => {

        const anyShortName = fileKt.tryImport('kotlin.Any');
        const arrayListShortName = fileKt.tryImport('kotlin.collections.ArrayList');
        const entityShortName = fileKt.tryImport(entityType);
        const headersShortName = fileKt.tryImport('org.springframework.http.HttpHeaders');
        const mediaTypeShortName = fileKt.tryImport('org.springframework.http.MediaType');
        const responseShortName = fileKt.tryImport(responseClass);
        const responseEntityShortName = fileKt.tryImport('org.springframework.http.ResponseEntity');
        const httpStatusShortName = fileKt.tryImport('org.springframework.http.HttpStatus');

        return `
val typedList: ${anyShortName}? = object : ${arrayListShortName}<${entityShortName}>(values) {}

val headers = ${headersShortName}()
headers.contentType = ${mediaTypeShortName}.APPLICATION_JSON_UTF8

return ${responseShortName}(
${indent(`${responseEntityShortName}(\
typedList, headers, ${httpStatusShortName}.${springHttpStatusValue}))`)}`;
      });
    });
  }

  public addFactoryFunctionForObject(companionObjectKt: CompanionObjectKt,
                                     spec: Specification,
                                     pathScope: RootPathScope,
                                     handler: HttpMethodHandler,
                                     response: Response) {

    const {status, bodyTypeRef} = response;

    const entityType = this.getQualifiedModelClass(spec, bodyTypeRef);
    const springHttpStatusValue = this.toSpringHttpStatusValue(status);
    const functionName = this.toFactoryFunctionName(status);

    companionObjectKt.addFunction(functionName, (bodyKt, functionKt) => {

      functionKt.addParameter('value', entityType);

      const responseClass = this.getQualifiedResponseClass(spec, pathScope, handler);
      functionKt.setReturnType(responseClass);

      const indent = this.indent;

      bodyKt.writeDynamicLn(fileKt => {

        const anyShortName = fileKt.tryImport('kotlin.Any');
        const headersShortName = fileKt.tryImport('org.springframework.http.HttpHeaders');
        const mediaTypeShortName = fileKt.tryImport('org.springframework.http.MediaType');
        const responseShortName = fileKt.tryImport(responseClass);
        const responseEntityShortName = fileKt.tryImport('org.springframework.http.ResponseEntity');
        const httpStatusShortName = fileKt.tryImport('org.springframework.http.HttpStatus');

        return `
val headers = ${headersShortName}()
headers.contentType = ${mediaTypeShortName}.APPLICATION_JSON_UTF8;

return ${responseShortName}(
${indent(`${responseEntityShortName}<${anyShortName}?>(\
value, headers, ${httpStatusShortName}.${springHttpStatusValue}))`)}`;
      });
    });
  }

  public addResponseKotlinClass(fileKt: FileKt,
                                spec: Specification,
                                pathScope: RootPathScope,
                                handler: HttpMethodHandler) {

    fileKt.addClass(this.getResponseClassName(handler), classKt => {

      classKt.setPrimaryConstructor(constructorKt => {

        constructorKt.visibility = VisibilityKt.Private;
        constructorKt.alwaysWrapParameters = true;

        const propertyName = 'responseEntity';
        const propertyType = 'org.springframework.http.ResponseEntity';

        constructorKt.addProperty(propertyName, propertyType, (propertyKt, typeSignatureKt) => {

          propertyKt.visibility = VisibilityKt.Private;

          typeSignatureKt.addGenericParameterNullable('kotlin.Any');
        });
      });

      classKt.implementsInterface(
          'com.gantsign.restrulz.spring.mvc.ResponseEntityConvertible',
          type => {

            type.addGenericParameterNullable('kotlin.Any');
          }
      );

      classKt.addFunction('toResponseEntity', (bodyKt, functionKt) => {

        functionKt.overrides = true;

        functionKt.setReturnType('org.springframework.http.ResponseEntity', returnType => {

          returnType.addGenericParameterNullable('kotlin.Any');
        });

        bodyKt.writeLn('return responseEntity');
      });

      classKt.setCompanionObject(companionObjectKt => {

        for (let responseRef of handler.responseRefs) {

          if (responseRef.isArray) {

            this.addFactoryFunctionForArray(
                companionObjectKt, spec, pathScope, handler, responseRef);

          } else {
            this.addFactoryFunctionForObject(
                companionObjectKt, spec, pathScope, handler, responseRef);
          }
        }
      });
    });
  }

  public toResponseKotlinFile(spec: Specification,
                              pathScope: RootPathScope,
                              handler: HttpMethodHandler): FileKt {

    const className = this.getResponseClassName(handler);
    const fileKt = this.createKotlinFile(this.getResponsePackageName(spec, pathScope), className);

    this.addResponseKotlinClass(fileKt, spec, pathScope, handler);
    return fileKt;
  }

  public generateResponseFile(spec: Specification,
                              pathScope: RootPathScope,
                              handler: HttpMethodHandler,
                              context: GeneratorContext): void {

    this.writeFile(context, this.toResponseKotlinFile(spec, pathScope, handler));
  }

  public addControllerApiFunction(interfaceKt: InterfaceKt,
                                  spec: Specification,
                                  path: string,
                                  pathScope: RootPathScope,
                                  mapping: Mapping,
                                  context: GeneratorContext) {

    if (mapping instanceof HttpMethodHandler) {

      this.generateResponseFile(spec, pathScope, mapping, context);
      this.addControllerApiHttpMethodHandlerFunction(interfaceKt, spec, path, pathScope, mapping);

    } else if (mapping instanceof SubPathScope) {

      const newPath = path + mapping.getPathAsString();

      mapping.mappings.forEach(
          subMapping => this.addControllerApiFunction(
              interfaceKt, spec, newPath, pathScope, subMapping, context));
    } else {
      throw new Error(`Unsupported Mapping type: ${mapping.constructor.name}`);
    }
  }

  public addControllerApiKotlinInterface(fileKt: FileKt,
                                         spec: Specification,
                                         pathScope: RootPathScope,
                                         context: GeneratorContext) {
    const {mappings} = pathScope;
    const path = pathScope.getPathAsString();

    fileKt.addInterface(this.getControllerApiClassName(pathScope), interfaceKt => {

      if (path !== '/' && path !== '') {
        interfaceKt.addAnnotation(
            'org.springframework.web.bind.annotation.RequestMapping',
            annotationKt => {

              annotationKt.addSimpleParameter('value', this.toKotlinString(path));
            });
      }

      mappings.forEach(
          mapping => this.addControllerApiFunction(
              interfaceKt, spec, '', pathScope, mapping, context));
    });
  }

  public toControllerApiKotlinFile(spec: Specification,
                                   pathScope: RootPathScope,
                                   context: GeneratorContext): FileKt {

    const className = this.getControllerApiClassName(pathScope);
    const fileKt = this.createKotlinFile(this.getControllerApiPackageName(spec), className);

    this.addControllerApiKotlinInterface(fileKt, spec, pathScope, context);
    return fileKt;
  }

  public generateControllerApiFiles(spec: Specification, context: GeneratorContext): void {

    spec.pathScopes.forEach(pathScope =>
        this.writeFile(context, this.toControllerApiKotlinFile(spec, pathScope, context)));
  }

  generateFiles(spec: Specification, context: GeneratorContext): void {

    this.generateControllerApiFiles(spec, context);
  }
}
