import {
    isReturnStatement,
    isValue,
    TExpression,
    TFunction,
    TProgram,
    TValue,
    isBitWiseCompl,
    isLogicalNegate,
    isNegate,
    isBinOp,
    TUnaryOperator,
TBinaryOperator,
} from "./ebnf.ts";

export type InstSize = "b" | "w" | "l";
export type Register = "eax" | "ebx" | "al";

export class Assembly {
    instructions: string[];

    constructor() {
        this.instructions = [];
    }
    

    add(
        size: InstSize,
        left: Register | TValue,
        right: Register | TValue,
    ): this {
        let leftOperand = isValue(left) ? left : `%${left}`;
        let rightOperand = isValue(right) ? right : `%${right}`;
        return this.append(`add${size} ${leftOperand},${rightOperand}`);
    }



    push(size: InstSize, operand: Register | TValue): this {
        return this.append(`push${size} %${operand}`);
    }

    pop(size: InstSize, operand: Register | TValue): this {
        return this.append(`pop${size} %${operand}`);
    }

    unOp(unOperator: TUnaryOperator): this {
        return isLogicalNegate(unOperator)
            ? this.logneg("l", "eax")
            : isNegate(unOperator)
            ? this.neg("eax")
            : this.bitcompl("eax");
    }

    mov(size: InstSize, value: TValue, register: Register): this {
        return this.append(`mov${size} $${value}, %${register}`);
    }

    neg(register: Register): this {
        return this.append(`neg %${register}`);
    }

    bitcompl(register: Register): this {
        return this.append(`not %${register}`);
    }

    cmp(size: InstSize, value: TValue, register: Register): this {
        return this.append(`cmp${size} $${value}, %${register}`);
    }

    sete(register: Register): this {
        this.append(`sete %${register}`);
        return this;
    }

    xor(reg1: Register, reg2: Register): this {
        return this.append(`xor %${reg1}, %${reg2}`);
    }

    logneg(size: InstSize, register: Register): this {
        return this.cmp(size, 0, "eax").xor("eax", "eax").sete("al");
    }

    ret(): this {
        return this.append(`ret`);
    }

    build(tidy: boolean = true): string {
        let separator = tidy ? `\n\t` : `  `;
        return this.instructions.reduce((acc, cur) => acc + this.tidy(cur), "");
    }

    tidy(inst: string) {
        return inst.match(/\.global/)
            ? `${inst}\n`
            : inst.match(/.*:/)
            ? `\n${inst}`
            : inst.match(/ret/)
            ? `\n\t${inst}\n`
            : `\n\t${inst}`;
    }

    append(instOrAssembly: string | Assembly): this {
        if (typeof instOrAssembly === "string")
            this.instructions.push(instOrAssembly);
        else this.instructions.push(...instOrAssembly.instructions);
        return this;
    }

    prepend(inst: string): this {
        this.instructions.unshift(inst);
        return this;
    }

    compose(other: Assembly): this {
        this.instructions = [...this.instructions, ...other.instructions];
        return this;
    }
}

export default function generateAsm(program: TProgram): string {
    const builder = new Assembly();
    builder.prepend(".text");
    for (const fn of program) {
        builder.prepend(`.type ${fn.identifier}, @function`);
        builder.prepend(`.globl ${fn.identifier}`);
        builder.compose(defineFunction(fn));
    }
    return builder.build();
}

export function defineExpression(exp: TExpression): Assembly {
    let recur;
    if (isValue(exp)) return new Assembly().mov("l", exp, "eax");
    else {
        switch (exp.opType) {
            case "unary_operation":
                let { operand, operator: unOperator } = exp;
                let recur = defineExpression(operand);
                return recur.unOp(unOperator);
            case "binary_operation":
                let { left, operator: binOperator, right } = exp;
                let result = defineExpression(left);

                result
                    .push("l", "eax")
                    .append(defineExpression(right))
                    .pop("l", "ecx")
                    .defineBinOperation(binOperator);
                return result;
        }
    }
}

export function defineBinOperation(op: TBinaryOperator):Assembly{
    let result = new Assembly();
    switch(op){
        case "*": 
                break;
        case "+": 
                result.append()
                break;
        case "-": 
                
                break;
        case "/": 
                
                break;
    }
}
//we need to initialize it first if we're going to support other kinds of statements.
export function defineFunction(fn: TFunction): Assembly {
    for (const s of fn.body) {
        if (isReturnStatement(s))
            return defineExpression(s.returnValue)
                .ret()
                .prepend(`${fn.identifier}:`);
    }
    throw new Error("Not implemented yet");
}
