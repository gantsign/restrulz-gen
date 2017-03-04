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
import {
  AbstractClassKt,
  AnnotationKt,
  AnnotationParameterKt,
  ClassKt,
  ClassMemberKt,
  CompanionObjectKt,
  ConstructorPropertyKt,
  ExtendsKt,
  ExtendsOrImplementsKt,
  ExtensionFunctionKt,
  FileKt,
  FileMemberKt,
  FunctionKt,
  FunctionSignatureKt,
  InitBlockKt,
  InterfaceKt,
  ObjectKt,
  ParameterKt,
  PrimaryConstructorKt,
  PropertyKt,
  TypeSignatureKt,
  VisibilityKt
} from './lang';

function shortNameFor(type: string): string {

  return type.replace(/.*\./g, '');
}

export class KotlinSerializer {
  //noinspection JSUnusedGlobalSymbols
  'classes:restrulz.kotlin.KotlinSerializer' = true;

  public static assignableFrom(
      kotlinSerializer: KotlinSerializer): kotlinSerializer is KotlinSerializer {

    return 'classes:restrulz.kotlin.KotlinSerializer' in kotlinSerializer;
  }

  //noinspection JSMethodCanBeStatic
  public indent(value: string): string {

    const lines = value.split(/\r?\n/);
    return lines.map(line => line === '' ? '' : `    ${line}`).join('\n');
  }

  //noinspection JSMethodCanBeStatic
  public getVisibilityPrefix(visibilityKt: VisibilityKt): string {

    switch (visibilityKt) {
      case VisibilityKt.Public:
        return '';
      case VisibilityKt.Private:
        return 'private ';
      case VisibilityKt.Protected:
        return 'protected ';
      case VisibilityKt.Internal:
        return 'internal ';
      default:
        throw new Error(`Unexpected visibility value: ${visibilityKt}`);
    }
  }

  public serializeTypeSignature(fileKt: FileKt,
                                typeSignatureKt: TypeSignatureKt): string {

    const {className, genericParameters, isNullable} = typeSignatureKt;
    const shortTypeName = fileKt.tryImport(className);
    let result = '';
    if (genericParameters.length > 0) {
      result += `${shortTypeName}<`;
      result += genericParameters
          .map(param => this.serializeTypeSignature(fileKt, param))
          .join(', ');
      result += '>';
    } else {
      result += shortTypeName;
    }
    if (isNullable) {
      result += '?';
    }
    return result;
  }

  //noinspection JSMethodCanBeStatic
  public serializeAnnotationParameter(fileKt: FileKt,
                                      annotationKt: AnnotationKt,
                                      parameterKt: AnnotationParameterKt): string {

    const {name, valueFactory} = parameterKt;
    let result = '';
    if (name !== 'value' || annotationKt.parameters.length > 1) {
      result += `${name} = `;
    }
    result += valueFactory(fileKt);
    return result;
  }

  public serializeAnnotation(fileKt: FileKt, annotationKt: AnnotationKt): string {

    const {className, parameters} = annotationKt;
    const shortName = fileKt.tryImport(className);
    let result = `@${shortName}`;
    if (parameters.length > 0) {
      result += '(';
      result += parameters
          .map(param => this.serializeAnnotationParameter(fileKt, annotationKt, param))
          .join(', ');
      result += ')';
    }
    return result;
  }

  public serializeParameterKt(fileKt: FileKt,
                              parameterKt: ParameterKt): string {

    const {annotations, name, type, defaultValue} = parameterKt;
    const typeString = this.serializeTypeSignature(fileKt, type);

    let result = '';
    if (annotations.length > 0) {
      result += annotations
          .map(annotationKt => this.serializeAnnotation(fileKt, annotationKt))
          .join(' ');
      result += ' ';
    }

    if (parameterKt instanceof ConstructorPropertyKt) {
      const {visibility, isMutable} = parameterKt;
      result += this.getVisibilityPrefix(visibility);
      result += `${(isMutable ? 'var' : 'val')} `;
    }

    result += `${name}: ${typeString}`;

    if ('' !== defaultValue) {
      result += ` = ${defaultValue}`;
    }

    return result;
  }

  public serializeProperty(fileKt: FileKt, propertyKt: PropertyKt): string {

    const {overrides, visibility, name, type, isMutable, defaultValueFactory, wrapAssignment,
        getterBodyFactory} = propertyKt;

    const typeString = this.serializeTypeSignature(fileKt, type);

    let result = '';
    if (overrides) {
      result += 'override ';
    }

    result += this.getVisibilityPrefix(visibility);

    result += `${(isMutable ? 'var' : 'val')} `;

    result += `${name}: ${typeString}`;

    if (defaultValueFactory) {
      if (wrapAssignment) {
        const indent = this.indent;
        result += '\n';
        result += indent(indent('= '));
      } else {
        result += ' = ';
      }
      result += defaultValueFactory(fileKt);
    }

    if (getterBodyFactory) {
      result += '\n';
      result += this.indent(`get() {\n${this.indent(getterBodyFactory(fileKt))}}`);
    }
    result += '\n';
    return result;
  }

