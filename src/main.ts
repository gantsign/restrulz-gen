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
import {SchemaProcessor} from './generator';
import {SwaggerGenerator} from './swagger/generator';

const swaggerGenerator = new SwaggerGenerator();
swaggerGenerator.outputFile = 'people.swagger.yml';

const processor = new SchemaProcessor();
processor.schemaFile = 'spec/data/schema.json';
processor.outputDirectory = 'dest';
processor.generators.push(swaggerGenerator);
processor.execute();
