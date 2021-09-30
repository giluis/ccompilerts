import { TokenKind } from "./lexer";

export function isReturnStatement (o: any): o is TReturnStatement {
    return o?.statementType === TokenKind.Kw_Return && o.returnValue;
}

export function isBinOp (o: any): o is TBinaryOperation {
    return isExpression( o?.left  )&& isBinaryOperator( o?.operator  )&&isExpression( o?.operator ) 
}

export function isBinaryOperator(o: any): o is TBinaryOperator{
    return ["+","-","*","/"].filter(op=>o===op).length === 0
}

export type TBinaryOperator = "+"|"-"|"*"|"/"


export function isExpression(o: any): o is TExpression{
    return isValue(o) || isUnOp(o) || isBinOp(o)
}

export function isUnOp(o: any): o is TExpression{
    return isUnaryOperator(o?.operator) && isExpression(o?.operand)
}

export function isUnaryOperator(o: any): o is TUnaryOperator{
    return ["!","~","-"].filter(op=>op === o).length === 0
}

export function isValue (o: any): o is TValue {
    return typeof o === "string" || typeof o === "number";
}

export function isLogicalNegate (o: any): o is TLogicalNegate {
    return o === TokenKind.LogicalNegate
}

export function isNegate (o: any): o is TNegate {
    return o === TokenKind.Minus
}

export function isBitWiseCompl (o: any): o is TBitWiseCompl {
    return o === TokenKind.BitWiseComplement
}


export type TNegate = TokenKind.Minus;
export type TBitWiseCompl = TokenKind.BitWiseComplement;
export type TLogicalNegate = TokenKind.LogicalNegate;

export type TProgram = TFunction[];

export type TFunction = {
    returnType: TType;
    identifier: string;
    args: TArg[];
    body: TStatement[];
};



export type TArg = {
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


export type TStatement = TReturnStatement;


export type TReturnStatement = {
    statementType: TokenKind.Kw_Return;
    returnValue: TExpression;
};


export type TExpression = 
    | TBinaryOperation
    | TUnaryOperation
    | TValue

export type TPlus = "+";
export type TMinus = "-";
export type TMult = "*";
export type TDiv = "/";

export type TBinaryOperation = {opType: "binary_operation", left: TExpression, operator: "-" | "+" | "*" | "/", right: TExpression}


export type TUnaryOperation = {
    opType: "unary_operation",
    operator: TUnaryOperator,
    operand: TExpression,
} 


export type TUnaryOperator = TLogicalNegate | TNegate | TBitWiseCompl
export type TValue = string | number;


export type TType = TokenKind.Kw_Int;


/**
 * Músicas
    * Entrada: Deixa Deus Entrar
    * Ato Penitencial: (fico de mandar)
    * Salmo: O Senhor é meu pastor (fico de mandar)
    * Aclamação do Evangelho: fico de mandar
    * Ofertório: Grão de Trigo
    * Santo: fico de mandar
    * Pai Nosso: Galego
    * Cordeiro: Sal Terra (fico de mandar)
    * Comunhão: Tomo este pão e este vinho
    * Ação de graças: Poema
    * Música FInal: Onde Deus te Levar
 * Indumentária: predominantemente de branco
 * Externato de Santa Margarida
 * 17 de setembro pelas 3 da tarde
 */