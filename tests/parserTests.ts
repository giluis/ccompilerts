import lex, { Token, TokenKind } from "./lexer.ts";
import { parserFunctionFromToken } from "./parser.ts";
import { assert } from "./deps.ts";

export function testParserFunctionFromTokenKwReturn() {
    //Kw_return
    let resultingFunction = parserFunctionFromToken(TokenKind.Kw_Return);
    let tokens: Token[] = lex("return 2;");
    let [nextPointer, parsingResult] = resultingFunction(0, tokens);
    assert(nextPointer === 1);
    assert(parsingResult.build().kind, TokenKind.Kw_Return);

    resultingFunction = parserFunctionFromToken(TokenKind.Kw_Return);
    tokens = lex("return 2;");
    [nextPointer, parsingResult] = resultingFunction(1, tokens);
    assert(nextPointer === -1);
    assert(parsingResult.isFailure === true);
}

export function testParserFunctionFromTokenKwInt() {
    //Kw_return
    let resultingFunction = parserFunctionFromToken(TokenKind.Kw_Int);
    let tokens: Token[] = lex("int main(){}");
    let [nextPointer, parsingResult] = resultingFunction(0, tokens);
    assert(nextPointer === 1);
    assert(parsingResult.build().kind, TokenKind.Kw_Int);

    [nextPointer, parsingResult] = resultingFunction(1, tokens);
    assert(nextPointer === -1);
    assert(parsingResult.isFailure === true);
}

export function testParserFunctionFromTokenLitInt(){

    //Lit_int
    let resultingFunction = parserFunctionFromToken(TokenKind.Lit_Int);
    let tokens = lex("return 2;");
    let [nextPointer, parsingResult] = resultingFunction(1, tokens);
    assert(nextPointer === 2);
    const buildResult = parsingResult.build()
    assert(buildResult.kind, TokenKind.Lit_Int);
    assert(buildResult.value, "2");


    resultingFunction = parserFunctionFromToken(TokenKind.Lit_Int);
    tokens = lex("return 2;");
    [nextPointer, parsingResult] = resultingFunction(2, tokens);
    assert(nextPointer === -1);
    assert(parsingResult.isFailure === true);
}
export function testParserFunctionFromTokenSemiColon(){

    //semi_colon
    let resultingFunction = parserFunctionFromToken(TokenKind.SemiColon);
    let tokens = lex("return 2;");
    let [nextPointer, parsingResult] = resultingFunction(2, tokens);
    assert(nextPointer === 3);
    const buildResult = parsingResult.build()
    assert(buildResult.kind, TokenKind.Lit_Int);
    assert(buildResult.value, ";");


    [nextPointer, parsingResult] = resultingFunction(0, tokens);
    assert(nextPointer === -1);
    assert(parsingResult.isFailure === true);
}

export function testParserFunctionFromTokenLeftParen(){

    //semi_colon
    let resultingFunction = parserFunctionFromToken(TokenKind.LeftParen);
    let tokens = lex("main()");
    let [nextPointer, parsingResult] = resultingFunction(1, tokens);
    assert(nextPointer === 2);
    const buildResult = parsingResult.build()
    assert(buildResult.kind, TokenKind.Lit_Int);
    assert(buildResult.value, "(");


    [nextPointer, parsingResult] = resultingFunction(0, tokens);
    assert(nextPointer === -1);
    assert(parsingResult.isFailure === true);
}



export function testParserFunctionFromTokenRight(){

    //semi_colon
    let resultingFunction = parserFunctionFromToken(TokenKind.RightParen);
    let tokens = lex("main()");
    let [nextPointer, parsingResult] = resultingFunction(2, tokens);
    assert(nextPointer === 3);
    const buildResult = parsingResult.build()
    assert(buildResult.kind, TokenKind.LeftCurly);
    assert(buildResult.value, ")");


    [nextPointer, parsingResult] = resultingFunction(0, tokens);
    assert(nextPointer === -1);
    assert(parsingResult.isFailure === true);
}
export function testParserFunctionFromTokenLeftCurly(){

    //semi_colon
    let resultingFunction = parserFunctionFromToken(TokenKind.LeftCurly);
    let tokens = lex("main(){}");
    let [nextPointer, parsingResult] = resultingFunction(3, tokens);
    assert(nextPointer === 4);
    const buildResult = parsingResult.build()
    assert(buildResult.kind, TokenKind.LeftCurly);
    assert(buildResult.value, "{");


    [nextPointer, parsingResult] = resultingFunction(0, tokens);
    assert(nextPointer === -1);
    assert(parsingResult.isFailure === true);
}

export function testParserFunctionFromTokenRightCurly(){

    //semi_colon
    let resultingFunction = parserFunctionFromToken(TokenKind.RightCurly);
    let tokens = lex("main(){}");
    let [nextPointer, parsingResult] = resultingFunction(4, tokens);
    assert(nextPointer === 5);
    const buildResult = parsingResult.build()
    assert(buildResult.kind, TokenKind.LeftCurly);
    assert(buildResult.value, "{");


    [nextPointer, parsingResult] = resultingFunction(3, tokens);
    assert(nextPointer === -1);
    assert(parsingResult.isFailure === true);
}

export function testParserFunctionFromTokenIdentifier(){
    //semi_colon
    let resultingFunction = parserFunctionFromToken(TokenKind.Identifier);
    let tokens = lex("main(){}");
    let [nextPointer, parsingResult] = resultingFunction(4, tokens);
    assert(nextPointer === 1);
    const buildResult = parsingResult.build()
    assert(buildResult.kind, TokenKind.LeftCurly);
    assert(buildResult.value, "main");


    [nextPointer, parsingResult] = resultingFunction(3, tokens);
    assert(nextPointer === -1);
    assert(parsingResult.isFailure === true);
}