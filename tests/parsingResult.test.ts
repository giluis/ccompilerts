import {assert} from "../deps.ts";
import lex,{Token,TokenKind} from "../lexer.ts"
import ParsingResult from "../parsingResult.ts";

function testAnd(){
    const result1 = ParsingResult.success().define({
        hello: "world"
    })
    const result2 = ParsingResult.success().define({
        hello: "mars"
    })
    const result3 = ParsingResult.success().define({
        hello: "jupiter"
    })

    let [isFailure, failureMsg] = ParsingResult.and(result1,result2,result3);
    assert(!isFailure,"isFailure should be false");
    assert(failureMsg === "","failure message should be empty");


    const DUMMY_FAIL_MSG = "failure" 
    const result4 = ParsingResult.fail(DUMMY_FAIL_MSG);

    [isFailure,failureMsg] = ParsingResult.and(result1,result2,result4);//since result 4 is failure, should return [true,"failure"]
    assert(isFailure,"isFailure should be true");
    assert(failureMsg === DUMMY_FAIL_MSG,`failureMsg should be ${DUMMY_FAIL_MSG} but was ${failureMsg}`);

    
}

testAnd();