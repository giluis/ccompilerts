import { assert } from "../deps.ts";
import { Assembly } from "../src/instructions.ts";

function testMov(){
    let builder1 = new Assembly();
    let result1 = builder1.mov("l","2","eax").build()
    let expected1 = "movl $2 %eax";
    assert(result1 === expected1);

    let builder2 = new Assembly();
    let result2 = builder2.mov("b","3","ebx").build();
    let expected2 = "movb $3 %ebx";
    
    assert(result2 === expected2);
}

function testRet(){
    let builder = new Assembly();
    let result = builder.ret().build();
    let expected = "ret";
    assert(expected === result);
}