export type TermDefinition = object | string;

export default class ParsingResult {
    isFailure: boolean;
    failureMsg: string;

    private constructor(isFailure: boolean, failureMsg: string | null) {
        if (isFailure && failureMsg === null)
            throw new Error("A failure must have a message");
        this.isFailure = isFailure;
        this.failureMsg = failureMsg ? failureMsg : "";
    }

    static and(...results: ParsingResult[]): [boolean, string] {
        let acc = true;
        let msg = "";
        for (const result of results) {
            acc = acc && !result.isFailure;
            if (!acc) {
                msg = result.failureMsg;
            }
        }
        return [!acc, msg]; //will return if it is failure, so we need to negate it
    }

    static firstSuccess(...results: ParsingResult[]): ParsingResult {
        for (const result of results) {
            if (!result.isFailure) return result;
        }
        return results[0];
    }

    static fail(msg: string) {
        return new ParsingResult(true, msg);
    }

    define(o: TermDefinition) {
        this.build = () => o;
        return this;
    }

    build(): any {
        throw new Error("Parsing Result hasn't been defined yet");
    }

    static success(msg?: string) {
        return new ParsingResult(false, msg ? msg : null); //succes means isFailure == false
    }
}
