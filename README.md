# scanpiler-tool-deno

A tool that is able to produce a Deno scanner from a scanner definition.


## Simple Example

To illustrate how to use the scanpiler Deno generation I'll use the [scanpiler CLI](https://github.com/littlelanguages/scanpiler-cli).

The following is a scanner definition for a simple C style language.

```
tokens
    If = "if";
    Else = "else";
    While = "while";

    LCurly = "{";
    LParen = "(";
    Minus = "-";
    Plus = "+";
    RCurly = "}";
    RParen = ")";
    
    ID = (alpha + '_') {alpha + digit + '_'};
    ConstantInt = digit {digit};

comments
    "/*" to "*/" nested;
    "//" {!cr};

fragments
    digit = '0'-'9';
    alpha = 'a'-'z' + 'A'-'Z';
    cr = chr(10);
```

Place this content into the file `simpleC.ll` and execute the following script to perform the translation of the definition into Typescript:

```bash
deno run --allow-read --allow-write "https://raw.githubusercontent.com/littlelanguages/scanpiler-cli/main/mod.ts" deno simpleC.ll
```

If this is the first time you have run the CLI you will probably see something similar to the following.

```
Download https://raw.githubusercontent.com/littlelanguages/scanpiler-cli/main/mod.ts
Download https://raw.githubusercontent.com/littlelanguages/deno-lib-console-cli/0.0.5/mod.ts
Download https://raw.githubusercontent.com/littlelanguages/scanpiler-tool-deno/0.0.3/mod.ts
Download https://raw.githubusercontent.com/littlelanguages/scanpiler-tool-viz/0.0.3/mod.ts
Download https://raw.githubusercontent.com/littlelanguages/deno-lib-text-prettyprint/0.2.2/mod.ts
Download https://deno.land/std@0.63.0/path/mod.ts
Download https://raw.githubusercontent.com/littlelanguages/scanpiler/0.0.1/parser/dynamic.ts
Download https://raw.githubusercontent.com/littlelanguages/scanpiler/0.0.1/la/fa.ts
Download https://raw.githubusercontent.com/littlelanguages/scanpiler/0.0.1/la/nfa.ts
Download https://raw.githubusercontent.com/littlelanguages/scanpiler/0.0.1/la/definition.ts
Download https://raw.githubusercontent.com/littlelanguages/scanpiler/0.0.1/la/dfa.ts
Download https://raw.githubusercontent.com/littlelanguages/deno-lib-data-set/0.0.1/mod.ts
Download https://deno.land/std@0.63.0/path/_constants.ts
Download https://deno.land/std@0.63.0/path/win32.ts
Download https://deno.land/std@0.63.0/path/posix.ts
Download https://deno.land/std@0.63.0/path/common.ts
Download https://deno.land/std@0.63.0/path/separator.ts
Download https://deno.land/std@0.63.0/path/_interface.ts
Download https://deno.land/std@0.63.0/path/glob.ts
Download https://deno.land/std@0.63.0/path/_globrex.ts
Download https://deno.land/std@0.63.0/_util/assert.ts
Download https://deno.land/std@0.63.0/path/_util.ts
Download https://raw.githubusercontent.com/littlelanguages/scanpiler/0.0.1/data/set.ts
Download https://raw.githubusercontent.com/littlelanguages/scanpiler/0.0.1/la/la.ts
Download https://raw.githubusercontent.com/littlelanguages/scanpiler/0.0.1/parser/ast.ts
Download https://raw.githubusercontent.com/littlelanguages/scanpiler/0.0.1/data/either.ts
Download https://raw.githubusercontent.com/littlelanguages/scanpiler/0.0.1/parser/errors.ts
Download https://raw.githubusercontent.com/littlelanguages/scanpiler/0.0.1/parser/parser.ts
Download https://raw.githubusercontent.com/littlelanguages/scanpiler/0.0.1/parser/scanner.ts
Download https://raw.githubusercontent.com/littlelanguages/scanpiler/0.0.1/parser/location.ts
Download https://raw.githubusercontent.com/littlelanguages/deno-lib-data-either/0.0.1/mod.ts
Download https://raw.githubusercontent.com/littlelanguages/scanpiler-deno-lib/0.0.1/location.ts
Download https://raw.githubusercontent.com/littlelanguages/scanpiler-deno-lib/0.0.1/abstract-scanner.ts
Check https://raw.githubusercontent.com/littlelanguages/scanpiler-cli/main/mod.ts
```

