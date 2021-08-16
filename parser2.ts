import { Token, TokenKind } from "./lexer.ts";

const temp: [TokenKind, string?][] = [
    [TokenKind.Kw_Int],
    [TokenKind.Identifier, "main"],
    [TokenKind.LeftParen],
    [TokenKind.RightParen],
    [TokenKind.LeftCurly],
    [TokenKind.Kw_Return],
    [TokenKind.Lit_Int, "2"],
    [TokenKind.SemiColon],
    [TokenKind.RightCurly],
];
const Tokens: Token[] = temp.map((e) => Token.new(e[0], e[1]));

function Program() {
    return FunctionFactory().build();
}

function FunctionFactory(): ParsingResult {
    let pointer = 0;
    return ParsingResult.create(pointer,Tokens)
        .expect(parserFunctionFromToken( TokenKind.Kw_Int ))
        .expect(parserFunctionFromToken( TokenKind.Identifier ))
        .expect(Args)
        .expect(parserFunctionFromToken( TokenKind.LeftCurly ))
        .expect(Statement)
        .expect(parserFunctionFromToken( TokenKind.RightCurly ))
        .define(([returnType, args, body]: ParsingResult[]) => ({
            returnType: returnType.build(),
        }));
}

function parserFunctionFromToken(
    tokenKind: TokenKind,
): (pointer: number, tokens: Token[]) => [number, ParsingResult] {
    return (pointer: number, tokens: Token[]) => {
        let currentToken = tokens[pointer];
        if (currentToken.kind === tokenKind) {
            const result = ParsingResult.create(pointer, tokens).define(
                (_: ParsingResult[]) => ({
                    kind: currentToken.kind,
                    value: currentToken.value,
                }),
            );
            return [pointer + 1, result];
        } else {
            const result = ParsingResult.fail();
            return [pointer, result];
        }
    };
}

function Args(pointer: number, tokens: Token[]): [number, ParsingResult] {
    return [
        pointer + 2,
        ParsingResult.create(pointer, tokens)
            .expect(parserFunctionFromToken(TokenKind.LeftParen))
            .expect(parserFunctionFromToken(TokenKind.RightParen ))
            .define(([l, r]: ParsingResult[]) => ({
                args: "void",
            })),
    ];
}


class ParsingResult {
    tokens: Token[];
    pointer: number;
    nuggets: ParsingResult[];
    isFailure: boolean;
    private constructor(
        pointer: number,
        tokens: Token[],
        nuggets: ParsingResult[],
        isFailure: boolean,
    ) {
        this.tokens = tokens;
        this.pointer = pointer;
        this.nuggets = [...nuggets];
        this.isFailure = isFailure;
    }

    static create(pointer: number, tokens: Token[]) {
        return new ParsingResult(pointer, tokens, [], false);
    }
    static fail() {
        return new ParsingResult(-1, [], [], true);
    }

    expect(
        fn: (pointer: number, tokens: Token[]) => [number, ParsingResult],
    ): ParsingResult {
        if (!this.isFailure) {
            const [newPointer, result] = fn(this.pointer, this.tokens);
            this.pointer = newPointer;
            if (result.isFailure) this.isFailure = true;
            this.nuggets.push(result);
        }
        return this;
    }

    define(fn: (results: ParsingResult[]) => object): ParsingResult {
        this.build = () => {
            fn(this.nuggets);
            this.nuggets = [];
        };
        return this;
    }

    build() {
        throw new Error("Build method has not been defined yet");
    }
}

function Statement(pointer: number, tokens: Token[]): [number, ParsingResult] {
    return [
        pointer + 3,
        ParsingResult.create(pointer, tokens)
            .expect(parserFunctionFromToken( TokenKind.Kw_Return ))
            .expect(parserFunctionFromToken( TokenKind.Lit_Int ))
            .expect(parserFunctionFromToken( TokenKind.SemiColon ))
            .define(([returnn, litInt, semi]: ParsingResult[]) => ({
                associationType: "return",
                returnValue: litInt,
                semi: !!semi,
            })),
    ];
}