  public serializeInitBlock(fileKt: FileKt, initBlockKt: InitBlockKt): string {

    const {bodyFactory} = initBlockKt;
    let result = 'init {\n';
    result += this.indent(bodyFactory(fileKt));
    result += '}\n';

    return result;
  }

  protected serializeFunctionSignatureCommon(fileKt: FileKt,
                                             functionSignatureKt: FunctionSignatureKt): string {

    const {annotations, name, parameters, returnType} = functionSignatureKt;
    const indent = this.indent;

    let result = '';
    if (annotations.length > 0) {
      result += annotations
          .map(annotationKt => this.serializeAnnotation(fileKt, annotationKt))
          .join('\n');
      result += '\n';
    }

    if (FunctionKt.assignableFrom(functionSignatureKt)) {
      const {visibility, overrides} = functionSignatureKt;

      result += this.getVisibilityPrefix(visibility);
      if (overrides) {
        result += 'override ';
      }
    }

    result += 'fun ';
    if (functionSignatureKt instanceof ExtensionFunctionKt) {
      const {extendedType} = functionSignatureKt;
      result += `${this.serializeTypeSignature(fileKt, extendedType)}.`;
    }
    result += `${name}(`;

    if (parameters.length > 0) {
      result += '\n';
      for (let i = 0; i < parameters.length; i++) {
        const param = parameters[i];
        if (i > 0) {
          result += ',\n';
        }
        result += indent(indent(this.serializeParameterKt(fileKt, param)))
      }
    }
    result += ')';
    if (returnType) {
      result += `: ${this.serializeTypeSignature(fileKt, returnType)}`
    }

    return result;
  }

  public serializeFunctionSignature(fileKt: FileKt,
                                    functionSignatureKt: FunctionSignatureKt): string {
    return `${this.serializeFunctionSignatureCommon(fileKt, functionSignatureKt)}\n`
  }

  public serializeFunction(fileKt: FileKt, functionKt: FunctionKt): string {
    const {bodyFactory} = functionKt;

    let result = this.serializeFunctionSignatureCommon(fileKt, functionKt);
    result += ' {\n';
    result += this.indent(bodyFactory(fileKt));
    result += '}\n';
    return result;
  }

  public serializeExtensionFunction(fileKt: FileKt,
                                    functionKt: ExtensionFunctionKt): string {

    return this.serializeFunction(fileKt, functionKt);
  }

  public serializeClassMember(fileKt: FileKt, memberKt: ClassMemberKt): string {

    if (memberKt instanceof PropertyKt) {
      return this.serializeProperty(fileKt, memberKt);
    } else if (memberKt instanceof InitBlockKt) {
      return this.serializeInitBlock(fileKt, memberKt);
    } else if (FunctionKt.assignableFrom(memberKt)) {
      return this.serializeFunction(fileKt, memberKt);
    } else {
      throw new Error(`Unexpected ClassMember type: ${memberKt.constructor.name}`);
    }
  }

  public serializePrimaryConstructor(fileKt: FileKt,
                                     constructorKt: PrimaryConstructorKt | null): string {

    if (!constructorKt) {
      return '';
    }
    const {visibility, parameters} = constructorKt;

    let result = '';
    if (visibility !== VisibilityKt.Public) {
      result += ` ${this.getVisibilityPrefix(visibility)}constructor`;
    }

    const indent = this.indent;
    if (parameters.length > 0) {
      result += '(\n';
      for (let i = 0; i < parameters.length; i++) {
        const param = parameters[i];
        if (i > 0) {
          result += ',\n';
        }
        result += indent(indent(this.serializeParameterKt(fileKt, param)));
      }
      result += ')';
    } else if (visibility !== VisibilityKt.Public) {
      result += '()';
    }
    return result;
  }

  public serializeCompanionObjectMember(fileKt: FileKt,
                                        memberKt: ClassMemberKt): string {

    if (FunctionKt.assignableFrom(memberKt)) {
      return this.serializeFunction(fileKt, memberKt);
    } else {
      throw new Error(`Unexpected CompanionObjectMember type: ${memberKt.constructor.name}`);
    }
  }

  public serializeCompanionObject(fileKt: FileKt,
                                  companionObjectKt: CompanionObjectKt): string {

    const {members} = companionObjectKt;

    let result = 'companion object {\n';

    let body = '';
    for (let member of members) {
      body += '\n';
      body += this.serializeCompanionObjectMember(fileKt, member);
    }
    result += this.indent(body);

    result += '}\n';
    return result;
  }

  public serializeClassImplementsOrExtends(fileKt: FileKt,
                                           implementsKt: ExtendsOrImplementsKt): string {

    const {type} = implementsKt;
    let result = this.serializeTypeSignature(fileKt, type);
    const indent = this.indent;
    if (implementsKt instanceof ExtendsKt) {
      const {wrapArguments} = implementsKt;
      const join = wrapArguments ? `,\n` : ', ';
      result += '(';
      if (wrapArguments) {
        result += '\n';
      }
      result += implementsKt.arguments
          .map(arg => {
            const {name, value} = arg;
            const argString = `${name} = ${value}`;
            if (wrapArguments) {
              return indent(indent(argString));
            }
            return argString;
          })
          .join(join);
      result += ')';
    }
    return result;
  }

