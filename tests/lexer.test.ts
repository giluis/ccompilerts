import { assert, assertEquals } from "../deps.ts";
import lex, { TokenKind, Token } from "../src/lexer.ts";

testLexBinaryComp();
testLexLogicalNeg();
testLexNegation();
function testLexBinaryComp() {
    const input = "~2";
    const temp: [TokenKind, string?][] = [
        [TokenKind.BitWiseComplement],
        [TokenKind.Lit_Int, "2"],
    ];
    const expected: Token[] = temp.map((e) => Token.new(e[0], e[1]));
    assertEquals(expected, lex(input));
}

function testLexLogicalNeg() {
    const input = "!0";
    const temp: [TokenKind, string?][] = [
        [TokenKind.LogicalNegate],
        [TokenKind.Lit_Int, "0"],
    ];
    const expected: Token[] = temp.map((e) => Token.new(e[0], e[1]));
    assertEquals(expected, lex(input));
}

function testLexNegation() {
    const input = "1-4";
    const temp: [TokenKind, string?][] = [
        [TokenKind.Lit_Int, "1"],
        [TokenKind.Negate],
        [TokenKind.Lit_Int, "4"],
    ];
    const expected: Token[] = temp.map((e) => Token.new(e[0], e[1]));
    assertEquals(expected, lex(input));
}

function testLex() {
    const input = "int main(){return 2;}";
    const temp: [TokenKind, string?][] = [
        [TokenKind.Kw_Int],
        [TokenKind.Identifier, "main"],
        [TokenKind.LeftParen],
        [TokenKind.RightParen],
        [TokenKind.LeftCurly],
        [TokenKind.Kw_Return],
        [TokenKind.Lit_Int, "2"],
        [TokenKind.SemiColon],
        [TokenKind.RightCurly],
    ];
    const expected: Token[] = temp.map((e) => Token.new(e[0], e[1]));
    const result: Token[] = lex(input);
    assert(expected.length === result.length);
    expected.forEach((e, i) => {
        assert(e.equals(result[i]));
    });
}

function testLexWithArgs() {
    const input = "somefunc(arg1,arg2,arg3)";
    const temp: [TokenKind, string?][] = [
        [TokenKind.Identifier, "somefunc"],
        [TokenKind.LeftParen],
        [TokenKind.Identifier, "arg1"],
        [TokenKind.Comma],
        [TokenKind.Identifier, "arg1"],
        [TokenKind.Comma],
        [TokenKind.Identifier, "arg1"],
        [TokenKind.RightParen],
    ];
    const expected: Token[] = temp.map((e) => Token.new(e[0], e[1]));
    const result: Token[] = lex(input);
    assert(expected.length === result.length);
    expected.forEach((e, i) => {
        assert(e.equals(result[i]));
    });
}

testLexWithArgs();
function testLex1() {
    const input = "a = 0";
    const temp: [TokenKind, string?][] = [
        [TokenKind.Identifier, "a"],
        [TokenKind.Assign],
        [TokenKind.Lit_Int, "0"],
    ];
    const expected: Token[] = temp.map((e) => Token.new(e[0], e[1]));
    const result: Token[] = lex(input);
    assert(expected.length === result.length);
    expected.forEach((e, i) => {
        assert(e.equals(result[i]));
    });
}

async function testFromTestCases() {
    const pathTo = "./testcases/stage_1";
    const pathToInvalid = pathTo + "/invalid";
    const pathToValid = pathTo + "/valid";
    const invalidTests = Deno.readDir(pathToInvalid);
    const validTests = Deno.readDir(pathToValid);
    for await (const file of invalidTests) {
        Deno.readTextFile(pathToInvalid + "/" + file.name).then((response) => {
            console.log("\n-------");
            console.log(file.name);
            console.log(lex(response));
        });
    }
    for await (const file of validTests) {
        Deno.readTextFile(pathToValid + "/" + file.name).then((response) => {
            console.log("\n-------");
            console.log(file.name);
            console.log(lex(response));
        });
    }
}

testLex1();
