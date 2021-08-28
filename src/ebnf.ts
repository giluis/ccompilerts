import { TokenKind } from "./lexer.ts";

export function isReturnStatement (o: any): o is TReturnStatement {
    return o?.statementType === TokenKind.Kw_Return && o.returnValue;
}
export function isValue (o: any): o is TValue {
    return typeof o === "string" || typeof o === "number";
}
export function isLogicalNegate (o: any): o is TLogicalNegate {
    return o === TokenKind.LogicalNegate
}
export function isNegate (o: any): o is TNegate {
    return o === TokenKind.Negate
}
export function isBitWiseCompl (o: any): o is TBitWiseCompl {
    return o === TokenKind.BitWiseComplement
}


export type TNegate = TokenKind.Negate;
export type TBitWiseCompl = TokenKind.BitWiseComplement;
export type TLogicalNegate = TokenKind.LogicalNegate;

export type TProgram = TFunction[];

export type TFunction = {
    returnType: TType;
    identifier: string;
    args: TArg[];
    body: TStatement[];
};

export type TArg = TVarDeclaration;

export type TVarDeclaration = {
    type: TType;
    identifier: TIdentifier;
};

export type TIdentifier = string;

export type TSingleSymbol = TValuedSingleSymbol | TUnvaluedSingleSymbol;

export type TUnvaluedSingleSymbol =
    | "("
    | ")"
    | "{"
    | "}"
    | "["
    | "]"
    | ","
    | ";";

export type TValuedSingleSymbol = TIdentifier | TValue;

/**
 */
export type TStatement = TReturnStatement;

export type TReturnStatement = {
    statementType: TokenKind.Kw_Return;
    returnValue: TExpression;
};

export type TExpression = TUnaryOperation | TValue

export type TUnaryOperation = {
    operator: TUnaryOperator,
    operand: TExpression,
} 

export type TUnaryOperator = TLogicalNegate | TNegate | TBitWiseCompl
export type TValue = string | number;

export type TType = TokenKind.Kw_Int;
