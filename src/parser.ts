import { TFunction, TProgram } from "./ebnf.ts";
import { FunctionDef, Statement } from "./grammar.ts";
import { Token, TokenKind } from "./lexer.ts";
import ParsingResult, { TermDefinition } from "./parsingResult.ts";

export default function parse(tokens: Token[]): [number, ParsingResult<TProgram>] {
    let r_fnDef;
    let pointer = 0;
    let fnResults: ParsingResult<TFunction>[] = [];
    while (pointer < tokens.length) {
        [pointer, r_fnDef] = FunctionDef(pointer, tokens);
        fnResults.push(r_fnDef);
    }
    const [isFailure, failuremMsg] = ParsingResult.and(...fnResults);
    if (isFailure) return [pointer, ParsingResult.fail(failuremMsg)];
    else
        return [
            pointer,
            ParsingResult.success<TProgram>().define(
                fnResults.map((f) => f.build()),
            ),
        ];
}
