import {defineFunction, generateAsm} from "./src/instructions.ts";
import lex from "./src/lexer.ts";
import { parse } from "./src/parser.ts";

compileFile("main.c","out.asm");
function run(){
    const [source,output] = Deno.args
    compileFile(source,output)
}

//from string represeting C code, compile it and return asm string
function compile(source:string):string {
    const tokens = lex(source);
    const [, ast ] = parse(tokens);
    if(ast.isFailure)
        throw new Error(`Parsing error: ${ast.failureMsg}`)
    const asm = generateAsm(ast.build());
    return asm;
//read tokens from main.c
//parse tokens into program ast
//build assembly from ast
//write built asm to file
}

//reads from file, compiles and writes output to outputFile
export async function compileFile(fileName:string, outputFile: string):Promise<void> {
    const source = await Deno.readTextFile(fileName);
    const asm = compile(source);
    await Deno.writeTextFile(outputFile, asm);
}
