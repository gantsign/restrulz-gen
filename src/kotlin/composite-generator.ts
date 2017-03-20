/*
 * Copyright 2017 GantSign Ltd. All Rights Reserved.
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
import {Specification} from '../restrulz/model';
import {Generator, GeneratorContext} from '../generator';
import {KotlinGenerator} from './generator';

export class CompositeKotlinGenerator extends KotlinGenerator {

  children: KotlinGenerator[] = [];

  init(generators: Generator[]): void {
    for (let child of this.children) {
      if (child.licenseHeader === '') {
        child.licenseHeader = this.licenseHeader;
      }
      const thisPackageMapping = this.packageMapping;
      const childPackageMapping = child.packageMapping;
      for (let prop in thisPackageMapping) {
        if (thisPackageMapping.hasOwnProperty(prop) && !childPackageMapping.hasOwnProperty(prop)) {
          childPackageMapping[prop] = thisPackageMapping[prop];
        }
      }
    }
    for (let child of this.children) {
      child.init(this.children);
    }
  }

  generateFiles(spec: Specification, context: GeneratorContext): void {
    for (let child of this.children) {
      child.generateFiles(spec, context);
    }
  }

}
