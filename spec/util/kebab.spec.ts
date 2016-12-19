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

import * as kebab from '../../src/util/kebab';

describe('kebabToCamelReviver', () => {

  it('should pass through a null value', () => {
    expect(kebab.kebabToCamelReviver(null, null)).toBeNull();
  });

  it('should pass through a number value', () => {
    expect(kebab.kebabToCamelReviver(null, 10)).toEqual(10);
  });

  it('should pass through a boolean value', () => {
    expect(kebab.kebabToCamelReviver(null, true)).toBeTruthy();
  });

  it('should pass through a string value', () => {
    expect(kebab.kebabToCamelReviver(null, 'Te-_sT')).toEqual('Te-_sT');
  });

  it('should pass through an array value', () => {
    expect(kebab.kebabToCamelReviver(null, [1, 2])).toEqual([1, 2]);
  });

  it('should work with a kebab case value', () => {
    expect(kebab.kebabToCamelReviver(null, {'tesT-nAmE': null})).toEqual({'testName': null});
  });

  it('should not fail with a snake case value', () => {
    expect(kebab.kebabToCamelReviver(null, {'tesT_nAmE': null})).toEqual({'test_name': null});
  });

  it('should not fail with a camel case value', () => {
    expect(kebab.kebabToCamelReviver(null, {'TestName': null})).toEqual({'testname': null});
  });
});
