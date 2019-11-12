import { IComponent } from '../../interfaces/Component';
import { ComponentEngine } from '../engine/componentEngine';
import { RenderingEngine } from '../engine/engine';
import { State } from '../state';

export class CoreComponent implements IComponent {
  public selector: string = 'component';

  constructor(protected state: State) {
    return new Proxy(this, this);
  }

  public get(target: any, prop: any, value: any) {
    console.log('got ' + value);
    return target[prop];
  }
  public set(target: any, prop: any, value: string) {
    console.log('t:' + target + 'p: ' + prop);
    target[prop] = value;
    this.notifyDOM(target, prop, '');
    return true;
  };
  public render() {
    /* html */
    return `<div></div>`;
  }

  private notifyDOM(target: any, prop: any, value: string) {
    const renderingEngine = new RenderingEngine(this.state);

    const refs = this.state.findElementsByObject(target, prop);
    if (refs === [] || refs.length === 0) {
      return;
    }
    for (const ref of refs) {
      renderingEngine.updateInterpolatedElement(ref.element, ref.content);
      renderingEngine.executeDirectivesOnElement(ref.element, false);
    }

    return true;
  }
}
