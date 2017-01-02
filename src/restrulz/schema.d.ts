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
export interface StringType {
  name: string;
  kind: 'string';
  pattern: string;
  minLength: number;
  maxLength: number;
}

export interface IntegerType {
  name: string;
  kind: 'integer';
  minimum: number;
  maximum: number;
}

export type SimpleType = StringType | IntegerType;

export interface Property {
  name: string;
  typeRef: string;
}

export interface ClassType {
  name: string;
  properties: Property[];
}

export interface Response {
  name: string;
  status: number;
  bodyTypeRef: string;
}

export interface StaticPathElement {
  kind: 'static';
  value: string;
}

export interface PathParam {
  kind: 'path-param';
  name: string;
  typeRef: string;
}

export type PathElement = StaticPathElement | PathParam;

export interface PathParamRef {
  kind: 'path-param-ref';
  valueRef: string;
}

export interface BodyParamRef {
  kind: 'body-param-ref';
  typeRef: string;
}

export type ParamRef = PathParamRef | BodyParamRef;

export interface HttpMethodHandler {
  kind: 'http-method';
  method: string;
  name: string;
  parameters: ParamRef[];
  responseRef: string;
}

export type Mapping = HttpMethodHandler;

export interface PathScope {
  name: string;
  path: PathElement[];
  mappings: Mapping[];
}

export interface Specification {
  name: string
  title: string
  description: string
  version: string
  simpleTypes: SimpleType[];
  classTypes: ClassType[];
  responses: Response[];
  pathScopes: PathScope[];
}
