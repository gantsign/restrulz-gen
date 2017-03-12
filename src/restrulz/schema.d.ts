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
export interface StringTypeJs {
  name: string;
  kind: 'string';
  pattern: string;
  minLength: number;
  maxLength: number;
}

export interface IntegerTypeJs {
  name: string;
  kind: 'integer';
  minimum: number;
  maximum: number;
}

export type SimpleTypeJs = StringTypeJs | IntegerTypeJs;

export interface PropertyJs {
  name: string;
  typeRef: string;
  allowEmpty: boolean | undefined;
  allowNull: boolean | undefined;
  array: boolean;
}

export interface ClassTypeJs {
  name: string;
  properties: PropertyJs[];
}

export interface ResponseJs {
  name: string;
  status: number;
  bodyTypeRef: string;
  array: boolean;
}

export interface StaticPathElementJs {
  kind: 'static';
  value: string;
}

export interface PathParamJs {
  kind: 'path-param';
  name: string;
  typeRef: string;
}

export type PathElementJs = StaticPathElementJs | PathParamJs;

export interface PathParamRefJs {
  kind: 'path-param-ref';
  name: string;
  valueRef: string;
}

export interface BodyParamRefJs {
  kind: 'body-param-ref';
  name: string;
  typeRef: string;
}

export type ParamRefJs = PathParamRefJs | BodyParamRefJs;

export interface HttpMethodHandlerJs {
  kind: 'http-method';
  method: string;
  name: string;
  parameters: ParamRefJs[];
  responseRefs: string[];
}

export interface SubPathScopeJs {
  kind: 'path';
  path: PathElementJs[];
  mappings: MappingJs[];
}

export type MappingJs = HttpMethodHandlerJs | SubPathScopeJs;

export interface PathScopeJs {
  name: string;
  path: PathElementJs[];
  mappings: MappingJs[];
}

export interface SpecificationJs {
  name: string
  title: string
  description: string
  version: string
  simpleTypes: SimpleTypeJs[];
  classTypes: ClassTypeJs[];
  responses: ResponseJs[];
  pathScopes: PathScopeJs[];
}
