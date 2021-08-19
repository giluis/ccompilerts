import { assert } from "https://deno.land/std@0.104.0/testing/asserts.ts";
import lex, { TokenKind, Token } from "../lexer.ts";
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

testFromTestCases();

testLex();
