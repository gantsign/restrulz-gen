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
export enum VisibilityKt {
  Public,
  Private,
  Protected,
  Internal
}

export class TypeSignatureKt {

  name: string;
  genericParameters: TypeSignatureKt[] = [];
  isNullable = false;

  constructor(className: string) {

    this.name = className;
  }

  addGenericParameter(typeClassName: string): void {

    this.genericParameters.push(new TypeSignatureKt(typeClassName));
  }

  addGenericParameterNullable(typeClassName: string): void {

    const typeSignatureKt = new TypeSignatureKt(typeClassName);
    typeSignatureKt.isNullable = true;
    this.genericParameters.push(typeSignatureKt);
  }
}

export class ParameterKt {

  annotations: AnnotationKt[] = [];
  name: string;
  type: TypeSignatureKt;
  defaultValue = '';

  constructor(name: string) {
    this.name = name;
  }

  addAnnotation(name: string, callback: (annotationKt: AnnotationKt) => void = () => {}): void {

    const annotationKt = new AnnotationKt(name);
    callback(annotationKt);
    this.annotations.push(annotationKt);
  }

}

export class ArgumentKt {
  name: string;
  value: string;

  constructor(name: string) {
    this.name = name;
  }

}

export class ConstructorPropertyKt extends ParameterKt {

  visibility: VisibilityKt = VisibilityKt.Public;
  isMutable = false;

  constructor(name: string) {
    super(name);
  }
}

export interface FileMemberKt {

  name: string;
}

export class AnnotationParameterKt {

  name: string;
  valueFactory: (fileKt: FileKt) => string;

  constructor(name: string) {
    this.name = name;
  }
}

export class AnnotationKt {

  className: string;
  parameters: AnnotationParameterKt[] = [];

  constructor(className: string) {
    this.className = className;
  }

  addParameter(name: string, valueFactory: (fileKt: FileKt) => string): void {

    const parameterKt = new AnnotationParameterKt(name);
    parameterKt.valueFactory = valueFactory;
    this.parameters.push(parameterKt);
  }

  addSimpleParameter(name: string, value: string): void {

    this.addParameter(name, () => value);
  }
}

export interface ClassMemberKt {
}

export interface ExtendsOrImplementsKt {

  type: TypeSignatureKt;
}

export class ImplementsKt implements ExtendsOrImplementsKt {

  type: TypeSignatureKt;

  constructor(type: TypeSignatureKt) {
    this.type = type;
  }
}

export class ExtendsKt extends ImplementsKt {

  arguments: ArgumentKt[] = [];
  wrapArguments: Boolean = false;

  addArgument(name: string, value: string): void {

    const argumentKt = new ArgumentKt(name);
    argumentKt.value = value;
    this.arguments.push(argumentKt);
  }

  constructor(type: TypeSignatureKt) {
    super(type);
  }
}

export class PrimaryConstructorKt {

  visibility: VisibilityKt = VisibilityKt.Public;
  parameters: ParameterKt[] = [];

  addParameter(name: string,
               typeClassName: string,
               callback: (typeSignatureKt: TypeSignatureKt) => void = () => {}): void {

    const parameterKt = new ParameterKt(name);
    const typeSignatureKt = new TypeSignatureKt(typeClassName);
    callback(typeSignatureKt);
    parameterKt.type = typeSignatureKt;
    this.parameters.push(parameterKt);
  }

  addProperty(name: string,
              typeClassName: string,
              callback: (constructorPropertyKt: ConstructorPropertyKt,
                         typeSignatureKt: TypeSignatureKt) => void = () => {}): void {

    const propertyKt = new ConstructorPropertyKt(name);
    const typeSignatureKt = new TypeSignatureKt(typeClassName);
    callback(propertyKt, typeSignatureKt);
    propertyKt.type = typeSignatureKt;
    this.parameters.push(propertyKt);
  }
}

export interface CompanionObjectMemberKt {}

export class CompanionObjectKt {

  members: CompanionObjectMemberKt[] = [];

  addFunction(name: string, callback: (functionKt: FunctionKt) => void): void {

    const functionKt = new FunctionKt(name);
    callback(functionKt);
    this.members.push(functionKt);
  }
}

export abstract class AbstractClassKt {
  name: string;
  primaryConstructor: PrimaryConstructorKt;
  extendsClasses: ExtendsOrImplementsKt[] = [];
  members: ClassMemberKt[] = [];

  constructor(name: string) {
    this.name = name;
  }

