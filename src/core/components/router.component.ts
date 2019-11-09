import { ComponentEngine } from "../engine/componentEngine";
import { State } from "../state";

export class Router {
  public state: State;
  public selector: string;
  public hashRoute: string;
  public engine: ComponentEngine;
  public routings: any;
  constructor(state: State) {
    this.state = state;
    const that = this;
    this.selector = "yield";
    this.hashRoute = window.location.hash.replace("#/", "");

    this.engine = state.componentEngine;
    window.onhashchange = () => {
      if (typeof that.engine === "undefined") {
        return;
      }

      that.hashRoute = window.location.hash.replace("#/", "");

      that.engine.recreateComponentsByName("yield"); // TODO: Find better way
    };
  }

  public isFunction(functionToCheck: any) {
    return (
      functionToCheck &&
      {}.toString.call(functionToCheck) === "[object Function]"
    );
  }
  public addRoutings(routings: any) {
    this.routings = routings;
  }

  public getHashRoute() {
    return window.location.hash.replace("#/", "");
  }

  public getComponent() {
    if (typeof this.routings === "undefined") {
      return "div";
    }
    for (const route of this.routings) {
      if (route.route === this.getHashRoute()) {
        if (this.isFunction(route.guard)) {
          if (route.guard(this)) {
            const instance = new route.component(this.state);
            return instance.selector;
          } else {
            return "div";
          }
        } else {
          const instance = new route.component(this.state);
          return instance.selector;
        }
      }
    }
  }
  public navigate(where: string) {
    window.location.hash = "/" + where.replace("/", "");
  }

  public render() {
    return `
            <${this.getComponent()}></${this.getComponent()}>
        `;
  }
}
