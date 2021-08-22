import { TokenKind } from "./lexer.ts";

export const OperationPriorities: {[key:string]:number} = {
    [TokenKind.Plus] : 6,
    [TokenKind.Minus] : 5,
}
