/**
 * @file tree-sitter grammar for the RGC programming language.
 *
 * RGC is a Python-style, compiled, statically typed language with
 * ownership/borrow checking and an LLVM backend.
 *
 * The grammar is derived from the official TextMate grammar in
 * https://github.com/rgc-lang/vscode-rgc (syntaxes/rgc.tmLanguage.json)
 * and validated against the example programs in
 * https://github.com/rgc-lang/rgc/tree/main/examples.
 */

// Helpers
function commaSep(rule) {
  return optional(seq(rule, repeat(seq(',', rule)), optional(',')));
}

function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)), optional(','));
}

module.exports = grammar({
  name: 'rgc',

  extras: ($) => [/\s/, $.comment],

  conflicts: ($) => [
    [$.call_expression, $.expression],
    [$.call_expression, $.borrow_expression],
  ],

  rules: {
    source_file: ($) => repeat($._statement),

    _statement: ($) => choice(
      $.function_definition,
      $.class_definition,
      $.enum_definition,
      $.interface_definition,
      $.import_statement,
      $.if_statement,
      $.for_statement,
      $.while_statement,
      $.match_statement,
      $.case_clause,
      $.break_statement,
      $.continue_statement,
      $.pass_statement,
      $.field_declaration,
      $.expression_statement,
    ),

    block: ($) => seq(
      '{',
      repeat($._statement),
      optional($.return_statement),
      '}',
    ),

    function_definition: ($) => seq(
      'def',
      field('name', $.identifier),
      optional($.generic_parameters),
      field('parameters', $.parameters),
      optional(seq('->', field('return_type', $._type))),
      optional(field('body', $.block)),
    ),

    generic_parameters: ($) => seq('[', commaSep1($.identifier), ']'),

    parameters: ($) => seq('(', optional(commaSep($.parameter)), ')'),

    parameter: ($) => choice(
      $.identifier,
      seq($.identifier, ':', $._type),
    ),

    _type: ($) => choice(
      $.type,
      $.identifier,
      $.borrow_type,
    ),

    type: ($) => choice('int', 'float', 'bool', 'str'),

    borrow_type: ($) => seq('@', optional('var'), $._type),

    class_definition: ($) => seq(
      'class',
      field('name', $.identifier),
      optional(seq(':', field('supertype', $.identifier))),
      field('body', $.block),
    ),

    enum_definition: ($) => seq(
      'enum',
      field('name', $.identifier),
      field('body', $.block),
    ),

    interface_definition: ($) => seq(
      'interface',
      field('name', $.identifier),
      field('body', $.block),
    ),

    import_statement: ($) => seq(
      'import',
      field('module', choice($.identifier, seq($.identifier, repeat(seq('/', $.identifier))))),
    ),

    if_statement: ($) => seq(
      'if',
      field('condition', $.expression),
      field('consequence', $.block),
      repeat(seq('elif', field('condition', $.expression), field('consequence', $.block))),
      optional(seq('else', field('alternative', $.block))),
    ),

    for_statement: ($) => seq(
      'for',
      field('name', $.identifier),
      'in',
      field('iterable', $.expression),
      field('body', $.block),
    ),

    while_statement: ($) => seq(
      'while',
      field('condition', $.expression),
      field('body', $.block),
    ),

    match_statement: ($) => seq(
      'match',
      field('value', $.expression),
      field('body', $.block),
    ),

    case_clause: ($) => seq(
      'case',
      field('pattern', $.expression),
      '=>',
      field('body', choice($.expression, $.block)),
    ),

    return_statement: ($) => choice(
      'return',
      seq('return', $.expression),
    ),
    break_statement: ($) => 'break',
    continue_statement: ($) => 'continue',
    pass_statement: ($) => 'pass',

    field_declaration: ($) => seq(
      field('name', $.identifier),
      ':',
      field('type', $._type),
      optional(seq('=', field('value', $.expression))),
    ),

    expression_statement: ($) => seq($.expression, optional(';')),

    expression: ($) => choice(
      $.assignment,
      $.binary_expression,
      $.unary_expression,
      $.call_expression,
      $.member_expression,
      $.borrow_expression,
      $.parenthesized_expression,
      $.identifier,
      $.number,
      $.string,
      $.boolean,
      $.none,
    ),

    assignment: ($) => prec.right(1, seq(
      field('left', choice($.identifier, $.member_expression)),
      field('operator', choice('=', '+=', '-=', '*=', '/=')),
      field('right', $.expression),
    )),

    binary_expression: ($) => prec.left(1, seq(
      field('left', $.expression),
      field('operator', choice(
        '+', '-', '*', '/', '%', '**', '//',
        '==', '!=', '<=', '>=', '<', '>',
        '<<', '>>', '&', '|', '^',
        'and', 'or',
      )),
      field('right', $.expression),
    )),

    unary_expression: ($) => prec(2, seq(
      choice('!', '-', 'not'),
      field('operand', $.expression),
    )),

    call_expression: ($) => seq(
      field('function', choice($.identifier, $.member_expression)),
      field('arguments', $.arguments),
    ),

    member_expression: ($) => prec(2, seq(
      field('object', choice(
        $.identifier,
        $.call_expression,
        $.member_expression,
        $.parenthesized_expression,
        $.string,
      )),
      '.',
      field('property', $.identifier),
    )),

    borrow_expression: ($) => seq(
      '@',
      optional('var'),
      field('value', choice($.identifier, $.member_expression, $.call_expression)),
    ),

    parenthesized_expression: ($) => seq('(', $.expression, ')'),

    arguments: ($) => seq('(', optional(commaSep($.expression)), ')'),

    identifier: ($) => /[A-Za-z_][A-Za-z0-9_]*/,

    number: ($) => choice(
      /0[xX][0-9a-fA-F_]+/,
      /0[bB][01_]+/,
      /0[oO][0-7_]+/,
      /[0-9][0-9_]*(\.[0-9][0-9_]*)?([eE][+-]?[0-9]+)?/,
    ),

    string: ($) => seq('"', repeat(choice($.escape_sequence, /[^"\\]/)), '"'),

    escape_sequence: ($) => seq('\\', /["nrt0\\]/),

    boolean: ($) => choice('True', 'False'),

    none: ($) => 'None',

    comment: ($) => choice(
      seq('#', /.*/),
      seq('/*', /[^*]*\*+([^/*][^*]*\*+)*\//),
    ),
  },
});