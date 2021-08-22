import ParsingResult from "./parsingResult.ts";
import { Token, TokenKind } from "./lexer.ts";
import { OperationPriorities } from "./operations.ts";

export function FunctionDef(
    pointer: number,
    tokens: Token[],
): [number, ParsingResult] {
    let [ptr1, r_typeReturn] = Type(pointer, tokens);
    let [ptr2, r_funcIdent] = Identifier(ptr1, tokens);
    let [ptr3, r_args] = Args(ptr2, tokens);
    let [ptr4, r_leftCurly] = SingleToken(TokenKind.LeftCurly, ptr3, tokens);
    let [isFailure1, failureMsg1] = ParsingResult.and(r_typeReturn,r_funcIdent,r_args,r_leftCurly);
    if(isFailure1)
        return [pointer, ParsingResult.fail(failureMsg1) ];
    const statements = [];
    let statementPtr = ptr4;
    let parsingResult;
    while (true) {
        let r = Statement(statementPtr, tokens);
        statementPtr = r[0];
        parsingResult = r[1];
        if (parsingResult.isFailure) {
            break;
        } else {
            statements.push(parsingResult);
        }
    }
    const [ptr5, r_rightCurly] = SingleToken(
        TokenKind.RightCurly,
        statementPtr,
        tokens,
    );

    const [isFailure, failureMsg] = ParsingResult.and(
        r_typeReturn,
        r_funcIdent,
        r_args,
        r_leftCurly,
        ...statements,
        r_rightCurly,
    );
    if (isFailure) {
        return [pointer, ParsingResult.fail(failureMsg)];
    } else {
        return [
            ptr5,
            ParsingResult.success().define({
                returnType: r_typeReturn.build(),
                identifier: r_funcIdent.build(),
                args: r_args.build(),
                body: statements.map((s) => s.build()),
            }),
        ];
    }
}

export function Args(
    pointer: number,
    tokens: Token[],
): [number, ParsingResult] {
    const [newPtr, r_leftParen] = SingleToken(
        TokenKind.LeftParen,
        pointer,
        tokens,
    );
    const [newPtr2, matchingParen] = SingleToken(
        TokenKind.RightParen,
        newPtr,
        tokens,
    );
    if (!matchingParen.isFailure)
        //function has no arguments;
        return [newPtr2, ParsingResult.success().define([])];

    let argPtr = newPtr;
    let argSet = [];
    let r_rightParen;
    while (true) {
        let [newptr, r_arg] = Variable(argPtr, tokens);
        let [newptr2, r_comma] = SingleToken(TokenKind.Comma, newptr, tokens);
        if (r_comma.isFailure) {
            let r_paren = SingleToken(
                TokenKind.RightParen,
                newptr,
                tokens,
            );
            let finalPtr = r_paren[0]
            r_rightParen = r_paren[1]
            if (!r_rightParen.isFailure) {

                argSet.push(r_arg);
                argPtr = finalPtr;
                break;
            } else
                return [
                    argPtr,
                    ParsingResult.fail(
                        `Expected , or ) in argument list at ${newptr}, but found ${tokens[
                            newptr
                        ].toString()}`,
                    ),
                ];
        } else argSet.push(r_arg);
        argPtr = newptr2;
    }

    const [isFailure, failureMsg] = ParsingResult.and(
        r_leftParen,
        ...argSet,
        r_rightParen,
    );
    if (isFailure) {
        return [pointer, ParsingResult.fail(failureMsg)];
    } else {
        return [
            argPtr,
            ParsingResult.success().define(argSet.map((r) => r.build())),
        ];
    }
}

export function Variable(
    pointer: number,
    tokens: Token[],
): [number, ParsingResult] {
    let [ptr1, r_type] = Type(pointer, tokens);
    let [ptr2, r_varName] = Identifier(ptr1, tokens);
    let [isFailure, failureMsg] = ParsingResult.and(r_type, r_varName);
    if (isFailure) return [pointer, ParsingResult.fail(failureMsg)];
    else
        return [
            ptr2,
            ParsingResult.success().define({
                type: r_type.build(),
                identifier: r_varName.build(),
            }),
        ];
}

export function Identifier(
    pointer: number,
    tokens: Token[],
): [number, ParsingResult] {
    let [ptr2, r_identifier] = SingleToken(
        TokenKind.Identifier,
        pointer,
        tokens,
    );
    let { isFailure, failureMsg } = r_identifier;
    if (isFailure) return [pointer, ParsingResult.fail(failureMsg)];
    else
        return [
            ptr2,
            ParsingResult.success().define(r_identifier.build().value),
        ];
}

export function Type(
    pointer: number,
    tokens: Token[],
): [number, ParsingResult] {
    const [newptr, r_type] = SingleToken(TokenKind.Kw_Int, pointer, tokens);
    if (r_type.isFailure) {
        return [pointer, ParsingResult.fail(r_type.failureMsg)];
    } else {
        return [newptr, ParsingResult.success().define(r_type.build())];
    }
}

export function Statement(
    pointer: number,
    tokens: Token[],
): [number, ParsingResult] {
    let [newpointer, r_returnStatement] = ReturnStatement(pointer, tokens);
    if (r_returnStatement.isFailure) return [pointer, r_returnStatement];
    return [
        newpointer,
        ParsingResult.success().define(r_returnStatement.build()),
    ];
}

