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
export class Info {
  title: string;
  description?: string;
  version: string;
}

export class Schema {
  $ref?: string;
  type?: string;
  properties?: {[propertyName: string]: Schema};
  maximum?: number;
  maxLength?: number;
  minimum?: number;
  minLength?: number;
  pattern?: string;
  required?: string[];
}

export class Response {
  description: string;
  schema?: Schema;
}

export interface Parameter {
  name: string;
  in: string;
  required: boolean;
}

export class PathParameter implements Parameter {
  name: string;
  in: string;
  required: boolean;
  type: string;
  maximum?: number;
  maxLength?: number;
  minimum?: number;
  minLength?: number;
  pattern?: string;
}

export class BodyParameter implements Parameter {
  name: string;
  in: string;
  required: boolean;
  schema?: Schema;
}

export class Operation {
  operationId?: string;
  parameters?: Parameter[];
  responses: {[statusCode: string]: Response};
}

export class Path {
  get?: Operation;
  put?: Operation;
  post?: Operation;
  delete?: Operation;
}

export class Spec {
  swagger: string;
  info: Info;
  paths: {[p: string]: Path};
  definitions?: {[definitionName: string]: Schema };
}
