import { State } from "../core/state";

export class Injector {
  public state: State;

  constructor(state: State) {
    this.state = state;
    this.bootstrap();
  }
  public bootstrap() {
    this.state.injectors = [];
  }

  public insert(clazz: any) {
    for (const c of this.state.injectors) {
      if (c instanceof clazz) {
        return;
      }
    }
    this.state.injectors.push(clazz);
  }
  public resolve(clazz: any) {
    for (const c of this.state.injectors) {
      if (c instanceof clazz) {
        return c;
      }
    }
  }
}
