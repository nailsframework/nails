import { IActiveElement } from '../interfaces/ActiveElement';
export class ActiveElement implements IActiveElement {
  public key: string;
  public statement: string;
  public element: HTMLElement;
  public reference: any;
  public content: string;
  public interpolation: string;

  // tslint:disable-next-line: max-line-length
  constructor(
    element: HTMLElement,
    reference: any,
    content: string,
    interpolation: string,
    key: string,
    statement: string
  ) {
    this.element = element;
    this.reference = reference;
    this.content = content;
    this.key = key;
    this.statement = statement;
    this.interpolation = interpolation;
  }
}
