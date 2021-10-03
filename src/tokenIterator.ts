import {Token,TokenKind} from "./lexer.ts";
import ParsingResult from "./parsingResult.ts";
import { Argument, Defunc } from "./grammar.ts";
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

    if(!pointer || !chainedResults || !chainedFailure || !chainedFailureMsg)
      throw new Error("Push/Pop was not performed correctly")
    this.pointer = pointer;
    this.chainedResults = chainedResults;
    this.chainedFailure = chainedFailure;
    this.chainedFailureMsg = chainedFailureMsg;

    this.popped = [];
  }

  oneOf<T>(...funcs: (Defunc<T>)[]): ParsingResult<T> {
    let r_func: ParsingResult<T> = ParsingResult.fail("Must pass funcs to One of");
    for (const fn of funcs) {
      r_func = fn(this);
      if (!r_func.isFailure) return r_func;
    }
    return r_func;
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
    this.chain(delimiters[0])
    while(true){
      if(this.isNext(delimiters[1]))
        break
      this.chain(target);
      if(this.isNext(separator))
        continue;
    }
    return this;
  }

}

  interface RepeatSpecs {
    separator: Defunc<any>,
    target: Defunc<any>,
    delimiters: Defunc<any>[],
  }

  let o:RepeatSpecs = {
    separator: defuncFrom(TokenKind.Comma),
    target: Argument,
    delimiters: [defuncFrom(TokenKind.LeftParen),defuncFrom(TokenKind.RightParen)],
  }

export function defuncFrom<K extends TokenKind>(kind: K): Defunc<K> {
  return (iter: TokenIterator) => {
    let t = iter.next();
    if (t.kind === kind) return ParsingResult.success<K>().define(kind);
    else return ParsingResult.fail(`Expected ${kind} but got ${t.toString} `);
  };
}
