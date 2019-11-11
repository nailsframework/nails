import { IComponent } from '../../interfaces/Component';
import { ComponentEngine } from '../engine/componentEngine';
import { RenderingEngine } from '../engine/engine';
import { State } from '../state';

export class CoreComponent implements IComponent {
    public selector: string = 'component'
    constructor(public state: State) {

    }

    public render() {
        /* html */
        return `<div></div>`
    }
    private useState() {
        const renderingEngine = new RenderingEngine(this.state);
        if (typeof window.Proxy !== 'undefined') {
            const handler = {
                state: this,
                // tslint:disable-next-line: object-literal-sort-keys
                notifyDom: renderingEngine.notifyDOM,
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

}