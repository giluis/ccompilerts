import ParsingResult from "./parsingResult.ts";
import {  TokenKind } from "./lexer.ts";
import TokenIterator, { defuncFrom as fn } from "./tokenIterator.ts";
import {
  TArg,
  TDiv,
  TExpression,
  TFunction,
  TIdentifier,
  TMinus,
  TMult,
  TPlus,
  TReturnStatement,
  TStatement,
  TType,
  TUnaryOperation,
  TUnaryOperator,
  TValue,
} from "./ebnf.ts";



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
  const { Plus, Minus } = TokenKind;
  return iter.oneOf(fn(Plus), fn(Minus));
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
  return iter.oneOf(fn( Mult ), fn( Div ));
}

export function Factor(iter: TokenIterator): ParsingResult<TExpression> {
  const r_binaryExpression = iter
    .chain(
      fn(TokenKind.LeftParen),
      BinaryExpression,
      fn(TokenKind.RightParen)
    )
    .release(([r_exp]) => r_exp.build());

  if (!r_binaryExpression.isFailure) return r_binaryExpression;
  let r_unOp = iter
    .chain(UnaryExpression)
    .release(([r_unOp]) => r_unOp.build());

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
    fn( TokenKind.Minus ),
    fn( TokenKind.BitWiseComplement ),
    fn(TokenKind.LogicalNegate)
  );
}

export function Expression(iter: TokenIterator): ParsingResult<TExpression> {
  return iter.oneOf(BinaryExpression, UnaryExpression, Value);
}

console.log("sdlfkj");
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
    .repeat({
      separator: fn(TokenKind.SemiColon),
      target: Statement,
      delimiters: [fn(TokenKind.LeftCurly), fn(TokenKind.RightCurly)],
    })
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
    .repeat({
      separator: fn(TokenKind.Comma),
      target: Argument,
      delimiters: [fn(TokenKind.LeftParen), fn(TokenKind.RightParen)],
    })
    .release<TArg[]>((args) => args.map((a) => a.build()));
}

export function Identifier(iter: TokenIterator): ParsingResult<TIdentifier> {
  return iter
    .chain(fn(TokenKind.Identifier))
    .release(([r_identifier]) => r_identifier.build());
}

export function Type(iter: TokenIterator): ParsingResult<TType> {
  return iter
    .chain(fn(TokenKind.Kw_Int))
    .release(([r_kwInt]) => r_kwInt.build());
}

export function Statement(iter: TokenIterator): ParsingResult<TStatement> {
  return iter
    .chain(ReturnStatement)
    .release(([r_returnStatement]) => r_returnStatement.build());
}

export function Value(iter: TokenIterator): ParsingResult<TValue> {
  return iter.oneOf(fn( TokenKind.Lit_Int ));
}

export function ReturnStatement(
  iter: TokenIterator
): ParsingResult<TReturnStatement> {
  return iter
    .chain(fn(TokenKind.Kw_Return), Expression, fn(TokenKind.SemiColon))
    .release(([r_ret, r_exp]) => ({
      statementType: r_ret.build(),
      returnValue: r_exp.build(),
    }));
}