  setPrimaryConstructor(callback: (constructorKt: PrimaryConstructorKt) => void): void {

    const constructorKt = new PrimaryConstructorKt();
    callback(constructorKt);
    this.primaryConstructor = constructorKt;
  }

  extendsClass(name: string,
               callback: (extendsKt: ExtendsKt,
                          typeSignatureKt: TypeSignatureKt) => void = () => {}): void {

    const typeSignatureKt = new TypeSignatureKt(name);
    const extendsKt = new ExtendsKt(typeSignatureKt);
    callback(extendsKt, typeSignatureKt);
    extendsKt.type = typeSignatureKt;
    this.extendsClasses.push(extendsKt);
  }

  implementsInterface(interfaceClassName: string,
                      callback: (typeSignatureKt: TypeSignatureKt) => void = () => {}): void {

    const typeSignatureKt = new TypeSignatureKt(interfaceClassName);
    const implementsKt = new ImplementsKt(typeSignatureKt);
    callback(typeSignatureKt);
    this.extendsClasses.push(implementsKt);
  }

  addFunction(name: string, callback: (functionKt: FunctionKt) => void): void {

    const functionKt = new FunctionKt(name);
    callback(functionKt);
    this.members.push(functionKt);
  }

  addProperty(name: string,
              typeClassName: string,
              callback: (propertyKt: PropertyKt,
                         typeSignatureKt: TypeSignatureKt) => void): void {

    const propertyKt = new PropertyKt(name);
    const typeSignatureKt = new TypeSignatureKt(typeClassName);
    callback(propertyKt, typeSignatureKt);
    propertyKt.type = typeSignatureKt;
    this.members.push(propertyKt);
  }

  addInitBlock(bodyFactory: (fileKt: FileKt) => string): void {

    this.members.push(new InitBlockKt(bodyFactory));
  }
}

export class ClassKt extends AbstractClassKt implements FileMemberKt {

  dataClass = false;
  companionObject: CompanionObjectKt;

  constructor(name: string) {
    super(name);
  }

  setCompanionObject(callback: (companionObjectKt: CompanionObjectKt) => void): void {

    const companionObjectKt = new CompanionObjectKt();
    callback(companionObjectKt);
    this.companionObject = companionObjectKt;
  }
}

export class ObjectKt extends AbstractClassKt implements FileMemberKt {

  constructor(name: string) {
    super(name);
  }

}

export class PropertyKt implements ClassMemberKt {

  overrides = false;
  visibility: VisibilityKt = VisibilityKt.Public;
  name: string;
  isMutable = false;
  type: TypeSignatureKt;
  defaultValueFactory: (fileKt: FileKt) => string;
  wrapAssignment = false;
  getterBodyFactory: (fileKt: FileKt) => string;

  constructor(name: string) {
    this.name = name;
  }

  setDefaultValue(valueFactory: (fileKt: FileKt) => string): void {
    this.defaultValueFactory = valueFactory;
  }

  setSimpleDefaultValue(value: string): void {
    this.setDefaultValue(() => value);
  }

  setGetterBody(bodyFactory: (fileKt: FileKt) => string): void {
    this.getterBodyFactory = bodyFactory;
  }

}

export class InitBlockKt implements ClassMemberKt {

  bodyFactory: (fileKt: FileKt) => string;

  constructor(bodyFactory: (fileKt: FileKt) => string) {
    this.bodyFactory = bodyFactory;
  }
}

export class FunctionSignatureKt {

  annotations: AnnotationKt[] = [];
  name: string;
  parameters: ParameterKt[] = [];
  returnType: TypeSignatureKt;

  constructor(name: string) {
    this.name = name;
  }

  addAnnotation(name: string, callback: (annotationKt: AnnotationKt) => void = () => {}): void {

    const annotationKt = new AnnotationKt(name);
    callback(annotationKt);
    this.annotations.push(annotationKt);
  }

  addParameter(name: string,
               typeClassName: string,
               callback: (parameterKt: ParameterKt,
                          typeSignatureKt: TypeSignatureKt) => void = () => {}): void {

    const parameterKt = new ParameterKt(name);
    const typeSignatureKt = new TypeSignatureKt(typeClassName);
    callback(parameterKt, typeSignatureKt);
    parameterKt.type = typeSignatureKt;
    this.parameters.push(parameterKt);
  }

  addParameterNullable(name: string, typeClassName: string): void {

    this.addParameter(name, typeClassName, (parameterKt, typeSignatureKt) => {
      typeSignatureKt.isNullable = true;
    });
  }

