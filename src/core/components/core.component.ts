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

    public useState() {
        const renderingEngine = new RenderingEngine(this.state);
        if (typeof window.Proxy !== 'undefined') {
            const handler = {
                state: this,
                // tslint:disable-next-line: object-literal-sort-keys
                notifyDom: this..noifyDOM,
                engine: renderingEngine,

                get(target: any, prop: any, receiver: any) {
                    return target[prop];
                },
                set(target: any, prop: any, value: string) {
                    target[prop] = value;
                    this.notifyDom(target, prop, '');
                    return true;
                },
            };

            const proxy = new Proxy(this, handler);
            this.state.data = proxy;
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
