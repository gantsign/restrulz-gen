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
/// <reference path="../../../typings/globals/jasmine/index.d.ts" />
import {
  BodyParameterReference,
  ClassType,
  HandlerParameter,
  HttpMethod,
  HttpMethodHandler,
  HttpStatus,
  PathParameter,
  PathParameterReference,
  Response,
  RootPathScope,
  Specification,
  StaticPathElement,
  StringType,
  SubPathScope
} from '../../../src/restrulz/model';
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
} from '../../../src/kotlin/lang';
import {GeneratorContext} from '../../../src/generator';
import {KotlinSerializer} from '../../../src/kotlin/serializer';
import {KotlinSpringMvcGenerator} from '../../../src/kotlin/jvm/spring-mvc-generator';

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
    const pathScope = new RootPathScope();
    pathScope.name = 'delivery-address';

    it('should convert kebab case to capitalized camel case', () => {
      expect(generator.getControllerApiClassName(pathScope))
          .toBe('DeliveryAddressApi');
    });
  });

  describe('getQualifiedApiClass()', () => {
    const pathScope = new RootPathScope();
    pathScope.name = 'delivery-address';

    it('should derive default package name from specification', () => {

      expect(generator.getQualifiedApiClass(spec, pathScope))
          .toBe('testing.ws.api.DeliveryAddressApi');
    });

    it('should support default package name mapping', () => {
      const generatorWithMapping = new KotlinSpringMvcGenerator();
      generatorWithMapping.packageMapping['testing'] = 'com.example';

      expect(generatorWithMapping.getQualifiedApiClass(spec, pathScope))
          .toBe('com.example.ws.api.DeliveryAddressApi');
    });

    it('should support package name mapping', () => {
      const generatorWithMapping = new KotlinSpringMvcGenerator();
      generatorWithMapping.packageMapping['testing.ws.api'] = 'com.example.mvc';

      expect(generatorWithMapping.getQualifiedApiClass(spec, pathScope))
          .toBe('com.example.mvc.DeliveryAddressApi');
    });
  });

  describe('getControllerPackageName()', () => {

    it('should derive default package name from specification', () => {

      expect(generator.getControllerPackageName(spec))
          .toBe('testing.ws.controller');
    });

    it('should support default package name mapping', () => {
      const generatorWithMapping = new KotlinSpringMvcGenerator();
      generatorWithMapping.packageMapping['testing'] = 'com.example';

      expect(generatorWithMapping.getControllerPackageName(spec))
          .toBe('com.example.ws.controller');
    });

    it('should support package name mapping', () => {
      const generatorWithMapping = new KotlinSpringMvcGenerator();
      generatorWithMapping.packageMapping['testing.ws.controller'] = 'com.example.mvc';

      expect(generatorWithMapping.getControllerPackageName(spec))
          .toBe('com.example.mvc');
    });
  });

  describe('getControllerClassName()', () => {
    const pathScope = new RootPathScope();
    pathScope.name = 'delivery-address';

    it('should convert kebab case to capitalized camel case', () => {
      expect(generator.getControllerClassName(pathScope))
          .toBe('DeliveryAddressController');
    });
  });

  describe('getResponsePackageName()', () => {
    const pathScope = new RootPathScope();
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
    const pathScope = new RootPathScope();
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

  describe('getSpringHttpMethodAnnotation()', () => {

    it('should support GET', () => {
      const handler = new HttpMethodHandler();
      handler.method = HttpMethod.GET;

      expect(generator.getSpringHttpMethodAnnotation(handler))
          .toBe('org.springframework.web.bind.annotation.GetMapping');
    });

    it('should support PUT', () => {
      const handler = new HttpMethodHandler();
      handler.method = HttpMethod.PUT;

      expect(generator.getSpringHttpMethodAnnotation(handler))
          .toBe('org.springframework.web.bind.annotation.PutMapping');
    });

    it('should support POST', () => {
      const handler = new HttpMethodHandler();
      handler.method = HttpMethod.POST;

      expect(generator.getSpringHttpMethodAnnotation(handler))
          .toBe('org.springframework.web.bind.annotation.PostMapping');
    });

    it('should support DELETE', () => {
      const handler = new HttpMethodHandler();
      handler.method = HttpMethod.DELETE;

      expect(generator.getSpringHttpMethodAnnotation(handler))
          .toBe('org.springframework.web.bind.annotation.DeleteMapping');
    });

    it('should throw error for unsupported method', () => {
      const handler = new HttpMethodHandler();
      handler.method = -1;

      expect(() => generator.getSpringHttpMethodAnnotation(handler))
          .toThrowError('Unsupported HTTP method: -1');
    });
  });

  describe('addFunctionSignaturePathParameter()', () => {

    it('should support path parameters', () => {

      const functionKt = new FunctionSignatureKt('test1');

      const pathParameter = new PathParameter();
      pathParameter.name = 'primary-id';
      pathParameter.typeRef = new StringType();

      const parameterRef = new PathParameterReference();
      parameterRef.name = 'address-id';
      parameterRef.value = pathParameter;

      generator.addFunctionSignaturePathParameter(functionKt, spec, parameterRef);

      expect(functionKt.parameters.length).toBe(1);

      const parameterKt = functionKt.parameters[0];

      expect(parameterKt.name)
          .toBe('addressId');

      expect(parameterKt.type.className)
          .toBe('kotlin.String');

      expect(parameterKt.annotations.length).toBe(0);
    });

  });

  describe('addFunctionSignatureBodyParameter()', () => {

    it('should support body parameters', () => {

      const functionKt = new FunctionSignatureKt('test1');

      const classType = new ClassType();
      classType.name = 'delivery-address';

      const parameterRef = new BodyParameterReference();
      parameterRef.name = 'primary-address';
      parameterRef.typeRef = classType;

      generator.addFunctionSignatureBodyParameter(functionKt, spec, parameterRef);

      expect(functionKt.parameters.length).toBe(1);

      const parameterKt = functionKt.parameters[0];

      expect(parameterKt.name)
          .toBe('primaryAddress');

      expect(parameterKt.type.className)
          .toBe('testing.model.DeliveryAddress');

      expect(parameterKt.annotations.length).toBe(0);
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

      expect(parameterKt.annotations.length).toBe(0);
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

      expect(parameterKt.annotations.length).toBe(0);
    });

    it('should throw error for unsupported type', () => {

      const functionKt = new FunctionSignatureKt('test1');

      class UnsupportedTypeTest {}
      const unsupportedType = <HandlerParameter>new UnsupportedTypeTest();

      expect(() => generator.addFunctionSignatureParameter(functionKt, spec, unsupportedType))
          .toThrowError('Unsupported HandlerParameter type: UnsupportedTypeTest');
    });
  });

  describe('addFunctionPathParameter()', () => {

    it('should support path parameters', () => {

      const functionKt = new FunctionSignatureKt('test1');

      const pathParameter = new PathParameter();
      pathParameter.name = 'primary-id';
      pathParameter.typeRef = new StringType();

      const parameterRef = new PathParameterReference();
      parameterRef.name = 'address-id';
      parameterRef.value = pathParameter;

      generator.addFunctionPathParameter(functionKt, spec, parameterRef);

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

  describe('addFunctionBodyParameter()', () => {

    it('should support body parameters', () => {

      const functionKt = new FunctionSignatureKt('test1');

      const classType = new ClassType();
      classType.name = 'delivery-address';

      const parameterRef = new BodyParameterReference();
      parameterRef.name = 'primary-address';
      parameterRef.typeRef = classType;

      generator.addFunctionBodyParameter(functionKt, spec, parameterRef);

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

  describe('addFunctionParameter()', () => {

    it('should support path parameters', () => {

      const functionKt = new FunctionSignatureKt('test1');

      const pathParameter = new PathParameter();
      pathParameter.name = 'primary-id';
      pathParameter.typeRef = new StringType();

      const parameterRef = new PathParameterReference();
      parameterRef.name = 'address-id';
      parameterRef.value = pathParameter;

      generator.addFunctionParameter(functionKt, spec, parameterRef);

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

      generator.addFunctionParameter(functionKt, spec, parameterRef);

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

      expect(() => generator.addFunctionParameter(functionKt, spec, unsupportedType))
          .toThrowError('Unsupported HandlerParameter type: UnsupportedTypeTest');
    });
  });

  describe('addControllerApiHttpMethodHandlerFunction()', () => {

    it('should add function', () => {

      const interfaceKt = new InterfaceKt('TestApi');

      const pathScope = new RootPathScope();
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

      generator.addControllerApiHttpMethodHandlerFunction(
          interfaceKt, spec, '', pathScope, handler);

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
          .toBe(0);

      const funParam2 = functionKt.parameters[1];

      expect(funParam2.name)
          .toBe('primaryAddress');

      expect(funParam2.annotations.length)
          .toBe(0);

      expect(functionKt.annotations.length)
          .toBe(0);
    });
  });

  describe('addControllerHttpMethodHandlerFunction()', () => {

    it('should add function', () => {

      const classKt = new ClassKt('TestApi');

      const pathScope = new RootPathScope();
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

      generator.addControllerHttpMethodHandlerFunction(
          classKt, spec, '', pathScope, handler);

      expect(classKt.members.length).toBe(1);
      const functionKt = classKt.members[0];
      if (!(functionKt instanceof FunctionKt)) {
        fail(`Expected FunctionKt but was ${functionKt.constructor.name}`);
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
          .toBe('org.springframework.web.bind.annotation.GetMapping');

      expect(funcAnna.parameters.length)
          .toBe(0);

      expect(serializer.serializeBody(fileKt, functionKt.body))
          .toBe(`
impl.getDeliveryAddress(
        addressId,
        primaryAddress)
`);
    });

    it('should add path to annotation', () => {

      const classKt = new ClassKt('TestApi');

      const pathScope = new RootPathScope();
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

      generator.addControllerHttpMethodHandlerFunction(
          classKt, spec, '/test1', pathScope, handler);

      expect(classKt.members.length).toBe(1);
      const functionKt = classKt.members[0];
      if (!(functionKt instanceof FunctionKt)) {
        fail(`Expected FunctionKt but was ${functionKt.constructor.name}`);
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
          .toBe('org.springframework.web.bind.annotation.GetMapping');

      expect(funcAnna.parameters.length)
          .toBe(1);

      const funcAnnaParam1 = funcAnna.parameters[0];

      expect(funcAnnaParam1.name)
          .toBe('value');

      expect(funcAnnaParam1.valueFactory(fileKt))
          .toBe('"/test1"');

      expect(serializer.serializeBody(fileKt, functionKt.body))
          .toBe(`
impl.getDeliveryAddress(
        addressId,
        primaryAddress)
`);

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

    it('should support INTERNAL_SERVER_ERROR', () => {
      expect(generator.toFactoryFunctionName(HttpStatus.INTERNAL_SERVER_ERROR))
          .toBe('internalServerError');
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

    it('should support NO_CONTENT', () => {
      expect(generator.toSpringHttpStatusValue(HttpStatus.NO_CONTENT))
          .toBe('NO_CONTENT');
    });

    it('should support PARTIAL_CONTENT', () => {
      expect(generator.toSpringHttpStatusValue(HttpStatus.PARTIAL_CONTENT))
          .toBe('PARTIAL_CONTENT');
    });

    it('should support MOVED_PERMANENTLY', () => {
      expect(generator.toSpringHttpStatusValue(HttpStatus.MOVED_PERMANENTLY))
          .toBe('MOVED_PERMANENTLY');
    });

    it('should support SEE_OTHER', () => {
      expect(generator.toSpringHttpStatusValue(HttpStatus.SEE_OTHER))
          .toBe('SEE_OTHER');
    });

    it('should support NOT_MODIFIED', () => {
      expect(generator.toSpringHttpStatusValue(HttpStatus.NOT_MODIFIED))
          .toBe('NOT_MODIFIED');
    });

    it('should support TEMPORARY_REDIRECT', () => {
      expect(generator.toSpringHttpStatusValue(HttpStatus.TEMPORARY_REDIRECT))
          .toBe('TEMPORARY_REDIRECT');
    });

    it('should support PERMANENT_REDIRECT', () => {
      expect(generator.toSpringHttpStatusValue(HttpStatus.PERMANENT_REDIRECT))
          .toBe('PERMANENT_REDIRECT');
    });

    it('should support BAD_REQUEST', () => {
      expect(generator.toSpringHttpStatusValue(HttpStatus.BAD_REQUEST))
          .toBe('BAD_REQUEST');
    });

    it('should support UNAUTHORIZED', () => {
      expect(generator.toSpringHttpStatusValue(HttpStatus.UNAUTHORIZED))
          .toBe('UNAUTHORIZED');
    });

    it('should support FORBIDDEN', () => {
      expect(generator.toSpringHttpStatusValue(HttpStatus.FORBIDDEN))
          .toBe('FORBIDDEN');
    });

    it('should support NOT_FOUND', () => {
      expect(generator.toSpringHttpStatusValue(HttpStatus.NOT_FOUND))
          .toBe('NOT_FOUND');
    });

    it('should support NOT_ACCEPTABLE', () => {
      expect(generator.toSpringHttpStatusValue(HttpStatus.NOT_ACCEPTABLE))
          .toBe('NOT_ACCEPTABLE');
    });

    it('should support CONFLICT', () => {
      expect(generator.toSpringHttpStatusValue(HttpStatus.CONFLICT))
          .toBe('CONFLICT');
    });

    it('should support GONE', () => {
      expect(generator.toSpringHttpStatusValue(HttpStatus.GONE))
          .toBe('GONE');
    });

    it('should support TOO_MANY_REQUESTS', () => {
      expect(generator.toSpringHttpStatusValue(HttpStatus.TOO_MANY_REQUESTS))
          .toBe('TOO_MANY_REQUESTS');
    });

    it('should support INTERNAL_SERVER_ERROR', () => {
      expect(generator.toSpringHttpStatusValue(HttpStatus.INTERNAL_SERVER_ERROR))
          .toBe('INTERNAL_SERVER_ERROR');
    });

    it('should support NOT_IMPLEMENTED', () => {
      expect(generator.toSpringHttpStatusValue(HttpStatus.NOT_IMPLEMENTED))
          .toBe('NOT_IMPLEMENTED');
    });

    it('should support BAD_GATEWAY', () => {
      expect(generator.toSpringHttpStatusValue(HttpStatus.BAD_GATEWAY))
          .toBe('BAD_GATEWAY');
    });

    it('should support SERVICE_UNAVAILABLE', () => {
      expect(generator.toSpringHttpStatusValue(HttpStatus.SERVICE_UNAVAILABLE))
          .toBe('SERVICE_UNAVAILABLE');
    });

    it('should support GATEWAY_TIME_OUT', () => {
      expect(generator.toSpringHttpStatusValue(HttpStatus.GATEWAY_TIME_OUT))
          .toBe('GATEWAY_TIME_OUT');
    });

    it('should throw error for unsupported status', () => {
      expect(() => generator.toSpringHttpStatusValue(-1))
          .toThrowError('Unexpected HTTP status: -1');
    });

  });

  describe('addFactoryFunctionForArray()', () => {

    it('should add function', () => {

      const companionObjectKt = new CompanionObjectKt();

      const pathScope = new RootPathScope();
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

      const pathScope = new RootPathScope();
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

      const pathScope = new RootPathScope();
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

      const pathScope = new RootPathScope();
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

      const pathScope = new RootPathScope();
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

      const pathScope = new RootPathScope();
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

      const pathScope = new RootPathScope();
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

      generator.addControllerApiFunction(interfaceKt, spec, '', pathScope, handler, context);

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
          .toBe(0);

      const funParam2 = functionKt.parameters[1];

      expect(funParam2.name)
          .toBe('primaryAddress');

      expect(funParam2.annotations.length)
          .toBe(0);

      expect(functionKt.annotations.length)
          .toBe(0);
    });

    it('should support sub path scope', () => {

      const pathScope = new RootPathScope();
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

      const subPathScope = new SubPathScope();
      const staticPathElement = new StaticPathElement();
      staticPathElement.value = 'test1';
      subPathScope.path = [staticPathElement];
      subPathScope.mappings = [handler];

      const context = new MockGeneratorContext();

      const interfaceKt = new InterfaceKt('DeliveryAddressApi');

      generator.addControllerApiFunction(interfaceKt, spec, '', pathScope, subPathScope, context);

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
          .toBe(0);

      const funParam2 = functionKt.parameters[1];

      expect(funParam2.annotations.length)
          .toBe(0);

      expect(functionKt.annotations.length)
          .toBe(0);
    });

    it('should throw error for unsupported type', () => {
      class UnsupportedTypeTest {}

      const pathScope = new RootPathScope();
      pathScope.name = 'delivery-address';

      const unsupportedHandler = new UnsupportedTypeTest();

      const context = new MockGeneratorContext();

      const interfaceKt = new InterfaceKt('DeliveryAddressApi');

      expect(() => generator.addControllerApiFunction(
          interfaceKt,
          spec,
          '',
          pathScope,
          <HttpMethodHandler>unsupportedHandler,
          context
      )).toThrowError('Unsupported Mapping type: UnsupportedTypeTest');
    });
  });

  describe('addControllerFunction()', () => {

    it('should support HttpMethodHandler', () => {

      const pathScope = new RootPathScope();
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

      const classKt = new ClassKt('DeliveryAddressController');

      generator.addControllerFunction(classKt, spec, '', pathScope, handler);

      expect(classKt.members.length).toBe(1);
      const functionKt = classKt.members[0];
      if (!(functionKt instanceof FunctionKt)) {
        fail(`Expected FunctionKt but was ${functionKt.constructor.name}`);
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
          .toBe('org.springframework.web.bind.annotation.GetMapping');

      expect(funcAnna.parameters.length)
          .toBe(0);

      expect(serializer.serializeBody(fileKt, functionKt.body))
          .toBe(`
impl.getDeliveryAddress(
        addressId,
        primaryAddress)
`);
    });

    it('should support sub path scope', () => {

      const pathScope = new RootPathScope();
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

      const subPathScope = new SubPathScope();
      const staticPathElement = new StaticPathElement();
      staticPathElement.value = 'test1';
      subPathScope.path = [staticPathElement];
      subPathScope.mappings = [handler];

      const classKt = new ClassKt('DeliveryAddressController');

      generator.addControllerFunction(classKt, spec, '', pathScope, subPathScope);

      expect(classKt.members.length).toBe(1);
      const functionKt = classKt.members[0];
      if (!(functionKt instanceof FunctionKt)) {
        fail(`Expected FunctionKt but was ${functionKt.constructor.name}`);
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
          .toBe('org.springframework.web.bind.annotation.GetMapping');

      expect(funcAnna.parameters.length)
          .toBe(1);

      const funcAnnaParam1 = funcAnna.parameters[0];

      expect(funcAnnaParam1.name)
          .toBe('value');

      expect(funcAnnaParam1.valueFactory(fileKt))
          .toBe('"/test1"');

      expect(serializer.serializeBody(fileKt, functionKt.body))
          .toBe(`
impl.getDeliveryAddress(
        addressId,
        primaryAddress)
`);
    });

    it('should throw error for unsupported type', () => {
      class UnsupportedTypeTest {}

      const pathScope = new RootPathScope();
      pathScope.name = 'delivery-address';

      const unsupportedHandler = new UnsupportedTypeTest();

      const classKt = new ClassKt('DeliveryAddressController');

      expect(() => generator.addControllerFunction(
          classKt,
          spec,
          '',
          pathScope,
          <HttpMethodHandler>unsupportedHandler
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

      const pathScope = new RootPathScope();
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
          .toBe(0);

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
          .toBe(0);

      const funParam2 = functionKt.parameters[1];

      expect(funParam2.name)
          .toBe('primaryAddress');

      expect(funParam2.annotations.length)
          .toBe(0);

      expect(functionKt.annotations.length)
          .toBe(0);
    });
  });

  describe('addControllerKotlinClass()', () => {

    it('should add interface', () => {

      const staticPathElement = new StaticPathElement();
      staticPathElement.value = 'delivery-address';

      const pathParameter = new PathParameter();
      pathParameter.name = 'primary-id';
      pathParameter.typeRef = new StringType();

      const pathScope = new RootPathScope();
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

      const fileKt = new FileKt('testing.ws.api', 'DeliveryAddressApi');

      const fullSpec = new Specification();
      fullSpec.name = 'testing';
      fullSpec.pathScopes = [pathScope];

      generator.addControllerKotlinClass(fileKt, fullSpec, pathScope);

      expect(fileKt.members.length)
          .toBe(1);

      const classKt = fileKt.members[0];
      if (!(classKt instanceof ClassKt)) {
        fail(`Expected ClassKt but was ${classKt.constructor.name}`);
        return;
      }

      expect(classKt.annotations.length)
          .toBe(2);

      const classAnna1 = classKt.annotations[0];

      expect(classAnna1.className)
          .toBe('org.springframework.web.bind.annotation.RestController');

      const classAnna2 = classKt.annotations[1];

      expect(classAnna2.className)
          .toBe('org.springframework.web.bind.annotation.RequestMapping');

      const intAnnParams: AnnotationParameterKt[] = classAnna2.parameters;

      expect(intAnnParams.length)
          .toBe(1);

      expect(intAnnParams[0].name)
          .toBe('value');

      expect(intAnnParams[0].valueFactory(fileKt))
          .toBe('"/delivery-address/{primary-id}"');

      expect(classKt.name)
          .toBe('DeliveryAddressController');

      expect(classKt.members.length).toBe(1);
      const functionKt = classKt.members[0];
      if (!(functionKt instanceof FunctionKt)) {
        fail(`Expected FunctionKt but was ${functionKt.constructor.name}`);
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
          .toBe('org.springframework.web.bind.annotation.GetMapping');

      expect(funcAnna.parameters.length)
          .toBe(0);

      expect(serializer.serializeBody(fileKt, functionKt.body))
          .toBe(`
impl.getDeliveryAddress(
        addressId,
        primaryAddress)
`);
    });

    it('should support empty path', () => {

      const pathScope = new RootPathScope();
      pathScope.name = 'delivery-address';
      pathScope.path = [];

      const handler = new HttpMethodHandler();
      handler.name = 'get-delivery-address';
      handler.method = HttpMethod.GET;

      pathScope.mappings = [handler];

      const classType = new ClassType();
      classType.name = 'delivery-address';

      const parameterRef2 = new BodyParameterReference();
      parameterRef2.name = 'primary-address';
      parameterRef2.typeRef = classType;

      handler.parameters = [parameterRef2];

      const response = new Response();
      response.name = 'get-address-response';
      response.status = HttpStatus.PARTIAL_CONTENT;
      response.bodyTypeRef = classType;

      handler.responseRefs = [response];

      const fileKt = new FileKt('testing.ws.api', 'DeliveryAddressApi');

      const fullSpec = new Specification();
      fullSpec.name = 'testing';
      fullSpec.pathScopes = [pathScope];

      generator.addControllerKotlinClass(fileKt, fullSpec, pathScope);

      expect(fileKt.members.length)
          .toBe(1);

      const classKt = fileKt.members[0];
      if (!(classKt instanceof ClassKt)) {
        fail(`Expected ClassKt but was ${classKt.constructor.name}`);
        return;
      }

      expect(classKt.annotations.length)
          .toBe(1);

      const classAnna1 = classKt.annotations[0];

      expect(classAnna1.className)
          .toBe('org.springframework.web.bind.annotation.RestController');

      expect(classKt.name)
          .toBe('DeliveryAddressController');

      expect(classKt.members.length).toBe(1);
      const functionKt = classKt.members[0];
      if (!(functionKt instanceof FunctionKt)) {
        fail(`Expected FunctionKt but was ${functionKt.constructor.name}`);
        return;
      }

      expect(functionKt.parameters.length).toBe(1);

      const returnType = functionKt.returnType;

      expect(returnType.className)
          .toBe('io.reactivex.Single');

      expect(returnType.genericParameters.length)
          .toBe(1);

      expect(returnType.genericParameters[0].className)
          .toBe('testing.ws.api.deliveryaddress.GetDeliveryAddressResponse');

      const funParam1 = functionKt.parameters[0];

      expect(funParam1.name)
          .toBe('primaryAddress');

      const paramAnna2 = funParam1.annotations[0];

      expect(paramAnna2.className)
          .toBe('org.springframework.web.bind.annotation.RequestBody');

      expect(paramAnna2.parameters.length)
          .toBe(0);

      expect(functionKt.annotations.length)
          .toBe(1);

      const funcAnna = functionKt.annotations[0];

      expect(funcAnna.className)
          .toBe('org.springframework.web.bind.annotation.GetMapping');

      expect(funcAnna.parameters.length)
          .toBe(0);

      expect(serializer.serializeBody(fileKt, functionKt.body))
          .toBe('\nimpl.getDeliveryAddress(primaryAddress)\n');
    });
  });

  describe('toControllerApiKotlinFile()', () => {

    it('should create file', () => {

      const staticPathElement = new StaticPathElement();
      staticPathElement.value = 'delivery-address';

      const pathParameter = new PathParameter();
      pathParameter.name = 'primary-id';
      pathParameter.typeRef = new StringType();

      const pathScope = new RootPathScope();
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
          .toBe(0);

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
          .toBe(0);

      const funParam2 = functionKt.parameters[1];

      expect(funParam2.name)
          .toBe('primaryAddress');

      expect(funParam2.annotations.length)
          .toBe(0);

      expect(functionKt.annotations.length)
          .toBe(0);
    });

  });




  describe('toControllerKotlinFile()', () => {

    it('should create file', () => {

      const staticPathElement = new StaticPathElement();
      staticPathElement.value = 'delivery-address';

      const pathParameter = new PathParameter();
      pathParameter.name = 'primary-id';
      pathParameter.typeRef = new StringType();

      const pathScope = new RootPathScope();
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

      const fullSpec = new Specification();
      fullSpec.name = 'testing';
      fullSpec.pathScopes = [pathScope];

      const fileKt = generator.toControllerKotlinFile(fullSpec, pathScope);

      expect(fileKt.packageName)
          .toBe('testing.ws.controller');

      expect(fileKt.fileName)
          .toBe('DeliveryAddressController');

      expect(fileKt.members.length)
          .toBe(1);

      const classKt = fileKt.members[0];
      if (!(classKt instanceof ClassKt)) {
        fail(`Expected ClassKt but was ${classKt.constructor.name}`);
        return;
      }

      expect(classKt.annotations.length)
          .toBe(2);

      const classAnna1 = classKt.annotations[0];

      expect(classAnna1.className)
          .toBe('org.springframework.web.bind.annotation.RestController');

      const classAnna2 = classKt.annotations[1];

      expect(classAnna2.className)
          .toBe('org.springframework.web.bind.annotation.RequestMapping');

      const intAnnParams: AnnotationParameterKt[] = classAnna2.parameters;

      expect(intAnnParams.length)
          .toBe(1);

      expect(intAnnParams[0].name)
          .toBe('value');

      expect(intAnnParams[0].valueFactory(fileKt))
          .toBe('"/delivery-address/{primary-id}"');

      expect(classKt.name)
          .toBe('DeliveryAddressController');

      expect(classKt.members.length).toBe(1);
      const functionKt = classKt.members[0];
      if (!(functionKt instanceof FunctionKt)) {
        fail(`Expected FunctionKt but was ${functionKt.constructor.name}`);
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
          .toBe('org.springframework.web.bind.annotation.GetMapping');

      expect(funcAnna.parameters.length)
          .toBe(0);
    });

  });

  describe('generateControllerApiFiles()', () => {

    it('should generate files', () => {

      const staticPathElement = new StaticPathElement();
      staticPathElement.value = 'delivery-address';

      const pathParameter = new PathParameter();
      pathParameter.name = 'primary-id';
      pathParameter.typeRef = new StringType();

      const pathScope = new RootPathScope();
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
import testing.model.DeliveryAddress
import testing.ws.api.deliveryaddress.GetDeliveryAddressResponse

interface DeliveryAddressApi {

    fun getDeliveryAddress(
            addressId: String,
            primaryAddress: DeliveryAddress): Single\<GetDeliveryAddressResponse>
}
`);

    });

  });

  describe('generateControllerFiles()', () => {

    it('should generate files', () => {

      const staticPathElement = new StaticPathElement();
      staticPathElement.value = 'delivery-address';

      const pathParameter = new PathParameter();
      pathParameter.name = 'primary-id';
      pathParameter.typeRef = new StringType();

      const pathScope = new RootPathScope();
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

      generator.generateControllerFiles(fullSpec, context);

      expect(context.outputPaths.length)
          .toBe(1);

      expect(context.outputPaths[0])
          .toBe('testing/ws/controller/DeliveryAddressController.kt');

      expect(context.contents[0])
          .toBe(`\
package testing.ws.controller

import io.reactivex.Single
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import testing.model.DeliveryAddress
import testing.ws.api.DeliveryAddressApi
import testing.ws.api.deliveryaddress.GetDeliveryAddressResponse

@RestController
@RequestMapping("/delivery-address/{primary-id}")
class DeliveryAddressController(private val impl: DeliveryAddressApi) {

    @GetMapping
    fun getDeliveryAddress(
            @PathVariable("primary-id") addressId: String,
            @RequestBody primaryAddress: DeliveryAddress
    ): Single\<GetDeliveryAddressResponse> {

        impl.getDeliveryAddress(
                addressId,
                primaryAddress)
    }
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

      const pathScope = new RootPathScope();
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
          .toBe(3);

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
import testing.model.DeliveryAddress
import testing.ws.api.deliveryaddress.GetDeliveryAddressResponse

interface DeliveryAddressApi {

    fun getDeliveryAddress(
            addressId: String,
            primaryAddress: DeliveryAddress): Single\<GetDeliveryAddressResponse>
}
`);

      expect(context.outputPaths[2])
          .toBe('testing/ws/controller/DeliveryAddressController.kt');

      expect(context.contents[2])
          .toBe(`\
package testing.ws.controller

import io.reactivex.Single
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import testing.model.DeliveryAddress
import testing.ws.api.DeliveryAddressApi
import testing.ws.api.deliveryaddress.GetDeliveryAddressResponse

@RestController
@RequestMapping("/delivery-address/{primary-id}")
class DeliveryAddressController(private val impl: DeliveryAddressApi) {

    @GetMapping
    fun getDeliveryAddress(
            @PathVariable("primary-id") addressId: String,
            @RequestBody primaryAddress: DeliveryAddress
    ): Single\<GetDeliveryAddressResponse> {

        impl.getDeliveryAddress(
                addressId,
                primaryAddress)
    }
}
`);

    });

  });

});
