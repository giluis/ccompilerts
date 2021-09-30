import ParsingResult from "./parsingResult";
import { Token, TokenKind } from "./lexer";
import TokenIterator,{defuncFrom} from "./tokenIterator"
import {
  TArg,
  TBitWiseCompl,
  TDiv,
  TExpression,
  TFunction,
  TIdentifier,
  TLogicalNegate,
  TMinus,
  TMult,
  TNegate,
  TPlus,
  TReturnStatement,
  TStatement,
  TType,
  TUnaryOperation,
  TUnaryOperator,
  TValue,
} from "./ebnf";

export type Defunc<T> = (iter: TokenIterator) => ParsingResult<T>;

export function BinaryExpression(
  iter: TokenIterator
): ParsingResult<TExpression> {
  return iter
    .chain(Term, LowerPriorityOperator, BinaryExpression)
    .release(([r_term, r_oper, r_exp]) => ({
      opType: "binary_operation",
      left: r_term.build(),
      operator: r_oper.build(),
      right: r_exp.build(),
    }));
}

export function BinaryExpression1(
  iter: TokenIterator
): ParsingResult<TExpression> {
  return iter
    .chain(Term, LowerPriorityOperator, BinaryExpression)
    .release(([r_term, r_oper, r_exp]) => ({
      opType: "binary_operation",
      left: r_term.build(),
      operator: r_oper.build(),
      right: r_exp.build(),
    }));
}



export function LowerPriorityOperator(
  iter: TokenIterator
): ParsingResult<TPlus | TMinus> {
  let { Plus, Minus } = TokenKind;
  return iter.oneOf(Plus, Minus);
}

export function Term(iter: TokenIterator): ParsingResult<TExpression> {
  return iter
    .chain(Factor, HigherPriorityOperator, Term)
    .release(([r_factor, r_oper, r_term]) => ({
      opType: "binary_operation",
      left: r_factor.build(),
      operator: r_oper.build(),
      right: r_term.build(),
    }));
}

export function HigherPriorityOperator(
  iter: TokenIterator
): ParsingResult<TMult | TDiv> {
  const { Mult, Div } = TokenKind;
  return iter.oneOf(Mult, Div);
}

function singleToken(
  kind: TokenKind
): (iter: TokenIterator) => ParsingResult<Token> {
  return (iter: TokenIterator) => iter.single(kind);
}

export function Factor(iter: TokenIterator): ParsingResult<TExpression> {
  let r_binaryExpression = iter
    .chain(
      singleToken(TokenKind.LeftParen),
      BinaryExpression,
      singleToken(TokenKind.RightParen)
    )
    .release(([r_exp]) => r_exp.build());

  if (!r_binaryExpression.isFailure) return r_binaryExpression;
  let r_unOp = iter.chain(UnaryExpression).release(([r_unOp]) => r_unOp.build());

  if (!r_unOp.isFailure) return r_unOp;

  let r_val = iter.chain(Value).release(([r_val]) => r_val.build());

  if (!r_val.isFailure) return r_val;

  return r_binaryExpression; //return by deafult binary expression failed restul
}

export function UnaryExpression(
  iter: TokenIterator
): ParsingResult<TUnaryOperation> {
  return iter
    .chain(UnaryOperator, Expression)
    .release(([r_unOperator, r_exp]) => ({
      operand: r_exp.build(),
      operator: r_unOperator.build(),
      opType: "unary_operation",
    }));
}

export function UnaryOperator(
  iter: TokenIterator
): ParsingResult<TUnaryOperator> {
  return iter.oneOf(
    TokenKind.Minus,
    TokenKind.BitWiseComplement,
    TokenKind.LogicalNegate
  );
}

export function Expression(iter: TokenIterator): ParsingResult<TExpression> {
  return iter.oneOf(BinaryExpression, UnaryExpression, Value);
}

export function FunctionDef(iter: TokenIterator): ParsingResult<TFunction> {
  return iter
    .chain(Type, Identifier, Args, FunctionBody)
    .release(([r_typeReturn, r_funcIdent, r_args, r_body]) => ({
      returnType: r_typeReturn.build(),
      identifier: r_funcIdent.build(),
      args: r_args.build(),
      body: r_body.build(),
    }));
}

export function FunctionBody(iter: TokenIterator): ParsingResult<TStatement[]> {
  return iter
    .chain(defuncFrom(TokenKind.LeftCurly))
    .consumeUntil(
      defuncFrom(TokenKind.RightCurly),
      Statement,
      defuncFrom(TokenKind.SemiColon)
    )
    .filterResults(1) //get only the argument and discard the comma
    .release<TStatement[]>((statements) => statements.map((s) => s.build()));
}

export function Argument(iter: TokenIterator): ParsingResult<TArg> {
  return iter.chain(Type, Identifier).release(([r_type, r_identifier]) => ({
    type: r_type.build(),
    identifier: r_identifier.build(),
  }));
}

export function Args(iter: TokenIterator): ParsingResult<TArg[]> {
  return iter
    .chain(defuncFrom(TokenKind.LeftParen))
    .consumeUntil(
      defuncFrom(TokenKind.RightParen),
      Argument,
      defuncFrom(TokenKind.Comma)
    )
    .filterResults(1) //get only the argument and discard the comma
    .release<TArg[]>((args) => args.map((a) => a.build()));
}

export function Identifier(iter: TokenIterator): ParsingResult<TIdentifier> {
  return iter
    .chain(defuncFrom(TokenKind.Identifier))
    .release(([r_identifier]) => r_identifier.build());
}

export function Type(iter: TokenIterator): ParsingResult<TType> {
  return iter
    .chain(defuncFrom(TokenKind.Kw_Int))
    .release(([r_kwInt]) => r_kwInt.build());
}

export function Statement(iter: TokenIterator): ParsingResult<TStatement> {
  return iter
    .chain(ReturnStatement)
    .release(([r_returnStatement]) => r_returnStatement.build());
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

export function LitInt(iter: TokenIterator): ParsingResult<TValue> {
  return iter.expect(TokenKind.Kw_Int)
}
export function LitString(iter: TokenIterator): ParsingResult<TValue> {
  throw new Error("Not supported yet");
}

export function Value(iter: TokenIterator): ParsingResult<TValue> {
  return iter.oneOf(LitInt, LitString);
}

export function ReturnStatement(
  iter: TokenIterator
): ParsingResult<TReturnStatement> {
  return iter
    .chain(defuncFrom( TokenKind.Kw_Return ), Expression, defuncFrom( TokenKind.SemiColon ))
    .release(([r_ret, r_exp]) => ({
      statementType: r_ret.build(),
      returnValue: r_exp.build(),
    }));
}

export function SingleToken(
  tokenKind: TokenKind,
  pointer: number,
  tokens: Token[]
): [number, ParsingResult<Token>] {
  if (pointer >= tokens.length)
    return [
      pointer,
      ParsingResult.fail("piotner cannot be larger than array length"),
    ];
  let currentToken = tokens[pointer];
  if (currentToken.kind === tokenKind)
    return [pointer + 1, ParsingResult.success<Token>().define(currentToken)];
  else
    return [
      pointer,
      ParsingResult.fail(
        `Expected ${tokenKind} at position ${pointer}, but got ${currentToken.toString()}`
      ),
    ];
}
