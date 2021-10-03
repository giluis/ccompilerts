export enum TokenKind {
        Kw_Int="Kw_Int",
        Plus="+",
        Mult="*",
        Div="/",
        LogicalNegate="!",
        BitWiseComplement="~",
        Minus="-",
        Identifier="Identifier",
        LeftParen="LeftParen",
        Comma=",",
        RightParen="RightParen",
        LeftCurly="LeftCurly",
        Kw_Return="Kw_Return",
        Lit_Int="Lit_Int",
        SemiColon="SemiColon",
        Assign="Assign",
        RightCurly="RightCurly",
} 

const MatchExpressions:[TokenKind,RegExp][]= [ 
        [ TokenKind.Kw_Int,/^int/ ],
        [ TokenKind.Assign,/^=/ ],
        [ TokenKind.Plus,/^\+/ ],
        [ TokenKind.Mult,/^\*/ ],
        [ TokenKind.Div,/^\// ],
        [ TokenKind.LogicalNegate,/^!/ ],
        [ TokenKind.BitWiseComplement,/^~/ ],
        [ TokenKind.Minus,/^-/ ],
        [ TokenKind.Comma,/^,/ ],
        [ TokenKind.Kw_Return,/^return/ ],
        [ TokenKind.Identifier,/^[a-zA-Z]\w*/ ],
        [ TokenKind.Identifier,/^,/ ],
        [ TokenKind.LeftParen,/^\(/ ],
        [ TokenKind.RightParen,/^\)/ ],
        [ TokenKind.LeftCurly,/^\{/ ],
        [ TokenKind.RightCurly,/^\}/ ],
        [ TokenKind.Lit_Int,/^[0-9]+/ ],
        [ TokenKind.SemiColon,/^;/ ],
 ]

export class Token{
    kind: TokenKind;
    value: string|null;
    private constructor(kind: TokenKind, value: string | null){
        this.kind = kind
        this.value = value
    }
    public equals(other:Token){
        return other.kind === this.kind && other.value === this.value;
    }

    public toString(){
        return `{kind:${this.kind},value:${this.value}}`;
    }

    public static create(kind:TokenKind, value?: string):Token{
        switch(kind){
            case TokenKind.Kw_Int:
            case TokenKind.LeftParen:
            case TokenKind.RightParen:
            case TokenKind.LeftCurly:
            case TokenKind.RightCurly:
            case TokenKind.Kw_Return:
            case TokenKind.SemiColon:
            case TokenKind.Assign:
            case TokenKind.Plus:
            case TokenKind.Mult:
            case TokenKind.Div:
            case TokenKind.Minus:
            case TokenKind.LogicalNegate:
            case TokenKind.BitWiseComplement:
            case TokenKind.Comma:
                return new Token(kind,null);
            case TokenKind.Identifier:
            case TokenKind.Lit_Int:
                if(value === null || value === undefined)
                    throw new Error("Value for these tokens cannot be null")
                return new Token(kind, value);
        }
    }
}
export default function lex(source:string):Token[]{
    const size = source.length
    let position = 0;
    const tokens:Token[] = [];
                
    while(position < size){
        const  currentChar = source[position];
        for( const [kind,regex] of MatchExpressions){
            const stringslice = source.slice(position)
            const match = stringslice.match(regex);
            if(match){
                tokens.push(Token.create(kind,match[0]))
                position += match[0].length;
                break;
            }
            continue;
        }
        if(currentChar === ' ' || currentChar === '\n')
            position++
            
    }

    return tokens;
}
