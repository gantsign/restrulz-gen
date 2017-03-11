/*
 * Copyright 2017 GantSign Ltd. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this fileKt except in compliance with the License.
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
/// <reference path="../../typings/globals/jasmine/index.d.ts" />
import {
  BodyParameterReference,
  ClassType,
  HandlerParameter,
  HttpMethod,
  HttpMethodHandler,
  HttpStatus,
  PathParameter,
  PathParameterReference,
  PathScope,
  Response,
  Specification,
  StaticPathElement,
  StringType
} from '../../src/restrulz/model';
import {
  AnnotationParameterKt,
  ClassKt,
  CompanionObjectKt,
  ConstructorPropertyKt,
  FileKt,
  FunctionKt,
  FunctionSignatureKt,
  ImplementsKt,
  InterfaceKt,
  PrimaryConstructorKt,
  VisibilityKt
} from '../../src/kotlin/lang';
import {GeneratorContext} from '../../src/generator';
import {KotlinSerializer} from '../../src/kotlin/serializer';
import {KotlinSpringMvcGenerator} from '../../src/kotlin/spring-mvc-generator';

describe('KotlinSpringMvcGenerator', () => {

  const generator = new KotlinSpringMvcGenerator();
  const serializer = new KotlinSerializer();

  const spec = new Specification();
  spec.name = 'testing';

  describe('getControllerApiPackageName()', () => {

    it('should derive default package name from specification', () => {

      expect(generator.getControllerApiPackageName(spec))
          .toBe('testing.ws.api');
    });

    it('should support default package name mapping', () => {
      const generatorWithMapping = new KotlinSpringMvcGenerator();
      generatorWithMapping.packageMapping['testing'] = 'com.example';

      expect(generatorWithMapping.getControllerApiPackageName(spec))
          .toBe('com.example.ws.api');
    });

    it('should support package name mapping', () => {
      const generatorWithMapping = new KotlinSpringMvcGenerator();
      generatorWithMapping.packageMapping['testing.ws.api'] = 'com.example.mvc';

      expect(generatorWithMapping.getControllerApiPackageName(spec))
          .toBe('com.example.mvc');
    });
  });

  describe('getControllerApiClassName()', () => {
    const pathScope = new PathScope();
    pathScope.name = 'delivery-address';

    it('should convert kebab case to capitalized camel case', () => {
      expect(generator.getControllerApiClassName(pathScope))
          .toBe('DeliveryAddressApi');
    });
  });

  describe('getResponsePackageName()', () => {
    const pathScope = new PathScope();
    pathScope.name = 'delivery-address';

    it('should derive default package name from specification', () => {

      expect(generator.getResponsePackageName(spec, pathScope))
          .toBe('testing.ws.api.deliveryaddress');
    });

    it('should support default package name mapping', () => {
      const generatorWithMapping = new KotlinSpringMvcGenerator();
      generatorWithMapping.packageMapping['testing'] = 'com.example';

      expect(generatorWithMapping.getResponsePackageName(spec, pathScope))
          .toBe('com.example.ws.api.deliveryaddress');
    });

    it('should support api package name mapping', () => {
      const generatorWithMapping = new KotlinSpringMvcGenerator();
      generatorWithMapping.packageMapping['testing.ws.api'] = 'com.example.mvc';

      expect(generatorWithMapping.getResponsePackageName(spec, pathScope))
          .toBe('com.example.mvc.deliveryaddress');
    });
  });

  describe('getResponseClassName()', () => {
    const handler = new HttpMethodHandler();
    handler.name = 'get-delivery-address';

    it('should convert kebab case to capitalized camel case', () => {
      expect(generator.getResponseClassName(handler))
          .toBe('GetDeliveryAddressResponse');
    });
  });

  describe('getQualifiedResponseClass()', () => {
    const pathScope = new PathScope();
    pathScope.name = 'delivery-address';

    const handler = new HttpMethodHandler();
    handler.name = 'get-delivery-address';

    it('should derive default package name from specification', () => {

      expect(generator.getQualifiedResponseClass(spec, pathScope, handler))
          .toBe('testing.ws.api.deliveryaddress.GetDeliveryAddressResponse');
    });

    it('should support default package name mapping', () => {
      const generatorWithMapping = new KotlinSpringMvcGenerator();
      generatorWithMapping.packageMapping['testing'] = 'com.example';

      expect(generatorWithMapping.getQualifiedResponseClass(spec, pathScope, handler))
          .toBe('com.example.ws.api.deliveryaddress.GetDeliveryAddressResponse');
    });

    it('should support api package name mapping', () => {
      const generatorWithMapping = new KotlinSpringMvcGenerator();
      generatorWithMapping.packageMapping['testing.ws.api'] = 'com.example.mvc';

      expect(generatorWithMapping.getQualifiedResponseClass(spec, pathScope, handler))
          .toBe('com.example.mvc.deliveryaddress.GetDeliveryAddressResponse');
    });
  });

  describe('getSpringHttpMethod()', () => {

    it('should support GET', () => {
      const handler = new HttpMethodHandler();
      handler.method = HttpMethod.GET;

      expect(generator.getSpringHttpMethod(handler))
          .toBe('org.springframework.web.bind.annotation.RequestMethod.GET');
    });

    it('should support PUT', () => {
      const handler = new HttpMethodHandler();
      handler.method = HttpMethod.PUT;

      expect(generator.getSpringHttpMethod(handler))
          .toBe('org.springframework.web.bind.annotation.RequestMethod.PUT');
    });

    it('should support POST', () => {
      const handler = new HttpMethodHandler();
      handler.method = HttpMethod.POST;

      expect(generator.getSpringHttpMethod(handler))
          .toBe('org.springframework.web.bind.annotation.RequestMethod.POST');
    });

    it('should support DELETE', () => {
      const handler = new HttpMethodHandler();
      handler.method = HttpMethod.DELETE;

      expect(generator.getSpringHttpMethod(handler))
          .toBe('org.springframework.web.bind.annotation.RequestMethod.DELETE');
    });

    it('should throw error for unsupported method', () => {
      const handler = new HttpMethodHandler();
      handler.method = -1;

      expect(() => generator.getSpringHttpMethod(handler))
          .toThrowError('Unsupported HTTP method: -1');
    });
  });

  describe('addPathParameter()', () => {

    it('should support path parameters', () => {

      const functionKt = new FunctionSignatureKt('test1');

      const pathParameter = new PathParameter();
      pathParameter.name = 'primary-id';
      pathParameter.typeRef = new StringType();

      const parameterRef = new PathParameterReference();
      parameterRef.name = 'address-id';
      parameterRef.value = pathParameter;

      generator.addPathParameter(functionKt, spec, parameterRef);

      expect(functionKt.parameters.length).toBe(1);

      const parameterKt = functionKt.parameters[0];

      expect(parameterKt.name)
          .toBe('addressId');

      expect(parameterKt.type.className)
          .toBe('kotlin.String');

      expect(parameterKt.annotations.length).toBe(1);

      const annotationKt = parameterKt.annotations[0];

      expect(annotationKt.className)
          .toBe('org.springframework.web.bind.annotation.PathVariable');

      expect(annotationKt.parameters.length).toBe(1);

      const annotationParam = annotationKt.parameters[0];

      expect(annotationParam.name).toBe('value');

      const fileKt = new FileKt('com.example.package', 'Test');
      expect(annotationParam.valueFactory(fileKt))
          .toBe('"primary-id"');
    });

  });

  describe('addBodyParameter()', () => {

    it('should support body parameters', () => {

      const functionKt = new FunctionSignatureKt('test1');

      const classType = new ClassType();
      classType.name = 'delivery-address';

      const parameterRef = new BodyParameterReference();
      parameterRef.name = 'primary-address';
      parameterRef.typeRef = classType;

      generator.addBodyParameter(functionKt, spec, parameterRef);

      expect(functionKt.parameters.length).toBe(1);

      const parameterKt = functionKt.parameters[0];

      expect(parameterKt.name)
          .toBe('primaryAddress');

      expect(parameterKt.type.className)
          .toBe('testing.model.DeliveryAddress');

      expect(parameterKt.annotations.length).toBe(1);

      const annotationKt = parameterKt.annotations[0];

      expect(annotationKt.className)
          .toBe('org.springframework.web.bind.annotation.RequestBody');

      expect(annotationKt.parameters.length).toBe(0);
    });

  });

  describe('addFunctionSignatureParameter()', () => {

    it('should support path parameters', () => {

      const functionKt = new FunctionSignatureKt('test1');

      const pathParameter = new PathParameter();
      pathParameter.name = 'primary-id';
      pathParameter.typeRef = new StringType();

      const parameterRef = new PathParameterReference();
      parameterRef.name = 'address-id';
      parameterRef.value = pathParameter;

      generator.addFunctionSignatureParameter(functionKt, spec, parameterRef);

      expect(functionKt.parameters.length).toBe(1);

      const parameterKt = functionKt.parameters[0];

      expect(parameterKt.name)
          .toBe('addressId');

      expect(parameterKt.type.className)
          .toBe('kotlin.String');

      expect(parameterKt.annotations.length).toBe(1);

      const annotationKt = parameterKt.annotations[0];

      expect(annotationKt.className)
          .toBe('org.springframework.web.bind.annotation.PathVariable');

      expect(annotationKt.parameters.length).toBe(1);

      const annotationParam = annotationKt.parameters[0];

      expect(annotationParam.name).toBe('value');

      const fileKt = new FileKt('com.example.package', 'Test');
      expect(annotationParam.valueFactory(fileKt))
          .toBe('"primary-id"');
    });

    it('should support body parameters', () => {

      const functionKt = new FunctionSignatureKt('test1');

      const classType = new ClassType();
      classType.name = 'delivery-address';

      const parameterRef = new BodyParameterReference();
      parameterRef.name = 'primary-address';
      parameterRef.typeRef = classType;

      generator.addFunctionSignatureParameter(functionKt, spec, parameterRef);

      expect(functionKt.parameters.length).toBe(1);

      const parameterKt = functionKt.parameters[0];

      expect(parameterKt.name)
          .toBe('primaryAddress');

      expect(parameterKt.type.className)
          .toBe('testing.model.DeliveryAddress');

      expect(parameterKt.annotations.length).toBe(1);

      const annotationKt = parameterKt.annotations[0];

      expect(annotationKt.className)
          .toBe('org.springframework.web.bind.annotation.RequestBody');

      expect(annotationKt.parameters.length).toBe(0);
    });

    it('should throw error for unsupported type', () => {

      const functionKt = new FunctionSignatureKt('test1');

      class UnsupportedTypeTest {}
      const unsupportedType = <HandlerParameter>new UnsupportedTypeTest();

      expect(() => generator.addFunctionSignatureParameter(functionKt, spec, unsupportedType))
          .toThrowError('Unsupported HandlerParameter type: UnsupportedTypeTest');
    });
  });

  describe('addControllerApiHttpMethodHandlerFunction()', () => {

    it('should add function', () => {

      const interfaceKt = new InterfaceKt('TestApi');

      const pathScope = new PathScope();
      pathScope.name = 'delivery-address';

      const handler = new HttpMethodHandler();
      handler.name = 'get-delivery-address';
      handler.method = HttpMethod.GET;

      const pathParameter = new PathParameter();
      pathParameter.name = 'primary-id';
      pathParameter.typeRef = new StringType();

      const parameterRef1 = new PathParameterReference();
      parameterRef1.name = 'address-id';
      parameterRef1.value = pathParameter;

      const classType = new ClassType();
      classType.name = 'delivery-address';

      const parameterRef2 = new BodyParameterReference();
      parameterRef2.name = 'primary-address';
      parameterRef2.typeRef = classType;

      handler.parameters = [parameterRef1, parameterRef2];

      generator.addControllerApiHttpMethodHandlerFunction(interfaceKt, spec, pathScope, handler);

      expect(interfaceKt.members.length).toBe(1);
      const functionKt = interfaceKt.members[0];
      if (!(<any>functionKt instanceof FunctionSignatureKt)) {
        fail(`Expected FunctionSignatureKt but was ${functionKt.constructor.name}`);
        return;
      }

      expect(functionKt.parameters.length).toBe(2);

      const returnType = functionKt.returnType;

      expect(returnType.className)
          .toBe('io.reactivex.Single');

      expect(returnType.genericParameters.length)
          .toBe(1);

      expect(returnType.genericParameters[0].className)
          .toBe('testing.ws.api.deliveryaddress.GetDeliveryAddressResponse');

      const funParam1 = functionKt.parameters[0];

      expect(funParam1.name)
          .toBe('addressId');

      expect(funParam1.annotations.length)
          .toBe(1);

      const paramAnna1 = funParam1.annotations[0];

      expect(paramAnna1.className)
          .toBe('org.springframework.web.bind.annotation.PathVariable');

      expect(paramAnna1.parameters.length)
          .toBe(1);

      const annaParam1 = paramAnna1.parameters[0];
      expect(annaParam1.name)
          .toBe('value');

      const fileKt = new FileKt('com.example.package', 'TestApi');

      expect(annaParam1.valueFactory(fileKt))
          .toBe('"primary-id"');

      const funParam2 = functionKt.parameters[1];

      expect(funParam2.name)
          .toBe('primaryAddress');

      const paramAnna2 = funParam2.annotations[0];

      expect(paramAnna2.className)
          .toBe('org.springframework.web.bind.annotation.RequestBody');

      expect(paramAnna2.parameters.length)
          .toBe(0);

      expect(functionKt.annotations.length)
          .toBe(1);

      const funcAnna = functionKt.annotations[0];

      expect(funcAnna.className)
          .toBe('org.springframework.web.bind.annotation.RequestMapping');

      expect(funcAnna.parameters.length)
          .toBe(1);

      const funcAnnaParam = funcAnna.parameters[0];

      expect(funcAnnaParam.name)
          .toBe('method');

      expect(funcAnnaParam.valueFactory(fileKt))
          .toBe('arrayOf(GET)');

      expect(fileKt.importMapping['kotlin.arrayOf'])
          .toBe('arrayOf');

      expect(fileKt.importMapping['org.springframework.web.bind.annotation.RequestMethod.GET'])
          .toBe('GET');
    });
  });

  describe('toFactoryFunctionName()', () => {

    it('should support OK', () => {
      expect(generator.toFactoryFunctionName(HttpStatus.OK))
          .toBe('ok');
    });

    it('should support CREATED', () => {
      expect(generator.toFactoryFunctionName(HttpStatus.CREATED))
          .toBe('created');
    });

    it('should support ACCEPTED', () => {
      expect(generator.toFactoryFunctionName(HttpStatus.ACCEPTED))
          .toBe('accepted');
    });

    it('should support NO_CONTENT', () => {
      expect(generator.toFactoryFunctionName(HttpStatus.NO_CONTENT))
          .toBe('noContent');
    });

    it('should support PARTIAL_CONTENT', () => {
      expect(generator.toFactoryFunctionName(HttpStatus.PARTIAL_CONTENT))
          .toBe('partialContent');
    });

    it('should support MOVED_PERMANENTLY', () => {
      expect(generator.toFactoryFunctionName(HttpStatus.MOVED_PERMANENTLY))
          .toBe('movedPermanently');
    });

    it('should support SEE_OTHER', () => {
      expect(generator.toFactoryFunctionName(HttpStatus.SEE_OTHER))
          .toBe('seeOther');
    });

    it('should support NOT_MODIFIED', () => {
      expect(generator.toFactoryFunctionName(HttpStatus.NOT_MODIFIED))
          .toBe('notModified');
    });

    it('should support TEMPORARY_REDIRECT', () => {
      expect(generator.toFactoryFunctionName(HttpStatus.TEMPORARY_REDIRECT))
          .toBe('temporaryRedirect');
    });

    it('should support PERMANENT_REDIRECT', () => {
      expect(generator.toFactoryFunctionName(HttpStatus.PERMANENT_REDIRECT))
          .toBe('permanentRedirect');
    });

    it('should support BAD_REQUEST', () => {
      expect(generator.toFactoryFunctionName(HttpStatus.BAD_REQUEST))
          .toBe('badRequest');
    });

    it('should support UNAUTHORIZED', () => {
      expect(generator.toFactoryFunctionName(HttpStatus.UNAUTHORIZED))
          .toBe('unauthorized');
    });

    it('should support FORBIDDEN', () => {
      expect(generator.toFactoryFunctionName(HttpStatus.FORBIDDEN))
          .toBe('forbidden');
    });

    it('should support NOT_FOUND', () => {
      expect(generator.toFactoryFunctionName(HttpStatus.NOT_FOUND))
          .toBe('notFound');
    });

    it('should support NOT_ACCEPTABLE', () => {
      expect(generator.toFactoryFunctionName(HttpStatus.NOT_ACCEPTABLE))
          .toBe('notAcceptable');
    });

    it('should support CONFLICT', () => {
      expect(generator.toFactoryFunctionName(HttpStatus.CONFLICT))
          .toBe('conflict');
    });

    it('should support GONE', () => {
      expect(generator.toFactoryFunctionName(HttpStatus.GONE))
          .toBe('gone');
    });

    it('should support TOO_MANY_REQUESTS', () => {
      expect(generator.toFactoryFunctionName(HttpStatus.TOO_MANY_REQUESTS))
          .toBe('tooManyRequests');
    });

    it('should support NOT_IMPLEMENTED', () => {
      expect(generator.toFactoryFunctionName(HttpStatus.NOT_IMPLEMENTED))
          .toBe('notImplemented');
    });

    it('should support BAD_GATEWAY', () => {
      expect(generator.toFactoryFunctionName(HttpStatus.BAD_GATEWAY))
          .toBe('badGateway');
    });

    it('should support SERVICE_UNAVAILABLE', () => {
      expect(generator.toFactoryFunctionName(HttpStatus.SERVICE_UNAVAILABLE))
          .toBe('serviceUnavailable');
    });

    it('should support GATEWAY_TIME_OUT', () => {
      expect(generator.toFactoryFunctionName(HttpStatus.GATEWAY_TIME_OUT))
          .toBe('gatewayTimeOut');
    });

    it('should throw error for unsupported status', () => {
      expect(() => generator.toFactoryFunctionName(-1))
          .toThrowError('Unexpected HTTP status: -1');
    });

  });

  describe('toSpringHttpStatusValue()', () => {

    it('should support OK', () => {
      expect(generator.toSpringHttpStatusValue(HttpStatus.OK))
          .toBe('OK');
    });

    it('should support CREATED', () => {
      expect(generator.toSpringHttpStatusValue(HttpStatus.CREATED))
          .toBe('CREATED');
    });

    it('should support ACCEPTED', () => {
      expect(generator.toSpringHttpStatusValue(HttpStatus.ACCEPTED))
          .toBe('ACCEPTED');
    });

    it('should support PARTIAL_CONTENT', () => {
      expect(generator.toSpringHttpStatusValue(HttpStatus.PARTIAL_CONTENT))
          .toBe('PARTIAL_CONTENT');
    });

    it('should throw error for unsupported status', () => {
      expect(() => generator.toSpringHttpStatusValue(-1))
          .toThrowError('Unexpected HTTP status: -1');
    });

  });

  describe('addFactoryFunctionForArray()', () => {

    it('should add function', () => {

      const companionObjectKt = new CompanionObjectKt();

      const pathScope = new PathScope();
      pathScope.name = 'delivery-address';

      const handler = new HttpMethodHandler();
      handler.name = 'get-delivery-address';
      handler.method = HttpMethod.GET;

      const pathParameter = new PathParameter();
      pathParameter.name = 'primary-id';
      pathParameter.typeRef = new StringType();

      const parameterRef1 = new PathParameterReference();
      parameterRef1.name = 'address-id';
      parameterRef1.value = pathParameter;

      const classType = new ClassType();
      classType.name = 'delivery-address';

      const parameterRef2 = new BodyParameterReference();
      parameterRef2.name = 'primary-address';
      parameterRef2.typeRef = classType;

      handler.parameters = [parameterRef1, parameterRef2];

      const response = new Response();
      response.name = 'get-address-response';
      response.status = HttpStatus.PARTIAL_CONTENT;
      response.bodyTypeRef = classType;

      handler.responseRefs = [response];

      generator.addFactoryFunctionForArray(companionObjectKt, spec, pathScope, handler, response);

      expect(companionObjectKt.members.length)
          .toBe(1);

      const functionKt = companionObjectKt.members[0];
      if (!(functionKt instanceof FunctionKt)) {
        fail(`Expected FunctionKt but was ${functionKt.constructor.name}`);
        return;
      }

      expect(functionKt.name)
          .toBe('partialContent');

      const fileKt = new FileKt('com.example.package', 'TestApi');

      expect(serializer.serializeBody(fileKt, functionKt.body))
          .toBe(`
val typedList: Any? = object : ArrayList\<DeliveryAddress>(values) {}

val headers = HttpHeaders()
headers.contentType = MediaType.APPLICATION_JSON_UTF8

return GetDeliveryAddressResponse(
    ResponseEntity(typedList, headers, HttpStatus.PARTIAL_CONTENT))
`);
    });

  });

  describe('addFactoryFunctionForObject()', () => {

    it('should add function', () => {

      const companionObjectKt = new CompanionObjectKt();

      const pathScope = new PathScope();
      pathScope.name = 'delivery-address';

      const handler = new HttpMethodHandler();
      handler.name = 'get-delivery-address';
      handler.method = HttpMethod.GET;

      const pathParameter = new PathParameter();
      pathParameter.name = 'primary-id';
      pathParameter.typeRef = new StringType();

      const parameterRef1 = new PathParameterReference();
      parameterRef1.name = 'address-id';
      parameterRef1.value = pathParameter;

      const classType = new ClassType();
      classType.name = 'delivery-address';

      const parameterRef2 = new BodyParameterReference();
      parameterRef2.name = 'primary-address';
      parameterRef2.typeRef = classType;

      handler.parameters = [parameterRef1, parameterRef2];

      const response = new Response();
      response.name = 'get-address-response';
      response.status = HttpStatus.PARTIAL_CONTENT;
      response.bodyTypeRef = classType;

      handler.responseRefs = [response];

      generator.addFactoryFunctionForObject(companionObjectKt, spec, pathScope, handler, response);

      expect(companionObjectKt.members.length)
          .toBe(1);

      const functionKt = companionObjectKt.members[0];
      if (!(functionKt instanceof FunctionKt)) {
        fail(`Expected FunctionKt but was ${functionKt.constructor.name}`);
        return;
      }

      expect(functionKt.name)
          .toBe('partialContent');

      const fileKt = new FileKt('com.example.package', 'TestApi');

      expect(serializer.serializeBody(fileKt, functionKt.body))
          .toBe(`
val headers = HttpHeaders()
headers.contentType = MediaType.APPLICATION_JSON_UTF8;

return GetDeliveryAddressResponse(
    ResponseEntity\<Any?>(value, headers, HttpStatus.PARTIAL_CONTENT))
`);
    });

  });

  describe('addResponseKotlinClass()', () => {

    it('should support objects', () => {

      const fileKt = new FileKt('testing.ws.api.deliveryaddress', 'GetDeliveryAddressResponse');

      const pathScope = new PathScope();
      pathScope.name = 'delivery-address';

      const handler = new HttpMethodHandler();
      handler.name = 'get-delivery-address';
      handler.method = HttpMethod.GET;

      const pathParameter = new PathParameter();
      pathParameter.name = 'primary-id';
      pathParameter.typeRef = new StringType();

      const parameterRef1 = new PathParameterReference();
      parameterRef1.name = 'address-id';
      parameterRef1.value = pathParameter;

      const classType = new ClassType();
      classType.name = 'delivery-address';

      const parameterRef2 = new BodyParameterReference();
      parameterRef2.name = 'primary-address';
      parameterRef2.typeRef = classType;

      handler.parameters = [parameterRef1, parameterRef2];

      const response = new Response();
      response.name = 'get-address-response';
      response.status = HttpStatus.PARTIAL_CONTENT;
      response.bodyTypeRef = classType;

      handler.responseRefs = [response];

      generator.addResponseKotlinClass(fileKt, spec, pathScope, handler);

      expect(fileKt.members.length)
          .toBe(1);

      const classKt = fileKt.members[0];
      if (!(classKt instanceof ClassKt)) {
        fail(`Expected ClassKt but was ${classKt.constructor.name}`);
        return;
      }

      expect(classKt.name)
          .toBe('GetDeliveryAddressResponse');

      const constructorKt: PrimaryConstructorKt = classKt.primaryConstructor;

      expect(constructorKt.visibility)
          .toBe(VisibilityKt.Private);

      expect(constructorKt.parameters.length)
          .toBe(1);

      const conParam = constructorKt.parameters[0];
      if (!(conParam instanceof ConstructorPropertyKt)) {
        fail(`Expected ConstructorPropertyKt but was ${conParam.constructor.name}`);
        return;
      }

      expect(conParam.visibility)
          .toBe(VisibilityKt.Private);

      expect(conParam.name)
          .toBe('responseEntity');

      expect(conParam.type.className)
          .toBe('org.springframework.http.ResponseEntity');

      expect(conParam.type.genericParameters.length)
          .toBe(1);

      expect(conParam.type.genericParameters[0].className)
          .toBe('kotlin.Any');

      expect(classKt.extendsClasses.length)
          .toBe(1);

      const implementsKt = classKt.extendsClasses[0];
      if (!(implementsKt instanceof ImplementsKt)) {
        fail(`Expected ImplementsKt but was ${implementsKt.constructor.name}`);
        return;
      }

      expect(implementsKt.type.className)
          .toBe('com.gantsign.restrulz.spring.mvc.ResponseEntityConvertible');

      expect(implementsKt.type.genericParameters.length)
          .toBe(1);

      expect(implementsKt.type.genericParameters[0].className)
          .toBe('kotlin.Any');

      expect(classKt.members.length)
          .toBe(1);

      const functionKt = classKt.members[0];
      if (!(functionKt instanceof FunctionKt)) {
        fail(`Expected FunctionKt but was ${functionKt.constructor.name}`);
        return;
      }
      expect(functionKt.name)
          .toBe('toResponseEntity');

      expect(functionKt.overrides)
          .toBeTruthy();

      const returnType = functionKt.returnType;
      expect(returnType.className)
          .toBe('org.springframework.http.ResponseEntity');

      expect(returnType.genericParameters.length)
          .toBe(1);

      expect(returnType.genericParameters[0].className)
          .toBe('kotlin.Any');

      expect(serializer.serializeBody(fileKt, functionKt.body))
          .toBe('return responseEntity\n');

      const companionObjectKt = classKt.companionObject;

      expect(companionObjectKt.members.length)
          .toBe(1);

      const companionFunctionKt = companionObjectKt.members[0];
      if (!(companionFunctionKt instanceof FunctionKt)) {
        fail(`Expected FunctionKt but was ${companionFunctionKt.constructor.name}`);
        return;
      }

      expect(companionFunctionKt.name)
          .toBe('partialContent');

      expect(serializer.serializeBody(fileKt, companionFunctionKt.body))
          .toBe(`
val headers = HttpHeaders()
headers.contentType = MediaType.APPLICATION_JSON_UTF8;

return GetDeliveryAddressResponse(
    ResponseEntity\<Any?>(value, headers, HttpStatus.PARTIAL_CONTENT))
`);

    });

    it('should support arrays', () => {

      const fileKt = new FileKt('testing.ws.api.deliveryaddress', 'GetDeliveryAddressResponse');

      const pathScope = new PathScope();
      pathScope.name = 'delivery-address';

      const handler = new HttpMethodHandler();
      handler.name = 'get-delivery-address';
      handler.method = HttpMethod.GET;

      const pathParameter = new PathParameter();
      pathParameter.name = 'primary-id';
      pathParameter.typeRef = new StringType();

      const parameterRef1 = new PathParameterReference();
      parameterRef1.name = 'address-id';
      parameterRef1.value = pathParameter;

      const classType = new ClassType();
      classType.name = 'delivery-address';

      const parameterRef2 = new BodyParameterReference();
      parameterRef2.name = 'primary-address';
      parameterRef2.typeRef = classType;

      handler.parameters = [parameterRef1, parameterRef2];

      const response = new Response();
      response.name = 'get-address-response';
      response.status = HttpStatus.PARTIAL_CONTENT;
      response.bodyTypeRef = classType;
      response.isArray = true;

      handler.responseRefs = [response];

      generator.addResponseKotlinClass(fileKt, spec, pathScope, handler);

      expect(fileKt.members.length)
          .toBe(1);

      const classKt = fileKt.members[0];
      if (!(classKt instanceof ClassKt)) {
        fail(`Expected ClassKt but was ${classKt.constructor.name}`);
        return;
      }

      expect(classKt.name)
          .toBe('GetDeliveryAddressResponse');

      const constructorKt: PrimaryConstructorKt = classKt.primaryConstructor;

      expect(constructorKt.visibility)
          .toBe(VisibilityKt.Private);

      expect(constructorKt.parameters.length)
          .toBe(1);

      const conParam = constructorKt.parameters[0];
      if (!(conParam instanceof ConstructorPropertyKt)) {
        fail(`Expected ConstructorPropertyKt but was ${conParam.constructor.name}`);
        return;
      }

      expect(conParam.visibility)
          .toBe(VisibilityKt.Private);

      expect(conParam.name)
          .toBe('responseEntity');

      expect(conParam.type.className)
          .toBe('org.springframework.http.ResponseEntity');

      expect(conParam.type.genericParameters.length)
          .toBe(1);

      expect(conParam.type.genericParameters[0].className)
          .toBe('kotlin.Any');

      expect(classKt.extendsClasses.length)
          .toBe(1);

      const implementsKt = classKt.extendsClasses[0];
      if (!(implementsKt instanceof ImplementsKt)) {
        fail(`Expected ImplementsKt but was ${implementsKt.constructor.name}`);
        return;
      }

      expect(implementsKt.type.className)
          .toBe('com.gantsign.restrulz.spring.mvc.ResponseEntityConvertible');

      expect(implementsKt.type.genericParameters.length)
          .toBe(1);

      expect(implementsKt.type.genericParameters[0].className)
          .toBe('kotlin.Any');

      expect(classKt.members.length)
          .toBe(1);

      const functionKt = classKt.members[0];
      if (!(functionKt instanceof FunctionKt)) {
        fail(`Expected FunctionKt but was ${functionKt.constructor.name}`);
        return;
      }
      expect(functionKt.name)
          .toBe('toResponseEntity');

      expect(functionKt.overrides)
          .toBeTruthy();

      const returnType = functionKt.returnType;
      expect(returnType.className)
          .toBe('org.springframework.http.ResponseEntity');

      expect(returnType.genericParameters.length)
          .toBe(1);

      expect(returnType.genericParameters[0].className)
          .toBe('kotlin.Any');

      expect(serializer.serializeBody(fileKt, functionKt.body))
          .toBe('return responseEntity\n');

      const companionObjectKt = classKt.companionObject;

      expect(companionObjectKt.members.length)
          .toBe(1);

      const companionFunctionKt = companionObjectKt.members[0];
      if (!(companionFunctionKt instanceof FunctionKt)) {
        fail(`Expected FunctionKt but was ${companionFunctionKt.constructor.name}`);
        return;
      }

      expect(companionFunctionKt.name)
          .toBe('partialContent');

      expect(serializer.serializeBody(fileKt, companionFunctionKt.body))
          .toBe(`
val typedList: Any? = object : ArrayList\<DeliveryAddress>(values) {}

val headers = HttpHeaders()
headers.contentType = MediaType.APPLICATION_JSON_UTF8

return GetDeliveryAddressResponse(
    ResponseEntity(typedList, headers, HttpStatus.PARTIAL_CONTENT))
`);

    });
  });

  describe('toResponseKotlinFile()', () => {

    it('should create file object', () => {

      const pathScope = new PathScope();
      pathScope.name = 'delivery-address';

      const handler = new HttpMethodHandler();
      handler.name = 'get-delivery-address';
      handler.method = HttpMethod.GET;

      const pathParameter = new PathParameter();
      pathParameter.name = 'primary-id';
      pathParameter.typeRef = new StringType();

      const parameterRef1 = new PathParameterReference();
      parameterRef1.name = 'address-id';
      parameterRef1.value = pathParameter;

      const classType = new ClassType();
      classType.name = 'delivery-address';

      const parameterRef2 = new BodyParameterReference();
      parameterRef2.name = 'primary-address';
      parameterRef2.typeRef = classType;

      handler.parameters = [parameterRef1, parameterRef2];

      const response = new Response();
      response.name = 'get-address-response';
      response.status = HttpStatus.PARTIAL_CONTENT;
      response.bodyTypeRef = classType;

      handler.responseRefs = [response];

      const fileKt = generator.toResponseKotlinFile(spec, pathScope, handler);

      expect(fileKt.packageName)
          .toBe('testing.ws.api.deliveryaddress');

      expect(fileKt.fileName)
          .toBe('GetDeliveryAddressResponse');

      expect(fileKt.members.length)
          .toBe(1);

      const classKt = fileKt.members[0];
      if (!(classKt instanceof ClassKt)) {
        fail(`Expected ClassKt but was ${classKt.constructor.name}`);
        return;
      }

      expect(classKt.name)
          .toBe('GetDeliveryAddressResponse');

      const constructorKt: PrimaryConstructorKt = classKt.primaryConstructor;

      expect(constructorKt.visibility)
          .toBe(VisibilityKt.Private);

      expect(constructorKt.parameters.length)
          .toBe(1);

      const conParam = constructorKt.parameters[0];
      if (!(conParam instanceof ConstructorPropertyKt)) {
        fail(`Expected ConstructorPropertyKt but was ${conParam.constructor.name}`);
        return;
      }

      expect(conParam.visibility)
          .toBe(VisibilityKt.Private);

      expect(conParam.name)
          .toBe('responseEntity');

      expect(conParam.type.className)
          .toBe('org.springframework.http.ResponseEntity');

      expect(conParam.type.genericParameters.length)
          .toBe(1);

      expect(conParam.type.genericParameters[0].className)
          .toBe('kotlin.Any');

      expect(classKt.extendsClasses.length)
          .toBe(1);

      const implementsKt = classKt.extendsClasses[0];
      if (!(implementsKt instanceof ImplementsKt)) {
        fail(`Expected ImplementsKt but was ${implementsKt.constructor.name}`);
        return;
      }

      expect(implementsKt.type.className)
          .toBe('com.gantsign.restrulz.spring.mvc.ResponseEntityConvertible');

      expect(implementsKt.type.genericParameters.length)
          .toBe(1);

      expect(implementsKt.type.genericParameters[0].className)
          .toBe('kotlin.Any');

      expect(classKt.members.length)
          .toBe(1);

      const functionKt = classKt.members[0];
      if (!(functionKt instanceof FunctionKt)) {
        fail(`Expected FunctionKt but was ${functionKt.constructor.name}`);
        return;
      }
      expect(functionKt.name)
          .toBe('toResponseEntity');

      expect(functionKt.overrides)
          .toBeTruthy();

      const returnType = functionKt.returnType;
      expect(returnType.className)
          .toBe('org.springframework.http.ResponseEntity');

      expect(returnType.genericParameters.length)
          .toBe(1);

      expect(returnType.genericParameters[0].className)
          .toBe('kotlin.Any');

      expect(serializer.serializeBody(fileKt, functionKt.body))
          .toBe('return responseEntity\n');

      const companionObjectKt = classKt.companionObject;

      expect(companionObjectKt.members.length)
          .toBe(1);

      const companionFunctionKt = companionObjectKt.members[0];
      if (!(companionFunctionKt instanceof FunctionKt)) {
        fail(`Expected FunctionKt but was ${companionFunctionKt.constructor.name}`);
        return;
      }

      expect(companionFunctionKt.name)
          .toBe('partialContent');

      expect(serializer.serializeBody(fileKt, companionFunctionKt.body))
          .toBe(`
val headers = HttpHeaders()
headers.contentType = MediaType.APPLICATION_JSON_UTF8;

return GetDeliveryAddressResponse(
    ResponseEntity\<Any?>(value, headers, HttpStatus.PARTIAL_CONTENT))
`);

    });
  });

  class MockGeneratorContext implements GeneratorContext {
    outputPaths: string[] = [];
    contents: string[] = [];

    writeJsonToFile(filePath: string, data: any): void {
      throw new Error('Method not implemented.');
    }

    writeYamlToFile(filePath: string, data: any): void {
      throw new Error('Method not implemented.');
    }

    writeStringToFile(filePath: string, data: any): void {
      this.outputPaths.push(filePath);
      this.contents.push(data);
    }
  }

  describe('generateResponseFile()', () => {

    it('should generate file', () => {

      const pathScope = new PathScope();
      pathScope.name = 'delivery-address';

      const handler = new HttpMethodHandler();
      handler.name = 'get-delivery-address';
      handler.method = HttpMethod.GET;

      const pathParameter = new PathParameter();
      pathParameter.name = 'primary-id';
      pathParameter.typeRef = new StringType();

      const parameterRef1 = new PathParameterReference();
      parameterRef1.name = 'address-id';
      parameterRef1.value = pathParameter;

      const classType = new ClassType();
      classType.name = 'delivery-address';

      const parameterRef2 = new BodyParameterReference();
      parameterRef2.name = 'primary-address';
      parameterRef2.typeRef = classType;

      handler.parameters = [parameterRef1, parameterRef2];

      const response = new Response();
      response.name = 'get-address-response';
      response.status = HttpStatus.PARTIAL_CONTENT;
      response.bodyTypeRef = classType;

      handler.responseRefs = [response];

      const context = new MockGeneratorContext();

      generator.generateResponseFile(spec, pathScope, handler, context);

      expect(context.outputPaths.length)
          .toBe(1);

      expect(context.outputPaths[0])
          .toBe('testing/ws/api/deliveryaddress/GetDeliveryAddressResponse.kt');

      expect(context.contents[0])
          .toBe(`\
package testing.ws.api.deliveryaddress

import com.gantsign.restrulz.spring.mvc.ResponseEntityConvertible
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import testing.model.DeliveryAddress

class GetDeliveryAddressResponse private constructor(
        private val responseEntity: ResponseEntity\<Any?>) : ResponseEntityConvertible\<Any?> {

    override fun toResponseEntity(): ResponseEntity\<Any?> {
        return responseEntity
    }

    companion object {

        fun partialContent(value: DeliveryAddress): GetDeliveryAddressResponse {

            val headers = HttpHeaders()
            headers.contentType = MediaType.APPLICATION_JSON_UTF8;

            return GetDeliveryAddressResponse(
                ResponseEntity\<Any?>(value, headers, HttpStatus.PARTIAL_CONTENT))
        }
    }
}
`);
    });
  });

  describe('addControllerApiFunction()', () => {

    it('should support HttpMethodHandler', () => {

      const pathScope = new PathScope();
      pathScope.name = 'delivery-address';

      const handler = new HttpMethodHandler();
      handler.name = 'get-delivery-address';
      handler.method = HttpMethod.GET;

      const pathParameter = new PathParameter();
      pathParameter.name = 'primary-id';
      pathParameter.typeRef = new StringType();

      const parameterRef1 = new PathParameterReference();
      parameterRef1.name = 'address-id';
      parameterRef1.value = pathParameter;

      const classType = new ClassType();
      classType.name = 'delivery-address';

      const parameterRef2 = new BodyParameterReference();
      parameterRef2.name = 'primary-address';
      parameterRef2.typeRef = classType;

      handler.parameters = [parameterRef1, parameterRef2];

      const response = new Response();
      response.name = 'get-address-response';
      response.status = HttpStatus.PARTIAL_CONTENT;
      response.bodyTypeRef = classType;

      handler.responseRefs = [response];

      const context = new MockGeneratorContext();

      const interfaceKt = new InterfaceKt('DeliveryAddressApi');

      generator.addControllerApiFunction(interfaceKt, spec, pathScope, handler, context);

      expect(context.outputPaths.length)
          .toBe(1);

      expect(context.outputPaths[0])
          .toBe('testing/ws/api/deliveryaddress/GetDeliveryAddressResponse.kt');

      expect(context.contents[0])
          .toBe(`\
package testing.ws.api.deliveryaddress

import com.gantsign.restrulz.spring.mvc.ResponseEntityConvertible
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import testing.model.DeliveryAddress

class GetDeliveryAddressResponse private constructor(
        private val responseEntity: ResponseEntity\<Any?>) : ResponseEntityConvertible\<Any?> {

    override fun toResponseEntity(): ResponseEntity\<Any?> {
        return responseEntity
    }

    companion object {

        fun partialContent(value: DeliveryAddress): GetDeliveryAddressResponse {

            val headers = HttpHeaders()
            headers.contentType = MediaType.APPLICATION_JSON_UTF8;

            return GetDeliveryAddressResponse(
                ResponseEntity\<Any?>(value, headers, HttpStatus.PARTIAL_CONTENT))
        }
    }
}
`);

      expect(interfaceKt.members.length).toBe(1);
      const functionKt = interfaceKt.members[0];
      if (!(<any>functionKt instanceof FunctionSignatureKt)) {
        fail(`Expected FunctionSignatureKt but was ${functionKt.constructor.name}`);
        return;
      }

      expect(functionKt.parameters.length).toBe(2);

      const returnType = functionKt.returnType;

      expect(returnType.className)
          .toBe('io.reactivex.Single');

      expect(returnType.genericParameters.length)
          .toBe(1);

      expect(returnType.genericParameters[0].className)
          .toBe('testing.ws.api.deliveryaddress.GetDeliveryAddressResponse');

      const funParam1 = functionKt.parameters[0];

      expect(funParam1.name)
          .toBe('addressId');

      expect(funParam1.annotations.length)
          .toBe(1);

      const paramAnna1 = funParam1.annotations[0];

      expect(paramAnna1.className)
          .toBe('org.springframework.web.bind.annotation.PathVariable');

      expect(paramAnna1.parameters.length)
          .toBe(1);

      const annaParam1 = paramAnna1.parameters[0];
      expect(annaParam1.name)
          .toBe('value');

      const fileKt = new FileKt('com.example.package', 'TestApi');

      expect(annaParam1.valueFactory(fileKt))
          .toBe('"primary-id"');

      const funParam2 = functionKt.parameters[1];

      expect(funParam2.name)
          .toBe('primaryAddress');

      const paramAnna2 = funParam2.annotations[0];

      expect(paramAnna2.className)
          .toBe('org.springframework.web.bind.annotation.RequestBody');

      expect(paramAnna2.parameters.length)
          .toBe(0);

      expect(functionKt.annotations.length)
          .toBe(1);

      const funcAnna = functionKt.annotations[0];

      expect(funcAnna.className)
          .toBe('org.springframework.web.bind.annotation.RequestMapping');

      expect(funcAnna.parameters.length)
          .toBe(1);

      const funcAnnaParam = funcAnna.parameters[0];

      expect(funcAnnaParam.name)
          .toBe('method');

      expect(funcAnnaParam.valueFactory(fileKt))
          .toBe('arrayOf(GET)');

      expect(fileKt.importMapping['kotlin.arrayOf'])
          .toBe('arrayOf');

      expect(fileKt.importMapping['org.springframework.web.bind.annotation.RequestMethod.GET'])
          .toBe('GET');

    });

    it('should throw error for unsupported type', () => {
      class UnsupportedTypeTest {}

      const pathScope = new PathScope();
      pathScope.name = 'delivery-address';

      const unsupportedHandler = new UnsupportedTypeTest();

      const context = new MockGeneratorContext();

      const interfaceKt = new InterfaceKt('DeliveryAddressApi');

      expect(() => generator.addControllerApiFunction(
          interfaceKt,
          spec,
          pathScope,
          <HttpMethodHandler>unsupportedHandler,
          context
      )).toThrowError('Unsupported Mapping type: UnsupportedTypeTest');
    });
  });

  describe('addControllerApiKotlinInterface()', () => {

    it('should add interface', () => {

      const staticPathElement = new StaticPathElement();
      staticPathElement.value = 'delivery-address';

      const pathParameter = new PathParameter();
      pathParameter.name = 'primary-id';
      pathParameter.typeRef = new StringType();

      const pathScope = new PathScope();
      pathScope.name = 'delivery-address';
      pathScope.path = [staticPathElement, pathParameter];

      const handler = new HttpMethodHandler();
      handler.name = 'get-delivery-address';
      handler.method = HttpMethod.GET;

      pathScope.mappings = [handler];

      const parameterRef1 = new PathParameterReference();
      parameterRef1.name = 'address-id';
      parameterRef1.value = pathParameter;

      const classType = new ClassType();
      classType.name = 'delivery-address';

      const parameterRef2 = new BodyParameterReference();
      parameterRef2.name = 'primary-address';
      parameterRef2.typeRef = classType;

      handler.parameters = [parameterRef1, parameterRef2];

      const response = new Response();
      response.name = 'get-address-response';
      response.status = HttpStatus.PARTIAL_CONTENT;
      response.bodyTypeRef = classType;

      handler.responseRefs = [response];

      const context = new MockGeneratorContext();

      const fileKt = new FileKt('testing.ws.api', 'DeliveryAddressApi');

      const fullSpec = new Specification();
      fullSpec.name = 'testing';
      fullSpec.pathScopes = [pathScope];

      generator.addControllerApiKotlinInterface(fileKt, fullSpec, pathScope, context);

      expect(fileKt.members.length)
          .toBe(1);

      const interfaceKt = fileKt.members[0];
      if (!(interfaceKt instanceof InterfaceKt)) {
        fail(`Expected InterfaceKt but was ${interfaceKt.constructor.name}`);
        return;
      }

      expect(interfaceKt.annotations.length)
          .toBe(1);

      expect(interfaceKt.annotations[0].className)
          .toBe('org.springframework.web.bind.annotation.RequestMapping');

      const intAnnParams: AnnotationParameterKt[] = interfaceKt.annotations[0].parameters;

      expect(intAnnParams.length)
          .toBe(1);

      expect(intAnnParams[0].name)
          .toBe('value');

      expect(intAnnParams[0].valueFactory(fileKt))
          .toBe('"/delivery-address/{primary-id}"');

      expect(interfaceKt.name)
          .toBe('DeliveryAddressApi');

      expect(context.outputPaths.length)
          .toBe(1);

      expect(context.outputPaths[0])
          .toBe('testing/ws/api/deliveryaddress/GetDeliveryAddressResponse.kt');

      expect(context.contents[0])
          .toBe(`\
package testing.ws.api.deliveryaddress

import com.gantsign.restrulz.spring.mvc.ResponseEntityConvertible
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import testing.model.DeliveryAddress

class GetDeliveryAddressResponse private constructor(
        private val responseEntity: ResponseEntity\<Any?>) : ResponseEntityConvertible\<Any?> {

    override fun toResponseEntity(): ResponseEntity\<Any?> {
        return responseEntity
    }

    companion object {

        fun partialContent(value: DeliveryAddress): GetDeliveryAddressResponse {

            val headers = HttpHeaders()
            headers.contentType = MediaType.APPLICATION_JSON_UTF8;

            return GetDeliveryAddressResponse(
                ResponseEntity\<Any?>(value, headers, HttpStatus.PARTIAL_CONTENT))
        }
    }
}
`);

      expect(interfaceKt.members.length).toBe(1);
      const functionKt = interfaceKt.members[0];
      if (!(<any>functionKt instanceof FunctionSignatureKt)) {
        fail(`Expected FunctionSignatureKt but was ${functionKt.constructor.name}`);
        return;
      }

      expect(functionKt.parameters.length).toBe(2);

      const returnType = functionKt.returnType;

      expect(returnType.className)
          .toBe('io.reactivex.Single');

      expect(returnType.genericParameters.length)
          .toBe(1);

      expect(returnType.genericParameters[0].className)
          .toBe('testing.ws.api.deliveryaddress.GetDeliveryAddressResponse');

      const funParam1 = functionKt.parameters[0];

      expect(funParam1.name)
          .toBe('addressId');

      expect(funParam1.annotations.length)
          .toBe(1);

      const paramAnna1 = funParam1.annotations[0];

      expect(paramAnna1.className)
          .toBe('org.springframework.web.bind.annotation.PathVariable');

      expect(paramAnna1.parameters.length)
          .toBe(1);

      const annaParam1 = paramAnna1.parameters[0];
      expect(annaParam1.name)
          .toBe('value');

      expect(annaParam1.valueFactory(fileKt))
          .toBe('"primary-id"');

      const funParam2 = functionKt.parameters[1];

      expect(funParam2.name)
          .toBe('primaryAddress');

      const paramAnna2 = funParam2.annotations[0];

      expect(paramAnna2.className)
          .toBe('org.springframework.web.bind.annotation.RequestBody');

      expect(paramAnna2.parameters.length)
          .toBe(0);

      expect(functionKt.annotations.length)
          .toBe(1);

      const funcAnna = functionKt.annotations[0];

      expect(funcAnna.className)
          .toBe('org.springframework.web.bind.annotation.RequestMapping');

      expect(funcAnna.parameters.length)
          .toBe(1);

      const funcAnnaParam = funcAnna.parameters[0];

      expect(funcAnnaParam.name)
          .toBe('method');

      expect(funcAnnaParam.valueFactory(fileKt))
          .toBe('arrayOf(GET)');

      expect(fileKt.importMapping['kotlin.arrayOf'])
          .toBe('arrayOf');

      expect(fileKt.importMapping['org.springframework.web.bind.annotation.RequestMethod.GET'])
          .toBe('GET');

    });

  });

  describe('toControllerApiKotlinFile()', () => {

    it('should create file', () => {

      const staticPathElement = new StaticPathElement();
      staticPathElement.value = 'delivery-address';

      const pathParameter = new PathParameter();
      pathParameter.name = 'primary-id';
      pathParameter.typeRef = new StringType();

      const pathScope = new PathScope();
      pathScope.name = 'delivery-address';
      pathScope.path = [staticPathElement, pathParameter];

      const handler = new HttpMethodHandler();
      handler.name = 'get-delivery-address';
      handler.method = HttpMethod.GET;

      pathScope.mappings = [handler];

      const parameterRef1 = new PathParameterReference();
      parameterRef1.name = 'address-id';
      parameterRef1.value = pathParameter;

      const classType = new ClassType();
      classType.name = 'delivery-address';

      const parameterRef2 = new BodyParameterReference();
      parameterRef2.name = 'primary-address';
      parameterRef2.typeRef = classType;

      handler.parameters = [parameterRef1, parameterRef2];

      const response = new Response();
      response.name = 'get-address-response';
      response.status = HttpStatus.PARTIAL_CONTENT;
      response.bodyTypeRef = classType;

      handler.responseRefs = [response];

      const context = new MockGeneratorContext();

      const fullSpec = new Specification();
      fullSpec.name = 'testing';
      fullSpec.pathScopes = [pathScope];

      const fileKt = generator.toControllerApiKotlinFile(fullSpec, pathScope, context);

      expect(fileKt.packageName)
          .toBe('testing.ws.api');

      expect(fileKt.fileName)
          .toBe('DeliveryAddressApi');

      expect(fileKt.members.length)
          .toBe(1);

      const interfaceKt = fileKt.members[0];
      if (!(interfaceKt instanceof InterfaceKt)) {
        fail(`Expected InterfaceKt but was ${interfaceKt.constructor.name}`);
        return;
      }

      expect(interfaceKt.annotations.length)
          .toBe(1);

      expect(interfaceKt.annotations[0].className)
          .toBe('org.springframework.web.bind.annotation.RequestMapping');

      const intAnnParams: AnnotationParameterKt[] = interfaceKt.annotations[0].parameters;

      expect(intAnnParams.length)
          .toBe(1);

      expect(intAnnParams[0].name)
          .toBe('value');

      expect(intAnnParams[0].valueFactory(fileKt))
          .toBe('"/delivery-address/{primary-id}"');

      expect(interfaceKt.name)
          .toBe('DeliveryAddressApi');

      expect(context.outputPaths.length)
          .toBe(1);

      expect(context.outputPaths[0])
          .toBe('testing/ws/api/deliveryaddress/GetDeliveryAddressResponse.kt');

      expect(context.contents[0])
          .toBe(`\
package testing.ws.api.deliveryaddress

import com.gantsign.restrulz.spring.mvc.ResponseEntityConvertible
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import testing.model.DeliveryAddress

class GetDeliveryAddressResponse private constructor(
        private val responseEntity: ResponseEntity\<Any?>) : ResponseEntityConvertible\<Any?> {

    override fun toResponseEntity(): ResponseEntity\<Any?> {
        return responseEntity
    }

    companion object {

        fun partialContent(value: DeliveryAddress): GetDeliveryAddressResponse {

            val headers = HttpHeaders()
            headers.contentType = MediaType.APPLICATION_JSON_UTF8;

            return GetDeliveryAddressResponse(
                ResponseEntity\<Any?>(value, headers, HttpStatus.PARTIAL_CONTENT))
        }
    }
}
`);

      expect(interfaceKt.members.length).toBe(1);
      const functionKt = interfaceKt.members[0];
      if (!(<any>functionKt instanceof FunctionSignatureKt)) {
        fail(`Expected FunctionSignatureKt but was ${functionKt.constructor.name}`);
        return;
      }

      expect(functionKt.parameters.length).toBe(2);

      const returnType = functionKt.returnType;

      expect(returnType.className)
          .toBe('io.reactivex.Single');

      expect(returnType.genericParameters.length)
          .toBe(1);

      expect(returnType.genericParameters[0].className)
          .toBe('testing.ws.api.deliveryaddress.GetDeliveryAddressResponse');

      const funParam1 = functionKt.parameters[0];

      expect(funParam1.name)
          .toBe('addressId');

      expect(funParam1.annotations.length)
          .toBe(1);

      const paramAnna1 = funParam1.annotations[0];

      expect(paramAnna1.className)
          .toBe('org.springframework.web.bind.annotation.PathVariable');

      expect(paramAnna1.parameters.length)
          .toBe(1);

      const annaParam1 = paramAnna1.parameters[0];
      expect(annaParam1.name)
          .toBe('value');

      expect(annaParam1.valueFactory(fileKt))
          .toBe('"primary-id"');

      const funParam2 = functionKt.parameters[1];

      expect(funParam2.name)
          .toBe('primaryAddress');

      const paramAnna2 = funParam2.annotations[0];

      expect(paramAnna2.className)
          .toBe('org.springframework.web.bind.annotation.RequestBody');

      expect(paramAnna2.parameters.length)
          .toBe(0);

      expect(functionKt.annotations.length)
          .toBe(1);

      const funcAnna = functionKt.annotations[0];

      expect(funcAnna.className)
          .toBe('org.springframework.web.bind.annotation.RequestMapping');

      expect(funcAnna.parameters.length)
          .toBe(1);

      const funcAnnaParam = funcAnna.parameters[0];

      expect(funcAnnaParam.name)
          .toBe('method');

      expect(funcAnnaParam.valueFactory(fileKt))
          .toBe('arrayOf(GET)');

      expect(fileKt.importMapping['kotlin.arrayOf'])
          .toBe('arrayOf');

      expect(fileKt.importMapping['org.springframework.web.bind.annotation.RequestMethod.GET'])
          .toBe('GET');

    });

  });

  describe('generateControllerApiFiles()', () => {

    it('should generate files', () => {

      const staticPathElement = new StaticPathElement();
      staticPathElement.value = 'delivery-address';

      const pathParameter = new PathParameter();
      pathParameter.name = 'primary-id';
      pathParameter.typeRef = new StringType();

      const pathScope = new PathScope();
      pathScope.name = 'delivery-address';
      pathScope.path = [staticPathElement, pathParameter];

      const handler = new HttpMethodHandler();
      handler.name = 'get-delivery-address';
      handler.method = HttpMethod.GET;

      pathScope.mappings = [handler];

      const parameterRef1 = new PathParameterReference();
      parameterRef1.name = 'address-id';
      parameterRef1.value = pathParameter;

      const classType = new ClassType();
      classType.name = 'delivery-address';

      const parameterRef2 = new BodyParameterReference();
      parameterRef2.name = 'primary-address';
      parameterRef2.typeRef = classType;

      handler.parameters = [parameterRef1, parameterRef2];

      const response = new Response();
      response.name = 'get-address-response';
      response.status = HttpStatus.PARTIAL_CONTENT;
      response.bodyTypeRef = classType;

      handler.responseRefs = [response];

      const context = new MockGeneratorContext();

      const fullSpec = new Specification();
      fullSpec.name = 'testing';
      fullSpec.pathScopes = [pathScope];

      generator.generateControllerApiFiles(fullSpec, context);

      expect(context.outputPaths.length)
          .toBe(2);

      expect(context.outputPaths[0])
          .toBe('testing/ws/api/deliveryaddress/GetDeliveryAddressResponse.kt');

      expect(context.contents[0])
          .toBe(`\
package testing.ws.api.deliveryaddress

import com.gantsign.restrulz.spring.mvc.ResponseEntityConvertible
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import testing.model.DeliveryAddress

class GetDeliveryAddressResponse private constructor(
        private val responseEntity: ResponseEntity\<Any?>) : ResponseEntityConvertible\<Any?> {

    override fun toResponseEntity(): ResponseEntity\<Any?> {
        return responseEntity
    }

    companion object {

        fun partialContent(value: DeliveryAddress): GetDeliveryAddressResponse {

            val headers = HttpHeaders()
            headers.contentType = MediaType.APPLICATION_JSON_UTF8;

            return GetDeliveryAddressResponse(
                ResponseEntity\<Any?>(value, headers, HttpStatus.PARTIAL_CONTENT))
        }
    }
}
`);
      expect(context.outputPaths[1])
          .toBe('testing/ws/api/DeliveryAddressApi.kt');

      expect(context.contents[1])
          .toBe(`\
package testing.ws.api

import io.reactivex.Single
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod.GET
import testing.model.DeliveryAddress
import testing.ws.api.deliveryaddress.GetDeliveryAddressResponse

@RequestMapping("/delivery-address/{primary-id}")
interface DeliveryAddressApi {

    @RequestMapping(method = arrayOf(GET))
    fun getDeliveryAddress(
            @PathVariable("primary-id") addressId: String,
            @RequestBody primaryAddress: DeliveryAddress
    ): Single\<GetDeliveryAddressResponse>
}
`);

    });

  });

  describe('generateFiles()', () => {

    it('should generate files', () => {

      const staticPathElement = new StaticPathElement();
      staticPathElement.value = 'delivery-address';

      const pathParameter = new PathParameter();
      pathParameter.name = 'primary-id';
      pathParameter.typeRef = new StringType();

      const pathScope = new PathScope();
      pathScope.name = 'delivery-address';
      pathScope.path = [staticPathElement, pathParameter];

      const handler = new HttpMethodHandler();
      handler.name = 'get-delivery-address';
      handler.method = HttpMethod.GET;

      pathScope.mappings = [handler];

      const parameterRef1 = new PathParameterReference();
      parameterRef1.name = 'address-id';
      parameterRef1.value = pathParameter;

      const classType = new ClassType();
      classType.name = 'delivery-address';

      const parameterRef2 = new BodyParameterReference();
      parameterRef2.name = 'primary-address';
      parameterRef2.typeRef = classType;

      handler.parameters = [parameterRef1, parameterRef2];

      const response = new Response();
      response.name = 'get-address-response';
      response.status = HttpStatus.PARTIAL_CONTENT;
      response.bodyTypeRef = classType;

      handler.responseRefs = [response];

      const context = new MockGeneratorContext();

      const fullSpec = new Specification();
      fullSpec.name = 'testing';
      fullSpec.pathScopes = [pathScope];

      generator.generateFiles(fullSpec, context);

      expect(context.outputPaths.length)
          .toBe(2);

      expect(context.outputPaths[0])
          .toBe('testing/ws/api/deliveryaddress/GetDeliveryAddressResponse.kt');

      expect(context.contents[0])
          .toBe(`\
package testing.ws.api.deliveryaddress

import com.gantsign.restrulz.spring.mvc.ResponseEntityConvertible
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import testing.model.DeliveryAddress

class GetDeliveryAddressResponse private constructor(
        private val responseEntity: ResponseEntity\<Any?>) : ResponseEntityConvertible\<Any?> {

    override fun toResponseEntity(): ResponseEntity\<Any?> {
        return responseEntity
    }

    companion object {

        fun partialContent(value: DeliveryAddress): GetDeliveryAddressResponse {

            val headers = HttpHeaders()
            headers.contentType = MediaType.APPLICATION_JSON_UTF8;

            return GetDeliveryAddressResponse(
                ResponseEntity\<Any?>(value, headers, HttpStatus.PARTIAL_CONTENT))
        }
    }
}
`);
      expect(context.outputPaths[1])
          .toBe('testing/ws/api/DeliveryAddressApi.kt');

      expect(context.contents[1])
          .toBe(`\
package testing.ws.api

import io.reactivex.Single
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod.GET
import testing.model.DeliveryAddress
import testing.ws.api.deliveryaddress.GetDeliveryAddressResponse

@RequestMapping("/delivery-address/{primary-id}")
interface DeliveryAddressApi {

    @RequestMapping(method = arrayOf(GET))
    fun getDeliveryAddress(
            @PathVariable("primary-id") addressId: String,
            @RequestBody primaryAddress: DeliveryAddress
    ): Single\<GetDeliveryAddressResponse>
}
`);

    });

  });

});
