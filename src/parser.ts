import { FunctionDef, Statement } from "./grammar.ts";
import { Token, TokenKind } from "./lexer.ts";
import { OperationPriorities } from "./operations.ts";
import ParsingResult, { TermDefinition } from "./parsingResult.ts";

type TAst = TFunction[]
type TFunction = {
    returnType: TType,
    identifier: string,
    args: TArg[],
    body: TStatement[],
}

type TStatement = TReturnStatement
type TReturnStatement = {
    statementType: TokenKind.Kw_Return,
    returnValue: TValue,
}

type TValue = string;

type TArg = {
    type: TType,
    identifier: string,
}

type TType = TokenKind.Kw_Int 


export default function parse(tokens:Token[]):TermDefinition{
    const [, r_ast ] = Program(0,tokens);
    if (r_ast.isFailure){
        return r_ast.failureMsg;
    } else {
        return r_ast.build();
    }
}

export function Program(pointer:number, tokens:Token[]):[number, ParsingResult ]{
    return FunctionDef(pointer,tokens);
}

