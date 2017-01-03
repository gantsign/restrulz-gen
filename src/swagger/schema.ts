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
export class SwaggerInfo {
  title: string;
  description?: string;
  version: string;
}

export class SwaggerSchema {
  $ref?: string;
  type?: string;
  properties?: {[propertyName: string]: SwaggerSchema};
  maximum?: number;
  maxLength?: number;
  minimum?: number;
  minLength?: number;
  pattern?: string;
  required?: string[];
  items?: SwaggerSchema;
}

export class SwaggerResponse {
  description: string;
  schema?: SwaggerSchema;
}

export interface SwaggerParameter {
  name: string;
  in: string;
  required: boolean;
}

export class SwaggerPathParameter implements SwaggerParameter {
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

export class SwaggerBodyParameter implements SwaggerParameter {
  name: string;
  in: string;
  required: boolean;
  schema?: SwaggerSchema;
}

export class SwaggerOperation {
  operationId?: string;
  parameters?: SwaggerParameter[];
  responses: {[statusCode: string]: SwaggerResponse};
}

export class SwaggerPath {
  get?: SwaggerOperation;
  put?: SwaggerOperation;
  post?: SwaggerOperation;
  delete?: SwaggerOperation;
}

export class SwaggerSpecification {
  swagger: string;
  info: SwaggerInfo;
  paths: {[p: string]: SwaggerPath};
  definitions?: {[definitionName: string]: SwaggerSchema };
}