This is the downloading of all the libraries that collectively make up the CLI.  Note that the CLI runs silently so it will give you no visual feedback if the source file is present and contains no syntactic or logical errors.

Hsving succesfully run the CLI a single file has been created - `scanner.ts`.  Looking through this file there are a couple of things that are worth noting:

- An enumeration called `TToken` listing all of the tokens that were defined in `simpleC.ll`.  These are

```ts
export enum TToken {
  If,
  Else,
  While,
  LCurly,
  LParen,
  Minus,
  Plus,
  RCurly,
  RParen,
  ID,
  ConstantInt,
  EOS,
  ERROR,
}
```
- The tokens `EOS` and `ERROR` have been included into the collection of tokens and represent end-of-stream and error tokens respectively.
- A `Token` is exported where a token is a 3-tuple of the type `[TToken, Location, string]`.  The first component takes on a value from the above enumeration, the second is the location in the source text and the final component is the text that was matched.
- The class `Scanner` is where it all happens.  It is constructed with a string of the content that the scanner needs to run against.  This class has two methods that are used to control the scanning process.
  - `current` is a function that returns the current token, and
  - `next` discards the current token and advances the scanner to the next token.  If `current()` is returning `EOS` then `next()` does not effect any change to the scanner.

So let's give the scanner a run.  Create the file `show.ts` in the same directory where `scanner.ts` is located with the following content.

```ts
iimport { mkScanner, TToken } from "./scanner.ts";

const scanner = mkScanner("if else 123 hello");

while (true) {
  console.log(scanner.current());
  if (scanner.current()[0] == TToken.EOS) {
    break;
  }
  scanner.next();
}
```

Executing this program using

```bash
deno run show.ts
```

You should be seeing the following output.

```json
[
  0,
  {
    tag: "Range",
    start: { tag: "Coordinate", offset: 0, line: 1, column: 1 },
    end: { tag: "Coordinate", offset: 1, line: 1, column: 2 }
  },
  "if"
]
[
  1,
  {
    tag: "Range",
    start: { tag: "Coordinate", offset: 3, line: 1, column: 4 },
    end: { tag: "Coordinate", offset: 6, line: 1, column: 7 }
  },
  "else"
]
[
  10,
  {
    tag: "Range",
    start: { tag: "Coordinate", offset: 8, line: 1, column: 9 },
    end: { tag: "Coordinate", offset: 10, line: 1, column: 11 }
  },
  "123"
]
[
  9,
  {
    tag: "Range",
    start: { tag: "Coordinate", offset: 12, line: 1, column: 13 },
    end: { tag: "Coordinate", offset: 16, line: 1, column: 17 }
  },
  "hello"
]
[ 11, { tag: "Coordinate", offset: 17, line: 1, column: 18 }, "" ]
```

Finally, if you are interested in looking at the internals of scanner's `next` method, it is really useful to work off of graphical view of the state machine.  To do this use the [viz tool](https://github.com/littlelanguages/scanpiler-tool-viz) which creates two dot files that can be viewed using [Graphviz](https://graphviz.org).  To produce the dot files run the following CLI:

```
deno run --allow-read --allow-write "https://raw.githubusercontent.com/littlelanguages/scanpiler-cli/main/mod.ts" viz simpleC.ll
```

Now you will see that the files `simpleC-dfa.dot` and `simpleC-nfa.dot` have been silently created.  The NFA is a intermediate representation used during scanner generation so it is more for interest rather than being helpful in understanding the internals of `next`.  The DFA however is the useful piece.

![simpleC DFA](./.doc/simpleC-dfa.svg)
