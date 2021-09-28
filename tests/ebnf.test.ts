import { assert } from "../deps.ts";
import {
isBinOp,
    isReturnStatement,
    TBinaryOperation,
    TReturnStatement,
} from "../src/ebnf.ts";
import { TokenKind } from "../src/lexer.ts";

testIsReturnStatement();
function testIsReturnStatement() {
    let s: TReturnStatement = {
        statementType: TokenKind.Kw_Return,
        returnValue: "2",
    };
    let result: boolean = isReturnStatement(s);
    assert(result);
    result = isReturnStatement(4);
    assert(!result);
}
