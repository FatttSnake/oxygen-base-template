interface Window {
    converter: Converter
}

type Language = 'C' | 'C++' | 'CQL' | 'CSS' | 'Go' | 'HTML' | 'Java' | 'JavaScript' | 'JSON' | 'JSX' |
    'LESS' | 'Liquid' | 'MariaDB SQL' | 'Markdown' | 'MS SQL' | 'MySQL' | 'PHP' | 'PLSQL' | 'PostgreSQL' | 'Python' |
    'Rust' | 'Sass' | 'SCSS' | 'SQL' | 'SQLite' | 'TSX' | 'TypeScript' | 'WebAssembly' | 'XML' | 'YAML' |
    'APL' | 'PGP' | 'ASN.1' | 'Asterisk' | 'Brainfuck' | 'Cobol' | 'C#' | 'Clojure' | 'ClojureScript' | 'Closure Stylesheets (GSS)' |
    'CMake' | 'CoffeeScript' | 'Common Lisp' | 'Cypher' | 'Cython' | 'Crystal' | 'D' | 'Dart' | 'diff' | 'Dockerfile' |
    'DTD' | 'Dylan' | 'EBNF' | 'ECL' | 'edn' | 'Eiffel' | 'Elm' | 'Erlang' | 'Esper' | 'Factor' |
    'FCL' | 'Forth' | 'Fortran' | 'F#' | 'Gas' | 'Gherkin' | 'Groovy' | 'Haskell' | 'Haxe' | 'HXML' |
    'HTTP' | 'IDL' | 'JSON-LD' | 'Jinja2' | 'Julia' | 'Kotlin' | 'LiveScript' | 'Lua' | 'mIRC' | 'Mathematica' |
    'Modelica' | 'MUMPS' | 'Mbox' | 'Nginx' | 'NSIS' | 'NTriples' | 'Objective-C' | 'Objective-C++' | 'OCaml' | 'Octave' |
    'Oz' | 'Pascal' | 'Perl' | 'Pig' | 'PowerShell' | 'Properties files' | 'ProtoBuf' | 'Pug' | 'Puppet' | 'Q' |
    'R' | 'RPM Changes' | 'RPM Spec' | 'Ruby' | 'SAS' | 'Scala' | 'Scheme' | 'Shell' | 'Sieve' | 'Smalltalk' |
    'Solr' | 'SML' | 'SPARQL' | 'Spreadsheet' | 'Squirrel' | 'Stylus' | 'Swift' | 'sTeX' | 'LaTeX' | 'SystemVerilog' |
    'Tcl' | 'Textile' | 'TiddlyWiki' | 'Tiki wiki' | 'TOML' | 'Troff' | 'TTCN' | 'TTCN_CFG' | 'Turtle' | 'Web IDL' |
    'VB.NET' | 'VBScript' | 'Velocity' | 'Verilog' | 'VHDL' | 'XQuery' | 'Yacas' | 'Z80' | 'MscGen' | 'Xù' |
    'MsGenny' | 'Vue' | 'Angular Template'

interface Converter {
    firstTitle: string
    firstLanguage?: Language
    secondTitle: string
    secondLanguage?: Language
    forwardConvert?: (input: string) => Promise<string>
    firstFormat?: (input: string, indent: number) => Promise<string>
    backwardConvert?: (input: string) => Promise<string>
    secondFormat?: (input: string, indent: number) => Promise<string>
}
