import { Statement } from "./grammar.ts";
import { Token, TokenKind } from "./lexer.ts";
import { OperationPriorities } from "./operations.ts";
import ParsingResult from "./parsingResult.ts";

export default function parse(tokens:Token[]):string | object{
    const [, r_ast ] = Program(0,tokens);
    if (r_ast.isFailure){
        return r_ast.failureMsg;
    } else {
        return r_ast.build();
    }
}

export function Program(pointer:number, tokens:Token[]):[number, ParsingResult ]{

    return Statement(pointer, tokens);
}

