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
import {Specification} from './restrulz/model';

export interface GeneratorContext {
  writeJsonToFile(filePath: string, data: any): void;

  writeYamlToFile(filePath: string, data: any): void;

  writeStringToFile(filePath: string, data: any): void;
}

export interface Generator {
  generateFiles(spec: Specification, context: GeneratorContext): void;
}
