import lex from "./src/lexer.ts";
import parser from "./src/parser.ts";
const text = Deno.readTextFile("./main.c");
text.then((response) => { 
    const tokens = lex(response);
    const ast = parser(tokens);
    console.log(ast);
});
