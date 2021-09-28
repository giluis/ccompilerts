import lex from "./src/lexer.ts";
import parser from "./src/parser.ts";
import generateAsm from "./src/instructions.ts";
const text = Deno.readTextFile("./main.c");
text.then((response) => { 
    const tokens = lex(response);
    const ast = parser(tokens);
    if(ast[1].isFailure)
        return console.log(`There was an error ${ast[1].failureMsg}`)
    const built = ast[1].build();
    const asm = generateAsm(built);
    return Deno.writeTextFile("./out.s",asm);
})
.then(r=>console.log("Compilation finnished"))
.catch(r=>console.log("there was an error mu dude"))
