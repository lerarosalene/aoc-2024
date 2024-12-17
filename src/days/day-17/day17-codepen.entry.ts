import { parse } from ".";
import { compileToCode } from "./compiler";

declare const window: {
  compile: typeof compileToCode;
  parse: typeof parse;
};

window.compile = compileToCode;
window.parse = parse;
