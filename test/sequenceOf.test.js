const { TextEncoder } = require('util');
const A = require("../index");
//const {
//Parser,
//parse,
//char,
//anyChar,
//str,
//digit,
//fail,
//exactly,
//peek,
//many,
//many1,
//digits,
//letter,
//letters,
//regex,
//anyOfString,
//namedSequenceOf,
//sequenceOf,
//sepBy,
//sepBy1,
//choice,
//between,
//everythingUntil,
//everyCharUntil,
//pipeParsers,
//composeParsers,
//anythingExcept,
//anyCharExcept,
//lookAhead,
//possibly,
//skip,
//whitespace,
//optionalWhitespace,
//takeRight,
//takeLeft,
//recursiveParser,
//tapParser,
//decide,
//mapTo,
//toPromise,
//toValue,
//succeedWith,
//errorMapTo,
//either,
//coroutine,
//getData,
//setData,
//mapData,
//startOfInput,
//endOfInput,
//withData,
//} = require('../index');

const encoder = new TextEncoder();

const expectedSuccessTest = (parser, expectation, testingString) => () => {
  const out = parser.run(testingString);
  if (out.isError) {
    failLeft(out);
  } else {
    expect(out.result).toEqual(expectation);
  }
};

const whitespaceSurrounded = (parser) =>
  A.between(A.optionalWhitespace)(A.optionalWhitespace)(parser);

const betweenParentheses = (parser) =>
  A.between(whitespaceSurrounded(A.char("(")))(
    whitespaceSurrounded(A.char(")"))
  )(parser);

//const betweenParentheses = (parser) => {
//return A.coroutine(run => {
//return run(A.between(whitespaceSurrounded(A.char("(")))(
//whitespaceSurrounded(A.char(")"))
//)(parser));
//});
//};

const plus = A.char("+");
const minus = A.char("-");
const times = A.char("*");
const divide = A.char("/");

// Utilize repetition instead of recursion to define binary expressions
const binaryExpression = (operator) => (parser) =>
  A.sequenceOf([
    //A.tapParser(x => console.log("binaryExpression", x)),
    whitespaceSurrounded(parser),
    A.many1(
      A.sequenceOf([
        whitespaceSurrounded(operator),
        whitespaceSurrounded(parser),
      ])
    ),
  ]).map(([initialTerm, expressions]) =>
    // Flatten the expressions
    [initialTerm, ...expressions].reduce((acc, curr) =>
      // Reduce the array into a left-recursive tree
      Array.isArray(curr) ? [curr[0], acc, curr[1]] : curr
    )
  );

// Each precedence group consists of a set of equal precedence terms,
// followed by a fall-through to the next level of precedence
const expression = A.recursiveParser(() =>
  A.choice([additionOrSubtraction, term])
);
const term = A.recursiveParser(() =>
  A.choice([multiplicationOrDivision, factor])
);
const factor = A.recursiveParser(() =>
  A.choice([A.digits, betweenParentheses(expression)])
);

// Group operations of the same precedence together
const additionOrSubtraction = binaryExpression(A.choice([plus, minus]))(term);
const multiplicationOrDivision = binaryExpression(A.choice([times, divide]))(
  factor
);

//test("haha", () => {
//let parser = sequenceOf([str('abc'), regex(/^[0-9-]+/), letters]);
//let expected = ['abc', '9823-2134-2-24-2--', 'hallo'];
//let input = 'abc9823-2134-2-24-2--hallo';

//let result = parser.run(input);
//console.log('result', result);
//expect(10).toEqual(10);
//});

test("foo", () => {
  //never finished
  let result = A.many(expression).run("9 + ((((((((((5)))))))))) - 4 * 4 / 3")

  // ~9 seconds
  //let result = A.many(expression).run("9 + (((((((((5))))))))) - 4 * 4 / 3")

  // ~3 seconds
  //let result = A.many(expression).run("9 + ((((((((5)))))))) - 4 * 4 / 3")

  // ~1.7 seconds
  //let result = A.many(expression).run("9 + (((((((5))))))) - 4 * 4 / 3")
  console.log('result', result);
});
