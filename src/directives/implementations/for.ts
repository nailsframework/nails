import { Context } from '../../core/context/context';
import { ComponentEngine } from '../../core/engine/componentEngine';
import { RenderingEngine } from '../../core/engine/engine';
import { State } from '../../core/state';

export class ForImplementation {
    private engine: RenderingEngine;
    private componentEngine: ComponentEngine;
    private context: Context;
    private reference: any;
    private element: HTMLElement;
    private statement: string;
    private state: State;
    private lastElement: HTMLElement = null;

    constructor(state: State, element: HTMLElement, statement: string) {
        this.state = state;
        this.engine = new RenderingEngine(this.state);
        this.componentEngine = new ComponentEngine(state, this.engine, null, []);
        this.context = new Context(state, this.componentEngine.getInstanceOfElementOrNull(element));
        this.reference = this.context.resolveOrUndefined(statement.split(' ')[3]);
        this.element = element;
        this.statement = statement;
    }

    public run() {
        this.element.style.display = 'none';
        this.engine.disableInterpolationForVariableNameOnElement(this.statement.split(' ')[1], this.element);

        const parent = this.element.parentElement;
        if (!parent) {
            throw new Error('Element ' + parent + ' has no parent');
        }
        if (!this.reference) {
            try {
                if (Array.isArray(JSON.parse(this.statement.split(' ')[3]))) {
                    this.reference = JSON.parse(this.statement.split(' ')[3]);
                }
            } catch (error) {
                throw new Error('Statement ' + this.statement + ' could not be translated into an object');
            }
        }
        // Reference has been set or we are not alive.
        if (parent.tagName !== 'FORCONTAINER') {
            this.setContainer(this.element);
        } else {
            this.cleanUp(parent);
        }

        this.interpolate(this.element, this.reference);
        this.hideElement(this.element);

        // Weird browsers don't draw the added options when in a select tag in certain conditions.
    }

    private addToList(element: HTMLElement) {
        if (this.lastElement === null) {
            this.engine.insertAfter(element, this.element);
            this.lastElement = element;
            return;
        }
        this.engine.insertAfter(element, this.lastElement);
        this.lastElement = element;
    }

    private cleanUp(container: HTMLElement) {
        const elements: Element[] = [];
        for (const element of container.children) {
            if (element !== this.element) {
                elements.push(element);
            }
        }
        elements.forEach(el => {
            container.removeChild(el);
        });
    }
    private setContainer(element: HTMLElement) {
        const container = document.createElement('FORCONTAINER');
        this.engine.insertAfter(container, element);
        container.appendChild(element); // Because it's the first element we don't need any insert before magic
    }
    private hideElement(e: HTMLElement) {
        e.hidden = true;
    }
    private replaceAll(search: string, replacement: string, target: string) {
        return target.replace(new RegExp(search, 'g'), replacement);
    }

    private removeStatementFromElement(element: HTMLElement) {
        if (element.hasAttribute('n-for')) {
            if (element.getAttribute('n-for') === this.statement) {
                element.removeAttribute('n-for');
            }
        }
    }

    private addContentsOfElementToAnother(source: Node, destination: Element) {
        while (source.childNodes.length > 0) {
            destination.appendChild(source.firstChild);
        }
    }

    private interpolate(el: HTMLElement, ref: []) {
        const interpolations = this.engine.getInterpolationsForTextContent(el.innerHTML);
        for (const idx of ref) {
            const forElement = document.createElement(el.tagName);
            this.addContentsOfElementToAnother(el.cloneNode(true), forElement);

            this.removeStatementFromElement(forElement);
            const resolved = this.context.resolveOrUndefinedCustomObject(this.statement.split(' ')[1], idx);
            if (!resolved) {
                throw new Error('Could not resolve Object for element ' + el + ' at index ' + idx);
            }
            for (const str of interpolations) {
                if (this.engine.stripAndTrimInterpolation(str) === this.statement.split(' ')[1]) {
                    const replacedHTML = this.replaceAll(str, idx, forElement.innerHTML);
                    //forElement.innerHTML = replacedHTML;
                }
            }
            this.addToList(forElement);
            this.engine.executeInterpolationsOnElement(forElement);
            this.engine.executeDirectivesOnElement(forElement, true);

        }
    }
}
