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
/// <reference path="../../typings/globals/jasmine/index.d.ts" />
import {
  BodyParameterReference,
  ClassType,
  getHttpMethod,
  HttpMethod,
  HttpMethodHandler,
  IntegerType,
  parseSpecification,
  PathParameter,
  PathParameterReference,
  PathScope,
  StringType,
  StaticPathElement
} from '../../src/restrulz/model';

const spec = parseSpecification('spec/data/schema.json');

const {name: specName, title, description, version, simpleTypes, classTypes, responses, pathScopes} = spec;

describe('restrulz specification', () => {

  describe('getHttpMethod', () => {
    it('should support GET', () => {
      expect(getHttpMethod('GET')).toEqual(HttpMethod.GET);
    });

    it('should support PUT', () => {
      expect(getHttpMethod('PUT')).toEqual(HttpMethod.PUT);
    });

    it('should support POST', () => {
      expect(getHttpMethod('POST')).toEqual(HttpMethod.POST);
    });

    it('should support DELETE', () => {
      expect(getHttpMethod('DELETE')).toEqual(HttpMethod.DELETE);
    });

    it('should throw an error for unsupported statuses', () => {
      expect(() => getHttpMethod('FAIL')).toThrowError()
    });
  });

  describe('getSimpleType', () => {
    it('should support string-types', () => {
      const type = spec.getSimpleType('uuid');
      expect(type).toBeDefined();
      if (!(type instanceof StringType)) {
        fail(`Unexpected class: ${typeof type}`);
        return;
      }
      const {name} = type;
      expect(name).toEqual('uuid');
    });

    it('should support integer-types', () => {
      const type = spec.getSimpleType('age');
      expect(type).toBeDefined();
      if (!(type instanceof IntegerType)) {
        fail(`Unexpected class: ${typeof type}`);
        return;
      }
      const {name} = type;
      expect(name).toEqual('age');
    });

    it('should throw an error for class-types', () => {
      expect(() => spec.getSimpleType('person')).toThrowError()
    });

    it('should throw an error for undefined types', () => {
      expect(() => spec.getSimpleType('ridiculous')).toThrowError()
    });
  });

  describe('getClassType', () => {
    it('should throw an error for simple-types', () => {
      expect(() => spec.getClassType('uuid')).toThrowError()
    });

    it('should support class-types', () => {
      const type = spec.getClassType('person');
      expect(type).toBeDefined();
      if (!(type instanceof ClassType)) {
        fail(`Unexpected class: ${typeof type}`);
        return;
      }
      const {name} = type;
      expect(name).toEqual('person');
    });

    it('should throw an error for undefined types', () => {
      expect(() => spec.getClassType('ridiculous')).toThrowError()
    });
  });

  describe('getType', () => {
    it('should support simple-types', () => {
      const type = spec.getType('uuid');
      expect(type).toBeDefined();
      if (!(type instanceof StringType)) {
        fail(`Unexpected class: ${typeof type}`);
        return;
      }
      const {name} = type;
      expect(name).toEqual('uuid');
    });

    it('should support class-types', () => {
      const type = spec.getType('person');
      expect(type).toBeDefined();
      if (!(type instanceof ClassType)) {
        fail(`Unexpected class: ${typeof type}`);
        return;
      }
      const {name} = type;
      expect(name).toEqual('person');
    });

    it('should throw an error for undefined types', () => {
      expect(() => spec.getType('ridiculous')).toThrowError()
    });
  });

  describe('getResponse', () => {
    it('should return defined response', () => {
      const response = spec.getResponse('get-person-success');
      expect(response).toBeDefined();
      const {name} = response;
      expect(name).toEqual('get-person-success');
    });

    it('should throw an error for undefined responses', () => {
      expect(() => spec.getResponse('ridiculous')).toThrowError()
    });
  });

  describe('pathScope.getPathParameter', () => {
    const [pathScope] = spec.pathScopes;

    it('should return defined path-path', () => {
      const param = pathScope.getPathParameter('id');
      expect(param).toBeDefined();
      const {name} = param;
      expect(name).toEqual('id');
    });

    it('should throw an error for undefined path param', () => {
      expect(() => pathScope.getPathParameter('ridiculous')).toThrowError()
    });
  });

  describe('pathScope.getPathAsString', () => {
    const [pathScope] = spec.pathScopes;

    it('should support static path element', () => {
      const staticPathScope = new PathScope();
      const staticPathElement = new StaticPathElement();
      staticPathElement.value = 'test1';
      staticPathScope.path = [staticPathElement];

      expect(staticPathScope.getPathAsString()).toBe('/test1');
    });

    it('should support path parameters', () => {
      const paramPathScope = new PathScope();
      const pathParameter = new PathParameter();
      pathParameter.name = 'test2';
      paramPathScope.path = [pathParameter];

      expect(paramPathScope.getPathAsString()).toBe('/{test2}');
    });

    it('should throw error for unsupported parameter type', () => {
      class UnsupportedTypeTest {}
      const paramPathScope = new PathScope();
      const pathParameter = new UnsupportedTypeTest();
      paramPathScope.path = [<StaticPathElement>pathParameter];

      expect(() => paramPathScope.getPathAsString())
          .toThrowError('Unsupported PathElement type: UnsupportedTypeTest');
    });

    it('should support multiple parameters', () => {
      const multiplePathScope = new PathScope();
      const staticPathElement = new StaticPathElement();
      staticPathElement.value = 'test1';
      const pathParameter = new PathParameter();
      pathParameter.name = 'test2';
      multiplePathScope.path = [staticPathElement, pathParameter];

      expect(multiplePathScope.getPathAsString()).toBe('/test1/{test2}');
    });
  });

  describe('name', () => {
    it('should be passed through', () => {
      expect(specName).toEqual('people');
    });
  });
  describe('title', () => {
    it('should be passed through', () => {
      expect(title).toEqual('People API');
    });
  });
  describe('description', () => {
    it('should be passed through', () => {
      expect(description).toEqual('A nice long description\n\n\t* With\n\t* Some\n\t* Bullet points.');
    });
  });
  describe('version', () => {
    it('should be passed through', () => {
      expect(version).toEqual('1.0.0');
    });
  });

  describe('simple-types', () => {
    it('there should be three elements', () => {
      expect(simpleTypes.length).toEqual(4);
    });

    const [simpleType1, simpleType2, simpleType3, simpleType4] = simpleTypes;

    describe('simple-type 1', () => {
      it('should match expected', () => {
        if (!(simpleType1 instanceof StringType)) {
          fail(`Unexpected class: ${typeof simpleType1}`);
          return;
        }
        const {name, pattern, minLength, maxLength} = simpleType1 as StringType;
        expect(name).toEqual('name');
        expect(pattern).toEqual('^[\\p{Alpha}\']+$');
        expect(minLength).toEqual(1);
        expect(maxLength).toEqual(100);
      });
    });

    describe('simple-type 2', () => {
      it('should match expected', () => {
        if (!(simpleType2 instanceof StringType)) {
          fail(`Unexpected class: ${typeof simpleType2}`);
          return;
        }
        const {name, pattern, minLength, maxLength} = simpleType2 as StringType;
        expect(name).toEqual('uuid');
        expect(pattern).toEqual('^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');
        expect(minLength).toEqual(36);
        expect(maxLength).toEqual(36);
      });
    });

    describe('simple-type 3', () => {
      it('should match expected', () => {
        if (!(simpleType3 instanceof IntegerType)) {
          fail(`Unexpected class: ${typeof simpleType3}`);
          return;
        }
        const {name, minimum, maximum} = simpleType3 as IntegerType;
        expect(name).toEqual('age');
        expect(minimum).toEqual(0);
        expect(maximum).toEqual(150);
      });
    });

    describe('simple-type 4', () => {
      it('should match expected', () => {
        if (!(simpleType4 instanceof IntegerType)) {
          fail(`Unexpected class: ${typeof simpleType4}`);
          return;
        }
        const {name, minimum, maximum} = simpleType4 as IntegerType;
        expect(name).toEqual('months-employed');
        expect(minimum).toEqual(0);
        expect(maximum).toEqual(1000);
      });
    });
  });

  describe('class-types', () => {
    it('there should be two elements', () => {
      expect(classTypes.length).toEqual(2);
    });

    const [classType1] = classTypes;

    describe('class-type 1', () => {

      it('should match expected', () => {
        const {name, properties} = classType1;
        expect(name).toEqual('person');
        expect(properties.length).toEqual(8);
      });

      const [property1, property2, property3, property4, property5, property6, property7, property8] = classType1.properties;
      describe('property 1', () => {
        it('should match expected', () => {
          const {name, type, allowEmpty, allowNull, isArray} = property1;
          expect(name).toEqual('first-name');
          expect(type).toEqual(spec.getType('name'));
          expect(allowEmpty).toBeFalsy();
          expect(allowNull).toBeFalsy();
          expect(isArray).toBeFalsy();
        });
      });

      describe('property 2', () => {
        it('should match expected', () => {
          const {name, type, allowEmpty, allowNull, isArray} = property2;
          expect(name).toEqual('last-name');
          expect(type).toEqual(spec.getType('name'));
          expect(allowEmpty).toBeTruthy();
          expect(allowNull).toBeFalsy();
          expect(isArray).toBeFalsy();
        });
      });

      describe('property 3', () => {
        it('should match expected', () => {
          const {name, type, allowEmpty, allowNull, isArray} = property3;
          expect(name).toEqual('age');
          expect(type).toEqual(spec.getType('age'));
          expect(allowEmpty).toBeFalsy();
          expect(allowNull).toBeFalsy();
          expect(isArray).toBeFalsy();
        });
      });

      describe('property 4', () => {
        it('should match expected', () => {
          const {name, type, allowEmpty, allowNull, isArray} = property4;
          expect(name).toEqual('employed');
          expect(type).toEqual(spec.getType('boolean'));
          expect(allowEmpty).toBeFalsy();
          expect(allowNull).toBeFalsy();
          expect(isArray).toBeFalsy();
        });
      });

      describe('property 5', () => {
        it('should match expected', () => {
          const {name, type, allowEmpty, allowNull, isArray} = property5;
          expect(name).toEqual('months-employed');
          expect(type).toEqual(spec.getType('months-employed'));
          expect(allowEmpty).toBeFalsy();
          expect(allowNull).toBeTruthy();
          expect(isArray).toBeFalsy();
        });
      });

      describe('property 6', () => {
        it('should match expected', () => {
          const {name, type, allowEmpty, allowNull, isArray} = property6;
          expect(name).toEqual('work-address');
          expect(type).toEqual(spec.getType('address'));
          expect(allowEmpty).toBeFalsy();
          expect(allowNull).toBeTruthy();
          expect(isArray).toBeFalsy();
        });
      });

      describe('property 7', () => {
        it('should match expected', () => {
          const {name, type, allowEmpty, allowNull, isArray} = property7;
          expect(name).toEqual('home-address');
          expect(type).toEqual(spec.getType('address'));
          expect(allowEmpty).toBeFalsy();
          expect(allowNull).toBeFalsy();
          expect(isArray).toBeFalsy();
        });
      });

      describe('property 8', () => {
        it('should match expected', () => {
          const {name, type, allowEmpty, allowNull, isArray} = property8;
          expect(name).toEqual('address-history');
          expect(type).toEqual(spec.getType('address'));
          expect(allowEmpty).toBeFalsy();
          expect(allowNull).toBeFalsy();
          expect(isArray).toBeTruthy();
        });
      });
    });
  });

  describe('responses', () => {
    it('there should be three elements', () => {
      expect(responses.length).toEqual(3);
    });

    const [response1, response2, response3] = responses;

    describe('response 1', () => {
      const {name, status, bodyTypeRef, isArray} = response1;
      it('should match expected', () => {
        expect(name).toEqual('get-person-success');
        expect(status).toEqual(200);
        expect(bodyTypeRef).toEqual(spec.getClassType('person'));
        expect(isArray).toBeFalsy();
      });
    });

    describe('response 2', () => {
      const {name, status, bodyTypeRef, isArray} = response2;
      it('should match expected', () => {
        expect(name).toEqual('update-person-success');
        expect(status).toEqual(200);
        expect(bodyTypeRef).toEqual(spec.getClassType('person'));
        expect(isArray).toBeFalsy();
      });
    });

    describe('response 3', () => {
      const {name, status, bodyTypeRef, isArray} = response3;
      it('should match expected', () => {
        expect(name).toEqual('get-person-array-success');
        expect(status).toEqual(200);
        expect(bodyTypeRef).toEqual(spec.getClassType('person'));
        expect(isArray).toBeTruthy();
      });
    });
  });

  describe('path-scopes', () => {
    it('there should be three elements', () => {
      expect(pathScopes.length).toEqual(3);
    });

    const [pathScope1] = pathScopes;

    describe('path-scope 1', () => {
      it('should match expected', () => {
        const {path, name, mappings} = pathScope1;
        expect(name).toEqual('person-ws');
        expect(path.length).toEqual(2);
        expect(mappings.length).toEqual(2);
      });

      const [path1, path2] = pathScope1.path;
      describe('path 1', () => {
        it('should match expected', () => {
          if (!(path1 instanceof StaticPathElement)) {
            fail(`Unexpected class: ${typeof path1}`);
            return;
          }
          const {value} = path1 as StaticPathElement;
          expect(value).toEqual('person');
        });
      });

      describe('path 2', () => {
        it('should match expected', () => {
          if (!(path2 instanceof PathParameter)) {
            fail(`Unexpected class: ${typeof path2}`);
            return;
          }
          const {name, typeRef} = path2 as PathParameter;
          expect(name).toEqual('id');
          expect(typeRef).toEqual(spec.getSimpleType('uuid'));
        });
      });

      const [mapping1, mapping2] = pathScope1.mappings;
      describe('mapping 1', () => {
        it('should match expected', () => {
          if (!(mapping1 instanceof HttpMethodHandler)) {
            fail(`Unexpected class: ${typeof mapping1}`);
            return;
          }
          const {method, name, parameters, responseRefs} = mapping1 as HttpMethodHandler;
          expect(method).toEqual(HttpMethod.GET);
          expect(name).toEqual('get-person');
          expect(parameters.length).toEqual(1);
          expect(responseRefs).toEqual([spec.getResponse('get-person-success')]);
        });

        if (!(mapping1 instanceof HttpMethodHandler)) {
          fail(`Unexpected class: ${typeof mapping1}`);
          return;
        }
        const {parameters} = mapping1;
        const [parameter1] = parameters;

        describe('parameter 1', () => {
          it('should match expected', () => {
            if (!(parameter1 instanceof PathParameterReference)) {
              fail(`Unexpected class: ${typeof parameter1}`);
              return;
            }
            const {name, value} = parameter1 as PathParameterReference;
            expect(name).toEqual('id');
            expect(value).toEqual(pathScope1.getPathParameter('id'));
          });
        });
      });

      describe('mapping 2', () => {
        it('should match expected', () => {
          if (!(mapping2 instanceof HttpMethodHandler)) {
            fail(`Unexpected class: ${typeof mapping2}`);
            return;
          }
          const {method, name, parameters, responseRefs} = mapping2 as HttpMethodHandler;
          expect(method).toEqual(HttpMethod.PUT);
          expect(name).toEqual('update-person');
          expect(parameters.length).toEqual(2);
          expect(responseRefs).toEqual([spec.getResponse('update-person-success')]);
        });

        if (!(mapping2 instanceof HttpMethodHandler)) {
          fail(`Unexpected class: ${typeof mapping2}`);
          return;
        }
        const {parameters} = mapping2 as HttpMethodHandler;
        const [parameter1, parameter2] = parameters;

        describe('parameter 1', () => {
          it('should match expected', () => {
            if (!(parameter1 instanceof PathParameterReference)) {
              fail(`Unexpected class: ${typeof parameter1}`);
              return;
            }
            const {name, value} = parameter1 as PathParameterReference;
            expect(name).toEqual('id');
            expect(value).toEqual(pathScope1.getPathParameter('id'));
          });
        });

        describe('parameter 2', () => {
          it('should match expected', () => {
            if (!(parameter2 instanceof BodyParameterReference)) {
              fail(`Unexpected class: ${typeof parameter2}`);
              return;
            }
            const {name, typeRef} = parameter2 as BodyParameterReference;
            expect(name).toEqual('person');
            expect(typeRef).toEqual(spec.getClassType('person'));
          });
        });
      });
    });
  });
});