export function Operand(
    pointer: number,
    tokens: Token[],
): [number, ParsingResult] {
    const [, r_operand] = SingleToken(TokenKind.Lit_Int, pointer, tokens);
    const result = ParsingResult.firstSuccess(r_operand);
    if (!result.isFailure) {
        return [
            pointer + 1,
            ParsingResult.success().define({
                operand: result.build(),
            }),
        ];
    } else {
        return [pointer, ParsingResult.fail(result.failureMsg)];
    }
}

export function compareParsingResults(
    first: ParsingResult,
    second: ParsingResult,
) {
    let firstToken = first.build();
    let secondToken = second.build();
    return compareOperations(firstToken, secondToken);
}

export function compareOperations(
    { kind: first }: Token,
    { kind: second }: Token,
): number {
    return OperationPriorities[second] - OperationPriorities[first];
}

export function BinaryOperation(
    pointer: number,
    tokens: Token[],
): [number, ParsingResult] {
    let [ptr2, firstOperand] = Operand(pointer, tokens);
    let [ptr3, currentOperation] = Operator(ptr2, tokens);
    let [ptr4, secondOperand] = Operand(ptr3, tokens);
    let [ptr5, nextOperation] = Operator(ptr4, tokens);

    const [isOperation, failureMsg] = ParsingResult.and(
        firstOperand,
        currentOperation,
        secondOperand,
    );

    const [doesOperationEnd] = ParsingResult.and(nextOperation);

    if (isOperation && doesOperationEnd) {
        return [
            pointer + 3,
            ParsingResult.success().define({
                first: firstOperand.build(),
                second: secondOperand.build(),
                operation: currentOperation.build(),
            }),
        ];
    }

    if (isOperation && !doesOperationEnd) {
        const comparison = compareParsingResults(
            currentOperation,
            nextOperation,
        );
        if (comparison > 1) {
            // currentOperation has higher priority than nextOperation
            const nextOperationBuilt = nextOperation.build();
            nextOperationBuilt.left = {
                operation: currentOperation.build(),
                first: firstOperand.build(),
                second: secondOperand.build(),
            };
            return [ptr5, ParsingResult.success().define(nextOperationBuilt)];
        } else {
            //currentOperation has lowerpriority than nextOperation
            return [
                ptr5,
                ParsingResult.success().define({
                    operation: currentOperation.build(),
                    left: firstOperand.build(),
                    right: nextOperation.build(),
                }),
            ];
        }
    } else {
        return [
            pointer,
            ParsingResult.fail(
                "There was a problem parsing an operation at this location",
            ),
        ];
    }
}

export function Operator(
    pointer: number,
    tokens: Token[],
): [number, ParsingResult] {
    let [, r_plusLiteral] = SingleToken(TokenKind.Plus, pointer, tokens);
    let [, r_minusLiteral] = SingleToken(TokenKind.Minus, pointer, tokens);

    const result: ParsingResult = ParsingResult.firstSuccess(
        r_plusLiteral,
        r_minusLiteral,
    );
    if (!result.isFailure) {
        return [
            pointer + 1,
            ParsingResult.success().define({
                operator: result.build(),
            }),
        ];
    } else {
        return [pointer, ParsingResult.fail(result.failureMsg)];
    }
}


export function Value(pointer:number, tokens:Token[]):[number,ParsingResult]{
    let [newpointer, r_value] = SingleToken(TokenKind.Lit_Int,pointer,tokens);
    if(r_value.isFailure)
        return [pointer, ParsingResult.fail(r_value.failureMsg)];
    else 
        return [newpointer,ParsingResult.success().define(r_value.build())];
}
export function ReturnStatement(
    pointer: number,
    tokens: Token[],
): [number, ParsingResult] {
    let [newpointer, r_return] = SingleToken(
        TokenKind.Kw_Return,
        pointer,
        tokens,
    );
    let [newpointer2, r_returnValue] = Value(newpointer,tokens);
    let [newpointer3, r_semicolon] = SingleToken(
        TokenKind.SemiColon,
        newpointer2,
        tokens,
    );
    const [isFailure, failureReason] = ParsingResult.and(
        r_return,
        r_returnValue,
        r_semicolon,
    );
    if (isFailure) return [pointer, ParsingResult.fail(failureReason)];
    return [
        newpointer3,
        ParsingResult.success().define({
            statementType:TokenKind.Kw_Return,
            returnValue: r_returnValue.build(),
        }),
    ];
}

export function SingleToken(
    tokenKind: TokenKind,
    pointer: number,
    tokens: Token[],
): [number, ParsingResult] {
    let currentToken = tokens[pointer];
    let returnValue = currentToken.value
        ? { kind: currentToken.kind, value: currentToken.value }
        : currentToken.kind;
    if (currentToken.kind === tokenKind)
        return [pointer + 1, ParsingResult.success().define(returnValue)];
    else
        return [
            pointer,
            ParsingResult.fail(
                `Expected ${tokenKind} at position ${pointer}, but got ${currentToken.toString()}`,
            ),
        ];
}
