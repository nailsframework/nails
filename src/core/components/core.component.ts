import { IComponent } from '../../interfaces/Component';
import { ComponentEngine } from '../engine/componentEngine';
import { RenderingEngine } from '../engine/engine';
import { State } from '../state';

export class CoreComponent implements IComponent {
    public selector: string = 'component';

    constructor(public state: State) { }
    public render() {
        /* html */
        return `<div></div>`;
    }

    public useState(): any {
        const renderingEngine = new RenderingEngine(this.state);
        if (typeof window.Proxy !== 'undefined') {
            const handler = {
                // tslint:disable-next-line: object-literal-sort-keys
                notifyDom: this.notifyDOM,
                // tslint:disable-next-line:object-literal-sort-keys
                engine: renderingEngine,

                get(target: any, prop: any, receiver: any) {
                    return target[prop];
                },
                set(target: any, prop: any, value: string) {
                    console.log('t:' + target + 'p: ' + prop);
                    target[prop] = value;
                    this.notifyDom(target, prop, '');
                    return true;
                },
            };

            const proxy = new Proxy({}, handler);
            return proxy;
        }
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
