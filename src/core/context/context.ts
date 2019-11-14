import { State } from "../state";
import { Instance } from "../../classes/Instance";

export class Context {
    constructor(public state: State, public instance: Instance) {

    }

    public resolveOrUndefined(path: any): any {
        const strippedPath = this.stripFunctionCalls(path);


        let stateResolve;
        let instanceResolve;
        if (this.instance) {
            instanceResolve = this.resolve(strippedPath, this.instance.getComponent());
        } else {
            instanceResolve = null;
        }

        if (this.state) {
            stateResolve = this.resolve(strippedPath, this.state.data);
        } else {
            stateResolve = null;
        }


        if (instanceResolve) {
            if (path !== strippedPath) {
                const functionCalls = this.getFunctionCallString(path);
                // tslint:disable-next-line:no-eval
                return eval('instanceResolve' + '.' + functionCalls);
            }
            return instanceResolve;
        }
        if (stateResolve) {
            if (path !== strippedPath) {
                const functionCalls = this.getFunctionCallString(path);
                // tslint:disable-next-line:no-eval
                return eval('stateResolve' + '.' + functionCalls);
            }
            return instanceResolve;
        }
    }
    private resolve(path: string, obj: any) {
        const properties = path.split('.');
        return properties.reduce((prev, curr) => prev && prev[curr], obj);
    }

    private getFunctionCallString(expression: string): string {
        const matches = expression.match(/[a-z_A-Z]+\([^\)]*\)(\.[^\)]*\))?/);
        if (matches === null) {
            return expression;
        }

        const firstMatch = matches[0];

        return expression.substring(expression.indexOf(firstMatch), expression.length);
    }
    private stripFunctionCalls(expression: string) {
        const matches = expression.match(/[a-z_A-Z]+\([^\)]*\)(\.[^\)]*\))?/);
        if (matches === null) {
            return expression;
        }
        for (const match of matches) {
            expression = expression.replace(match + '.', '');
            expression = expression.replace(match, '');
        }

        if (expression.endsWith('.')) {
            expression = expression.substring(0, expression.length - 1)
        }
        return expression;
    }
}