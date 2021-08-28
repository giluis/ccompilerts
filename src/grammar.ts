import ParsingResult from "./parsingResult.ts";
import { Token, TokenKind } from "./lexer.ts";
import {
    TArg,
    TExpression,
    TFunction,
    TIdentifier,
    TReturnStatement,
    TStatement,
    TType,
    TUnaryOperation,
    TUnaryOperator,
    TValue,
    TVarDeclaration,
} from "./ebnf.ts";

export function Expression(
    pointer: number,
    tokens: Token[],
): [number, ParsingResult<TExpression>] {
    const [ptr1, r_value] = Value(pointer, tokens);
    if (r_value.isFailure)
        return UnaryOperation(pointer, tokens);
    return [ptr1, ParsingResult.success<TExpression>().define(r_value.build())];
}

export function UnaryOperation(
    pointer: number,
    tokens: Token[],
): [number, ParsingResult<TUnaryOperation>] {
    const [ptr2, r_unaryOperator] = UnaryOperator(pointer, tokens);
    if (r_unaryOperator.isFailure) {
        return [
            ptr2,
            ParsingResult.fail<TUnaryOperation>(
                `Expected unaryOperator at position ${ptr2}, but got ${tokens[
                    ptr2
                ].toString()}`,
            ),
        ];
    }

    let [expPtr,r_exp] = Expression(ptr2, tokens);
    return [ expPtr, ParsingResult.success<TUnaryOperation>().define({
        operator: r_unaryOperator.build(),
        operand: r_exp.build(),
    }) ]
}

export function UnaryOperator(
    pointer: number,
    tokens: Token[],
): [number, ParsingResult<TUnaryOperator>] {
    let [ptr1, r_unOp] = SingleToken(TokenKind.LogicalNegate, pointer, tokens);
    if (r_unOp.isFailure) {
        [, r_unOp] = SingleToken(TokenKind.Negate, pointer, tokens);
        if (r_unOp.isFailure) {
            [, r_unOp] = SingleToken(
                TokenKind.BitWiseComplement,
                pointer,
                tokens,
            );
            if (r_unOp.isFailure)
                return [
                    pointer,
                    ParsingResult.fail<TUnaryOperator>(
                        `Expected unaryOperator at ${pointer} but got ${tokens[
                            pointer
                        ].toString()}`,
                    ),
                ];
        }
        return [
            pointer + 1,
            ParsingResult.success<TUnaryOperator>().define(
                r_unOp.build().kind as TUnaryOperator,
            ),
        ];
    }
    return [
        ptr1,
        ParsingResult.success<TUnaryOperator>().define(
            r_unOp.build().kind as TUnaryOperator,
        ),
    ];
}

