export type TermDefinition = object | string;

/**
 * T is the type f the object that is returned upon building
 */
export default class ParsingResult<T> {
    isFailure: boolean;
    failureMsg: string;

    private constructor(isFailure: boolean, failureMsg: string | null) {
        if (isFailure && failureMsg === null)
            throw new Error("A failure must have a message");
        this.isFailure = isFailure;
        this.failureMsg = failureMsg ? failureMsg : "";
    }

    static and(...results: ParsingResult<any>[]): [boolean, string] {
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

    static firstSuccess(...results: ParsingResult<any>[]): ParsingResult<any> {
        for (const result of results) {
            if (!result.isFailure) return result;
        }
        return results[0];
    }

    static fail<P>(msg: string) {
        return new ParsingResult<P>(true, msg);
    }

    define(o: T) {
        this.build = () => o;
        return this;
    }

    build(): T {
        throw new Error("Parsing Result hasn't been defined yet");
    }

    static success<P>(msg?: string) {
        return new ParsingResult<P>(false, msg ? msg : null); //succes means isFailure == false
    }
}
