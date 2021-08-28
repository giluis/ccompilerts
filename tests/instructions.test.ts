import { assert } from "../deps.ts";
import { TFunction } from "../src/ebnf.ts";
import {defineFunction } from "../src/instructions.ts";
import { TokenKind } from "../src/lexer.ts";




testDefineFunctionUnaryOperator();
function testDefineFunctionUnaryOperator(){
    let fn: TFunction = {
        identifier: "main",
        args: [],
        body: [
            {
                statementType: TokenKind.Kw_Return,
                returnValue: {
                    operator: TokenKind.BitWiseComplement,
                    operand: {
                        operator: TokenKind.Negate,
                        operand: {
                            operator: TokenKind.LogicalNegate,
                            operand: "0",
                        }
                    }
                }
            }
        ],
        returnType: TokenKind.Kw_Int,
    }
    let expected = `'\nmain:\n\tmovl $0 %eax\n\tcmpl $0, %eax\n\txor %eax %eax\n\tsete %al\n\tneg %eax\n\tnot %eax\n\tret\n'`;
    let result = defineFunction(fn).build();
    assert(expected === result);
}
testDefineFunction();
function testDefineFunction(){
    let fn: TFunction = {
        identifier: "main",
        args: [],
        body: [
            {
                statementType: TokenKind.Kw_Return,
                returnValue: "2"
            }
        ],
        returnType: TokenKind.Kw_Int,
    }
    let expected = `\nmain:\n\tmovl $2 %eax\n\tret\n`;
    let result = defineFunction(fn).build();
    assert(expected === result);
}