  setReturnType(className: string,
                callback: (typeSignatureKt: TypeSignatureKt) => void = () => {}): void {

    const typeSignatureKt = new TypeSignatureKt(className);
    callback(typeSignatureKt);
    this.returnType = typeSignatureKt;
  }

  setReturnTypeNullable(className: string): void {
    this.setReturnType(className, typeSignatureKt => {
      typeSignatureKt.isNullable = true;
    });
  }

}

export class FunctionKt
extends FunctionSignatureKt
implements
    FileMemberKt,
    CompanionObjectMemberKt {

  //noinspection JSUnusedGlobalSymbols
  'classes:restrulz.kotlin.FunctionKt' = true;

  visibility: VisibilityKt = VisibilityKt.Public;
  overrides = false;
  bodyFactory: (fileKt: FileKt) => string;

  public static assignableFrom(
      functionKt: FunctionSignatureKt | ClassMemberKt | FileMemberKt): functionKt is FunctionKt {

    return 'classes:restrulz.kotlin.FunctionKt' in functionKt;
  }

  setBody(bodyFactory: (fileKt: FileKt) => string): void {

    this.bodyFactory = bodyFactory;
  }
}

export class ExtensionFunctionKt extends FunctionKt implements FileMemberKt {

  extendedType: TypeSignatureKt;
}

export class InterfaceKt implements FileMemberKt {

  annotations: AnnotationKt[] = [];
  name: string;
  members: FunctionSignatureKt[] = [];

  constructor(name: string) {
    this.name = name;
  }

  addAnnotation(className: string,
                callback: (annotationKt: AnnotationKt) => void = () => {}): void {

    const annotationKt = new AnnotationKt(className);
    callback(annotationKt);
    this.annotations.push(annotationKt);
  }

  addFunctionSignature(
      name: string,
      callback: (functionSignatureKt: FunctionSignatureKt) => any = () => {}): void {

    const functionSignatureKt = new FunctionSignatureKt(name);
    callback(functionSignatureKt);
    this.members.push(functionSignatureKt);
  }

}

function shortNameFor(type: string): string {

  return type.replace(/.*\./g, '');
}

export class FileKt {

  importMapping: {[key: string]: string; } = {};
  licenseHeader = '';
  fileName: string;
  packageName: string;
  members: FileMemberKt[] = [];

  tryImport(type: string): string {

    const importName: string|undefined = this.importMapping[type];
    if (importName) {
      return importName;
    }
    const shortName = shortNameFor(type);
    if (this.members
            .map(member => member.name)
            .filter(memberName => `${this.packageName}.${memberName}` !== type)
            .indexOf(shortName) >= 0) {
      // do not import there is a member with the same short name
      return type;
    }
    if (Object.keys(this.importMapping)
            .map(key => this.importMapping[key]).indexOf(shortName) >= 0) {
      // do not import there is another import with the same short name
      return type;
    }
    this.importMapping[type] = shortName;
    return shortName;
  }

  constructor(packageName: string, fileName: string) {

    this.packageName = packageName;
    this.fileName = fileName;
  }

  addInterface(name: string, callback: (interfaceKt: InterfaceKt) => any): void {

    const interfaceKt = new InterfaceKt(name);
    callback(interfaceKt);
    this.members.push(interfaceKt);
  }

  addClass(name: string, callback: (classKt: ClassKt) => void): void {

    const classKt = new ClassKt(name);
    callback(classKt);
    this.members.push(classKt);
  }

  addObject(name: string, callback: (objectKt: ObjectKt) => void): void {

    const objectKt = new ObjectKt(name);
    callback(objectKt);
    this.members.push(objectKt);
  }

  addFunction(name: string, callback: (functionKt: FunctionKt) => void): void {

    const functionKt = new FunctionKt(name);
    callback(functionKt);
    this.members.push(functionKt);
  }

  addExtensionFunction(name: string,
                       extendedClassName: string,
                       callback: (extensionFunctionKt: ExtensionFunctionKt,
                                  typeSignatureKt: TypeSignatureKt) => void): void {

    const extensionFunctionKt = new ExtensionFunctionKt(name);
    const typeSignatureKt = new TypeSignatureKt(extendedClassName);
    callback(extensionFunctionKt, typeSignatureKt);
    extensionFunctionKt.extendedType = typeSignatureKt;
    this.members.push(extensionFunctionKt);
  }

  public getOutputPath(): string {
    const {packageName, fileName} = this;

    return `${packageName.replace(/\./g, '/')}/${fileName}.kt`;
  }

}
