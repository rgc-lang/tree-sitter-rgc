# tree-sitter-rgc

A [Tree-sitter](https://tree-sitter.github.io/tree-sitter/) grammar for the
[RGC](https://github.com/rgc-lang/rgc) programming language — a Python-style,
compiled, statically typed language with ownership/borrow checking and an LLVM
backend.

Used by the [RGC Zed extension](https://github.com/rgc-lang/zed-rgc) and
available for any other tree-sitter host (Neovim, helix, etc.).

## Structure

```
grammar.js        the grammar definition (tree-sitter source of truth)
src/parser.c      generated parser (run `npm run generate` to rebuild)
package.json      npm package metadata
```

## Usage

```sh
npm install
npm run generate   # rebuild src/parser.c from grammar.js
npm test       # run the grammar's test corpus
```

## License

Apache-2.0. See [LICENSE](LICENSE).