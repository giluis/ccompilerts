import {Token,TokenKind} from "./lexer";
import ParsingResult from "./parsingResult";
import { Defunc } from "./grammar";
export default class TokenIterator {
  tokens: Token[];
  pointer: number;
  chainedResults: ParsingResult<any>[];
  chainedFailure: boolean;
  chainedFailureMsg: string;
  popped: [number, ParsingResult<any>[], boolean, string] | [];

  constructor(tokens: Token[]) {
    this.tokens = [...tokens];
    this.pointer = 0;
    this.chainedResults = [];
    this.chainedFailure = false;
    this.chainedFailureMsg = "";
    this.popped = [];
  }

  push() {
    this.popped = [
      this.pointer,
      this.chainedResults,
      this.chainedFailure,
      this.chainedFailureMsg,
    ];
  }

  pop() {
    const [pointer, chainedResults, chainedFailure, chainedFailureMsg] =
      this.popped;
    this.pointer = pointer;
    this.chainedResults = chainedResults;
    this.chainedFailure = chainedFailure;
    this.chainedFailureMsg = chainedFailureMsg;

    this.popped = [];
  }

  oneOf<T>(...funcs: (Defunc<T> | TokenKind)[]): ParsingResult<T> {
    let r_func: ParsingResult<T>;
    let fn;
    for (const e of funcs) {
      if (typeof e === "function") {
        fn = e as Defunc<T>;
      } else {
        fn = defuncFrom(e as TokenKind);
      }
      r_func = fn(this);
      if (!r_func.isFailure) return r_func;
    }
    return ParsingResult.fail<T>(r_func.failureMsg);
  }

  single(kind: TokenKind): ParsingResult<Token> {
    let token = this.next();
    if (token.kind === kind)
      return ParsingResult.success<Token>().define(token);
    else
      ParsingResult.fail(
        `Expected ${kind} at position ${
          this.pointer
        }, but got ${token.toString()}`
      );
  }

  release<T>(fn: (results: ParsingResult<any>[]) => T): ParsingResult<T> {
    let result;
    if (this.chainedFailure)
      result = ParsingResult.fail<T>(this.chainedFailureMsg);
    result = ParsingResult.success<T>().define(fn(this.chainedResults));

    this.reset();
    return result;
  }

  reset() {
    this.chainedResults = [];
    this.chainedFailure = false;
    this.chainedFailureMsg = "";
  }

  evalChainFailure() {
    return this.chainedResults.reduce(
      (acc, cur) => acc && !cur.isFailure,
      true
    );
  }

  chain(...expects: Defunc<any>[]): this {
    for (const fn of expects) {
      let r: ParsingResult<any>;
      r = fn(this);
      if (r.isFailure) {
        this.chainedFailure = true;
        this.chainedFailureMsg = r.failureMsg;
        return this;
      }
      this.chainedResults.push(r);
    }
    return this;
  }

  expect<T>(
    expected: Defunc<T> | TokenKind
  ): ParsingResult<T | TokenKind> {
    if (typeof expected === "function") {
      return expected(this);
    } else {
      let f = defuncFrom(expected as TokenKind);
      return f(this);
    }
  }

  isNext(func: Defunc<any>): boolean {
    this.push();
    let r = func(this);
    this.pop();
    return !r.isFailure;
  }

  /**
   * Discards Results that are not on a multiple of index
   * @param index
   */
  filterResults(index: number) {
    this.chainedResults = this.chainedResults.filter((r, i) => i % index === 0);
    return this;
  }

  consumeUntil(
    stopFunc: Defunc<any>,
    ...funcs: Defunc<any>[]
  ): this {
    while (!this.isNext(stopFunc)) {
      this.chain(...funcs);
      if (this.chainedFailure) break;
    }
    return this;
  }

  next() {
    let token = this.tokens[this.pointer];
    this.pointer += 1;
    return token;
  }

  repeat(info:RepeatSpecs){
    const {separator, target, delimiters} = info;
  }

}

  interface RepeatSpecs {
    separator: Defunc<any>,
    target: Defunc<any>,
    delimiters: Defunc<any>[],
  }

export function defuncFrom<K extends TokenKind>(kind: K): Defunc<K> {
  return (iter: TokenIterator) => {
    let t = iter.next();
    if (t.kind === kind) return ParsingResult.success<K>().define(kind);
    else return ParsingResult.fail(`Expected ${kind} but got ${t.toString} `);
  };
}
