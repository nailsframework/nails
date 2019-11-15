import { Instance } from '../../classes/Instance';
import { State } from '../state';

export class Context {
  constructor(public state: State, public instance: Instance) {}

  public resolveContextOrUndefined(path: string) {
    path = this.stripFunctionCalls(path);
    let stateResolve;
    let instanceResolve;

    if (this.state) {
      stateResolve = this.resolve(path, this.state.data);
    }
    if (this.instance) {
      instanceResolve = this.resolve(path, this.instance);
    }
    if (instanceResolve || instanceResolve === '') {
      return stateResolve;
    }
    if (stateResolve || stateResolve === '') {
      return stateResolve;
    }
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
    if (instanceResolve || instanceResolve === '') {
      if (path !== strippedPath) {
        const functionCalls = this.getFunctionCallString(path);
        // tslint:disable-next-line:no-eval
        return eval('instanceResolve' + '.' + functionCalls);
      }
      return instanceResolve;
    }
    if (stateResolve || stateResolve === '') {
      if (path !== strippedPath) {
        const functionCalls = this.getFunctionCallString(path);
        // tslint:disable-next-line:no-eval
        return eval('stateResolve' + '.' + functionCalls);
      }
      return stateResolve;
    }
    return undefined;
  }

  public stripFunctionCalls(expression: string) {
    const matches = expression.match(/[a-z_A-Z]+\([^\)]*\)(\.[^\)]*\))?/);
    if (matches === null) {
      return expression;
    }
    for (const match of matches) {
      expression = expression.replace(match + '.', '');
      expression = expression.replace(match, '');
    }

    if (expression.endsWith('.')) {
      expression = expression.substring(0, expression.length - 1);
    }
    return expression;
  }

  private resolve(path: string, obj: any, separator = '.') {
    const properties = path.split(separator);
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
}
