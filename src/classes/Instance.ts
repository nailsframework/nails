import { IComponent } from '../interfaces/Component';

export class Instance {
  private identifier: string;
  private component: IComponent;
  private element: HTMLElement;
  constructor(id: string, component: IComponent, element: HTMLElement) {
    this.identifier = id;
    this.component = component;
    this.element = element;
  }

  public getIdentifier(): string {
    return this.identifier;
  }
  public getComponent(): IComponent {
    return this.component;
  }
  public getElement(): HTMLElement {
    return this.element;
  }
}
