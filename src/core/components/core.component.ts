import { IComponent } from '../../interfaces/Component';
import { RenderingEngine } from '../engine/engine';
import ObservableSlim from '../observation/observer';
import { State } from '../state';

export class CoreComponent implements IComponent {
  public selector: string = 'component';

  constructor(protected state: State) {
    const proxy = ObservableSlim.create(this, true, (changes: any) => {
      this.notifyDOM(changes.target, changes.property, changes.newValue);
    });

    return proxy;
  }
  public render() {
    return '<div></div>';
  }

  private notifyDOM(target: any, prop: any, value: string) {
    const renderingEngine = new RenderingEngine(this.state);

    const refs = this.state.findElementsByObject(target, prop);

    if (refs === [] || refs.length === 0) {
      return;
    }
    for (const ref of refs) {
      renderingEngine.updateInterpolatedElement(ref.element, ref.content);
      //  renderingEngine.executeDirectivesOnElement(ref.element, false);
    }

    return true;
  }
}
