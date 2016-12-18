/// <reference path="../typings/globals/jasmine/index.d.ts" />

import {hello} from '../src/hello';

describe("hello", () => {

  it("should return welcome message", () => {
    expect(hello('world')).toEqual('Hello from world');
  });

});
