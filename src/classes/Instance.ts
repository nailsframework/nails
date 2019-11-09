import { IComponent } from "../interfaces/Component";

export class Instance {
  private identifier: string;
  private component: IComponent;
  constructor(id: string, component: IComponent) {
    this.identifier = id;
    this.component = component;
  }

  public getIdentifier() {
    return this.identifier;
  }
  public getComponent() {
    return this.component;
  }
}
