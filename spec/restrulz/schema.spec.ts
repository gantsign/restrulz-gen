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
/// <reference path="../../typings/globals/jasmine/index.d.ts" />
/// <reference path="../../typings/globals/node/index.d.ts" />
import * as fs from 'fs';
import * as kebab from '../../src/util/kebab';
import {IntegerType, Specification, StringType} from '../../src/restrulz/schema';

/*
 * Since we're testing the the schema definition is correct it only makes sense to test against a
 * real file. Testing against mock JSON would only prove the schema definition matched the mock
 * JSON.
 */
const json = fs.readFileSync('spec/data/schema.json', 'utf8');
const schema: Specification = JSON.parse(json, kebab.kebabToCamelReviver);

const {name: specName, title, description, version, simpleTypes, classTypes, responses, pathScopes} = schema;

describe('restrulz schema definition', () => {

  describe('name', () => {
    it('should match expected', () => {
      expect(specName).toEqual('people');
    });
  });
  describe('title', () => {
    it('should match expected', () => {
      expect(title).toEqual('People API');
    });
  });
  describe('description', () => {
    it('should match expected', () => {
      expect(description).toEqual('A nice long description\n\n\t* With\n\t* Some\n\t* Bullet points.');
    });
  });
  describe('version', () => {
    it('should match expected', () => {
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
        const {name, kind, pattern, minLength, maxLength} = simpleType1 as StringType;
        expect(name).toEqual('name');
        expect(kind).toEqual('string');
        expect(pattern).toEqual('^[\\p{Alpha}\']+$');
        expect(minLength).toEqual(1);
        expect(maxLength).toEqual(100);
      });
    });

    describe('simple-type 2', () => {
      it('should match expected', () => {
        const {name, kind, pattern, minLength, maxLength} = simpleType2 as StringType;
        expect(name).toEqual('uuid');
        expect(kind).toEqual('string');
        expect(pattern).toEqual('^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');
        expect(minLength).toEqual(36);
        expect(maxLength).toEqual(36);
      });
    });

    describe('simple-type 3', () => {
      it('should match expected', () => {
        const {name, kind, minimum, maximum} = simpleType3 as IntegerType;
        expect(name).toEqual('age');
        expect(kind).toEqual('integer');
        expect(minimum).toEqual(0);
        expect(maximum).toEqual(150);
      });
    });

    describe('simple-type 4', () => {
      it('should match expected', () => {
        const {name, kind, minimum, maximum} = simpleType4 as IntegerType;
        expect(name).toEqual('months-employed');
        expect(kind).toEqual('integer');
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
        expect(properties.length).toEqual(7);
      });

      const [property1, property2, property3, property4, property5, property6, property7] = classType1.properties;
      describe('property 1', () => {
        it('should match expected', () => {
          const {name, typeRef, allowEmpty} = property1;
          expect(name).toEqual('first-name');
          expect(typeRef).toEqual('name');
          expect(allowEmpty).toBeFalsy();
        });
      });

      describe('property 2', () => {
        it('should match expected', () => {
          const {name, typeRef, allowEmpty} = property2;
          expect(name).toEqual('last-name');
          expect(typeRef).toEqual('name');
          expect(allowEmpty).toBeTruthy();
        });
      });

      describe('property 3', () => {
        it('should match expected', () => {
          const {name, typeRef, allowNull} = property3;
          expect(name).toEqual('age');
          expect(typeRef).toEqual('age');
          expect(allowNull).toBeFalsy();
        });
      });

      describe('property 4', () => {
        it('should match expected', () => {
          const {name, typeRef} = property4;
          expect(name).toEqual('employed');
          expect(typeRef).toEqual('boolean');
        });
      });

      describe('property 5', () => {
        it('should match expected', () => {
          const {name, typeRef, allowNull} = property5;
          expect(name).toEqual('months-employed');
          expect(typeRef).toEqual('months-employed');
          expect(allowNull).toBeTruthy();
        });
      });

      describe('property 6', () => {
        it('should match expected', () => {
          const {name, typeRef, allowNull} = property6;
          expect(name).toEqual('work-address');
          expect(typeRef).toEqual('address');
          expect(allowNull).toBeTruthy();
        });
      });

      describe('property 7', () => {
        it('should match expected', () => {
          const {name, typeRef, allowNull} = property7;
          expect(name).toEqual('home-address');
          expect(typeRef).toEqual('address');
          expect(allowNull).toBeFalsy();
        });
      });
    });
  });

  describe('responses', () => {
    it('there should be two elements', () => {
      expect(responses.length).toEqual(2);
    });

    const [response1, response2] = responses;

    describe('response 1', () => {
      const {name, status, bodyTypeRef} = response1;
      it('should match expected', () => {
        expect(name).toEqual('get-person-success');
        expect(status).toEqual(200);
        expect(bodyTypeRef).toEqual('person');
      });
    });

    describe('response 2', () => {
      const {name, status, bodyTypeRef} = response2;
      it('should match expected', () => {
        expect(name).toEqual('update-person-success');
        expect(status).toEqual(200);
        expect(bodyTypeRef).toEqual('person');
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
          if (path1.kind !== 'static') {
            fail(`Unexpected kind: ${path1.kind}`);
            return;
          }
          const {value} = path1;
          expect(value).toEqual('person');
        });
      });

      describe('path 2', () => {
        it('should match expected', () => {
          if (path2.kind !== 'path-param') {
            fail(`Unexpected kind: ${path2.kind}`);
            return;
          }
          const {name, typeRef} = path2;
          expect(name).toEqual('id');
          expect(typeRef).toEqual('uuid');
        });
      });

      const [mapping1, mapping2] = pathScope1.mappings;
      describe('mapping 1', () => {
        it('should match expected', () => {
          if (mapping1.kind !== 'http-method') {
            fail(`Unexpected kind: ${mapping1.kind}`);
            return;
          }
          const {method, name, parameters, responseRef} = mapping1;
          expect(method).toEqual('GET');
          expect(name).toEqual('get-person');
          expect(parameters.length).toEqual(1);
          expect(responseRef).toEqual('get-person-success');
        });

        if (mapping1.kind !== 'http-method') {
          return;
        }
        const {parameters} = mapping1;
        const [parameter1] = parameters;

        describe('parameter 1', () => {
          it('should match expected', () => {
            if (parameter1.kind !== 'path-param-ref') {
              fail(`Unexpected kind: ${parameter1.kind}`);
              return;
            }
            const {valueRef} = parameter1;
            expect(valueRef).toEqual('id');
          });
        });
      });

      describe('mapping 2', () => {
        it('should match expected', () => {
          if (mapping2.kind !== 'http-method') {
            fail(`Unexpected kind: ${mapping2.kind}`);
            return;
          }
          const {method, name, parameters, responseRef} = mapping2;
          expect(method).toEqual('PUT');
          expect(name).toEqual('update-person');
          expect(parameters.length).toEqual(2);
          expect(responseRef).toEqual('update-person-success');
        });

        if (mapping2.kind !== 'http-method') {
          return;
        }
        const {parameters} = mapping2;
        const [parameter1, parameter2] = parameters;

        describe('parameter 1', () => {
          it('should match expected', () => {
            if (parameter1.kind !== 'path-param-ref') {
              fail(`Unexpected kind: ${parameter1.kind}`);
              return;
            }
            const {valueRef} = parameter1;
            expect(valueRef).toEqual('id');
          });
        });

        describe('parameter 2', () => {
          it('should match expected', () => {
            if (parameter2.kind !== 'body-param-ref') {
              fail(`Unexpected kind: ${parameter2.kind}`);
              return;
            }
            const {typeRef} = parameter2;
            expect(typeRef).toEqual('person');
          });
        });
      });
    });
  });
});
