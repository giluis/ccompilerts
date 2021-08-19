import ParsingResult from "./parsingResult.ts";
import {Token,TokenKind} from "./lexer.ts";
import { OperationPriorities } from "./operations.ts";

function Statement(pointer: number, tokens: Token[]): [number, ParsingResult] {
    let [newpointer, r_returnStatement] = ReturnStatement(pointer, tokens);
    if (r_returnStatement.isFailure) return [pointer, r_returnStatement];
    return [
        newpointer,
        ParsingResult.success().define({
            type: "return",
            returnValue: r_returnStatement.build(),
        }),
    ];
}

function Operand(pointer: number, tokens: Token[]): [number, ParsingResult] {
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

function compareParsingResults(first:ParsingResult,second:ParsingResult){
    let firstToken = first.build();
    let secondToken = second.build();
    return compareOperations(firstToken,secondToken);
}


function compareOperations({kind:first}:Token, {kind:second}: Token):number{
    return OperationPriorities[second]  - OperationPriorities[first];
}

function BinaryOperation(
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

    const [doesOperationEnd,] = ParsingResult.and(
        nextOperation
    )

    if(isOperation && doesOperationEnd){
        return [pointer + 3 , ParsingResult.success().define({
            first: firstOperand.build(),
            second: secondOperand.build(),
            operation: currentOperation.build(),
        })]
    }

    

    if (isOperation && !doesOperationEnd) {
        const comparison = compareParsingResults(currentOperation, nextOperation);
        if (comparison > 1) {
            // currentOperation has higher priority than nextOperation
            const nextOperationBuilt = nextOperation.build()
            nextOperationBuilt.left = {
                operation: currentOperation.build(),
                first:firstOperand.build(),
                second: secondOperand.build(),
            }
            return [
                ptr5,
                ParsingResult.success().define(
                    nextOperationBuilt
                ),
            ];
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

function Operator(pointer: number, tokens: Token[]): [number, ParsingResult] {
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

function ReturnStatement(
    pointer: number,
    tokens: Token[],
): [number, ParsingResult] {
    let [newpointer, r_return] = SingleToken(
        TokenKind.Kw_Return,
        pointer,
        tokens,
    );
    let [newpointer2, r_returnValue] = SingleToken(
        TokenKind.Lit_Int,
        newpointer,
        tokens,
    );
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
            returnValue: r_returnValue.build(),
            semi: r_semicolon.build(),
        }),
    ];
}

function SingleToken(
    tokenKind: TokenKind,
    pointer: number,
    tokens: Token[],
): [number, ParsingResult] {
    let currentToken = tokens[pointer];
    if (currentToken.kind === tokenKind)
        return [
            pointer + 1,
            ParsingResult.success().define({
                kind: currentToken.kind,
                value: currentToken.value,
            }),
        ];
    else
        return [
            -1,
            ParsingResult.fail(
                `Expected ${tokenKind} at position ${pointer}, but got ${currentToken.toString()}`,
            ),
        ];
}