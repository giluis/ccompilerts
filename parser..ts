import { Token, TokenKind } from "./lexer.ts";

class Parser {
    tokens: Token[];
    workbench: Token[];
    pointer: number;
    error: string | null;
    constructor(tokens: Token[]) {
        this.tokens = tokens;
        this.pointer = 0;
        this.workbench = [];
        this.error = null;
    }
    Program() {
        this.Function();
    }

    expect(kind: TokenKind) {
        let currentToken = this.next();
        if (currentToken.kind === kind) {
            this.workbench.push(currentToken);
            return this;
        } else {
            throw new Error(`
              currentPointer: ${this.pointer},
              currentToken: ${this.currentToken()},
              expectedKind: ${kind},
            `);
        }
    }

    currentToken() {
        return this.tokens[this.pointer];
    }

    flush() {
        const workbench = [...this.workbench];
        this.workbench = [];
        return workbench;
    }

    next() {
        let currentToken = this.currentToken();
        this.pointer += 1;
        return currentToken;
    }

    Function() {
        const functionDefinition = [
            TokenKind.Kw_Int,
            TokenKind.Identifier,
            TokenKind.LeftParen,
            TokenKind.RightParen,
            TokenKind.LeftCurly,
            this.Statement(),
            TokenKind.RightCurly,
        ];
        return {};
    }

    Statement(): Parser {
        let statement = this.expect(TokenKind.Kw_Return).expect(
            TokenKind.Lit_Int,
        );
        return this;
    }
}

interface result {
    isOk: boolean;
    value: object;
}

class ParsingResult {
    isOk: boolean;
    value: Token[] | null;
    failValue: string | null;

    private constructor(
        isOk: boolean,
        value: Token[] | null,
        failValue: string | null,
    ) {
        this.isOk = isOk;
        this.value = value;
        this.failValue = failValue;
    }
}
