import { SingleToken, Args, Variable } from "../grammar.ts";
import lex, { Token, TokenKind } from "../lexer.ts";
import { assert, equal } from "../deps.ts";
import ParsingResult from "../parsingResult.ts";

testVariable();

function testVariable() {
    let tokens = lex("somefunc(int arg1,int arg2 , int arg3 )");
    const [ptr1, r_var1] = Variable(2, tokens);
    const [ptr2, r_var2] = Variable(ptr1 + 1, tokens);
    const [, r_var3] = Variable(ptr2 + 1, tokens);

    const [isFailure, failureMsg] = ParsingResult.and(r_var1, r_var2, r_var3);
    assert(!isFailure && failureMsg === "");

    let r_var1Built = r_var1.build()
    let r_var2Built = r_var2.build()
    let r_var3Built = r_var3.build()

    equal(r_var1Built, {
        type: TokenKind.Kw_Int,
        identifier: "arg1",
    });
    equal(r_var2Built, {
        type: TokenKind.Kw_Int,
        identifier: "arg2",
    });
    equal(r_var3Built, {
        type: TokenKind.Kw_Int,
        identifier: "arg3",
    });
}
function testArgs() {
    let tokens = lex("somefunc(int arg1,int arg2 , int arg3 )");
    const [newptr, r_args] = Args(1, tokens);
    assert(!r_args.isFailure);
    let argsBuilt = r_args.build();
    equal(argsBuilt, [
        {
            type: TokenKind.Kw_Int,
            identifier: "arg1",
        },
        {
            type: TokenKind.Kw_Int,
            identifier: "arg2",
        },
        {
            type: TokenKind.Kw_Int,
            identifier: "arg3",
        },
    ]);
}

function testSingleToken() {
    let tokens = lex("a = 0");
    let [ptr1, r_identifier] = SingleToken(TokenKind.Identifier, 0, tokens);
    let [ptr2, r_equals] = SingleToken(TokenKind.Assign, ptr1, tokens);
    let [ptr3, r_litInt] = SingleToken(TokenKind.Lit_Int, ptr2, tokens);

    let arePtrsSequential = ptr3 === ptr2 + 1 && ptr2 + 1 === ptr1 + 2;
    assert(arePtrsSequential, "pointers should be sequential");

    let [isFailure, failureMsg] = ParsingResult.and(
        r_identifier,
        r_equals,
        r_litInt,
    );
    assert(!isFailure, "Should be false ");
    assert(
        failureMsg === "",
        "Failure Msg should be empty, as it is not a failure",
    );

    let identifierBuilt = r_identifier.build();
    let equalsBuilt = r_equals.build();
    let litIntBuilt = r_litInt.build();

    equal(identifierBuilt, { kind: TokenKind.Identifier, value: "a" });
    equal(equalsBuilt, { kind: TokenKind.Assign, b: 2 });
    equal(identifierBuilt, { kind: TokenKind.Identifier, value: "a" });
}

testSingleToken();
