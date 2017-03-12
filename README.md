# Restrulz Generator

[![Build Status](https://travis-ci.org/gantsign/restrulz-gen.svg?branch=master)](https://travis-ci.org/gantsign/restrulz-gen)
[![codecov](https://codecov.io/gh/gantsign/restrulz-gen/branch/master/graph/badge.svg)](https://codecov.io/gh/gantsign/restrulz-gen)

A code/documentation generator for REST services defined using the
[Restrulz](https://github.com/gantsign/restrulz) domain specific language.

**Warning: this project is far from feature complete and is not ready for general use.**

# Goals

* Generate Swagger specifications
* Generate client & server API code
* Extendable using object-oriented and functional programming techniques
* Separation of concerns
    * e.g. object models, parsing & serialization, API generation should all
      have separate generators and you should be able to mix and match
      implementations
* Polyglot output
    * e.g. you may want to use Kotlin data classes for defining your object
      model but Java interfaces for your controller API
* Low level code generation for parsing & serialization
    * This will be more performant and allow parsing & serialization to be
      debugged more easily and code coverage reports to be generated
* Easily integrated into builds for non JVM languages
* Integrated parsing & schema validation for more helpful schema validation
  messages (e.g. they can report where in the input the error occurred)
* Null safety
    * omitted strings are converted to empty strings during parsing
    * omitted arrays are converted to empty arrays during parsing
* Blank string safety
    * blank strings are converted to empty strings during parsing
* Generated parsing code will terminate if input exceeds the range specified in
  the specification, to protect against DOS attacks
* Support for wrapping simple types as objects for static typing
* Support for mutible & immutable models
* Support for passing through unknown properties
    * For forwards compatibility it can sometimes be useful to pass through
      JSON properties that were unknown at build time
* Pretty printed output

# Non-goals

* Monolithic templates
    * the Swagger code-gen works using monolithic Mustache templates, these are
      difficult to extend without completely replacing them and are difficult
      to read due to all the conditional output
* Annotating the code with all the API documentation for use at runtime
    * generated code should use regular code comments where appropriate
    * API documentation can be written to a separate file for use at runtime
    * the goal is for the generated code to resemble hand written code
* Generate once then maintain manually
    * The generated code is intended to be generated on every build rather
      than manually edited

# Why TypeScript and NPM?

* Scripting support enables you to use off the shelf generators or to easily
  add your own generators and customizations
* Scripting support avoids the need for a separate configuration file
* Static typing support makes for robust code and good IDE support
* Dynamic typing support enables more techniques for customizing the generators
* TypeScript has native support for multi-line string templates
* TypeScript has native support for JSON
* Users can use JavaScript or TypeScript
* JavaScript is the most widely known language by developers
* NPM provides an easy way of distributing and installing custom generators
* Node+NPM are easier to integrate into another build systems than Java+Maven

# Related projects

* [Restrulz](https://github.com/gantsign/restrulz) the language grammar, DSL
  parser and IDE plugins

* [Restrulz JVM](https://github.com/gantsign/restrulz-jvm) JVM libraries
  required by code generated for the JVM

* [Restrulz Demo](https://github.com/gantsign/restrulz-demo) see Restrulz and
  Restrulz generator in action

# License

This project is under the
[Apache 2 Licence](https://raw.githubusercontent.com/gantsign/restrulz-gen/master/LICENSE).

# Author information

John Freeman

GantSign Ltd.
Company No. 06109112 (registered in England)