export function FunctionDef(
    pointer: number,
    tokens: Token[],
): [number, ParsingResult<TFunction>] {
    let [ptr1, r_typeReturn] = Type(pointer, tokens);
    let [ptr2, r_funcIdent] = Identifier(ptr1, tokens);
    let [ptr3, r_args] = Args(ptr2, tokens);
    let [ptr4, r_leftCurly] = SingleToken(TokenKind.LeftCurly, ptr3, tokens);
    let [isFailure1, failureMsg1] = ParsingResult.and(
        r_typeReturn,
        r_funcIdent,
        r_args,
        r_leftCurly,
    );
    if (isFailure1) return [pointer, ParsingResult.fail(failureMsg1)]; //infers
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
            ParsingResult.success<TFunction>().define({
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
): [number, ParsingResult<TArg[]>] {
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
        return [newPtr2, ParsingResult.success<TArg[]>().define([])];

    let argPtr = newPtr;
    let argSet = [];
    let r_rightParen;
    while (true) {
        let [newptr, r_arg] = Variable(argPtr, tokens);
        let [newptr2, r_comma] = SingleToken(TokenKind.Comma, newptr, tokens);
        if (r_comma.isFailure) {
            let r_paren = SingleToken(TokenKind.RightParen, newptr, tokens);
            let finalPtr = r_paren[0];
            r_rightParen = r_paren[1];
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
            ParsingResult.success<TArg[]>().define(
                argSet.map((r) => r.build()),
            ),
        ];
    }
}

export function Variable(
    pointer: number,
    tokens: Token[],
): [number, ParsingResult<TVarDeclaration>] {
    let [ptr1, r_type] = Type(pointer, tokens);
    let [ptr2, r_varName] = Identifier(ptr1, tokens);
    let [isFailure, failureMsg] = ParsingResult.and(r_type, r_varName);
    if (isFailure) return [pointer, ParsingResult.fail(failureMsg)];
    else
        return [
            ptr2,
            ParsingResult.success<TVarDeclaration>().define({
                type: r_type.build(),
                identifier: r_varName.build(),
            }),
        ];
}

export function Identifier(
    pointer: number,
    tokens: Token[],
): [number, ParsingResult<TIdentifier>] {
    let [ptr2, r_identifier] = SingleToken(
        TokenKind.Identifier,
        pointer,
        tokens,
    );
    let { value } = r_identifier.build();
    if (!value)
        throw new Error(
            "Error (parser consistency): value cannot be null in this context",
        );
    let { isFailure, failureMsg } = r_identifier;
    if (isFailure) return [pointer, ParsingResult.fail(failureMsg)];
    else return [ptr2, ParsingResult.success<TIdentifier>().define(value)];
}

export function Type(
    pointer: number,
    tokens: Token[],
): [number, ParsingResult<TType>] {
    const [newptr, r_type] = SingleToken(TokenKind.Kw_Int, pointer, tokens);
    let { value } = r_type.build();
    if (r_type.isFailure) {
        return [pointer, ParsingResult.fail(r_type.failureMsg)];
    } else {
        return [
            newptr,
            ParsingResult.success<TType>().define(value as TokenKind.Kw_Int),
        ]; //casting here is the only option I can think of right now
    }
}

export function Statement(
    pointer: number,
    tokens: Token[],
): [number, ParsingResult<TStatement>] {
    let [newpointer, r_returnStatement] = ReturnStatement(pointer, tokens);
    if (r_returnStatement.isFailure) return [pointer, r_returnStatement];
    return [
        newpointer,
        ParsingResult.success<TStatement>().define(r_returnStatement.build()),
    ];
}

// export function Operand(
//     pointer: number,
//     tokens: Token[],
// ): [number, ParsingResult] {
//     const [, r_operand] = SingleToken(TokenKind.Lit_Int, pointer, tokens);
//     const result = ParsingResult.firstSuccess(r_operand);
//     if (!result.isFailure) {
//         return [
//             pointer + 1,
//             ParsingResult.success().define({
//                 operand: result.build(),
//             }),
//         ];
//     } else {
//         return [pointer, ParsingResult.fail(result.failureMsg)];
//     }
// }

// export function compareParsingResults(
//     first: ParsingResult,
//     second: ParsingResult,
// ) {
//     let firstToken = first.build();
//     let secondToken = second.build();
//     return compareOperations(firstToken, secondToken);
// }

// export function compareOperations(
//     { kind: first }: Token,
//     { kind: second }: Token,
// ): number {
//     return OperationPriorities[second] - OperationPriorities[first];
// }

// export function BinaryOperation(
//     pointer: number,
//     tokens: Token[],
// ): [number, ParsingResult] {
//     let [ptr2, firstOperand] = Operand(pointer, tokens);
//     let [ptr3, currentOperation] = Operator(ptr2, tokens);
//     let [ptr4, secondOperand] = Operand(ptr3, tokens);
//     let [ptr5, nextOperation] = Operator(ptr4, tokens);

//     const [isOperation, failureMsg] = ParsingResult.and(
//         firstOperand,
//         currentOperation,
//         secondOperand,
//     );

//     const [doesOperationEnd] = ParsingResult.and(nextOperation);

//     if (isOperation && doesOperationEnd) {
//         return [
//             pointer + 3,
//             ParsingResult.success().define({
//                 first: firstOperand.build(),
//                 second: secondOperand.build(),
//                 operation: currentOperation.build(),
//             }),
//         ];
//     }

//     if (isOperation && !doesOperationEnd) {
//         const comparison = compareParsingResults(
//             currentOperation,
//             nextOperation,
//         );
//         if (comparison > 1) {
//             // currentOperation has higher priority than nextOperation
//             const nextOperationBuilt = nextOperation.build();
//             nextOperationBuilt.left = {
//                 operation: currentOperation.build(),
//                 first: firstOperand.build(),
//                 second: secondOperand.build(),
//             };
//             return [ptr5, ParsingResult.success().define(nextOperationBuilt)];
//         } else {
//             //currentOperation has lowerpriority than nextOperation
//             return [
//                 ptr5,
//                 ParsingResult.success().define({
//                     operation: currentOperation.build(),
//                     left: firstOperand.build(),
//                     right: nextOperation.build(),
//                 }),
//             ];
//         }
//     } else {
//         return [
//             pointer,
//             ParsingResult.fail(
//                 "There was a problem parsing an operation at this location",
//             ),
//         ];
//     }
// }

// export function Operator(
//     pointer: number,
//     tokens: Token[],
// ): [number, ParsingResult] {
//     let [, r_plusLiteral] = SingleToken(TokenKind.Plus, pointer, tokens);
//     let [, r_minusLiteral] = SingleToken(TokenKind.Minus, pointer, tokens);

//     const result: ParsingResult = ParsingResult.firstSuccess(
//         r_plusLiteral,
//         r_minusLiteral,
//     );
//     if (!result.isFailure) {
//         return [
//             pointer + 1,
//             ParsingResult.success().define({
//                 operator: result.build(),
//             }),
//         ];
//     } else {
//         return [pointer, ParsingResult.fail(result.failureMsg)];
//     }
// }

export function Value(
    pointer: number,
    tokens: Token[],
): [number, ParsingResult<TValue>] {
    let [newpointer, r_value] = SingleToken(TokenKind.Lit_Int, pointer, tokens);
    if (r_value.isFailure)
        return [ pointer,ParsingResult.fail<TValue>(r_value.failureMsg) ]

    let { value } = r_value.build();
    if (!value)
        throw new Error(
            "Error (parser consistency): value cannot be null in this context",
        );
    if (r_value.isFailure)
        return [pointer, ParsingResult.fail(r_value.failureMsg)];
    else
        return [
            newpointer,
            ParsingResult.success<TValue>().define(value as TValue),
        ];
}
export function ReturnStatement(
    pointer: number,
    tokens: Token[],
): [number, ParsingResult<TReturnStatement>] {
    let [newpointer, r_return] = SingleToken(
        TokenKind.Kw_Return,
        pointer,
        tokens,
    );
    let [newpointer2, r_exp] = Expression(newpointer, tokens);
    let [newpointer3, r_semicolon] = SingleToken(
        TokenKind.SemiColon,
        newpointer2,
        tokens,
    );
    const [isFailure, failureReason] = ParsingResult.and(
        r_return,
        r_exp,
        r_semicolon,
    );
    if (isFailure) return [pointer, ParsingResult.fail(failureReason)];
    return [
        newpointer3,
        ParsingResult.success<TReturnStatement>().define({
            statementType: TokenKind.Kw_Return,
            returnValue: r_exp.build(),
        }),
    ];
}

export function SingleToken(
    tokenKind: TokenKind,
    pointer: number,
    tokens: Token[],
): [number, ParsingResult<Token>] {
    let currentToken = tokens[pointer];
    if (currentToken.kind === tokenKind)
        return [
            pointer + 1,
            ParsingResult.success<Token>().define(currentToken),
        ];
    else
        return [
            pointer,
            ParsingResult.fail(
                `Expected ${tokenKind} at position ${pointer}, but got ${currentToken.toString()}`,
            ),
        ];
}
