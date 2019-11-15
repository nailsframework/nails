import { IComponent } from '../../interfaces/Component';
import { RenderingEngine } from '../engine/engine';
import { State } from '../state';

export class CoreComponent implements IComponent {
  public selector: string = 'component';

  constructor(protected state: State) {
    return new Proxy(this, this);
  }

  public set(target: any, prop: any, value: string) {
    target[prop] = value;
    this.notifyDOM(target, prop, '');
    return true;
  }
  public render() {
    /* html */
    return `<div></div>`;
  }

  private notifyDOM(target: any, prop: any, value: string) {
    const renderingEngine = new RenderingEngine(this.state);
    console.log('updating' + target);

    console.log(this.state.activeElements);

    const refs = this.state.findElementsByObject(target, prop);
    console.log(refs);

    if (refs === [] || refs.length === 0) {
      console.log('refs were empty??');
      return;
    }
    for (const ref of refs) {
      renderingEngine.updateInterpolatedElement(ref.element, ref.content);
      renderingEngine.executeDirectivesOnElement(ref.element, false);
    }

    return true;
  }
}
