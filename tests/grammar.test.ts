import {
    SingleToken,
    Args,
    Variable,
    Identifier,
    ReturnStatement,
    FunctionDef,
    Statement,
    UnaryOperation,
} from "../src/grammar.ts";
import lex, { Token, TokenKind } from "../src/lexer.ts";
import { assert, assertEquals } from "../deps.ts";
import ParsingResult from "../src/parsingResult.ts";
import { parse } from "../src/parser.ts";
import { TExpression, TProgram } from "../src/ebnf.ts";

testExpression();
testUnaryOperation();
testProgram();
testSingleToken();
testArgs();
testFunctionDefNoArgs();
testFunctionDef();


function testExpression(){
    const [ptr, result ] = UnaryOperation(0,lex("!~-3"));
    assertEquals(ptr,4);
    assert(!result.isFailure);
    const expected: TExpression = {
        operator: TokenKind.LogicalNegate,
        operand: {
            operator: TokenKind.BitWiseComplement,
            operand: {
                operator: TokenKind.Negate,
                operand: "3",
            },
        },
    };
    const resultBuilt = result.build();

    assertEquals(expected,resultBuilt);
}

function testUnaryOperation() {
    const [ptr, result ] = UnaryOperation(0,lex("!!!2"));
    assertEquals(ptr,4);
    assert(!result.isFailure);
    const expected: TExpression = {
        operator: TokenKind.LogicalNegate,
        operand: {
            operator: TokenKind.LogicalNegate,
            operand: {
                operator: TokenKind.LogicalNegate,
                operand: "2",
            },
        },
    };
    const resultBuilt = result.build();

    assertEquals(expected,resultBuilt);
}

function testProgram() {
    let [, r_program] = parse(
        lex("int main(){return 2;} int other(int a, int b){return 4;}"),
    );
    const ast = r_program.build();
    const expected: TProgram = [
        {
            returnType: TokenKind.Kw_Int,
            identifier: "other",
            args: [
                { type: TokenKind.Kw_Int, identifier: "a" },
                { type: TokenKind.Kw_Int, identifier: "b" },
            ],
            body: [
                {
                    statementType: TokenKind.Kw_Return,
                    returnValue: "a",
                },
            ],
        },
        {
            returnType: TokenKind.Kw_Int,
            identifier: "main",
            args: [],
            body: [
                {
                    statementType: TokenKind.Kw_Return,
                    returnValue: "2",
                },
            ],
        },
    ];
    assertEquals(ast, expected);
}

function testFunctionDefNoArgs() {
    let tokens = lex("int main(){return 2;}");
    const [ptr1, r_functionDef] = FunctionDef(0, tokens);
    assert(!r_functionDef.isFailure);
    let functionDefBuilt = r_functionDef.build();
    const expectedArgs = Args(2, tokens)[1].build();
    const expectedStatements = [Statement(0, lex("return 2;"))[1].build()];
    const expected = {
        identifier: "main",
        returnType: TokenKind.Kw_Int,
        body: expectedStatements,
        args: expectedArgs,
    };

    assertEquals(functionDefBuilt, expected);
}
function testFunctionDef() {
    let tokens = lex("int add(int arg1,int arg2){return 2;}");
    const [ptr1, r_functionDef] = FunctionDef(0, tokens);
    assert(!r_functionDef.isFailure);
    let functionDefBuilt = r_functionDef.build();
    const expectedArgs = Args(2, tokens)[1].build();
    const expectedStatements = [Statement(0, lex("return 2;"))[1].build()];
    const expected = {
        identifier: "add",
        returnType: TokenKind.Kw_Int,
        body: expectedStatements,
        args: expectedArgs,
    };

    assertEquals(functionDefBuilt, expected);
}
function testReturnStatement() {
    let tokens = lex("return 2;");
    const [ptr1, r_returnStatement] = ReturnStatement(0, tokens);

    assert(!r_returnStatement.isFailure);

    let returnStatementBuiltl = r_returnStatement.build();

    assertEquals(returnStatementBuiltl, {
        statementType: TokenKind.Kw_Return,
        returnValue: {
            kind: TokenKind.Lit_Int,
            value: "2",
        },
    });
}

testVariable();

function testVariable() {
    let tokens = lex("somefunc(int arg1,int arg2 , int arg3 )");
    const [ptr1, r_var1] = Variable(2, tokens);
    const [ptr2, r_var2] = Variable(ptr1 + 1, tokens);
    const [, r_var3] = Variable(ptr2 + 1, tokens);

    const [isFailure, failureMsg] = ParsingResult.and(r_var1, r_var2, r_var3);
    assert(!isFailure && failureMsg === "");

    let r_var1Built = r_var1.build();
    let r_var2Built = r_var2.build();
    let r_var3Built = r_var3.build();

    assertEquals(r_var1Built, {
        type: TokenKind.Kw_Int,
        identifier: "arg1",
    });
    assertEquals(r_var2Built, {
        type: TokenKind.Kw_Int,
        identifier: "arg2",
    });
    assertEquals(r_var3Built, {
        type: TokenKind.Kw_Int,
        identifier: "arg3",
    });
}

function testArgs() {
    let tokens = lex("somefunc(int arg1,int arg2 , int arg3 )");
    const [newptr, r_args] = Args(1, tokens);
    assert(!r_args.isFailure);
    let argsBuilt: any[] = r_args.build();
    argsBuilt.forEach((arg, i) => {
        assert(arg.type === TokenKind.Kw_Int);
        assert(arg.identifier === `arg${i + 1}`);
    });

    assert(newptr === 11);
}

function testSingleToken() {
    let tokens = lex("a = 0");
    let [ptr1, r_identifier] = Identifier(0, tokens);
    let [ptr2, r_equalSign] = SingleToken(TokenKind.Assign, ptr1, tokens);
    let [ptr3, r_litInt] = SingleToken(TokenKind.Lit_Int, ptr2, tokens);

    let arePtrsSequential = ptr3 === ptr2 + 1 && ptr2 + 1 === ptr1 + 2;
    assert(arePtrsSequential, "pointers should be sequential");

    let [isFailure, failureMsg] = ParsingResult.and(
        r_identifier,
        r_equalSign,
        r_litInt,
    );
    assert(!isFailure, "Should be false ");
    assert(
        failureMsg === "",
        "Failure Msg should be empty, as it is not a failure",
    );

    let identifierBuilt = r_identifier.build();
    let equalSignBuilt = r_equalSign.build();
    let litIntBuilt = r_litInt.build();

    assertEquals(identifierBuilt, "a");
    assertEquals(equalSignBuilt, Token.new(TokenKind.Assign));
    assertEquals(litIntBuilt, Token.new(TokenKind.Lit_Int, "0"));
}

testSingleToken();

