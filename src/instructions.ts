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
} from "./ebnf.ts";

export type InstSize = "b" | "w" | "l";
export type Register = "eax" | "ebx" | "al";

export class Assembly {
    instructions: string[];

    constructor() {
        this.instructions = [];
    }

    mov(size: InstSize, value: TValue, register: Register): this {
        this.push(`mov${size} $${value}, %${register}`);
        return this;
    }

    neg(register: Register): this {
        this.push(`neg %${register}`);
        return this;
    }

    bitcompl(register: Register): this {
        this.push(`not %${register}`);
        return this;
    }

    cmp(size: InstSize, value: TValue, register: Register): this {
        this.push(`cmp${size} $${value}, %${register}`);
        return this;
    }

    sete(register: Register): this {
        this.push(`sete %${register}`);
        return this;
    }

    xor(reg1: Register, reg2: Register): this {
        this.push(`xor %${reg1}, %${reg2}`);
        return this;
    }

    logneg(size: InstSize, register: Register): this {
        this.cmp(size, 0, "eax").xor("eax", "eax").sete("al");
        return this;
    }

    ret(): this {
        this.instructions.push(`ret`);
        return this;
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

    push(inst: string): this {
        this.instructions.push(inst);
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

export function generateAsm(program: TProgram): string {
    const builder = new Assembly();
    for (const fn of program) {
        builder.prepend(`.global ${fn.identifier}`);
        builder.compose(defineFunction(fn));
    }
    return builder.build();
}

export function defineExpression(exp: TExpression): Assembly {
    if (isValue(exp)) return new Assembly().mov("l", exp, "eax");
    else {
        const { operand, operator } = exp;
        let recur = defineExpression(operand);
        return isLogicalNegate(operator)
            ? recur.logneg("l", "eax")
            : isNegate(operator)
            ? recur.neg("eax")
            : recur.bitcompl("eax");
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