  public serializeClass(fileKt: FileKt, classKt: AbstractClassKt): string {

    const {name, primaryConstructor, extendsClasses, members} = classKt;
    let result = '';
    if (classKt instanceof ClassKt) {
      const {dataClass} = classKt;
      if (dataClass) {
        result += 'data ';
      }
      result += `class ${name}`;
    } else {
      result += `object ${name}`;
    }

    if (primaryConstructor) {
      result += this.serializePrimaryConstructor(fileKt, primaryConstructor);
    }

    if (extendsClasses.length > 0) {
      const extendsList = extendsClasses
          .map(extendsClass => this.serializeClassImplementsOrExtends(fileKt, extendsClass))
          .join(', ');
      result += ` : ${extendsList}`;
    }

    const hasBody = members.length > 0 || (classKt instanceof ClassKt && classKt.companionObject);

    if (!hasBody) {
      result += '\n';
      return result;
    }

    result += ' {\n';

    const indent = this.indent;
    if (members.length > 0) {
      let body = '';
      let lastMember: ClassMemberKt | null = null;
      for (let member of members) {
        if (!(member instanceof PropertyKt) || (!(lastMember instanceof PropertyKt))) {
          body += '\n';
        }
        body += this.serializeClassMember(fileKt, member);
        lastMember = member;
      }
      result += indent(body);
    }

    if (classKt instanceof ClassKt) {
      const {companionObject} = classKt;
      if (companionObject) {
        result += '\n';
        result += indent(this.serializeCompanionObject(fileKt, companionObject));
      }
    }

    result += '}\n';

    return result;
  }

  public serializeInterface(fileKt: FileKt, interfaceKt: InterfaceKt): string {

    const {annotations, name, members} = interfaceKt;

    let result = '';
    if (annotations.length > 0) {
      result += annotations
          .map(annotationKt => this.serializeAnnotation(fileKt, annotationKt))
          .join('\n');
      result += '\n';
    }
    result += `interface ${name}`;
    if (members.length > 0) {
      result += ' {\n\n';
      result += members
          .map(fun => this.indent(this.serializeFunctionSignature(fileKt, fun)))
          .join('\n');
      result += '}';
    }
    result += '\n';

    return result;
  }

  public serializeFileMember(fileKt: FileKt, memberKt: FileMemberKt): string {

    if (memberKt instanceof ClassKt) {
      return this.serializeClass(fileKt, memberKt);
    } else if (memberKt instanceof ObjectKt) {
      return this.serializeClass(fileKt, memberKt);
    } else if (memberKt instanceof InterfaceKt) {
      return this.serializeInterface(fileKt, memberKt);
    } else if (memberKt instanceof ExtensionFunctionKt) {
      return this.serializeExtensionFunction(fileKt, memberKt);
    } else if (FunctionKt.assignableFrom(memberKt)) {
      return this.serializeFunction(fileKt, memberKt);
    } else {
      throw new Error(`Unexpected FileMember type: ${memberKt.constructor.name}`);
    }
  }

  public serializeFileMembers(fileKt: FileKt): string {

    const {members} = fileKt;

    return members
        .map(member => this.serializeFileMember(fileKt, member))
        .join('\n');
  }

  public serializeImports(fileKt: FileKt): string {

    const {importMapping} = fileKt;
    const imports = Object.keys(importMapping).sort();
    const importStatements = imports
        .filter(kotlinImport => {
          const shortName = shortNameFor(kotlinImport);
          const alias = importMapping[kotlinImport];
          if (shortName !== alias) {
            return true;
          }

          if (/^kotlin\.[a-zA-Z]+$/g.test(kotlinImport)) {
            return false;
          }

          if (/^kotlin\.collections\.[a-zA-Z]+$/g.test(kotlinImport)) {
            return false;
          }

          return !new RegExp(`^${fileKt.packageName}\.[a-zA-Z]+$`).test(kotlinImport);
        })
        .map(kotlinImport => {
          const alias = importMapping[kotlinImport];
          if (kotlinImport.endsWith(`.${alias}`)) {
            return `import ${kotlinImport}`;
          } else {
            return `import ${kotlinImport} as ${alias}`;
          }
        });
    if (importStatements.length === 0) {
      return '';
    }
    return `${importStatements.join('\n')}\n`;
  }

  public serializeFileBody(fileKt: FileKt): string {

    return this.serializeFileMembers(fileKt);
  }

  public serializeFile(fileKt: FileKt): string {

    const {licenseHeader, packageName} = fileKt;
    let result = '';
    if (licenseHeader !== '') {
      result += licenseHeader;
      if (!licenseHeader.endsWith('\n')) {
        result += '\n';
      }
    }
    result += `package ${packageName}\n`;

    // has to be evaluated before imports
    const fileBody = this.serializeFileBody(fileKt);

    const imports = this.serializeImports(fileKt);

    if (imports !== '') {
      result += `\n${imports}`
    }

    if (fileBody !== '') {
      result += `\n${fileBody}`;
    }

    return result;
  }

}
